import { useState, useEffect, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

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
            <div className="relative z-20 container mx-auto px-4 bg-transparent">
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
                <motion.div variants={itemVariants} className="flex justify-center gap-4 md:gap-6 flex-wrap">
                  {socialLinks.map((link, index) => (
                    <motion.a
                      key={link.name}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 transition-all duration-300 transform hover:scale-110 hover:rotate-3 hover:shadow-xl hover:shadow-blue-500/25 hover:border-white/20"
                      aria-label={link.name}
                      whileHover={{ 
                        scale: 1.15, 
                        rotate: 5,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        transition: { duration: 0.1 }
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      {/* Enhanced glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                      
                      {/* Icon background for better contrast */}
                      <div className="absolute inset-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Icon with consistent styling */}
                      <div className="relative z-10 w-6 h-6 md:w-8 md:h-8 transition-all duration-300 group-hover:scale-110">
                        <div className="w-full h-full rounded-lg bg-black/20 backdrop-blur-sm flex items-center justify-center p-1 group-hover:bg-black/30 transition-all duration-300 border border-white/10">
                          <img 
                            src={link.iconUrl} 
                            alt={link.name} 
                            className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:drop-shadow-lg"
                          />
                        </div>
                      </div>
                      
                      {/* Enhanced tooltip */}
                      <div className="absolute -top-10 md:-top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none backdrop-blur-sm border border-white/20 shadow-lg whitespace-nowrap">
                        {link.name}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                      </div>
                    </motion.a>
                  ))}
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
