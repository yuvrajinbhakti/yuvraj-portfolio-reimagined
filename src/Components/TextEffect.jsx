import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { SplitText } from 'gsap/SplitText';

// Register plugins
gsap.registerPlugin(TextPlugin, SplitText);

const AnimatedText = ({ 
  text, 
  delay = 0, 
  duration = 0.5, 
  type = 'fade', 
  className = '', 
  staggerDelay = 0.03,
  onComplete = () => {} 
}) => {
  const textRef = useRef(null);
  // Declare glitchInterval in component scope
  const glitchIntervalRef = useRef(null);
  
  useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    
    let tl = gsap.timeline({ 
      delay, 
      onComplete 
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
              
              if(iteration >= originalGlitchText.length) { 
                clearInterval(glitchIntervalRef.current);
                element.textContent = originalGlitchText;
              }
              iteration += 1/3;
            }, 30);
          });
        break;
        
      case 'split-words':
        // Create a SplitText instance for words
        const splitText = new SplitText(element, { type: "words" });
        const words = splitText.words;
        
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
      if (glitchIntervalRef.current) {
        clearInterval(glitchIntervalRef.current);
        glitchIntervalRef.current = null;
      }
    };
  }, [text, delay, duration, type, staggerDelay, onComplete]);
  
  return (
    <div ref={textRef} className={`bg-transparent ${className}`}>
      {text}
    </div>
  );
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
      <div className="mb-4 overflow-hidden bg-transparent">
        <AnimatedText 
          text="I'm Yuvraj Singh Nain" 
          type="character" 
          className="text-4xl md:text-6xl font-bold text-white" 
          delay={0.5}
          staggerDelay={0.05}
        />
      </div>
      
      <div className="overflow-hidden bg-transparent">
        <AnimatedText 
          text="Full Stack Developer & Software Engineer" 
          type="split-words" 
          className="text-xl md:text-2xl text-blue-300 mb-4" 
          delay={1.5}
          duration={0.7}
          staggerDelay={0.06}
        />
      </div>
      
      {animate && (
        <div className="mt-6 overflow-hidden bg-transparent">
          <AnimatedText 
            text="Building digital experiences that inspire!" 
            type="glitch" 
            className="text-lg md:text-xl text-gray-300" 
            delay={2.5}
            duration={1}
          />
        </div>
      )}
      
      {/* Floating particles */}
      {animate && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 rounded-full bg-blue-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      
      <style jsx="true">{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default TextEffect; 