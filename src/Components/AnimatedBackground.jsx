import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useReducedMotion } from 'framer-motion';

const AnimatedBackground = ({ children }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let width, height, stars = [], meteors = [];
    // Tracked so the loop and the meteor scheduler can actually be torn down —
    // previously neither was cancelled on unmount.
    let rafId = null;

    // --- Descent -------------------------------------------------------
    // The page reads as one continuous journey rather than three stacked
    // sections if the sky itself changes as you move down it. `depth` runs 0
    // at the top to 1 at the bottom and drives everything below.
    //
    // Deliberately subtle — it should be felt, not noticed. Both ends stay very
    // dark so text contrast never shifts (white-on-near-black at every depth).
    const SKY_TOP = [[2, 6, 23], [15, 23, 42]];   // cold near-black blue
    const SKY_DEEP = [[5, 4, 24], [26, 16, 56]];  // indigo, further down

    const lerp = (a, b, t) => a + (b - a) * t;
    const mixRGB = (c1, c2, t) =>
      `rgb(${Math.round(lerp(c1[0], c2[0], t))}, ${Math.round(lerp(c1[1], c2[1], t))}, ${Math.round(lerp(c1[2], c2[2], t))})`;

    const getDepth = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return 0;
      return Math.min(1, Math.max(0, window.scrollY / max));
    };
    let meteorTimeoutId = null;
    
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
      
      update(deltaTime) {
        this.timePassed += deltaTime;
        
        // Oscillating opacity (twinkle effect)
        this.opacity = 0.5 + Math.sin(this.timePassed * this.twinkleSpeed) * this.twinkleAmplitude;
        
        // Stars do not move, and this is the whole of why the sky read as
        // wrong. Every star used to drift in its own random direction and
        // wrap at the edges, while the cursor shoved nearby ones aside — so
        // the field was in constant, directionless motion. That is what dust
        // does, or snow, or a screensaver. A night sky is fixed: the only
        // thing that changes is how brightly each point burns, which is the
        // twinkle above.
        //
        // Removing the motion also removes the reason `angle`, `speed`,
        // `originalX/Y` and the wrap existed, and the mouse-repulsion pass
        // that ran against every star on every frame.
        
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
      // Roughly triple the old density, and much smaller. A real sky is
      // overwhelmingly faint points with a handful of bright ones; 250 fat
      // dots is a scattering of confetti, and no amount of colour correction
      // fixes the count.
      const starCount = Math.min(Math.max(width, height) * 0.22, 760);
      
      for (let i = 0; i < starCount; i++) {
        // Clustered rather than evenly spread. Uniform random is the giveaway
        // — real skies have dense patches and voids, and an even scatter is
        // the one distribution nature never produces.
        const clustered = Math.random() < 0.55;
        const cx = Math.random() * width;
        const cy = Math.random() * height;
        const spread = width * 0.09;
        const x = clustered ? cx + (Math.random() - 0.5) * spread : Math.random() * width;
        const y = clustered ? cy + (Math.random() - 0.5) * spread : Math.random() * height;
        // Cubed, so the distribution is weighted hard towards the very small.
        const radius = 0.25 + Math.random() ** 3 * 1.5;
        const speed = Math.random() * 0.5 + 0.1;
        
        // The same blue band the cursor layer uses (196-238), not 220-280.
        // The old range ran past blue into violet, so roughly a third of the
        // field came out lavender — the exact stray purple that got the ambient
        // orbs deleted from this component, reintroduced one file over and
        // scattered across every page.
        const hue = Math.random() * 42 + 196;
        // And far less of it. At 50-100% these were saturated dots rather than
        // stars, which is what made them read as confetti over the globe.
        // Starlight is near-white with a suggestion of colour in it.
        const saturation = Math.random() * 30 + 15; // 15-45%
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
        
        // The bright pass. Same band as the field above, and the same reason:
        // at 80% saturation on hue 220-280 these were the most visible violet
        // on the page — big, bright, and right over the hero.
        const color = `hsla(${Math.random() * 42 + 196}, 45%, 88%`;
        
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
      meteorTimeoutId = setTimeout(createMeteor, Math.random() * 5000 + 2000);
    };
    
    // Fill canvas with initial gradient
    const fillBackground = (depth = 0) => {
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, mixRGB(SKY_TOP[0], SKY_DEEP[0], depth));
      gradient.addColorStop(1, mixRGB(SKY_TOP[1], SKY_DEEP[1], depth));
      
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
      
      const depth = getDepth();

      
      // Fill with gradient background
      
      fillBackground(depth);
      
      // Update stars position based on scroll
      const scrollY = window.scrollY;
      
      // Update and draw stars
      stars.forEach(star => {
        // Apply scroll effect - parallax
        const parallaxFactor = star.radius * 0.1; // Smaller stars move slower
        const effectiveY = star.y - (scrollY * parallaxFactor);
        
        // Only draw stars that are in the visible viewport area
        if (effectiveY > -50 && effectiveY < window.innerHeight + 50) {
          star.update(deltaTime);
          
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
      drawNebula(context, width, height, scrollY, depth);

      // Under reduced motion the scene is painted once and left static: the
      // starfield still reads as a backdrop, but nothing drifts or streaks.
      if (!reduce) {
        rafId = requestAnimationFrame(animate);
      }
    };
    
    // Draw a nebula effect
    const drawNebula = (ctx, width, height, scrollY, depth = 0) => {
      // Only draw nebula in part of the screen to avoid performance issues
      const nebulaX = width * 0.8;
      const nebulaY = height * 0.2 - scrollY * 0.2;
      
      // Create nebula gradient
      const nebulaGradient = ctx.createRadialGradient(
        nebulaX, nebulaY, 0,
        nebulaX, nebulaY, width * 0.4
      );
      
      // Thickens with depth, so the lower page feels denser.
        const k = 1 + depth * 1.6;
      // Both stops sit in the blue band. The middle one used to run red up to
      // 143 against a green of 58, which is not a blue nebula shading deeper —
      // it is a purple one, and it tinted the whole lower page.
      nebulaGradient.addColorStop(0, `rgba(46, 86, 170, ${(0.02 * k).toFixed(4)})`);
      nebulaGradient.addColorStop(0.5, `rgba(${Math.round(38 + 18 * depth)}, 74, 156, ${(0.015 * k).toFixed(4)})`);
      nebulaGradient.addColorStop(1, 'rgba(33, 33, 33, 0)');
      
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, width, height);
    };
    
    // The mousemove handler that used to live here is gone with the star
    // repulsion it fed. It tracked the pointer, ran a distance check against
    // every star on every frame, and set a 150ms timeout on each event — all
    // so the field could scatter away from the cursor, which is the effect
    // that made this read as a particle toy rather than a sky.
    
    // Scroll handler to reposition canvas
    const handleScroll = () => {
      // We'll use CSS transform for performance instead of repositioning
      if (canvas) {
        canvas.style.transform = `translateY(${window.scrollY}px)`;
      }
    };
    
    // Initialize
    updateDimensions();
    fillBackground(getDepth()); // Ensure the background is filled immediately
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('scroll', handleScroll);
    
    // Start animation and meteors. `animate` paints one frame either way; only
    // the repeat is conditional. Meteors are skipped entirely under reduced
    // motion — objects streaking across the viewport are the most aggressive
    // movement on the page.
    animate();
    if (!reduce) createMeteor();

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (meteorTimeoutId !== null) clearTimeout(meteorTimeoutId);
    };
  }, [reduce]);
  
  // NOTE: 3D perspective transform removed — it was creating a stacking context
  // that prevented native vertical scrolling on the page.
  
  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-[#020617]">
      {/* AmbientOrbs used to sit here — five blurred 350-600px colour blobs
          drifting behind everything. With the starfield canvas already running,
          they were a second decorative layer competing with the first, and they
          were the main source of stray purple and pink on a page whose accent is
          blue. The canvas carries the depth on its own. */}
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
        className="relative w-full"
        style={{ zIndex: 1 }}
      >
        {children}
      </div>
    </div>
  );
};

AnimatedBackground.propTypes = {
  children: PropTypes.node,
};

export default AnimatedBackground; 