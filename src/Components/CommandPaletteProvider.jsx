import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { CommandPaletteContext } from '../contexts/commandPalette';

/**
 * Owns the palette's open state and the shortcuts that reach it, without
 * loading the palette itself until somebody asks for it.
 *
 * Splitting it this way matters: the index pulls in every case study body and
 * the project list, and the component brings its own matcher and markup. None
 * of that belongs on the critical path of a page that has not been asked to
 * search anything, and the whole point of the site's last performance pass was
 * to stop shipping code nobody triggered.
 */

// Named so it can be called for its side effect as well as by lazy(). The
// module registry caches the promise, so warming it early and rendering it
// later resolve to the same import.
const loadPalette = () => import('./CommandPalette');
const CommandPalette = lazy(loadPalette);

const isTypingTarget = (element) => {
  if (!element) return false;
  const tag = element.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable;
};

const CommandPaletteProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const prefetch = useCallback(() => {
    loadPalette();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      // Held before K is pressed, which is the whole trick: the chunk is
      // already in flight by the time the chord completes, so the palette opens
      // on the first press rather than after a blank frame.
      if (event.key === 'Meta' || event.key === 'Control') {
        loadPalette();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        // Firefox and Chrome both bind ⌘K to the address bar's search mode.
        event.preventDefault();
        setIsOpen((v) => !v);
        return;
      }

      // The single-key shortcut every developer tool trained people to expect —
      // but only outside a field, or it eats the slash in a URL someone is
      // typing into the contact form.
      if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle, prefetch }),
    [isOpen, open, close, toggle, prefetch]
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {/* Suspense sits outside AnimatePresence, not inside it. AnimatePresence
          hands its subtree a presence context that the palette's motion
          elements use to defer unmounting until their exit finishes; a Suspense
          boundary in between is fine, but wrapping AnimatePresence *in* the
          lazy child's boundary is what keeps the fallback from replacing the
          exiting palette mid-animation. */}
      <Suspense fallback={null}>
        <AnimatePresence>{isOpen && <CommandPalette key="palette" onClose={close} />}</AnimatePresence>
      </Suspense>
    </CommandPaletteContext.Provider>
  );
};

CommandPaletteProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CommandPaletteProvider;
