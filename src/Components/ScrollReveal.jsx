import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({ 
  children, 
  animation = 'fade', // fade, slide, scale, rotate, flip, stagger, custom
  direction = 'up', // up, down, left, right - for slide animations
  duration = 0.7,
  delay = 0, 
  ease = 'power2.out',
  staggerDelay = 0.05, // for stagger animations
  distance = 50, // distance in pixels for slide animations
  threshold = 0.2, // trigger threshold (0 to 1)
  once = true, // animate once or every time
  className = '',
}) => {
  const ref = useRef(null);
  const childrenRef = useRef([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // GSAP is driven imperatively, so neither the CSS media query nor
    // MotionConfig can reach it. Skip the timeline entirely and make sure the
    // content is left visible — without this the gsap.set() initial states
    // would never be animated away and the page would render blank.
    if (reduce) {
      gsap.set(element, { clearProps: 'all', opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 });
      if (childrenRef.current.length) {
        gsap.set(childrenRef.current, { clearProps: 'all', opacity: 1, x: 0, y: 0 });
      }
      return;
    }

    // Paused, and with no ScrollTrigger attached yet.
    //
    // Attaching the trigger up here — as this did — creates it against an
    // element whose initial state has not been written and whose timeline has
    // no tweens in it. If the element is already past the start point on load,
    // which is true of anything in the first viewport, the trigger fires
    // immediately and plays an empty timeline to completion. Only *then* does
    // the switch below set opacity to 0 and append the tween that was supposed
    // to bring it back. The playhead is already at the end, so nothing runs and
    // the block stays invisible — content in the initial viewport is exactly
    // the case that breaks.
    //
    // Initial state and tweens are defined first now; the trigger is created
    // afterwards, at the bottom.
    let tl = gsap.timeline({ paused: true });

    // The collected child nodes, for the stagger case. Named distinctly from
    // the `children` prop it used to shadow — the prop is what gets rendered
    // below, these are the DOM nodes GSAP tweens.
    const staggerTargets = animation === 'stagger' ? childrenRef.current : null;
    
    // Set initial state based on animation type
    switch (animation) {
      case 'fade':
        gsap.set(element, { opacity: 0, y: direction === 'up' ? distance : direction === 'down' ? -distance : 0, x: direction === 'left' ? distance : direction === 'right' ? -distance : 0 });
        tl.to(element, { opacity: 1, y: 0, x: 0, duration, delay, ease });
        break;
        
      case 'slide': {
        const xFrom = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
        const yFrom = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
        gsap.set(element, { x: xFrom, y: yFrom, opacity: 0 });
        tl.to(element, { x: 0, y: 0, opacity: 1, duration, delay, ease });
        break;
      }
        
      case 'scale':
        gsap.set(element, { scale: 0.7, opacity: 0 });
        tl.to(element, { scale: 1, opacity: 1, duration, delay, ease });
        break;
        
      case 'rotate':
        gsap.set(element, { rotation: direction === 'left' ? -15 : 15, opacity: 0 });
        tl.to(element, { rotation: 0, opacity: 1, duration, delay, ease });
        break;
        
      case 'flip': {
        const axis = direction === 'up' || direction === 'down' ? 'X' : 'Y';
        const deg = (direction === 'down' || direction === 'right') ? 90 : -90;
        gsap.set(element, { [`rotate${axis}`]: deg, opacity: 0 });
        tl.to(element, { [`rotate${axis}`]: 0, opacity: 1, duration, delay, ease });
        break;
      }

      case 'stagger':
        if (staggerTargets && staggerTargets.length) {
          gsap.set(staggerTargets, {
            y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
            x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
            opacity: 0
          });

          tl.to(staggerTargets, {
            y: 0, 
            x: 0, 
            opacity: 1, 
            duration, 
            stagger: staggerDelay, 
            delay, 
            ease 
          });
        }
        break;
        
      case 'custom':
        // For custom animations, add class to handle in CSS
        element.classList.add('scroll-reveal-custom');
        break;
        
      default:
        gsap.set(element, { opacity: 0, y: 20 });
        tl.to(element, { opacity: 1, y: 0, duration, delay, ease });
    }
    
    // Now that the initial state is written and the tweens exist, wire up the
    // trigger. `once` maps to a one-way play; otherwise it reverses on the way
    // back out.
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: `top bottom-=${threshold * 100}%`,
      onEnter: () => tl.play(),
      onLeaveBack: once ? undefined : () => tl.reverse(),
      once,
    });

    // Belt and braces for the case that caused this: anything already inside
    // the viewport when the component mounts should be visible, not waiting on
    // a scroll that may never come. ScrollTrigger's own evaluation can miss
    // this if it runs before fonts and images have settled the layout.
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) tl.play();

    return () => {
      if (tl) tl.kill();
      trigger.kill();
    };
  }, [animation, direction, duration, delay, ease, staggerDelay, distance, threshold, once, reduce]);
  
  // Set refs for children if stagger animation
  const setChildRefs = element => {
    if (element && !childrenRef.current.includes(element)) {
      childrenRef.current.push(element);
    }
  };
  
  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {animation === 'stagger' 
        ? React.Children.map(children, child => (
            React.isValidElement(child)
              ? React.cloneElement(child, { ref: setChildRefs })
              : child
          ))
        : children
      }
    </div>
  );
};

ScrollReveal.propTypes = {
  children: PropTypes.node,
  animation: PropTypes.oneOf(['fade', 'slide', 'scale', 'rotate', 'flip', 'stagger', 'custom']),
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
  duration: PropTypes.number,
  delay: PropTypes.number,
  ease: PropTypes.string,
  staggerDelay: PropTypes.number,
  distance: PropTypes.number,
  // 0 to 1 — how far into the viewport the element must be before it plays.
  threshold: PropTypes.number,
  once: PropTypes.bool,
  className: PropTypes.string,
};

export default ScrollReveal;
