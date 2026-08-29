import { useState, useEffect, useRef } from "react";
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

// The three.js hero globe used to be lazy-loaded here. It is gone, and with it
// three.js, @react-three/fiber and drei — 225 kB gzip that was the largest
// thing on the landing page and the only WebGL context on the site. Two
// decorative skies were competing above the fold, and the one behind it is the
// real one.

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
    // Where the claim is substantiated. /about opens on the experience tab by
    // default, which is the Razorpay role in full.
    to: '/about',
    linkLabel: 'The work at Razorpay',
  },
  {
    type: 'backend',
    title: 'Backend & Infrastructure',
    description:
      'Node.js and Go services, change-data-capture pipelines, and containerised deploys on Docker and Kubernetes.',
    proof: 'Onboarding: 2 weeks → 24 hours',
    // The deepest backend build on this site that can actually be read: Node,
    // Redis, Docker, and the reasoning behind each.
    to: '/work/secure-file-sharing',
    linkLabel: 'Read a backend build',
  },
  {
    type: 'ml',
    title: 'Machine Learning',
    description:
      'Amazon ML Summer School alumnus. Built an ML-powered fraud detection system for real-time transaction monitoring.',
    proof: 'Top 0.2% of 91,000 applicants',
    to: '/about',
    linkLabel: 'Background and coursework',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const ServiceCard = ({ service }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    // A link, not a div. Each of these cards makes a specific claim — +25%
    // adoption, two weeks down to twenty-four hours, top 0.2% of 91,000 — and
    // until now there was nothing to click on any of them. A number with no
    // route to its evidence is just an assertion, and three of them in a row
    // read as a brochure.
    //
    // aria-label rather than letting the accessible name fall out of the
    // contents: unlabelled, a screen reader announces the heading, the whole
    // description and the statistic as one link name.
    <Link
      to={service.to}
      aria-label={`${service.title} — ${service.linkLabel}`}
      className="h-full block rounded-2xl focus-visible:outline-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
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
          <span className="block text-sm font-semibold text-blue-300">{service.proof}</span>
          {/* Its own line, not beside the statistic. Side by side, the two
              longer proofs — "Onboarding: 2 weeks → 24 hours" and "Top 0.2% of
              91,000 applicants" — wrapped mid-phrase and left the three card
              footers at three different heights. */}
          <span
            aria-hidden="true"
            className="mt-2 text-xs text-white/40 group-hover:text-blue-300 transition-colors inline-flex items-center gap-1"
          >
            {service.linkLabel}
            <svg
              className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </GlassCard>
    </Link>
  );
};

ServiceCard.propTypes = {
  service: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    proof: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    linkLabel: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['frontend', 'backend', 'ml']).isRequired,
  }).isRequired,
};

const Home = () => {
  useDocumentMeta({ path: '/' });

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
          {/* The sticky three.js globe used to live here, above the hero and
              carrying through the rest of the page. Removing it also removed
              the readability scrim it needed — a four-stop dark gradient across
              the entire viewport, which existed to keep the headline legible
              over a dense wireframe and which was, incidentally, dimming the
              sky behind it everywhere else. */}

          {/* Hero Section */}
          <motion.section
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
                      // min-h-44 and justify-center are for the icon-only phone
                      // layout: without a label to give it height the pill came
                      // to 38px, and centring matters once the icon is the whole
                      // content. Desktop already clears 44 from sm:py-3.
                      className="group flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-300"
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
                      {/* Hidden below sm, where the three labelled pills need
                          344px and the column is 305. They wrapped two-then-one,
                          which centres as a visibly lopsided block under a hero
                          that is otherwise symmetrical. Three icons fit on one
                          line with room to spare, and it is the treatment the
                          footer already uses. aria-label on the anchor carries
                          the name for screen readers either way. */}
                      <span className="hidden sm:inline text-sm sm:text-base text-white/70 group-hover:text-white transition-colors duration-300 font-medium">
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
