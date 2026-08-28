import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';
import AnimatedBackground from '../Components/AnimatedBackground';
import GlassCard from '../Components/GlassCard';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { getCaseStudy, caseStudies, sectionId } from '../constants/caseStudies';

const Metric = ({ value, label }) => (
  <div className="text-center px-4 py-5 rounded-xl bg-white/5 border border-white/10">
    <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">{value}</div>
    <div className="text-sm text-white/60 leading-snug">{label}</div>
  </div>
);

Metric.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

const words = (text) => (text ? text.trim().split(/\s+/).filter(Boolean).length : 0);

/**
 * The table of contents, rendered twice from one component: as a sticky rail in
 * the right margin on a wide screen, and inside a disclosure above the body
 * everywhere else.
 *
 * Plain anchors, with no click handler. The browser already does everything
 * wanted here — it honours the scroll-margin-top on the target, it updates the
 * address bar so the position is shareable, it adds a history entry so Back
 * returns you, and it supports middle-click and "copy link address". A handler
 * that called scrollIntoView would have to reimplement all four and would still
 * lose the last two.
 *
 * The jump is instant rather than smooth, which is also the browser's default
 * and the right default: a contents list exists to skip a long distance, and
 * animating a long distance is the classic vestibular trigger this site already
 * avoids elsewhere.
 */
const Outline = ({ sections, activeId, className }) => (
  <nav aria-label="On this page" className={className}>
    <ul className="border-l border-white/10">
      {sections.map((section) => {
        const anchor = sectionId(section.heading);
        const isActive = anchor === activeId;
        return (
          <li key={anchor}>
            <a
              href={`#${anchor}`}
              // "location" rather than "true": this marks where the reader is
              // within a set of links, not the current page.
              aria-current={isActive ? 'location' : undefined}
              className={`block -ml-px border-l-2 pl-4 py-1.5 text-sm leading-snug transition-colors ${
                isActive
                  ? 'border-blue-400 text-white'
                  : 'border-transparent text-white/45 hover:text-white/80 hover:border-white/25'
              }`}
            >
              {section.heading}
            </a>
          </li>
        );
      })}
    </ul>
  </nav>
);

Outline.propTypes = {
  sections: PropTypes.array.isRequired,
  activeId: PropTypes.string,
  className: PropTypes.string,
};

