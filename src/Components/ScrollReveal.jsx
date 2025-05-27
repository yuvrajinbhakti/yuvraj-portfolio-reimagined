import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: `top bottom-=${threshold * 100}%`,
        toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        markers: false,
      },
    });
    
    // Get all children if stagger animation
    const children = animation === 'stagger' ? childrenRef.current : null;
    
    // Set initial state based on animation type
    switch (animation) {
      case 'fade':
        gsap.set(element, { opacity: 0, y: direction === 'up' ? distance : direction === 'down' ? -distance : 0, x: direction === 'left' ? distance : direction === 'right' ? -distance : 0 });
        tl.to(element, { opacity: 1, y: 0, x: 0, duration, delay, ease });
        break;
        
      case 'slide':
        const xFrom = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
        const yFrom = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
        gsap.set(element, { x: xFrom, y: yFrom, opacity: 0 });
        tl.to(element, { x: 0, y: 0, opacity: 1, duration, delay, ease });
        break;
        
      case 'scale':
        gsap.set(element, { scale: 0.7, opacity: 0 });
        tl.to(element, { scale: 1, opacity: 1, duration, delay, ease });
        break;
        
      case 'rotate':
        gsap.set(element, { rotation: direction === 'left' ? -15 : 15, opacity: 0 });
        tl.to(element, { rotation: 0, opacity: 1, duration, delay, ease });
        break;
        
      case 'flip':
        const axis = direction === 'up' || direction === 'down' ? 'X' : 'Y';
        const deg = (direction === 'down' || direction === 'right') ? 90 : -90;
        gsap.set(element, { [`rotate${axis}`]: deg, opacity: 0 });
        tl.to(element, { [`rotate${axis}`]: 0, opacity: 1, duration, delay, ease });
        break;
        
      case 'stagger':
        if (children && children.length) {
          gsap.set(children, { 
            y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
            x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
            opacity: 0 
          });
          
          tl.to(children, { 
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
    
    return () => {
      if (tl) tl.kill();
      if (element) ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [animation, direction, duration, delay, ease, staggerDelay, distance, threshold, once]);
  
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

export default ScrollReveal; 