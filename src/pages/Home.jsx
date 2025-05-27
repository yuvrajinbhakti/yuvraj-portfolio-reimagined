import React, { useState, useEffect, Suspense, useRef } from "react";
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
            className="relative h-screen flex flex-col items-center justify-center px-4 bg-transparent"
            style={{ y, opacity }}
          >
            {/* 3D Animation */}
            <div className="absolute inset-0 w-full h-full z-10">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-t-blue-500 border-opacity-20 rounded-full animate-spin mb-4"></div>
                    <p>Loading 3D Experience...</p>
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
                <motion.div variants={itemVariants} className="mb-8 bg-transparent">
                  <TextEffect />
                </motion.div>
                
                {/* CTA Buttons */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                  <Link
                    to="/projects"
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>View Projects</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/contact"
                    className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl"
                  >
                    Contact Me
                  </Link>
                </motion.div>
                
                {/* Social Links */}
                <motion.div variants={itemVariants} className="flex justify-center gap-6">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full flex items-center justify-center bg-black/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                      aria-label={link.name}
                    >
                      <img src={link.iconUrl} alt={link.name} className="w-6 h-6" />
                    </a>
                  ))}
                </motion.div>
              </motion.div>
      </div>

            {/* Scroll Indicator */}
            <motion.div 
              className="absolute bottom-10 left-0 right-0 flex justify-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
              style={{ zIndex: 20 }}
            >
              <div className="flex flex-col items-center">
                <p className="text-white/70 mb-2 text-sm">Scroll to explore</p>
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-white/70 animate-bounce"
                >
                  <path d="M7 13l5 5 5-5"></path>
                  <path d="M7 6l5 5 5-5"></path>
                </svg>
              </div>
            </motion.div>
          </motion.section>
          
          {/* Featured Section */}
          <section className="py-20 px-4 relative" id="featured-section">
            <div className="container mx-auto">
              <ScrollReveal animation="fade">
                <h2 className="text-4xl font-bold text-center text-white mb-16">
                  What I <span className="text-blue-400">Do</span>
                </h2>
              </ScrollReveal>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <GlassCard className="h-full p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-blue-500/20 hover:shadow-lg group">
                      <div className="text-4xl mb-4 transition-transform duration-700 transform group-hover:scale-110 group-hover:rotate-12">{service.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">{service.title}</h3>
                      <p className="text-white/70">{service.description}</p>
                    </GlassCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
          
          {/* Featured Work */}
          <section className="py-20 px-4 relative" id="featured-work">
            <div className="container mx-auto">
              <ScrollReveal animation="fade">
                <h2 className="text-4xl font-bold text-center text-white mb-16">
                  Featured <span className="text-blue-400">Work</span>
                </h2>
              </ScrollReveal>
              
              <ScrollReveal animation="scale">
                <GlassCard className="p-8 mb-12 hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">Realtime Code Editor</h3>
                      <p className="text-white/70 mb-6">
                        A collaborative real-time code editor using Socket.io and React.js, enabling multiple users to write and edit code simultaneously.
                      </p>
                      <Link 
                        to="/projects" 
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 group"
                      >
                        <span>View Project</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 transform group-hover:translate-x-1">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                    <div className="aspect-video bg-blue-900/30 rounded-lg overflow-hidden">
                      {/* Project Preview Image or Animation could go here */}
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
                        Project Preview
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
              
              <div className="text-center">
                <ScrollReveal animation="fade">
                  <Link 
                    to="/projects" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 group"
                  >
                    <span>View All Projects</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-300 transform group-hover:translate-x-1">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </ScrollReveal>
              </div>
            </div>
          </section>
        </div>
        
        {/* Sound Control */}
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => setIsPlayingMusic(!isPlayingMusic)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPlayingMusic ? 'bg-blue-600' : 'bg-black/20'
            } hover:shadow-lg hover:shadow-blue-500/20`}
            aria-label={isPlayingMusic ? "Mute" : "Play music"}
          >
        <img
          src={!isPlayingMusic ? soundoff : soundon}
              alt="Sound control"
              className={`w-6 h-6 object-contain transition-transform ${
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
