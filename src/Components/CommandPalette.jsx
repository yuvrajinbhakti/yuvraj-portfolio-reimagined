import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';
import { COMMAND_ITEMS, DEFAULT_ITEMS, GROUPS, itemById } from '../constants/commandIndex';
import { highlight, scoreFields } from '../utils/search';

/**
 * ⌘K. Search everything on the site and go there without touching the mouse.
 *
 * The site had no keyboard navigation at all: five pages, six projects, two
 * long case studies and three playground examples, all reachable only by
 * clicking through a nav bar. This indexes every one of them, plus each
 * *section* of each case study, which is the smallest unit anyone is really
 * looking for — "how did you handle conflicts" is a heading, not a page.
 *
 * Rendered through a portal into <body>, which is not optional here. The route
 * transition in App.jsx is a motion.div, and a transformed ancestor replaces
 * the viewport as the containing block for `position: fixed` — the same rule
 * that had the hero globe rendering as a 300x150 canvas in a corner. Portalled
 * out, the overlay is fixed to the viewport like it reads.
 *
 * Accessibility is the combobox/listbox pattern: focus never leaves the input,
 * the active row is pointed at with aria-activedescendant rather than moved to,
 * and the result count is announced. That is what makes arrow keys work for a
 * screen reader user the same way they work for everyone else.
 */

const RECENT_KEY = 'ysn:cmdk-recent';
const MAX_RECENT = 4;
const MAX_RESULTS = 24;

const readRecent = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY));
    return Array.isArray(raw) ? raw.filter((id) => typeof id === 'string').slice(0, MAX_RECENT) : [];
  } catch {
    // Private mode, disabled storage, or something else wrote here first.
    return [];
  }
};

const writeRecent = (ids) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, MAX_RECENT)));
  } catch {
    // Recents are a nicety; failing to persist them is not worth a thrown error.
  }
};

// Title carries the highlight, so it is the only field marked primary — an
// offset found in a description would be drawn on the wrong characters.
// Descriptions and keywords still count towards the score, at less than half
// the weight, which is roughly how much less a match in prose means than a
// match in a name.
const fieldsFor = (item) => [
  { text: item.title, weight: 1, primary: true },
  { text: item.subtitle, weight: 0.5 },
  { text: item.keywords, weight: 0.55 },
];

// Small enough to only decide ties. Scores run from ~200 to ~1750, so this
// separates a page from a section that matched equally well without ever
// overriding relevance.
const groupBias = (group) => (GROUPS.length - GROUPS.indexOf(group)) * 8;

const ICONS = {
  page: 'M4 5a1 1 0 011-1h9l6 6v9a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10-1v6h6',
  'case-study': 'M4 6h16M4 12h16M4 18h10',
  section: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  project: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  playground: 'M8 9l3 3-3 3m5 0h3M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z',
  action: 'M13 10V3L4 14h7v7l9-11h-7z',
};

const TypeIcon = ({ type }) => (
  <svg
    className="w-4 h-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={ICONS[type] ?? ICONS.action} />
  </svg>
);

TypeIcon.propTypes = { type: PropTypes.string.isRequired };

const Highlighted = ({ text, ranges }) => (
  <>
    {highlight(text, ranges).map((segment, i) =>
      segment.match ? (
        // <mark> rather than a styled span: the default yellow is overridden,
        // but the semantics — "this is why you are seeing this row" — are worth
        // keeping for anyone whose browser or reader surfaces them.
        <mark key={i} className="bg-transparent text-blue-300 font-semibold">
          {segment.text}
        </mark>
      ) : (
        <span key={i}>{segment.text}</span>
      )
    )}
  </>
);

Highlighted.propTypes = {
  text: PropTypes.string.isRequired,
  ranges: PropTypes.array,
};

// Rendered as its own element so a phone shows the same affordances as a
// desktop without a keyboard hint that means nothing there.
const Key = ({ children }) => (
  <kbd className="hidden sm:inline-flex items-center justify-center min-w-[1.375rem] h-[1.375rem] px-1.5 rounded border border-white/15 bg-white/5 text-[11px] font-sans text-white/60">
    {children}
  </kbd>
);

Key.propTypes = { children: PropTypes.node.isRequired };

