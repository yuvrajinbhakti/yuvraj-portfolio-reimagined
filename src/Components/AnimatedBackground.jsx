import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const AnimatedBackground = ({ children }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let width, height, stars = [], meteors = [];
    let mouseX = 0, mouseY = 0;
    let isMouseMoving = false;
    let mouseTimeout;
    
    // Set canvas dimensions
    const updateDimensions = () => {
      width = window.innerWidth;
      height = window.innerHeight; // Remove the 1.1 multiplier to prevent extra height
      canvas.width = width;
      canvas.height = height;
      
      // Recreate stars when dimensions change
      createStars();
    };
    
    // Star constructor
    class Star {
      constructor(x, y, radius, color, speed, trailLength = 0, angle = Math.random() * Math.PI * 2) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.angle = angle;
        this.trailLength = trailLength;
        this.trail = [];
        this.opacity = Math.random() * 0.5 + 0.5;
        this.timePassed = Math.random() * 1000;
        this.twinkleSpeed = Math.random() * 0.01 + 0.003;
        this.twinkleAmplitude = Math.random() * 0.3 + 0.1;
      }
      
      update(deltaTime, mouseInfluence = false) {
        this.timePassed += deltaTime;
        
        // Oscillating opacity (twinkle effect)
        this.opacity = 0.5 + Math.sin(this.timePassed * this.twinkleSpeed) * this.twinkleAmplitude;
        
        // Mouse influence
        if (mouseInfluence && isMouseMoving) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 250;
          
          if (distance < maxDistance) {
            const force = (1 - distance / maxDistance) * 3;
            this.x -= (dx / distance) * force;
            this.y -= (dy / distance) * force;
          }
        } else {
          // Slowly return to original position
          this.x += (this.originalX - this.x) * 0.03;
          this.y += (this.originalY - this.y) * 0.03;
        }
        
        // Movement
        const oscillation = Math.sin(this.timePassed * 0.001) * 0.5;
        this.x += Math.cos(this.angle) * this.speed * (1 + oscillation) * deltaTime * 0.01;
        this.y += Math.sin(this.angle) * this.speed * (1 + oscillation) * deltaTime * 0.01;
        
        // Wrap around edges
        if (this.x < -50) this.x = width + 50;
        if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;
        
        // Trail
        if (this.trailLength > 0) {
          this.trail.push({ x: this.x, y: this.y });
          if (this.trail.length > this.trailLength) {
            this.trail.shift();
          }
        }
      }
      
      draw(context) {
        // Draw trail
        if (this.trail.length > 0) {
          context.beginPath();
          context.moveTo(this.trail[0].x, this.trail[0].y);
          
          for (let i = 1; i < this.trail.length; i++) {
            context.lineTo(this.trail[i].x, this.trail[i].y);
          }
          
          context.lineTo(this.x, this.y);
          context.strokeStyle = this.color.replace(')', `, ${this.opacity * 0.5})`);
          context.stroke();
        }
        
        // Draw star
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color.replace(')', `, ${this.opacity})`);
        context.fill();
        
        // Add glow effect for brighter stars
        if (this.radius > 1) {
          context.beginPath();
          context.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
          const gradient = context.createRadialGradient(
            this.x, this.y, this.radius * 0.5,
            this.x, this.y, this.radius * 3
          );
          gradient.addColorStop(0, this.color.replace(')', ', 0.3)'));
          gradient.addColorStop(1, this.color.replace(')', ', 0)'));
          context.fillStyle = gradient;
          context.fill();
        }
      }
    }
    
    // Meteor constructor
    class Meteor {
      constructor() {
        this.reset();
      }
      
      reset() {
        this.x = Math.random() * width * 1.5;
        this.y = -100;
        this.length = Math.random() * 200 + 50;
        this.speed = Math.random() * 15 + 5;
        this.angle = Math.PI / 4 + (Math.random() * Math.PI / 8);
        this.opacity = 1;
        this.trailPoints = [];
        this.size = Math.random() * 3 + 1;
        this.active = true;
      }
      
      update() {
        // Move meteor
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        
        // Add trail point
        this.trailPoints.unshift({ x: this.x, y: this.y, opacity: 1 });
        
        // Limit trail length
        if (this.trailPoints.length > this.length) {
          this.trailPoints.pop();
        }
        
        // Fade trail points
        for (let i = 0; i < this.trailPoints.length; i++) {
          this.trailPoints[i].opacity = 1 - (i / this.trailPoints.length);
        }
        
        // Check if meteor is out of bounds
        if (this.x < -100 || this.x > width + 100 || this.y > height + 100) {
          this.active = false;
        }
      }
      
      draw(context) {
        // Draw trail
        for (let i = 1; i < this.trailPoints.length; i++) {
          const point = this.trailPoints[i];
          const prevPoint = this.trailPoints[i - 1];
          
          context.beginPath();
          context.moveTo(prevPoint.x, prevPoint.y);
          context.lineTo(point.x, point.y);
          context.strokeStyle = `rgba(150, 180, 255, ${point.opacity * 0.7})`;
          context.lineWidth = this.size * (1 - i / this.trailPoints.length);
          context.stroke();
        }
        
        // Draw meteor head
        context.beginPath();
        context.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        context.fillStyle = 'rgba(200, 220, 255, 0.8)';
        context.fill();
        
        // Add glow
        const gradient = context.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 6
        );
        gradient.addColorStop(0, 'rgba(150, 180, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(150, 180, 255, 0)');
        
        context.beginPath();
        context.arc(this.x, this.y, this.size * 6, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
      }
    }
    
    // Create stars
    const createStars = () => {
      stars = [];
      const starCount = Math.min(Math.max(width, height) * 0.07, 250); // Responsive star count
      
      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 1.8 + 0.5;
        const speed = Math.random() * 0.5 + 0.1;
        
        // Generate a color with a blue/purple hue
        const hue = Math.random() * 60 + 220; // 220-280 range for blue-purple
        const saturation = Math.random() * 50 + 50; // 50-100%
        const lightness = Math.random() * 30 + 70; // 70-100%
        const color = `hsla(${hue}, ${saturation}%, ${lightness}%`;
        
        // Add trail to some stars
        const trailLength = Math.random() < 0.3 ? Math.floor(Math.random() * 15) + 5 : 0;
        
        stars.push(new Star(x, y, radius, color, speed, trailLength));
      }
      
      // Create a few larger, brighter stars
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 1.5 + 1.8;
        const speed = Math.random() * 0.3 + 0.05;
        
        // Brighter color for larger stars
        const color = `hsla(${Math.random() * 60 + 220}, 80%, 85%`;
        
        stars.push(new Star(x, y, radius, color, speed, 0));
      }
    };
    
    // Create meteor
    const createMeteor = () => {
      // Clean up inactive meteors
      meteors = meteors.filter(meteor => meteor.active);
      
      // Add new meteor if we have less than max
      if (meteors.length < 5) {
        meteors.push(new Meteor());
      }
      
      // Schedule next meteor
      setTimeout(createMeteor, Math.random() * 5000 + 2000);
    };
    
    // Fill canvas with initial gradient
    const fillBackground = () => {
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#020617'); // Deep space blue at top
      gradient.addColorStop(1, '#0f172a'); // Slightly lighter blue at bottom
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    };
    
    // Animation loop
    let lastTime = 0;
    const animate = (time = 0) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // Clear canvas
      context.clearRect(0, 0, width, height);
      
      // Fill with gradient background
      fillBackground();
      
      // Update stars position based on scroll
      const scrollY = window.scrollY;
      
      // Update and draw stars
      stars.forEach(star => {
        // Apply scroll effect - parallax
        const parallaxFactor = star.radius * 0.1; // Smaller stars move slower
        const effectiveY = star.y - (scrollY * parallaxFactor);
        
        // Only draw stars that are in the visible viewport area
        if (effectiveY > -50 && effectiveY < window.innerHeight + 50) {
          star.update(deltaTime, true);
          
          // Temporarily adjust y-position for drawing
          const originalY = star.y;
          star.y = effectiveY;
          star.draw(context);
          star.y = originalY; // Restore original position
        }
      });
      
      // Update and draw meteors
      meteors.forEach(meteor => {
        meteor.update();
        meteor.draw(context);
      });
      
      // Draw subtle gradient
      const gradient = context.createRadialGradient(
        width / 2, height / 2 - scrollY, 0,
        width / 2, height / 2 - scrollY, Math.max(width, height) / 1.5
      );
      gradient.addColorStop(0, 'rgba(25, 33, 68, 0.2)');
      gradient.addColorStop(1, 'rgba(9, 12, 25, 0)');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      
      // Draw nebula
      drawNebula(context, width, height, scrollY);
      
      requestAnimationFrame(animate);
    };
    
    // Draw a nebula effect
    const drawNebula = (ctx, width, height, scrollY) => {
      // Only draw nebula in part of the screen to avoid performance issues
      const nebulaX = width * 0.8;
      const nebulaY = height * 0.2 - scrollY * 0.2;
      
      // Create nebula gradient
      const nebulaGradient = ctx.createRadialGradient(
        nebulaX, nebulaY, 0,
        nebulaX, nebulaY, width * 0.4
      );
      
      nebulaGradient.addColorStop(0, 'rgba(63, 81, 181, 0.02)');
      nebulaGradient.addColorStop(0.5, 'rgba(103, 58, 183, 0.015)');
      nebulaGradient.addColorStop(1, 'rgba(33, 33, 33, 0)');
      
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, width, height);
    };
    
    // Mouse move handler
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top + window.scrollY; // Adjust for scroll
      
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
      
      isMouseMoving = true;
      
      // Reset timeout
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        isMouseMoving = false;
      }, 150);
    };
    
    // Scroll handler to reposition canvas
    const handleScroll = () => {
      // We'll use CSS transform for performance instead of repositioning
      if (canvas) {
        canvas.style.transform = `translateY(${window.scrollY}px)`;
      }
    };
    
    // Initialize
    updateDimensions();
    fillBackground(); // Ensure the background is filled immediately
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    // Start animation and meteors
    animate();
    createMeteor();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Apply subtle parallax effect to container based on mouse position
  const parallaxStyle = {
    transform: `perspective(1000px) rotateX(${mousePosition.y * -2}deg) rotateY(${mousePosition.x * 2}deg)`,
    transition: 'transform 0.2s ease-out'
  };
  
  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-[#020617] overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-screen pointer-events-none"
        style={{ 
          background: 'linear-gradient(to bottom, #020617, #0f172a)',
          willChange: 'transform',
          zIndex: 0,
          overflow: 'hidden' // Add overflow hidden to prevent scrollbars
        }}
      />
      
      <div 
        className="relative w-full overflow-visible"
        style={{
          ...parallaxStyle,
          zIndex: 1
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground; 