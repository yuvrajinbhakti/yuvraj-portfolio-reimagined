import { useEffect, useRef } from 'react';
import { STARS, STAR_STRIDE, CONSTELLATION_LINES } from '../constants/starCatalog';
import { localSiderealTime, horizontal, starColor, magnitudeToAlpha, magnitudeToRadius } from '../utils/sky';
import PropTypes from 'prop-types';
import { useReducedMotion } from 'framer-motion';

const AnimatedBackground = ({ children }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let width, height, meteors = [];
    let constellationSegments = [];
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
    // The Star class that lived here is gone with the random field it
    // generated. Real stars need no per-object state: their positions come from
    // the catalogue, their brightness from a magnitude, and the only thing that
    // varies per frame is scintillation, which is one sine.

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
    /**
     * Chandigarh, which is where the footer says the author is. The sky is
     * genuinely different from anywhere else, so the coordinates have to be
     * somebody's rather than a default.
     */
    const OBSERVER = { latitude: 30.7333, longitude: 76.7794 };

    // Looking south and a little up, which is the richest part of the sky from
    // 30 degrees north and puts the galactic plane through the frame for much
    // of the year.
    const VIEW = { altitude: 34, azimuth: 180 };

    const DEG = Math.PI / 180;

    /**
     * Project the visible sky onto the canvas.
     *
     * Stereographic rather than gnomonic. Gnomonic keeps great circles
     * straight, which is right for a star chart and wrong here: it stretches
     * violently past about 60 degrees from centre, and this view is wider than
     * that. Stereographic distorts shape gently and preserves angles, so the
     * constellations stay recognisable at the edges — which is the entire point
     * of drawing real ones.
     *
     * Recomputed only when the clock moves on, not per frame. The sky turns 15
     * degrees an hour; at 60fps that is four ten-thousandths of a degree
     * between frames, and projecting 2,851 stars to discover that would be the
     * most expensive thing on the page.
     */
    let projected = [];
    let projectedAt = 0;

    const projectSky = (now) => {
      const lst = localSiderealTime(new Date(now), OBSERVER.longitude);

      // Camera basis. Forward is where we are looking; right and up come from
      // it and the world vertical.
      const fAlt = VIEW.altitude * DEG;
      const fAz = VIEW.azimuth * DEG;
      const fx = Math.cos(fAlt) * Math.sin(fAz);
      const fy = Math.cos(fAlt) * Math.cos(fAz);
      const fz = Math.sin(fAlt);
      const horiz = Math.hypot(fx, fy) || 1;
      const rx = -fy / horiz;
      const ry = fx / horiz;
      // up = forward x right
      const ux = fy * 0 - fz * ry;
      const uy = fz * rx - fx * 0;
      const uz = fx * ry - fy * rx;

      // Field of view, as a scale factor. In a stereographic projection a star
      // theta from centre lands 2*tan(theta/2) away, so 0.62 put only about 44
      // degrees on screen in each direction — a keyhole, through which a
      // 1,289-star sky arrived as a few dozen widely spaced points. 0.34 opens
      // it to roughly the whole visible hemisphere, which is both what you see
      // standing outside and what makes the field look like a field.
      const scale = Math.max(width, height) * 0.34;
      const out = [];

      for (let i = 0; i < STARS.length; i += STAR_STRIDE) {
        const ra = STARS[i] / 100;
        const dec = STARS[i + 1] / 100;
        const mag = STARS[i + 2] / 100;
        const bv = STARS[i + 3] / 100;

        const { altitude, azimuth } = horizontal(ra, dec, OBSERVER.latitude, lst);
        // Everything under the horizon is behind the planet.
        if (altitude < -2) continue;

        const a = altitude * DEG;
        const z = azimuth * DEG;
        const sx = Math.cos(a) * Math.sin(z);
        const sy = Math.cos(a) * Math.cos(z);
        const sz = Math.sin(a);

        const dot = sx * fx + sy * fy + sz * fz;
        if (dot < -0.2) continue; // behind the viewer

        const k = 2 / (1 + dot);
        const px = width / 2 + k * (sx * rx + sy * ry) * scale;
        const py = height / 2 - k * (sx * ux + sy * uy + sz * uz) * scale;
        if (px < -60 || px > width + 60 || py < -60 || py > height + 60) continue;

        out.push({
          x: px,
          y: py,
          radius: magnitudeToRadius(mag),
          alpha: magnitudeToAlpha(mag),
          color: starColor(bv),
          // Twinkle is atmospheric scintillation, and it is strongest for
          // stars low in the sky, where you are looking through the most air.
          // Giving every star the same shimmer is the giveaway that it is an
          // effect rather than an atmosphere.
          twinkle: Math.max(0, 1 - altitude / 50) * 0.5,
          phase: (ra + dec) * 0.7,
        });
      }

      projected = out;
      projectedAt = now;
    };

    const projectConstellations = () => {
      const lst = localSiderealTime(new Date(projectedAt), OBSERVER.longitude);
      const fAlt = VIEW.altitude * DEG;
      const fAz = VIEW.azimuth * DEG;
      const fx = Math.cos(fAlt) * Math.sin(fAz);
      const fy = Math.cos(fAlt) * Math.cos(fAz);
      const fz = Math.sin(fAlt);
      const horiz = Math.hypot(fx, fy) || 1;
      const rx = -fy / horiz;
      const ry = fx / horiz;
      const ux = -fz * ry;
      const uy = fz * rx;
      const uz = fx * ry - fy * rx;
      const scale = Math.max(width, height) * 0.34;

      const segments = [];
      for (const line of CONSTELLATION_LINES) {
        const points = [];
        for (const [raTenths, decTenths] of line) {
          const { altitude, azimuth } = horizontal(raTenths / 10, decTenths / 10, OBSERVER.latitude, lst);
          if (altitude < 0) { points.length = 0; break; }
          const a = altitude * DEG;
          const z = azimuth * DEG;
          const sx = Math.cos(a) * Math.sin(z);
          const sy = Math.cos(a) * Math.cos(z);
          const sz = Math.sin(a);
          const dot = sx * fx + sy * fy + sz * fz;
          if (dot < 0.1) { points.length = 0; break; }
          const k = 2 / (1 + dot);
          points.push([
            width / 2 + k * (sx * rx + sy * ry) * scale,
            height / 2 - k * (sx * ux + sy * uy + sz * uz) * scale,
          ]);
        }
        if (points.length > 1) segments.push(points);
      }
      return segments;
    };

    const createStars = () => {
      projectSky(Date.now());
      constellationSegments = projectConstellations();
    };

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
    const animate = (time = 0) => {
      
      // Clear canvas
      context.clearRect(0, 0, width, height);
      
      const depth = getDepth();

      
      // Fill with gradient background
      
      fillBackground(depth);
      
      const scrollYForSky = window.scrollY;
      
      // The glow and the nebula are sky, so they belong under the stars.
      // They used to be painted last, which meant a 20%-opacity wash across
      // the whole canvas went over the top of everything — enough to fog out
      // a magnitude-5 star drawn at alpha 0.35 and under a pixel wide. The
      // field was being rendered correctly the whole time and then covered up.
      const gradient = context.createRadialGradient(
        width / 2, height / 2 - scrollYForSky, 0,
        width / 2, height / 2 - scrollYForSky, Math.max(width, height) / 1.5
      );
      gradient.addColorStop(0, 'rgba(25, 33, 68, 0.2)');
      gradient.addColorStop(1, 'rgba(9, 12, 25, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      
      drawNebula(context, width, height, scrollYForSky, depth);
      
      const scrollY = window.scrollY;

      // Re-project once a second. The sky turns 15 degrees an hour, so between
      // frames it moves four ten-thousandths of a degree — recomputing 2,851
      // positions to find that out would be the most expensive thing here.
      if (time - projectedAt > 1000) {
        projectSky(Date.now());
        constellationSegments = projectConstellations();
      }

      // The figures, under everything, at the edge of visible. They are there
      // for the moment somebody recognises Orion, not to be read.
      context.save();
      context.strokeStyle = 'rgba(120, 165, 235, 0.07)';
      context.lineWidth = 1;
      context.translate(0, -scrollY * 0.06);
      for (const segment of constellationSegments) {
        context.beginPath();
        context.moveTo(segment[0][0], segment[0][1]);
        for (let i = 1; i < segment.length; i++) context.lineTo(segment[i][0], segment[i][1]);
        context.stroke();
      }
      context.restore();

      // The stars themselves.
      const seconds = time * 0.001;
      for (const star of projected) {
        // Parallax by brightness. Brighter stars are drawn larger, so tying the
        // shift to radius makes the big ones lead — which is backwards for real
        // distance and right for the illusion of depth on a scrolling page.
        const y = star.y - scrollY * (0.02 + star.radius * 0.012);
        if (y < -40 || y > height + 40) continue;

        const shimmer = star.twinkle
          ? 1 - star.twinkle * 0.5 * (0.5 + 0.5 * Math.sin(seconds * 2.1 + star.phase))
          : 1;
        const alpha = star.alpha * shimmer;

        context.beginPath();
        context.arc(star.x, y, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${star.color}, ${alpha.toFixed(3)})`;
        context.fill();

        // A halo on the few genuinely bright ones. This is the airy disc a
        // camera and an eye both produce, and it is most of what makes Sirius
        // look like Sirius rather than a slightly larger dot.
        if (star.radius > 1.5) {
          const glow = context.createRadialGradient(star.x, y, 0, star.x, y, star.radius * 4.5);
          glow.addColorStop(0, `rgba(${star.color}, ${(alpha * 0.35).toFixed(3)})`);
          glow.addColorStop(1, `rgba(${star.color}, 0)`);
          context.beginPath();
          context.arc(star.x, y, star.radius * 4.5, 0, Math.PI * 2);
          context.fillStyle = glow;
          context.fill();
        }
      }

      // Update and draw meteors
      meteors.forEach(meteor => {
        meteor.update();
        meteor.draw(context);
      });
      

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