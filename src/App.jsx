import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { Home, About, Contact, Projects, NotFound } from './pages';
import Navbar from './Components/Navbar';
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

// Page transition component
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
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
    <main className="bg-[#020617] text-white relative min-h-screen overflow-hidden">
      {isLoading ? (
        <InitialLoader />
      ) : (
        <Router>
          <Navbar />
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
