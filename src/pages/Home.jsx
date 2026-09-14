import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

// New components
import TextEffect from "../Components/TextEffect";
import AnimatedBackground from "../Components/AnimatedBackground";
import SocialIcon from "../Components/SocialIcon";
import StackingProjectCards from "../Components/StackingProjectCards";
// Former routes, now sections of this one. See where they are rendered below.
import About from "./About";
import Interactive from "./Interactive";
import Contact from "./Contact";
import SkyReadout from "../Components/SkyReadout";

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

// The three "What I Do" cards and their data moved to Components/ServiceCards
// and render inside About now — see the note where that section is mounted.

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
                    to="/#projects"
                    className="w-full sm:w-auto px-6 py-3 sm:px-7 md:px-8 sm:py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                  >
                    <span>View Projects</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/#contact"
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
                      className="group flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white/10 border border-white/10 hover:border-white/25 hover:bg-white/15 transition-all duration-300"
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

            {/* What the background actually is.
                Bottom-left of the hero, in the container's own gutter — which
                also clears the fixed audio button in the page corner, the
                reason this is not simply pinned to the viewport edge. Desktop
                only: on a phone the two would collide, and the hover naming it
                hints at needs a pointer anyway. */}
            <motion.div
              className="absolute bottom-8 left-0 right-0 hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.8 }}
              style={{ zIndex: 20 }}
            >
              <div className="container mx-auto px-4 md:px-8">
                <SkyReadout />
              </div>
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
          
          {/* "What I Do" used to sit here as its own section — three cards —
              followed one screen later by "Hello, I'm Yuvraj", which said the
              same three things in prose with the same numbers. The cards now
              live inside About (see ServiceCards), and the page introduces its
              author once. */}
          <section id="about" className="scroll-mt-20"><About /></section>

          {/* The one project section.
              There were two: this stack of four, and a second grid of seven
              underneath About that repeated these same four with thirty-one
              filter chips and a stats counter on top. Same work, shown twice,
              with the weaker presentation second. The four with case studies
              are the projects; the other three are a line at the bottom of the
              stack, which is all a Docker template and a rental site rebuild
              can carry next to a platform sixteen thousand merchants use.
              About sits above so the page runs in the nav's order. */}
          <section id="projects" className="scroll-mt-20"><StackingProjectCards /></section>

          {/*
           * The rest of the site, in order, under one sky.
           *
           * These four were routes until now, and each mounted its own
           * AnimatedBackground — five separate skies, every one of them running
           * a complete night from dusk to sunrise across its own scroll height.
           * The background's whole argument is that the page is one night
           * ending in one sunrise, and five copies of it made that false five
           * times over; the playground alone fitted a full dusk-to-dawn into
           * four and a half thousand pixels.
           *
           * One page, one night. The anchors are what the nav and the command
           * palette aim at now — they scroll rather than navigate, so the sky
           * keeps its place instead of starting the evening again.
           *
           * The case studies stay on their own routes. They are the long-form
           * writing, they are linked from outside, and four of them inlined
           * here would double a page that is already four and a half screens.
           */}
          <section id="playground" className="scroll-mt-20"><Interactive /></section>
          <section id="contact" className="scroll-mt-20"><Contact /></section>
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
            /* 36x36. A 12px backdrop blur under a button this size frosts a
               region smaller than the blur radius, and this one is position:
               fixed over the sky canvas — so it was re-blurring a repainting
               surface for every frame of the whole visit. */
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 ${
              isPlayingMusic
                ? 'bg-white/15 border-white/25 opacity-90'
                : 'bg-white/10 border-white/10 opacity-40 hover:opacity-90 hover:border-white/25'
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