const CommandPalette = ({ onClose }) => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(null);
  const [recentIds, setRecentIds] = useState(readRecent);

  const inputRef = useRef(null);
  const optionRefs = useRef([]);
  // Captured on mount, because by the time this unmounts the element that had
  // focus is whatever the browser fell back to — usually <body>.
  const opener = useRef(null);

  const sections = useMemo(() => {
    const q = query.trim();

    // Nothing typed: recents first, then the pages and the handful of actions
    // worth a keystroke, under headings. Listing all eighty items here would be
    // a wall rather than a starting point.
    if (!q) {
      const recent = recentIds.map(itemById).filter(Boolean);
      const seen = new Set(recent.map((item) => item.id));
      const rest = DEFAULT_ITEMS.filter((item) => !seen.has(item.id));

      const out = [];
      if (recent.length) {
        out.push({ heading: 'Recent', entries: recent.map((item) => ({ item, ranges: [] })) });
      }
      for (const group of GROUPS) {
        const entries = rest.filter((item) => item.group === group);
        if (entries.length) {
          out.push({ heading: group, entries: entries.map((item) => ({ item, ranges: [] })) });
        }
      }
      return out;
    }

    const scored = [];
    for (const item of COMMAND_ITEMS) {
      const hit = scoreFields(q, fieldsFor(item));
      if (!hit) continue;
      scored.push({ item, ranges: hit.ranges, score: hit.score + groupBias(item.group) });
    }
    scored.sort((a, b) => b.score - a.score);

    // One flat list in score order, deliberately ungrouped.
    //
    // Grouping search results looks tidier and ranks worse. Whichever group
    // holds the single best match gets drawn first *in its entirety*, so ten
    // passing mentions inside case-study prose push a page whose title is
    // exactly what was typed below the fold: searching "operational" listed
    // four sections that merely say the word before the playground example
    // actually called Operational Transform. Every row already names its own
    // type on the right, so the headings were carrying no information the list
    // did not already have.
    return [{ heading: null, entries: scored.slice(0, MAX_RESULTS) }];
  }, [query, recentIds]);

  // Flattened after sectioning, never before: arrow keys have to walk the rows
  // in the order they are painted.
  const flat = useMemo(() => sections.flatMap((s) => s.entries), [sections]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  // Keep the highlighted row on screen. 'nearest' rather than 'center' so
  // holding ArrowDown scrolls a line at a time instead of jumping the list
  // under the reader's eye.
  useEffect(() => {
    optionRefs.current[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, sections]);

  // Focus in, focus back out. Without the second half, dismissing the palette
  // drops a keyboard user at the top of the document.
  useEffect(() => {
    opener.current = document.activeElement;
    inputRef.current?.focus();
    const restoreTo = opener.current;
    return () => {
      if (restoreTo instanceof HTMLElement && document.contains(restoreTo)) restoreTo.focus();
    };
  }, []);

  // Hold the page still underneath. The padding compensates for the scrollbar
  // that hiding overflow removes — without it the whole page jumps left by
  // ~15px on Windows the moment the palette opens.
  useEffect(() => {
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, []);

  const remember = useCallback((id) => {
    setRecentIds((previous) => {
      const next = [id, ...previous.filter((existing) => existing !== id)].slice(0, MAX_RECENT);
      writeRecent(next);
      return next;
    });
  }, []);

  const copy = useCallback(async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // No clipboard API on an insecure origin, or permission refused. The old
      // selection dance still works everywhere and is worth the eight lines,
      // because "copy email" silently doing nothing is worse than not offering
      // it at all.
      try {
        const field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(field);
        return ok;
      } catch {
        return false;
      }
    }
  }, []);

  const run = useCallback(
    async (entry) => {
      if (!entry) return;
      const { item } = entry;
      remember(item.id);
      const action = item.run;

      if (action.kind === 'copy') {
        const ok = await copy(action.value);
        // Stays open for a beat on success so the confirmation is actually
        // seen. Closing instantly would make a successful copy and a failed one
        // look identical.
        if (ok) setCopied(item.id);
        else onClose();
        return;
      }

      if (action.kind === 'external') {
        // mailto: through window.open leaves a stranded about:blank tab in
        // several browsers; a location assignment hands off to the mail client
        // and leaves the page where it was.
        if (action.href.startsWith('mailto:')) window.location.href = action.href;
        else window.open(action.href, '_blank', 'noopener,noreferrer');
        onClose();
        return;
      }

      onClose();
      navigate(action.to);
    },
    [copy, navigate, onClose, remember]
  );

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(onClose, 850);
    return () => clearTimeout(timer);
  }, [copied, onClose]);

  const move = useCallback(
    (delta) => {
      setActive((current) => {
        if (!flat.length) return 0;
        // Wraps. At the bottom of a list of four, ArrowDown returning to the top
        // is faster than reaching for the other arrow.
        return (current + delta + flat.length) % flat.length;
      });
    },
    [flat.length]
  );

  const onKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActive(0);
        break;
      case 'End':
        event.preventDefault();
        setActive(Math.max(0, flat.length - 1));
        break;
      case 'Enter':
        event.preventDefault();
        run(flat[active]);
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
      case 'Tab':
        // The input is the only focusable thing in here, so there is nowhere to
        // Tab to. Swallowing it keeps focus from escaping into the page behind
        // the overlay, which is inert but still fully tabbable.
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  let index = -1;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]"
      role="presentation"
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0.1 : 0.18 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search and commands"
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b1020]/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.985 }}
        transition={{ duration: reduce ? 0.12 : 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 px-4 border-b border-white/10">
          <svg
            className="w-4 h-4 text-white/40 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.2-4.2" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, projects, case studies…"
            className="command-palette__input flex-1 bg-transparent py-4 text-base text-white placeholder:text-white/35 outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={flat[active] ? `cmd-${flat[active].item.id}` : undefined}
            aria-autocomplete="list"
            aria-label="Search pages, projects, case studies and commands"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-[11px] text-white/40 hover:text-white/80 border border-white/15 hover:border-white/30 rounded px-1.5 h-[1.375rem] transition-colors"
          >
            esc
          </button>
        </div>

        <div
          id="command-palette-list"
          role="listbox"
          aria-label="Results"
          className="command-palette__results max-h-[min(24rem,50vh)] overflow-y-auto overscroll-contain py-2"
        >
          {flat.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-white/45">
              Nothing matches <span className="text-white/80">“{query.trim()}”</span>. Try a project
              name, a technology, or a word from a case study.
            </p>
          ) : (
            sections.map(({ heading, entries }) => (
              <div
                key={heading ?? 'results'}
                role="group"
                aria-labelledby={heading ? `cmd-group-${heading}` : undefined}
                aria-label={heading ? undefined : 'Search results'}
              >
                {heading && (
                  <p
                    id={`cmd-group-${heading}`}
                    className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-label text-white/35 font-semibold"
                  >
                    {heading}
                  </p>
                )}
                {entries.map((entry) => {
                  index += 1;
                  const position = index;
                  const isActive = position === active;
                  const wasCopied = copied === entry.item.id;
                  return (
                    <div
                      key={entry.item.id}
                      id={`cmd-${entry.item.id}`}
                      ref={(node) => {
                        optionRefs.current[position] = node;
                      }}
                      role="option"
                      aria-selected={isActive}
                      // Not a <button>. Inside a listbox the rows are options,
                      // and a nested interactive element would put a second tab
                      // stop behind every one of them.
                      onClick={() => run(entry)}
                      // mousemove, not mouseenter: with the pointer parked over
                      // the list, scrolling rows underneath it with the arrow
                      // keys would otherwise yank the selection back.
                      onMouseMove={() => setActive(position)}
                      className={`mx-2 px-2.5 py-2.5 rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${
                        isActive ? 'bg-white/10' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className={isActive ? 'text-blue-400' : 'text-white/35'}>
                        <TypeIcon type={entry.item.type} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm ${
                            isActive ? 'text-white' : 'text-white/85'
                          }`}
                        >
                          <Highlighted text={entry.item.title} ranges={entry.ranges} />
                        </span>
                        {entry.item.subtitle && (
                          <span className="block truncate text-xs text-white/45 mt-0.5">
                            {entry.item.subtitle}
                          </span>
                        )}
                      </span>
                      {wasCopied ? (
                        <span className="shrink-0 text-xs font-medium text-blue-300">Copied</span>
                      ) : (
                        <>
                          {entry.item.hint && (
                            <span className="shrink-0 hidden sm:block text-[11px] text-white/30">
                              {entry.item.hint}
                            </span>
                          )}
                          {isActive && <Key>↵</Key>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-t border-white/10 text-[11px] text-white/35">
          <span className="flex items-center gap-1.5">
            <Key>↑</Key>
            <Key>↓</Key>
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Key>↵</Key>
            open
          </span>
          <span className="flex items-center gap-1.5">
            <Key>esc</Key>
            close
          </span>
        </div>
      </motion.div>

      {/* Announced rather than merely displayed: without it a screen reader
          user types and hears nothing, because the results appear in a region
          they are not focused on. */}
      <p className="sr-only" aria-live="polite">
        {query.trim()
          ? `${flat.length} result${flat.length === 1 ? '' : 's'} for ${query.trim()}`
          : `${flat.length} suggestions`}
      </p>
    </div>,
    document.body
  );
};

CommandPalette.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default CommandPalette;
