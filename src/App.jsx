import { Route, BrowserRouter as Router, Routes, useLocation, useNavigationType } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import CursorPresenceProvider from './Components/CursorPresenceProvider';
import CommandPaletteProvider from './Components/CommandPaletteProvider';
import GhostCursors from './Components/GhostCursors';
import { useEffect, useRef, Suspense, lazy } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import PropTypes from 'prop-types';

// Routes are imported per-file rather than through ./pages, because pulling
// them from the barrel would drag every page (and three.js with them) into the
// entry chunk and defeat the split.
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Projects = lazy(() => import('./pages/Projects'));
const Interactive = lazy(() => import('./pages/Interactive'));
const Contact = lazy(() => import('./pages/Contact'));
const CaseStudy = lazy(() => import('./pages/CaseStudy'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Shown while a route chunk is in flight. Deliberately not full-screen: the
// navbar stays visible and the layout doesn't collapse.
const RouteLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
    </div>
  );
};

// Page transition — fade with subtle upward slide
const PageTransition = ({ children }) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: reduce ? 0.15 : 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }}
      exit={{ opacity: 0, y: reduce ? 0 : -12, transition: { duration: reduce ? 0.1 : 0.2, ease: [0.55, 0, 1, 0.45] } }}
    >
      {/* Suspense sits inside the transition so a pending chunk swaps only the
          page body. Hoisting it above AnimatePresence would unmount the
          outgoing page instantly and kill the exit animation. */}
      <Suspense fallback={<RouteLoader />}>{children}</Suspense>
    </motion.div>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Recalculate ScrollTrigger positions, but not before the page has stopped
 * moving.
 *
 * ScrollTrigger.refresh() saves and restores the scroll offset as part of
 * recalculating, and doing that to a smooth scroll still in flight stops it
 * dead. This used to run on a flat 600ms timer, so navigating from deep in a
 * long page landed you partway down the new one — the scroll to top was
 * cancelled mid-travel, and how far it got depended on how far down you had
 * been. A fixed delay cannot fix it either: the further the scroll, the longer
 * it takes. Waiting for it to settle can.
 */
const refreshTriggersWhenSettled = () => {
  let last = window.scrollY;
  let stillFor = 0;
  let frame;
  const deadline = performance.now() + 2000;

  const check = () => {
    const y = window.scrollY;
    stillFor = y === last ? stillFor + 1 : 0;
    last = y;
    if (stillFor >= 3 || performance.now() > deadline) {
      ScrollTrigger.refresh();
      return;
    }
    frame = requestAnimationFrame(check);
  };

  frame = requestAnimationFrame(check);
  return () => cancelAnimationFrame(frame);
};

/**
 * Top on a new page, back where you were on Back.
 *
 * This used to scroll to top unconditionally, which is right for a forward
 * navigation and wrong for the one that matters most here: reading down
 * /projects, opening a case study, then returning to the top of a list you had
 * already scrolled halfway through. Browsers do this natively for real page
 * loads; a client-side router has to do it by hand.
 */
