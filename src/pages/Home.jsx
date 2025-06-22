import { useState, useEffect, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import PropTypes from 'prop-types';

// New components
import HeroAnimation from "../Components/HeroAnimation";
import TextEffect from "../Components/TextEffect";
import AnimatedBackground from "../Components/AnimatedBackground";
import ScrollReveal from "../Components/ScrollReveal";
import GlassCard from "../Components/GlassCard";

// Icons and media
import { socialLinks } from "../constants";
import sakura from '../assets/sakura.mp3';
import { soundoff, soundon } from "../assets/icons";
import realtimeCodeEditorImage from '../assets/images/realtime-code-editor.svg';

const Home = () => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [audioElement] = useState(new Audio(sakura));
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax effect for hero section
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Handle music playback
  useEffect(() => {
    audioElement.loop = true;
    
    if (isPlayingMusic) {
      audioElement.volume = 0;
      audioElement.play().then(() => {
        // Fade in audio
        const fadeIn = setInterval(() => {
          if (audioElement.volume < 0.4) {
            audioElement.volume += 0.02;
          } else {
            clearInterval(fadeIn);
          }
        }, 100);
      }).catch(error => {
        console.error("Audio play failed:", error);
      });
    } else if (!isPlayingMusic && audioElement.played.length > 0) {
      // Fade out audio
      const fadeOut = setInterval(() => {
        if (audioElement.volume > 0.02) {
          audioElement.volume -= 0.02;
    } else {
          audioElement.pause();
          clearInterval(fadeOut);
        }
      }, 100);
    }

    return () => {
      audioElement.pause();
    };
  }, [isPlayingMusic, audioElement]);
  
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
    <div className="min-h-screen w-full overflow-x-hidden bg-transparent text-white">
      <AnimatedBackground>
        <div ref={containerRef} className="relative w-full bg-transparent">
          {/* Hero Section */}
          <motion.section 
            className="relative h-screen flex flex-col items-center justify-center px-4 md:px-8 bg-transparent"
            style={{ y, opacity }}
          >
            {/* 3D Animation */}
            <div className="absolute inset-0 w-full h-full z-10">
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
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-20 container mx-auto px-2 bg-transparent pt-32 md:pt-40">
              <motion.div
                className="text-center max-w-4xl mx-auto bg-transparent"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Main Title & Subtitle with Text Effects */}
                <motion.div variants={itemVariants} className="mb-6 md:mb-8 bg-transparent">
                  <TextEffect />
                </motion.div>
                
                {/* CTA Buttons */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-10 px-4">
                  <Link
                    to="/projects"
                    className="px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <span>View Projects</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/contact"
                    className="px-6 py-3 md:px-8 md:py-4 bg-transparent border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl text-sm md:text-base"
                  >
                    Contact Me
                  </Link>
                </motion.div>
                
                {/* Social Links */}
                <motion.div variants={itemVariants} className="flex justify-center gap-3 md:gap-4 flex-wrap mb-6 md:mb-8">
                  {socialLinks.map((link, index) => {
                    // Enhanced Icon Components
                    const IconComponent = ({ name, className }) => {
                      IconComponent.propTypes = {
                        name: PropTypes.string.isRequired,
                        className: PropTypes.string
                      };
                      switch(name) {
                        case 'Email':
                          return (
                            <motion.svg 
                              className={className}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              whileHover={{ rotate: [0, -10, 10, 0] }}
                              transition={{ duration: 0.5 }}
                            >
                              <motion.path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut", delay: index * 0.2 }}
                              />
                              {/* Animated @ symbol */}
                              <motion.circle
                                cx="12"
                                cy="12"
                                r="2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1 + index * 0.2, duration: 0.5 }}
                              />
                              <motion.path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M12 10v4"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 1.3 + index * 0.2, duration: 0.3 }}
                              />
                            </motion.svg>
                          );
                        
                        case 'GitHub':
                          return (
                            <motion.svg 
                              className={className}
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                              whileHover={{ 
                                scale: 1.1,
                                rotate: 360 
                              }}
                              transition={{ duration: 0.6, ease: "easeInOut" }}
                            >
                              <motion.path
                                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, ease: "easeInOut", delay: index * 0.2 }}
                              />
                              {/* Animated stars around GitHub logo */}
                              {[...Array(3)].map((_, i) => (
                                <motion.circle
                                  key={i}
                                  cx={8 + i * 4}
                                  cy={4 + i * 2}
                                  r="0.5"
                                  fill="currentColor"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ 
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3 + index * 0.2
                                  }}
                                />
                              ))}
                            </motion.svg>
                          );
                        
                        case 'LinkedIn':
                          return (
                            <motion.svg 
                              className={className}
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                              whileHover={{ 
                                scale: 1.1,
                                y: [-2, 0, -2]
                              }}
                              transition={{ duration: 0.5 }}
                            >
                              <motion.path
                                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, ease: "easeInOut", delay: index * 0.2 }}
                              />
                              {/* Animated connection dots */}
                              <motion.g>
                                <motion.circle
                                  cx="6"
                                  cy="6"
                                  r="1"
                                  fill="currentColor"
                                  initial={{ scale: 0 }}
                                  animate={{ 
                                    scale: [0, 1.2, 1],
                                    opacity: [0, 1, 1]
                                  }}
                                  transition={{ delay: 1 + index * 0.2, duration: 0.5 }}
                                />
                                <motion.circle
                                  cx="18"
                                  cy="6"
                                  r="1"
                                  fill="currentColor"
                                  initial={{ scale: 0 }}
                                  animate={{ 
                                    scale: [0, 1.2, 1],
                                    opacity: [0, 1, 1]
                                  }}
                                  transition={{ delay: 1.2 + index * 0.2, duration: 0.5 }}
                                />
                                <motion.line
                                  x1="6"
                                  y1="6"
                                  x2="18"
                                  y2="6"
                                  stroke="currentColor"
                                  strokeWidth="0.5"
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 0.6 }}
                                  transition={{ delay: 1.4 + index * 0.2, duration: 0.8 }}
                                />
                              </motion.g>
                            </motion.svg>
                          );
                        
                        default:
                          return null;
                      }
                    };

                    return (
                    <motion.a
                      key={link.name}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                        className="group relative w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-cyan-600/10 backdrop-blur-xl border border-white/20 transition-all duration-500 transform hover:scale-110 hover:rotate-3 hover:shadow-2xl hover:shadow-blue-500/30 hover:border-white/40 overflow-hidden"
                      aria-label={link.name}
                      whileHover={{ 
                        scale: 1.15, 
                        rotate: 5,
                          transition: { duration: 0.3, ease: "easeOut" }
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        transition: { duration: 0.1 }
                      }}
                        initial={{ opacity: 0, y: 30, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          delay: 0.1 * index, 
                          duration: 0.5,
                          type: "spring",
                          stiffness: 100
                        }}
                      >
                        {/* Animated background gradients */}
                        <motion.div 
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-all duration-500"
                          animate={{
                            background: [
                              "linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)",
                              "linear-gradient(90deg, #8b5cf6, #06b6d4, #3b82f6)",
                              "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
                              "linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)"
                            ]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        
                        {/* Floating particles effect */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white/30 rounded-full"
                            style={{
                              left: `${20 + i * 10}%`,
                              top: `${10 + i * 15}%`,
                            }}
                            animate={{
                              y: [-10, 10, -10],
                              x: [-5, 5, -5],
                              opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                              duration: 3 + i * 0.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                        
                        {/* Enhanced glow ring */}
                        <motion.div 
                          className="absolute inset-1 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500"
                          animate={{
                            borderColor: [
                              "rgba(255,255,255,0.1)",
                              "rgba(59,130,246,0.3)",
                              "rgba(139,92,246,0.3)",
                              "rgba(6,182,212,0.3)",
                              "rgba(255,255,255,0.1)"
                            ]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                                                 {/* Icon container with enhanced styling */}
                         <div className="relative z-10 w-6 h-6 md:w-8 md:h-8 transition-all duration-500 group-hover:scale-110">
                          <div className="w-full h-full rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center p-2 group-hover:bg-black/30 transition-all duration-500 border border-white/10 group-hover:border-white/20">
                            <IconComponent 
                              name={link.name}
                              className="w-full h-full text-white/90 group-hover:text-white transition-all duration-500 drop-shadow-lg"
                            />
                          </div>
                      </div>
                      
                        {/* Premium tooltip with animation */}
                        <motion.div 
                          className="absolute -top-12 md:-top-14 left-1/2 transform -translate-x-1/2 bg-black/95 text-white text-xs px-3 py-2 md:px-4 md:py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none backdrop-blur-sm border border-white/20 shadow-2xl whitespace-nowrap font-medium"
                          initial={{ y: 10, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                        >
                        {link.name}
                          {/* Enhanced arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-black/95"></div>
                          
                          {/* Glowing effect for tooltip */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 -z-10 blur-sm"></div>
                        </motion.div>
                        
                        {/* Click ripple effect */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-white/20"
                          initial={{ scale: 0, opacity: 0 }}
                          whileTap={{ 
                            scale: 1.5, 
                            opacity: [0, 0.5, 0],
                            transition: { duration: 0.4 }
                          }}
                        />
                    </motion.a>
                    );
                  })}
                </motion.div>
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
              className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
              style={{ zIndex: 20 }}
            >
              <div className="flex flex-col items-center">
                <p className="text-white/70 mb-2 text-xs md:text-sm">Scroll to explore</p>
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
                    icon: "🎨"
                  },
                  {
                    title: "Backend Engineering",
                    description: "Building scalable APIs and server-side applications using Node.js, Express, and cloud technologies.",
                    icon: "⚙️"
                  },
                  {
                    title: "Machine Learning",
                    description: "Implementing data-driven solutions with Python and modern ML frameworks for real-world applications.",
                    icon: "🧠"
                  }
                ].map((service, index) => (
                  <ScrollReveal
                    key={index}
                    animation="slide"
                    direction={["left", "up", "right"][index]}
                    delay={index * 0.1}
                  >
                    <GlassCard className="h-full p-6 md:p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-blue-500/20 hover:shadow-lg group">
                      <div className="text-3xl md:text-4xl mb-3 md:mb-4 transition-transform duration-700 transform group-hover:scale-110 group-hover:rotate-12">{service.icon}</div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 group-hover:text-blue-400 transition-colors duration-300">{service.title}</h3>
                      <p className="text-white/70 text-sm md:text-base leading-relaxed">{service.description}</p>
                    </GlassCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
          
          {/* Featured Work */}
          <section className="py-12 md:py-20 px-4 md:px-8 relative" id="featured-work">
            <div className="container mx-auto">
              <ScrollReveal animation="fade">
                <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-12 md:mb-16">
                  Featured <span className="text-blue-400">Work</span>
                </h2>
              </ScrollReveal>
              
              <ScrollReveal animation="scale">
                <GlassCard className="p-6 md:p-8 mb-8 md:mb-12 hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                    <div className="order-2 md:order-1">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Realtime Code Editor</h3>
                      <p className="text-white/70 mb-4 md:mb-6 text-sm md:text-base leading-relaxed">
                        A collaborative real-time code editor using Socket.io and React.js, enabling multiple users to write and edit code simultaneously.
                      </p>
                      <Link 
                        to="/projects" 
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 group text-sm md:text-base"
                      >
                        <span>View Project</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 transform group-hover:translate-x-1 md:w-5 md:h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                    <div className="order-1 md:order-2 aspect-video bg-blue-900/30 rounded-lg overflow-hidden">
                      {/* Project Preview Image */}
                      <img 
                        src={realtimeCodeEditorImage} 
                        alt="Realtime Code Editor Interface" 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
              
              <div className="text-center">
                <ScrollReveal animation="fade">
                  <Link 
                    to="/projects" 
                    className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 group text-sm md:text-base"
                  >
                    <span>View All Projects</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 transform group-hover:translate-x-1 md:w-5 md:h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </ScrollReveal>
              </div>
            </div>
          </section>
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
