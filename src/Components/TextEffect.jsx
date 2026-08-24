import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { SplitText } from 'gsap/SplitText';
import { useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';

// Register plugins
gsap.registerPlugin(TextPlugin, SplitText);

const AnimatedText = ({
  text,
  delay = 0,
  duration = 0.5,
  type = 'fade',
  className = '',
  staggerDelay = 0.03,
  onComplete = () => { },
  as: Tag = 'div'
}) => {
  const textRef = useRef(null);
  // Declare glitchInterval in component scope
  const glitchIntervalRef = useRef(null);
  const splitRef = useRef(null);
  // Latest onComplete without making it an effect dependency.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const reduce = useReducedMotion();

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    // Character-by-character reveals and the glitch effect are pure motion.
    // Render the text plainly and fire onComplete so any dependent state still
    // advances.
    if (reduce) {
      gsap.set(element, { clearProps: 'all', opacity: 1, x: 0, y: 0 });
      onCompleteRef.current();
      return;
    }

    let tl = gsap.timeline({
      delay,
      onComplete: () => onCompleteRef.current()
    });

    switch (type) {
      case 'fade':
        tl.from(element, {
          opacity: 0,
          y: 20,
          duration,
          ease: 'power2.out'
        });
        break;

      case 'reveal':
        // First hide the text container
        gsap.set(element, { overflow: 'hidden' });

        // Create a wrapper for the text
        const wrapper = document.createElement('div');
        wrapper.innerHTML = element.innerHTML;
        element.innerHTML = '';
        element.appendChild(wrapper);

        // Create the animation
        tl.from(wrapper, {
          y: '100%',
          duration,
          ease: 'power4.out'
        });
        break;

      case 'typewriter':
        const originalText = element.textContent;
        gsap.set(element, { text: '' });
        tl.to(element, {
          duration: duration * 2,
          text: originalText,
          ease: 'none'
        });
        break;

      case 'character':
        // Create a span for each character
        const chars = Array.from(element.textContent).map(char => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space for spaces
          return span;
        });

        element.textContent = '';
        chars.forEach(char => element.appendChild(char));

        // Animate each character
        tl.from(chars, {
          opacity: 0,
          y: 20,
          rotationX: 90,
          stagger: staggerDelay,
          duration: duration / 2,
          ease: 'back.out(1.7)'
        });
        break;

      case 'gradient':
        // Animate background position for gradient text
        gsap.set(element, {
          backgroundImage: 'linear-gradient(90deg, #4169e1, #8a2be2, #4169e1)',
          backgroundSize: '200% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          backgroundPosition: '0% 0%'
        });

        tl.to(element, {
          backgroundPosition: '100% 0%',
          duration: duration * 4,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });
        break;

      case 'glitch':
        // First make a copy of the original text
        const originalGlitchText = element.textContent;
        const glitchChars = "!<>-_\\/[]{}—=+*^?#@%$&~".split('');

        let iteration = 0;

        // Create the glitch animation
        tl.set(element, { opacity: 1 })
          .call(() => {
            glitchIntervalRef.current = setInterval(() => {
              element.textContent = originalGlitchText
                .split('')
                .map((char, index) => {
                  if (index < iteration) {
                    return originalGlitchText[index];
                  }
                  return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                })
                .join('');

              if (iteration >= originalGlitchText.length) {
                clearInterval(glitchIntervalRef.current);
                element.textContent = originalGlitchText;
              }
              iteration += 1 / 3;
            }, 30);
          });
        break;

      case 'split-words':
        // Held in a ref so cleanup can revert the split. Without that, a
        // re-run splits an element that is already split — the new words nest
        // inside the old ones, the outer set keeps the opacity: 0 written
        // below and is never animated, and the line renders blank forever.
        splitRef.current = new SplitText(element, { type: "words" });
        const words = splitRef.current.words;

        // Set initial state
        gsap.set(words, { opacity: 0, y: 20 });

        // Animate each word
        tl.to(words, {
          opacity: 1,
          y: 0,
          stagger: staggerDelay * 3,
          duration: duration,
          ease: "power2.out"
        });
        break;

      default:
        tl.from(element, {
          opacity: 0,
          y: 20,
          duration,
          ease: 'power2.out'
        });
    }

    return () => {
      tl.kill();
      // Put the markup back the way it was, and clear anything the timeline
      // left half-applied — a killed timeline leaves its targets wherever they
      // happened to be, which for a delayed animation is opacity: 0.
      if (splitRef.current) {
        splitRef.current.revert();
        splitRef.current = null;
      }
      gsap.set(element, { clearProps: 'opacity,transform' });
      if (glitchIntervalRef.current) {
        clearInterval(glitchIntervalRef.current);
        glitchIntervalRef.current = null;
      }
    };
    // onComplete is deliberately not a dependency. It defaults to an inline
    // arrow, so it has a new identity on every render of the parent — including
    // it re-ran this whole effect mid-animation, which is what broke the split
    // above. The ref keeps the latest callback without retriggering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delay, duration, type, staggerDelay, reduce]);

  return (
    <Tag ref={textRef} className={`bg-transparent ${className}`}>
      {text}
    </Tag>
  );
};

AnimatedText.propTypes = {
  text: PropTypes.string.isRequired,
  delay: PropTypes.number,
  duration: PropTypes.number,
  type: PropTypes.string,
  className: PropTypes.string,
  staggerDelay: PropTypes.number,
  onComplete: PropTypes.func,
  as: PropTypes.elementType,
};

const TextEffect = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-effect-container relative z-30 bg-transparent">
      {/* <div className="mb-4 overflow-hidden bg-transparent px-2 sm:px-4"> */}
      <div className="mb-4 overflow-hidden px-2 sm:px-4 pb-4">
        {/* The page's h1 — Home previously had no level-1 heading, so its
            document outline started at h2. */}
        <AnimatedText
          as="h1"
          text="I'm Yuvraj Singh Nain"
          type="character"
          // `tracking-wide` and `leading-[1.3]` were both wrong for the largest
          // type on the site — wide tracking and loose leading are corrections
          // for small text, and applying them at 60px is what makes display
          // type read as untreated. The size scale now carries its own optical
          // tracking and line height, so this just gets out of the way.
          className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-bold text-white"
          delay={0.5}
          staggerDelay={0.05}
        />
      </div>

      <div className="overflow-hidden bg-transparent px-2 sm:px-4">
        <AnimatedText
          text="Frontend Engineer at Razorpay"
          type="split-words"
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-300 mb-4 leading-relaxed"
          delay={1.5}
          duration={0.7}
          staggerDelay={0.06}
        />
      </div>

      {animate && (
        <div className="mt-6 overflow-hidden bg-transparent px-2 sm:px-4">
          <AnimatedText
            text="I build the screens businesses use to understand their money."
            type="split-words"
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed"
            delay={2.5}
            duration={1}
          />
        </div>
      )}

      {/* Twenty blue dots used to drift here on an infinite float loop. With
          the starfield canvas already running behind the hero, they were a
          second particle system layered on the first — noise competing with
          noise, and nothing to do with the message. */}

    </div>
  );
};

export default TextEffect; 