const ScrollManager = () => {
  const { key, hash } = useLocation();
  const navigationType = useNavigationType();
  const reduce = useReducedMotion();
  const positions = useRef(new Map());

  // Recorded continuously rather than on the way out. Reading scrollY during
  // teardown is too late — the outgoing route has already been swapped for a
  // page of a different height, and the browser has clamped the offset.
  //
  // Only ever from a real scroll event. Seeding the entry when the effect runs
  // looks harmless and destroys the feature: on Back, this effect re-runs for
  // the restored key *before* the effect below reads it, so the seed overwrites
  // the position being restored with wherever the page currently sits — which
  // is the top. A key with no entry simply means that page was never scrolled,
  // and scrolling to top is the right answer for it anyway.
  useEffect(() => {
    const onScroll = () => positions.current.set(key, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [key]);

  useEffect(() => {
    // A URL with a fragment is a request to land somewhere specific, so neither
    // of the behaviours below is right for it. Handled here rather than in each
    // page that has anchors, because the hard parts — waiting out the route
    // transition, waiting for a lazy chunk to actually render the target — are
    // the same everywhere and are exactly what a page-level effect gets wrong.
    //
    // How far below the navbar to land is the target's business: every anchor
    // carries its own scroll-margin-top, so scrollIntoView needs no offset
    // arithmetic here and stays correct if the bar ever changes height.
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let frame;
      let stopRefresh;
      const start = performance.now();
      const exitMs = reduce ? 100 : 200; // mirrors PageTransition's exit duration
      const deadline = start + 1500;

      const attempt = () => {
        const now = performance.now();
        if (now - start >= exitMs) {
          const target = document.getElementById(id);
          if (target) {
            target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
            stopRefresh = refreshTriggersWhenSettled();
            return;
          }
          // The anchor never appeared — a stale link, or a heading that has
          // been renamed. Leaving the page at the top is the honest outcome;
          // scrolling somewhere arbitrary would be worse.
          if (now > deadline) return;
        }
        frame = requestAnimationFrame(attempt);
      };

      frame = requestAnimationFrame(attempt);
      return () => {
        cancelAnimationFrame(frame);
        stopRefresh?.();
      };
    }

    const saved = navigationType === 'POP' ? positions.current.get(key) : undefined;

    if (saved == null) {
      window.scrollTo({
        top: 0,
        left: 0,
        // A smooth jump across a full page is exactly the kind of large-field
        // movement that triggers vestibular symptoms.
        behavior: reduce ? 'auto' : 'smooth',
      });
      return refreshTriggersWhenSettled();
    }

    // Restoring cannot happen on this tick, for two separate reasons.
    //
    // AnimatePresence runs mode="wait", so for the length of the exit animation
    // the *outgoing* page is still the one mounted. Measuring the document then
    // measures the page being left, which says nothing about whether the page
    // being returned to can hold the offset — and on a tall outgoing page the
    // check would pass and scroll the wrong thing. So the exit is waited out
    // first.
    //
    // Then the incoming route is a lazy chunk that may not have arrived, so the
    // document can still be short enough that scrollTo would clamp. Poll until
    // it is tall enough, with a deadline so a slow chunk degrades to landing as
    // close as the page allows rather than not restoring at all.
    //
    // The jump itself is instant, never smooth: Back should return you where
    // you were, not animate you there.
    let frame;
    const start = performance.now();
    const exitMs = reduce ? 100 : 200; // mirrors PageTransition's exit duration
    const deadline = start + 1200;

    const attempt = () => {
      const now = performance.now();
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (now - start >= exitMs && (max >= saved || now > deadline)) {
        window.scrollTo({ top: Math.min(saved, max), left: 0, behavior: 'auto' });
        ScrollTrigger.refresh();
        return;
      }
      frame = requestAnimationFrame(attempt);
    };
    frame = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(frame);
  }, [key, hash, navigationType, reduce]);

  return null;
};

// Animated routes with location-keyed transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
        <Route path="/work/:slug" element={<PageTransition><CaseStudy /></PageTransition>} />
        <Route path="/playground" element={<PageTransition><Interactive /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    // reducedMotion="user" makes every framer-motion component in the tree
    // honour the OS setting: transform and layout animations are dropped while
    // opacity transitions are kept.
    <MotionConfig reducedMotion="user">
      {/* A plain div, not <main>. This element wraps the nav and the footer, and
          a main landmark that contains them tells a screen-reader user "the
          main content is the entire page" — which is the same as saying
          nothing. The real <main> is below, around the routed page only. */}
      <div className="bg-[#020617] text-white relative min-h-screen">
        <CursorPresenceProvider>
          <Router>
            {/* Inside the Router because the palette navigates, and around
                everything because the navbar, the mobile menu and the footer
                all offer a way into it. The palette itself is not loaded until
                it is opened. */}
            <CommandPaletteProvider>
              {/* Scroll-driven, no JS. Gives a long page a sense of journey. */}
              <div className="scroll-progress" aria-hidden="true" />
              {/* Off-screen until focused. Without it, every keyboard visitor tabs
                  through the whole nav again on every page (WCAG 2.4.1). */}
              <a href="#main-content" className="skip-link">Skip to main content</a>
              <Navbar />
              <ScrollManager />
              {/* Inside the Router because it keys everything to the current
                  route, and outside <main> because it is decoration layered over
                  the page rather than part of its content. */}
              <GhostCursors />
              {/* tabIndex={-1} so the skip link can actually move focus here;
                  without it the browser scrolls but focus stays in the nav. */}
              <main id="main-content" tabIndex={-1}>
                <AnimatedRoutes />
              </main>
              <Footer />
            </CommandPaletteProvider>
          </Router>
        </CursorPresenceProvider>
      </div>
    </MotionConfig>
  );
};

export default App;