const CaseStudy = () => {
  const { slug } = useParams();
  const study = getCaseStudy(slug);
  const reduce = useReducedMotion();

  const [activeId, setActiveId] = useState(null);
  // The section elements, collected as they mount, so the scroll handler does
  // not run getElementById once per section per frame.
  const sectionNodes = useRef([]);

  useDocumentMeta({
    title: study ? `${study.title} | Yuvraj Singh Nain` : 'Case study | Yuvraj Singh Nain',
    description: study ? study.tagline : 'Project case study.',
    path: study ? `/work/${study.slug}` : '/work',
  });

  const anchors = useMemo(
    () => (study ? study.sections.map((section) => sectionId(section.heading)) : []),
    [study]
  );

  /**
   * Which section is being read.
   *
   * Deliberately a scroll handler and not an IntersectionObserver. The question
   * is "which heading did I last pass", and that has a single answer at every
   * scroll position, including the two an observer handles worst: a section
   * taller than the viewport, where nothing enters or leaves for a long time,
   * and two short sections in the band at once. Reading the rects answers it
   * directly.
   *
   * Coalesced into one rAF, so a burst of scroll events measures the page once
   * per frame rather than once per event, and the measurement is a single pass
   * over four or five elements.
   */
  useEffect(() => {
    if (!anchors.length) return undefined;

    sectionNodes.current = anchors.map((id) => document.getElementById(id));

    let frame = null;
    const measure = () => {
      frame = null;
      // A third of the way down: high enough that the heading you are reading
      // under has already passed it, low enough not to flip on the last pixel
      // before a heading arrives.
      const line = window.innerHeight * 0.3;
      let current = anchors[0];
      for (let i = 0; i < sectionNodes.current.length; i++) {
        const node = sectionNodes.current[i];
        if (!node) continue;
        if (node.getBoundingClientRect().top > line) break;
        current = anchors[i];
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [anchors]);

  // Hooks must run unconditionally, so the redirect happens after them.
  if (!study) return <Navigate to="/projects" replace />;

  const fade = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
        };

  const others = caseStudies.filter((c) => c.slug !== study.slug);

  // 180 words a minute, not the 200-250 usually quoted. Those figures are for
  // general prose; this is technical writing dense with terms the reader has to
  // stop and parse — "operational transform", "AES-256-GCM", "change-data
  // capture" — and it is read slower. Rounded, with a floor of one, because the
  // number exists to set an expectation and not to be accurate to the second.
  const minutes = Math.max(
    1,
    Math.round(
      (words(study.tagline) +
        study.sections.reduce((n, s) => n + words(s.heading) + words(s.body), 0) +
        words(study.takeaway)) /
        180
    )
  );

  return (
    <div className="w-full">
      <AnimatedBackground>
        <div className="w-full pt-28 md:pt-36 pb-16 px-4 md:px-8">
          {/* Below xl this is a plain centred column, exactly as before. From xl
              the outline claims a track of its own beside the prose — there is
              no room to float it into the margin at 1280 without it touching
              the text, and a rail that overlaps the thing it indexes is worse
              than no rail. */}
          <div className="max-w-6xl mx-auto xl:grid xl:grid-cols-[minmax(0,48rem)_12rem] xl:gap-10 xl:justify-center">
            <article className="max-w-3xl mx-auto xl:mx-0">
              {/* Back */}
              <motion.div {...fade()}>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-blue-400 transition-colors mb-8"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  All projects
                </Link>
              </motion.div>

              {/* Header */}
              <motion.header {...fade(0.05)} className="mb-10">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {study.title}
                </h1>
                <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-6">
                  {study.tagline}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/50 mb-6">
                  <span>{study.role}</span>
                  <span aria-hidden="true" className="text-white/25">
                    ·
                  </span>
                  {/* Sets an expectation before the scrollbar does. These are
                      long pieces, and knowing it is five minutes rather than
                      twenty is the difference between reading now and meaning
                      to come back. */}
                  <span>{minutes} min read</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {study.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-full border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* An internal Link, not an anchor with target="_blank". This
                      goes to a page of this site, so it should be a client-side
                      navigation like every other link here — opening a new tab
                      would be the affordance for leaving, which it is not. */}
                  {study.tryIt && (
                    <Link
                      to={study.tryIt.to}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {study.tryIt.label}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </Link>
                  )}
                  {study.links.demo && (
                    <a
                      href={study.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      View live demo
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  {study.links.code && (
                    <a
                      href={study.links.code}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/25 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Source code
                    </a>
                  )}
                </div>
              </motion.header>

              {/* Metrics */}
              <motion.div {...fade(0.1)} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                {study.metrics.map((m) => (
                  <Metric key={m.label} value={m.value} label={m.label} />
                ))}
              </motion.div>

              {/* The same contents the rail shows, for every width that has no
                  room for a rail. A <details> rather than a custom disclosure:
                  it is keyboard operable, announced as expandable and closed by
                  the browser without a line of JavaScript, and it starts closed
                  so it costs a reader who does not want it one line. */}
              <motion.div {...fade(0.12)} className="xl:hidden mb-10">
                <details className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-white/75 hover:text-white transition-colors marker:text-white/30">
                    Contents
                    <span className="text-white/40 font-normal">
                      {' '}
                      · {study.sections.length} sections
                    </span>
                  </summary>
                  <Outline
                    sections={study.sections}
                    activeId={activeId}
                    className="px-5 pb-4 pt-1"
                  />
                </details>
              </motion.div>

              {/* Body */}
              <div className="space-y-10">
                {study.sections.map((section, i) => (
                  // The id makes each section addressable, which is what the
                  // command palette's "jump to section" results and the outline
                  // above both link to. scroll-mt clears the fixed navbar so an
                  // anchored heading lands below the bar instead of behind it —
                  // kept on the target rather than as an offset in the scrolling
                  // code, so it stays right if the bar ever changes height.
                  <motion.section
                    key={section.heading}
                    id={sectionId(section.heading)}
                    className="scroll-mt-28 md:scroll-mt-32"
                    {...fade(0.15 + i * 0.05)}
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {section.heading}
                    </h2>
                    <p className="text-white/70 leading-relaxed text-base md:text-lg">
                      {section.body}
                    </p>
                  </motion.section>
                ))}
              </div>

              {/* Takeaway */}
              <motion.div {...fade(0.4)} className="mt-12">
                <GlassCard className="p-6 md:p-8 border-l-2 border-l-blue-500">
                  <h2 className="text-sm uppercase tracking-label text-blue-400 font-semibold mb-3">
                    What I took from it
                  </h2>
                  <p className="text-white/80 leading-relaxed text-base md:text-lg">
                    {study.takeaway}
                  </p>
                </GlassCard>
              </motion.div>

              {/* Next case study */}
              {others.length > 0 && (
                <motion.nav {...fade(0.45)} className="mt-14 pt-8 border-t border-white/10">
                  <h2 className="text-sm uppercase tracking-label text-white/50 font-semibold mb-4">
                    Read next
                  </h2>
                  {/* Two columns only when there is something to put in the
                      second one. With a single card the grid left a card-shaped
                      hole beside it, which reads as a page that failed to load
                      rather than as a deliberate one-item list. */}
                  <div className={`grid grid-cols-1 gap-4 ${others.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                    {others.map((o) => (
                      <Link
                        key={o.slug}
                        to={`/work/${o.slug}`}
                        className="group block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-400/40 hover:bg-white/10 transition-all"
                      >
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                          {o.title}
                        </div>
                        <div className="text-sm text-white/60 leading-snug">{o.tagline}</div>
                      </Link>
                    ))}
                  </div>
                </motion.nav>
              )}
            </article>

            {/* The rail. aria-hidden is deliberately absent — it is a real
                navigation landmark — but it is a duplicate of the disclosure
                above, so only ever one of the two is in the layout at a time. */}
            <aside className="hidden xl:block">
              <div className="sticky top-32">
                <p className="text-[11px] uppercase tracking-label text-white/35 font-semibold mb-3 pl-4">
                  On this page
                </p>
                <Outline sections={study.sections} activeId={activeId} />
              </div>
            </aside>
          </div>
        </div>
      </AnimatedBackground>
    </div>
  );
};

export default CaseStudy;
