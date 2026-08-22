import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import VoiceNavigation from './Components/VoiceNavigation';
import Footer from './Components/Footer';
import { useEffect, Suspense, lazy } from 'react';
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

// ScrollToTop component - scrolls to top when navigating to a new page
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      // A smooth jump across a full page is exactly the kind of large-field
      // movement that triggers vestibular symptoms.
      behavior: reduce ? 'auto' : 'smooth'
    });
    
    // Refresh ScrollTriggers after page transitions
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 600);
    
    return () => clearTimeout(timer);
  }, [pathname]);
  
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
        <Router>
          {/* Scroll-driven, no JS. Gives a long page a sense of journey. */}
          <div className="scroll-progress" aria-hidden="true" />
          {/* Off-screen until focused. Without it, every keyboard visitor tabs
              through the whole nav again on every page (WCAG 2.4.1). */}
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Navbar />
          <VoiceNavigation />
          <ScrollToTop />
          {/* tabIndex={-1} so the skip link can actually move focus here;
              without it the browser scrolls but focus stays in the nav. */}
          <main id="main-content" tabIndex={-1}>
            <AnimatedRoutes />
          </main>
          <Footer />
        </Router>
      </div>
    </MotionConfig>
  );
};

export default App;
