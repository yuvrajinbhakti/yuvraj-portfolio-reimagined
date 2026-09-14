import { Route, BrowserRouter as Router, Routes, Navigate, useLocation, useNavigationType } from 'react-router-dom';
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
//
// Home is static, and the other two are lazy, because they are different kinds
// of route. Splitting a chunk only pays when there are visitors who do not need
// it; Home is the landing page, so lazy-loading it bought nothing and cost a
// serial round trip. The browser cannot discover a dynamic import until the
// entry chunk has downloaded, parsed and run far enough to hit the Suspense
// boundary — measured here as a second request wave starting at 58ms when the
// first wave was already done at 46ms, and on a real connection that gap is a
// whole RTT rather than 12ms. Imported statically it joins the entry's graph,
// so Vite emits a modulepreload for it and it arrives alongside the vendors
// instead of after them.
//
// CaseStudy and NotFound stay lazy: most visits never reach either.
import Home from './pages/Home';
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
      /*
       * How long to wait for the anchor to exist. It was 1500ms, which was
       * generous when every section was its own small lazily-loaded route, and
       * is not once they are merged: the home chunk now carries the hero, the
       * work and the four former pages, and there is no reason to assume it
       * renders inside a second and a half on a cold load or a slow phone.
       *
       * Fifteen seconds is deliberately far more than a render should need, and
       * the reason is the same background tab as everything else here: React
       * deprioritises rendering a document nobody is looking at, so a chunk that
       * mounts in a moment on a visible page can take many times that on a
       * hidden one. Measured here, the four sections were not in the DOM at nine
       * seconds and were there shortly after — against a six-second cap the
       * handler had already given up, and the anchor silently did nothing.
       *
       * Nothing is spent by waiting longer. The work is one getElementById
       * every fifty milliseconds until the target exists, and if it never
       * appears the loop exits having done nothing — the same outcome, later.
       */
      const deadline = start + 15000;

      /*
       * Polled on a timer rather than on animation frames.
       *
       * requestAnimationFrame does not run in a background tab, and a link to
       * an anchor is very often opened in one — middle-click, cmd-click, "open
       * in new tab". The loop would sit dead while the tab slept, the deadline
       * would expire against a clock that keeps running regardless, and by the
       * time anyone looked at the tab there would be nothing left to do: the
       * page would simply be at the top with the anchor in the address bar.
       *
       * A timer is throttled in the background but it still fires, so the wait
       * survives. Fifty milliseconds is far finer than this needs — the work is
       * one getElementById until the target exists — and the smooth scroll it
       * ends with is still the browser's own.
       */
      const attempt = () => {
        const now = performance.now();
        if (now - start >= exitMs) {
          const target = document.getElementById(id);
          if (target) {
            /*
             * Refresh before aiming, not after.
             *
             * ScrollTrigger.refresh() recalculates by saving the scroll offset,
             * re-measuring, and putting the offset back — and it does that
             * through references captured when it was imported, so it is
             * invisible to anything patched onto window later. Run after an
             * anchor scroll it can therefore quietly undo it, which is the same
             * hazard the comment on refreshTriggersWhenSettled describes for
             * scrolls still in flight. Measuring first and aiming second has
             * neither problem, and there is nothing left to run afterwards.
             */
            ScrollTrigger.refresh();
            /*
             * Smooth only if the page is actually on screen.
             *
             * A hidden tab does not render, and a browser will not animate a
             * scroll it is not drawing — it discards the request entirely
             * rather than jumping to the end. Measured: with the tab hidden,
             * scrollIntoView({behavior:'smooth'}) leaves scrollY at 0, while
             * the same call with 'auto' lands exactly on the anchor. So the
             * background-tab case — middle-click, cmd-click, open in new tab,
             * which is how a link to a section often gets opened — would find
             * its target, ask to scroll, be ignored, and present the reader
             * with the top of the page and an anchor in the address bar.
             *
             * Instant is the right answer there anyway: nobody is watching, so
             * there is no animation to appreciate, only a position to be in.
             */
            const animate = !reduce && document.visibilityState === 'visible';
            target.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'start' });
            return;
          }
          // The anchor never appeared — a stale link, or a heading that has
          // been renamed. Leaving the page at the top is the honest outcome;
          // scrolling somewhere arbitrary would be worse.
          if (now > deadline) return;
        }
        frame = setTimeout(attempt, 50);
      };

      frame = setTimeout(attempt, 50);
      return () => {
        clearTimeout(frame);
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

/*
 * Old route -> its section on the one page, keeping the rest of the address.
 *
 * `<Navigate to="/#playground" />` threw away everything but the path. The
 * case studies link to `/playground?example=operational-transform#code-playground`
 * — the query names the example to load and the hash names the editor, which
 * sits 1,800px below the top of the playground section — and both were being
 * dropped, so "Run the algorithm" landed on the section heading with the
 * default example loaded. The hash is kept if the link supplied one, because
 * it is more specific than the section; the section id is only the fallback.
 */
const SectionRedirect = ({ section }) => {
  const { search, hash } = useLocation();
  return <Navigate to={`/${search}${hash || `#${section}`}`} replace />;
};

SectionRedirect.propTypes = {
  section: PropTypes.string.isRequired,
};

// Animated routes with location-keyed transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />

        {/*
         * About, Projects, Playground and Contact are sections of the home page
         * now rather than routes, so these four redirect to their anchors.
         *
         * They are kept rather than deleted because the addresses are out in the
         * world — in the nav people have bookmarked, in anything shared, and in
         * whatever Google has indexed. Deleting a route does not delete the
         * links to it; it just turns them into a 404. `replace` keeps them out
         * of the back-button history, so going back from an old /about link
         * returns to wherever the visitor actually came from.
         */}
        <Route path="/about" element={<SectionRedirect section="about" />} />
        <Route path="/projects" element={<SectionRedirect section="projects" />} />
        <Route path="/playground" element={<SectionRedirect section="playground" />} />
        <Route path="/contact" element={<SectionRedirect section="contact" />} />

        {/* The long-form writing keeps its own addresses. */}
        <Route path="/work/:slug" element={<PageTransition><CaseStudy /></PageTransition>} />
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
