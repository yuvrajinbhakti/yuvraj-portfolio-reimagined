import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { Home, About, Contact, Projects, NotFound } from './pages';
import Interactive from './pages/Interactive';
import Navbar from './Components/Navbar';
import VoiceNavigation from './Components/VoiceNavigation';
import { useEffect, useState, Suspense } from 'react';
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

// Curtain wipe transition variants
const curtainVariants = {
  initial:  { scaleX: 0, originX: 0 },
  enter:    { scaleX: 1, originX: 0, transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] } },
  exit:     { scaleX: 0, originX: 1, transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1], delay: 0.05 } },
};

const contentVariants = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1, transition: { duration: 0.3, delay: 0.35 } },
  exit:     { opacity: 0, transition: { duration: 0.15 } },
};

// Page transition component — blue curtain wipe
const PageTransition = ({ children }) => {
  return (
    <div className="relative w-full">
      {/* Blue curtain panel */}
      <motion.div
        className="fixed inset-0 z-[100] pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)' }}
        variants={curtainVariants}
        initial="initial"
        animate="exit"
        exit="enter"
      />
      {/* Page content */}
      <motion.div
        className="w-full"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </div>
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

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <main className="bg-[#020617] text-white relative min-h-screen">
      {isLoading ? (
        <InitialLoader />
      ) : (
        <Router>
          <Navbar />
          <VoiceNavigation />
          <ScrollToTop />
          <Suspense fallback={<InitialLoader />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <PageTransition>
                    <Home />
                  </PageTransition>
                } />
                <Route path="/about" element={
                  <PageTransition>
                    <About />
                  </PageTransition>
                } />
                <Route path="/projects" element={
                  <PageTransition>
                    <Projects />
                  </PageTransition>
                } />
                <Route path="/playground" element={
                  <PageTransition>
                    <Interactive />
                  </PageTransition>
                } />
                <Route path="/contact" element={
                  <PageTransition>
                    <Contact />
                  </PageTransition>
                } />
                <Route path="*" element={
                  <PageTransition>
                    <NotFound />
                  </PageTransition>
                } />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </Router>
      )}
    </main>
  );
};

export default App;
