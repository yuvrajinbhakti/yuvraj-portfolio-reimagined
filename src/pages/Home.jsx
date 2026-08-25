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
import StackingProjectCards from "../Components/StackingProjectCards";
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

// Each card carries a concrete proof point rather than a capability claim.
// "Creating responsive, performant user interfaces" is something anyone can
// write; "+25% platform adoption" is not.
const SERVICES = [
  {
    type: 'frontend',
    title: 'Frontend Engineering',
    description:
      'React and TypeScript in production at Razorpay — merchant-facing analytics dashboards and an A/B testing framework with client-side caching.',
    proof: '+25% platform adoption',
  },
  {
    type: 'backend',
    title: 'Backend & Infrastructure',
    description:
      'Node.js and Go services, change-data-capture pipelines, and containerised deploys on Docker and Kubernetes.',
    proof: 'Onboarding: 2 weeks → 24 hours',
  },
  {
    type: 'ml',
    title: 'Machine Learning',
    description:
      'Amazon ML Summer School alumnus. Built an ML-powered fraud detection system for real-time transaction monitoring.',
    proof: 'Top 0.2% of 91,000 applicants',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const ServiceCard = ({ service }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left-aligned throughout. Centred body copy is measurably harder to
          read — every line starts at a different x, so the eye has to hunt for
          it — and centring three lines of prose inside an otherwise
          left-aligned page is the strongest template tell on the site. */}
      <GlassCard className="h-full p-6 md:p-8 flex flex-col group">
        <div className="mb-3 relative z-0">
          <ServiceIcon type={service.type} isHovered={isHovered} />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300 relative z-10">
          {service.title}
        </h3>
        <p className="text-white/70 text-sm md:text-base leading-relaxed relative z-10 flex-1">
          {service.description}
        </p>
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10">
          <span className="text-sm font-semibold text-blue-300">{service.proof}</span>
        </div>
      </GlassCard>
    </div>
  );
};

ServiceCard.propTypes = {
  service: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    proof: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['frontend', 'backend', 'ml']).isRequired,
  }).isRequired,
};

const Home = () => {
  useDocumentMeta({ path: '/' });

  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef(null);
  const heroRef = useRef(null);
  const heroSectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Measured against the hero *section* rather than the whole content block, so
  // progress 0 -> 1 spans exactly one viewport of scroll. Using heroRef here
  // would stretch the journey across four screens.
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"]
  });
  
  // Layered parallax — each layer moves at a different speed.
  // Parallax is a scroll-bound style binding rather than an animation, so
  // MotionConfig can't switch it off; the ranges are flattened to 0 instead.
  // Decoupled scroll movement is a classic vestibular trigger.
  const reduce    = useReducedMotion();
  const p         = (distance) => (reduce ? 0 : distance);
  const midY      = useTransform(scrollYProgress, [0, 1], [0, p(220)]);  // medium: subtitle
  const y         = useTransform(scrollYProgress, [0, 1], [0, p(320)]);  // fast: headline
  const opacity   = useTransform(scrollYProgress, [0, 0.5], [1, 0]);     // fade only — kept

  // Globe journey: centre-stage in the hero, then shrinks into the bottom-right
  // and holds there. useTransform clamps outside the input range, so once the
  // hero has scrolled past, the globe simply stays put.
  const globeScale = useTransform(heroProgress, [0, 1], [1, reduce ? 1 : 0.32]);
  const globeX = useTransform(heroProgress, [0, 1], ['0vw', reduce ? '0vw' : '30vw']);
  const globeY = useTransform(heroProgress, [0, 1], ['0vh', reduce ? '0vh' : '28vh']);
  // Under reduced motion nothing moves, so the globe is faded out instead of
  // being left sitting behind the page content.
  const globeOpacity = useTransform(
    heroProgress,
    reduce ? [0, 0.6] : [0, 0.85, 1],
    reduce ? [1, 0] : [1, 0.6, 0.5]
  );

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
          {/* Persistent globe.
              Lifted out of the hero so it survives past it: as the hero scrolls
              away the globe shrinks and settles into the bottom-right, carrying
              through the whole page instead of being hero decoration that
              disappears.

              Sticky rather than fixed. `position: fixed` is neutralised by any
              transformed ancestor, and the page-transition wrapper in App.jsx is
              a motion.div that carries a transform — measured breaking it. Sticky
              is unaffected by that, and it pins for as long as this container
              (hero + services + featured) is on screen, which is the whole page.

              h-0 so it claims no layout space; the inner h-screen simply
              overflows. z-10 sits above the starfield (z-0), below content (z-20). */}
          <div className="sticky top-0 h-0 z-10 pointer-events-none" aria-hidden="true">
            {/* `relative` is what makes the globe render at all. HeroAnimation's
                root is `absolute inset-0 h-full`, and this element is the only
                thing between it and the sticky wrapper above, which is
                deliberately h-0. Static, it is not a containing block, so those
                offsets resolved against that zero-height ancestor and the canvas
                collapsed to its 300x150 default in the corner. A transform would
                also make it one, which is why this looked fine in passing: the
                globe appears the moment you scroll and framer-motion writes a
                real transform, and vanishes again at the top of the page where an
                identity transform is serialised as `none`. */}
            <motion.div
              className="relative w-full h-screen"
              style={{ scale: globeScale, x: globeX, y: globeY, opacity: globeOpacity }}
            >
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
          </div>

          {/* Hero Section */}
          <motion.section
            ref={heroSectionRef}
            className="relative h-screen flex flex-col items-center justify-center px-4 md:px-8 bg-transparent"
          >
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
              
              {/* One direction, staggered — the previous version slid each card in
                  from a different side (left/up/right), which reads as three
                  unrelated effects rather than one considered entrance.
                  MotionConfig drops the y-offset under reduced motion. */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
              >
                {SERVICES.map((service) => (
                  <motion.div key={service.type} variants={cardVariants}>
                    <ServiceCard service={service} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
          
          {/* Horizontal Scroll Project Showcase */}
          <StackingProjectCards />
        </div>
        
        {/* Sound control — the only persistent floating element left, and
            deliberately quiet about it. It used to be a solid blue disc when
            playing, which made a secondary control the loudest thing on the
            page. Now it recedes until you look for it.
            alt="" because the button already carries the accessible name;
            labelling the image too made screen readers announce it twice. */}
        <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50">
          <button
            onClick={() => setIsPlayingMusic(!isPlayingMusic)}
            className={`w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-md transition-all duration-300 ${
              isPlayingMusic
                ? 'bg-white/10 border-white/25 opacity-90'
                : 'bg-white/5 border-white/10 opacity-40 hover:opacity-90 hover:border-white/25'
            }`}
            aria-label={isPlayingMusic ? 'Mute background music' : 'Play background music'}
            aria-pressed={isPlayingMusic}
          >
            <img
              src={!isPlayingMusic ? soundoff : soundon}
              alt=""
              aria-hidden="true"
              className="w-4 h-4 object-contain"
            />
          </button>
        </div>
      </AnimatedBackground>
      </div>
  );
};

export default Home;
