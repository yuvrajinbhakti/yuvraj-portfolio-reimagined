import { useState, useEffect, Suspense, useRef, lazy } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import PropTypes from 'prop-types';

// New components
import TextEffect from "../Components/TextEffect";
import AnimatedBackground from "../Components/AnimatedBackground";
import ScrollReveal from "../Components/ScrollReveal";
import GlassCard from "../Components/GlassCard";
import SocialIcon from "../Components/SocialIcon";
import HorizontalProjectScroll from "../Components/HorizontalProjectScroll";
// Plain SVG — imported directly because it is a couple of hundred bytes and
// carries no WebGL context, unlike the three.js version it replaced.
import ServiceIcon from "../Components/ServiceIcon";

// Deferred: the hero is now the only thing on this page pulling in three.js
// (~227kB gzip). Loading it lazily keeps three off the critical path so the
// headline and CTAs paint first.
const HeroAnimation = lazy(() => import("../Components/HeroAnimation"));

// Icons and media
import { socialLinks } from "../constants";
import sakura from '../assets/sakura.mp3';
import { soundoff, soundon } from "../assets/icons";
import useDocumentMeta from '../hooks/useDocumentMeta';

const ServiceCard = ({ service }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="h-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GlassCard className="h-full p-6 md:p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-blue-500/20 hover:shadow-lg group">
        <div className="mb-2 -mt-4 relative z-0">
          <ServiceIcon type={service.type} isHovered={isHovered} />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 group-hover:text-blue-400 transition-colors duration-300 relative z-10 text-center">{service.title}</h3>
        <p className="text-white/70 text-sm md:text-base leading-relaxed relative z-10 text-center">{service.description}</p>
      </GlassCard>
    </div>
  );
};

ServiceCard.propTypes = {
  service: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['frontend', 'backend', 'ml']).isRequired,
  }).isRequired,
};

