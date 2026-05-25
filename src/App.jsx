import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { Home, About, Contact, Projects, NotFound } from './pages';
import Interactive from './pages/Interactive';
import Navbar from './Components/Navbar';
import VoiceNavigation from './Components/VoiceNavigation';
import Footer from './Components/Footer';
import { useEffect, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import PropTypes from 'prop-types';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Initial loading component
const InitialLoader = () => {
  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-24 h-24 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
        <div className="text-white text-lg">Loading your experience...</div>
      </div>
    </div>
  );
};

// Page transition — fade with subtle upward slide
const PageTransition = ({ children }) => {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.2, ease: [0.55, 0, 1, 0.45] } }}
    >
      {children}
    </motion.div>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
};

// ScrollToTop component - scrolls to top when navigating to a new page
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
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
        <Route path="/playground" element={<PageTransition><Interactive /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <main className="bg-[#020617] text-white relative min-h-screen">
      <Router>
        <Navbar />
        <VoiceNavigation />
        <ScrollToTop />
        <Suspense fallback={<InitialLoader />}>
          <AnimatedRoutes />
        </Suspense>
        <Footer />
      </Router>
    </main>
  );
};

export default App;
