import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';
import AnimatedBackground from '../Components/AnimatedBackground';
import useDocumentMeta from '../hooks/useDocumentMeta';

/**
 * This page used to run its own decorative layer: eighty particles held in
 * React state and advanced by a setInterval(16), which re-rendered the whole
 * tree sixty times a second, plus a mousemove handler that re-rendered it again
 * on every pointer event. None of it honoured prefers-reduced-motion, and a 404
 * is where a disoriented visitor lands.
 *
 * All of it is gone. AnimatedBackground already draws the starfield every other
 * page uses, already cancels its loop on unmount, and already respects the
 * motion setting — so the fix was to stop hand-rolling a second background and
 * use the one that exists. The particles also drew from a five-colour palette,
 * which is the same stray purple and pink that got the ambient orbs deleted out
 * of AnimatedBackground itself.
 */

const ICONS = {
  projects: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  about: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  playground: 'M8 9l3 3-3 3m5 0h3M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z',
  contact: 'M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z',
};

// Ordered by what a lost visitor most likely wanted.
const SUGGESTED = [
  { to: '/projects', label: 'Projects', icon: 'projects' },
  { to: '/about', label: 'About', icon: 'about' },
  { to: '/playground', label: 'Playground', icon: 'playground' },
  { to: '/contact', label: 'Contact', icon: 'contact' },
];

const Icon = ({ name }) => (
  <svg
    className="w-4 h-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={ICONS[name]} />
  </svg>
);

Icon.propTypes = {
  name: PropTypes.oneOf(Object.keys(ICONS)).isRequired,
};

const NotFound = () => {
  const reduce = useReducedMotion();

  useDocumentMeta({
    title: 'Page not found | Yuvraj Singh Nain',
    description: 'That page does not exist. Head back to the portfolio home page.',
  });

  // Matches the entrance used on the case studies, so arriving here does not
  // feel like arriving on a different site.
  const fade = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
        };

  // There used to be a 30-second countdown here that navigated to "/" on its
  // own, with no way to pause, extend or cancel it — a WCAG 2.2.1 (Timing
  // Adjustable, Level A) failure, and hostile to anyone reading slowly or with
  // a screen reader. The visitor decides when to leave; the links below are
  // how they do it.

  return (
    <div className="w-full">
      <AnimatedBackground>
        <section className="w-full min-h-screen flex items-center px-4 md:px-8 pt-28 md:pt-36 pb-16">
          <div className="max-w-2xl mx-auto w-full">
            <motion.p
              {...fade()}
              className="text-sm uppercase tracking-label text-blue-400 font-semibold mb-4"
            >
              Error 404
            </motion.p>

            <motion.h1
              {...fade(0.05)}
              className="text-5xl md:text-7xl font-bold text-white mb-5 leading-tight"
            >
              This page doesn&apos;t exist.
            </motion.h1>

            <motion.p
              {...fade(0.1)}
              className="text-lg md:text-xl text-white/70 leading-relaxed mb-10"
            >
              The address may have been mistyped, or it may have pointed at something that has
              since moved. Nothing is broken on your end.
            </motion.p>

            <motion.div {...fade(0.15)} className="flex flex-wrap gap-3 mb-14">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to home
              </Link>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/25 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Previous page
              </button>
            </motion.div>

            {/* Where they probably meant to go. A dead end that only says "not
                found" makes the visitor's next move their problem. */}
            <motion.nav {...fade(0.2)} aria-label="Suggested destinations">
              <h2 className="text-sm uppercase tracking-label text-white/50 font-semibold mb-4">
                Or try one of these
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTED.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:border-blue-400/40 hover:bg-white/10 transition-all"
                    >
                      <span className="text-white/50 group-hover:text-blue-400 transition-colors">
                        <Icon name={item.icon} />
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </div>
        </section>
      </AnimatedBackground>
    </div>
  );
};

export default NotFound;