const Home = () => {
  useDocumentMeta({
    title: 'Yuvraj Singh Nain | Full Stack Developer & Software Engineer',
    description: 'Full Stack Developer and Software Engineer building fast, accessible web applications with React, Node.js, TypeScript and Go. Frontend Engineer at Razorpay.',
    path: '/',
  });

  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Layered parallax — each layer moves at a different speed.
  // Parallax is a scroll-bound style binding rather than an animation, so
  // MotionConfig can't switch it off; the ranges are flattened to 0 instead.
  // Decoupled scroll movement is a classic vestibular trigger.
  const reduce    = useReducedMotion();
  const p         = (distance) => (reduce ? 0 : distance);
  const bgY       = useTransform(scrollYProgress, [0, 1], [0, p(120)]);  // slow: background
  const midY      = useTransform(scrollYProgress, [0, 1], [0, p(220)]);  // medium: subtitle
  const y         = useTransform(scrollYProgress, [0, 1], [0, p(320)]);  // fast: headline
  const opacity   = useTransform(scrollYProgress, [0, 0.5], [1, 0]);     // fade only — kept

  // Build the audio element on first use. `new Audio(src)` defaults to
  // preload="auto", which would pull the whole track down on mount even for the
  // majority of visitors who never turn music on.
  const getAudio = () => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = 'none';
      el.loop = true;
      el.src = sakura;
      audioRef.current = el;
    }
    return audioRef.current;
  };

  // Handle music playback
  useEffect(() => {
    // Nothing to fade until the visitor has actually asked for audio once.
    if (!isPlayingMusic && !audioRef.current) return;

    const audio = getAudio();
    let fade;

    if (isPlayingMusic) {
      audio.volume = 0;
      audio.play().then(() => {
        // Fade in audio
        fade = setInterval(() => {
          if (audio.volume < 0.4) {
            // Clamp: assigning outside 0..1 throws IndexSizeError.
            audio.volume = Math.min(0.4, audio.volume + 0.02);
          } else {
            clearInterval(fade);
          }
        }, 100);
      }).catch(error => {
        console.error("Audio play failed:", error);
        setIsPlayingMusic(false);
      });
    } else {
      // Fade out audio
      fade = setInterval(() => {
        if (audio.volume > 0.02) {
          audio.volume = Math.max(0, audio.volume - 0.02);
        } else {
          audio.pause();
          clearInterval(fade);
        }
      }, 100);
    }

    // Clear only the interval here — pausing on every toggle would cut the
    // fade-out short. Teardown on unmount is handled separately below.
    return () => clearInterval(fade);
  }, [isPlayingMusic]);

  // Stop playback when leaving the page.
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // Hero section variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-white">
      <AnimatedBackground>
        <div ref={heroRef} className="relative w-full bg-transparent">
          {/* Hero Section */}
          <motion.section 
            className="relative h-screen flex flex-col items-center justify-center px-4 md:px-8 bg-transparent"
          >
            {/* 3D Animation */}
            <motion.div className="absolute inset-0 w-full h-full z-10" style={{ y: bgY }}>
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white flex flex-col items-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-t-blue-500 border-opacity-20 rounded-full animate-spin mb-4"></div>
                    <p className="text-sm md:text-base">Loading 3D Experience...</p>
                  </div>
                </div>
              }>
                <HeroAnimation />
              </Suspense>
            </motion.div>
            
            {/* Content Overlay — parallax foreground (moves fast) */}
            <motion.div
              className="relative z-20 container mx-auto px-4 sm:px-6 md:px-8 bg-transparent pt-32 md:pt-40"
              style={{ y, opacity }}
            >
              <motion.div
                className="text-center max-w-5xl mx-auto bg-transparent overflow-hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Main Title & Subtitle with Text Effects */}
                <motion.div variants={itemVariants} className="mb-6 md:mb-8 bg-transparent">
                  <TextEffect />
                </motion.div>
                
                {/* CTA Buttons — mid-speed parallax layer */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-4 justify-center mb-6 sm:mb-8 md:mb-10 px-2 sm:px-4" style={{ y: midY }}>
                  <Link
                    to="/projects"
                    className="w-full sm:w-auto px-6 py-3 sm:px-7 md:px-8 sm:py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                  >
                    <span>View Projects</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto px-6 py-3 sm:px-7 md:px-8 sm:py-3 md:py-4 bg-transparent border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl text-sm sm:text-base font-medium"
                  >
                    Contact Me
                  </Link>
                </motion.div>
                
                {/* Social Links */}
                <motion.div variants={itemVariants} className="flex justify-center gap-3 sm:gap-4 flex-wrap mb-8 sm:mb-10 md:mb-12 px-2">
                  {socialLinks.map((link, index) => (
                    <motion.a
                      key={link.name}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-300"
                      aria-label={link.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.4, ease: "easeOut" }}
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <SocialIcon
                        name={link.name}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:text-white transition-colors duration-300"
                        animationIndex={index}
                      />
                      <span className="text-sm sm:text-base text-white/70 group-hover:text-white transition-colors duration-300 font-medium">
                        {link.name}
                      </span>
                    </motion.a>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
              style={{ zIndex: 20 }}
            >
              <div className="flex flex-col items-center">
                <p className="text-white/70 mb-2 text-sm">Scroll to explore</p>
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-white/70 animate-bounce md:w-6 md:h-6"
                >
                  <path d="M7 13l5 5 5-5"></path>
                  <path d="M7 6l5 5 5-5"></path>
                </svg>
              </div>
            </motion.div>
          </motion.section>
          
          {/* Featured Section */}
          <section className="py-12 md:py-20 px-4 md:px-8 relative" id="featured-section">
            <div className="container mx-auto">
              <ScrollReveal animation="fade">
                <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-12 md:mb-16">
                  What I <span className="text-blue-400">Do</span>
                </h2>
              </ScrollReveal>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {[
                  {
                    title: "Frontend Development",
                    description: "Creating responsive, performant user interfaces with React, Next.js, and modern CSS frameworks.",
                    type: "frontend"
                  },
                  {
                    title: "Backend Engineering",
                    description: "Building scalable APIs and server-side applications using Node.js, Express, and cloud technologies.",
                    type: "backend"
                  },
                  {
                    title: "AI",
                    description: "Implementing data-driven solutions with Python and modern ML frameworks for real-world applications.",
                    type: "ml"
                  }
                ].map((service, index) => (
                  <ScrollReveal
                    key={index}
                    animation="slide"
                    direction={["left", "up", "right"][index]}
                    delay={index * 0.1}
                  >
                    <ServiceCard service={service} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
          
          {/* Horizontal Scroll Project Showcase */}
          <HorizontalProjectScroll />
        </div>
        
        {/* Sound Control */}
        <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50">
          <button
            onClick={() => setIsPlayingMusic(!isPlayingMusic)}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPlayingMusic ? 'bg-blue-600' : 'bg-black/20'
            } hover:shadow-lg hover:shadow-blue-500/20`}
            aria-label={isPlayingMusic ? "Mute" : "Play music"}
          >
        <img
          src={!isPlayingMusic ? soundoff : soundon}
              alt="Sound control"
              className={`w-5 h-5 md:w-6 md:h-6 object-contain transition-transform ${
                isPlayingMusic ? 'rotate-180 filter-white' : ''
          }`}
        />
          </button>
        </div>
      </AnimatedBackground>
      </div>
  );
};

export default Home;
