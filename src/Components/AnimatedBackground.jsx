import { useEffect, useRef } from 'react';
import {
  STARS,
  STAR_STRIDE,
  STAR_LABELS,
  CONSTELLATION_NAMES,
  CONSTELLATION_LINES,
} from '../constants/starCatalog';
import {
  localSiderealTime,
  horizontal,
  starColor,
  starGlowColor,
  magnitudeT,
  radiusForT,
  alphaForT,
} from '../utils/sky';
import { OBSERVER } from '../constants/observer';
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
    // Device pixels per CSS pixel, capped at 2. Everything below is written in
    // CSS pixels and the context carries the scale.
    //
    // This was the single largest thing wrong with the sky. The backing store
    // was sized in CSS pixels, so on any 2x display the whole field was drawn
    // at half resolution and then bilinearly upscaled by the compositor — and
    // most of a star catalogue is sub-pixel. A 0.7px point became a 1.4px grey
    // smudge, which is exactly the difference between "stars" and "noise".
    // Capped rather than uncapped because a 3x phone would quadruple the fill
    // cost for a difference nobody can see at that density.
    let dpr = 1;
    // Measured rather than assumed, so a change to the nav's padding cannot
    // silently start hiding star labels behind it.
    let headerHeight = 0;
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
    // Deeper and warmer-toward-blue, not indigo. The old bottom stop was
    // (26, 16, 56) — red above green with blue well clear of both, which is
    // violet, and with the canvas finally staying on screen past the hero it
    // turned the entire lower half of the page purple. Green now leads red, so
    // the descent deepens within the blue this site actually uses.
    const SKY_DEEP = [[3, 7, 28], [16, 30, 72]];

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
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Resizing a canvas resets its context state, so the scale has to be
      // re-established here and nowhere else.
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      headerHeight = document.querySelector('header')?.getBoundingClientRect().height || 0;

      // The sprites were baked for the old ratio, and a sprite drawn at the
      // wrong one is soft in exactly the way this change exists to fix.
      sprites.clear();

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
    
    // Looking due south, which is the richest part of the sky from 30 degrees
    // north and puts the galactic plane through the frame for much of the year.
    // How far *up* is not a constant — see cameraBasis.
    const VIEW_AZIMUTH = 180;

    const DEG = Math.PI / 180;
    const TAU = Math.PI * 2;

    /**
     * Where the camera points and how much sky it holds.
     *
     * Stereographic rather than gnomonic. Gnomonic keeps great circles
     * straight, which is right for a star chart and wrong here: it stretches
     * violently past about 60 degrees from centre, and this view is wider than
     * that. Stereographic distorts shape gently and preserves angles, so the
     * constellations stay recognisable at the edges — which is the entire point
     * of drawing real ones.
     *
     * The tilt is derived rather than chosen. Everything below the horizon is
     * culled, correctly — but at a fixed 34 degrees of elevation the horizon
     * itself fell inside the frame on every common viewport, leaving a starless
     * band across the bottom fifth of the page. Solving the stereographic
     * relation for the frame's own half-height gives the angle the bottom edge
     * reaches, and pointing six degrees above that keeps the horizon just out
     * of shot at any aspect ratio. Tall phone screens see much more vertical
     * sky than a laptop does, so this is the one number that cannot be a
     * constant.
     */
    const cameraBasis = () => {
      // Scale is degrees-to-pixels, and it is deliberately *not* proportional
      // to the viewport. It used to be `max(width, height) * 0.34`, which holds
      // the field of view constant and therefore magnifies the same sky onto a
      // bigger screen — so a 1920px monitor got the same 1,250 stars spread
      // over 2.9x the area as a laptop, and read as an empty one. Counted:
      //
      //   rule                      1920x1080   1440x900   390x844
      //   max*0.34 (field-locked)        1250       1379      1191
      //   this one                       1867       1495       946
      //
      // Pinning the scale instead means a larger window shows *more sky*, which
      // is what a larger window does. The clamp stops the two ends running
      // away: below 340 the distortion at the corners of a phone screen starts
      // to matter, above 460 a wide monitor is back to magnifying.
      const scale = Math.min(460, Math.max(340, Math.min(width, height) * 0.75));

      // In a stereographic projection a star theta from centre lands
      // 2*tan(theta/2) away, so this inverts to the angle at the frame edge.
      const edge = (2 * Math.atan(height / 2 / (2 * scale))) / DEG;
      const altitude = Math.min(74, edge + 6);

      const fAlt = altitude * DEG;
      const fAz = VIEW_AZIMUTH * DEG;
      const fx = Math.cos(fAlt) * Math.sin(fAz);
      const fy = Math.cos(fAlt) * Math.cos(fAz);
      const fz = Math.sin(fAlt);
      // right = forward x world-up, normalised; up = forward x right.
      const horiz = Math.hypot(fx, fy) || 1;
      const rx = -fy / horiz;
      const ry = fx / horiz;
      return {
        scale,
        fx, fy, fz,
        rx, ry,
        ux: -fz * ry,
        uy: fz * rx,
        uz: fx * ry - fy * rx,
      };
    };

    /**
     * Stars are pre-rendered once and blitted, not drawn.
     *
     * A star that reads as a light source rather than a dot needs three things
     * layered: a white core, a coloured halo, and — on the genuinely bright
     * ones — diffraction spikes. Composed live that is two radial gradients and
     * four polygons per star, and `createRadialGradient` is not free: at 2,300
     * stars and 60fps it is roughly a quarter of a million gradient objects a
     * second, which is a frame budget spent on garbage collection.
     *
     * So each distinct (brightness, colour) pair is drawn once into its own
     * small canvas and then copied per frame. Buckets are coarse — 16 steps of
     * brightness, 10 of colour — because the eye cannot separate adjacent ones
     * at these sizes, and built on demand rather than up front: the largest
     * sprites are also the rarest, since there are four stars in the entire sky
     * brighter than magnitude zero, and pre-building all 160 would spend
     * megabytes on combinations no star occupies.
     */
    const BRIGHT_BUCKETS = 16;
    const COLOR_BUCKETS = 10;
    const sprites = new Map();

    const buildSprite = (t, bv) => {
      // 1.15 *device* pixels is about the smallest dot that still reads as a
      // point rather than as grain, so the floor is that constant converted
      // back into the CSS pixels everything else is written in.
      const radius = radiusForT(t, Math.max(0.62, 1.15 / dpr));
      const alpha = alphaForT(t);
      const core = starColor(bv);
      const glow = starGlowColor(bv);

      // Faint stars get no halo at all. Two thousand of them each wearing a
      // glow is not a sky, it is fog: under additive blending those halos sum
      // across the whole frame and lift the black the bright stars need to
      // stand against.
      const haloT = Math.max(0, (t - 0.12) / 0.88);
      const haloR = radius * (2.2 + 4.8 * haloT);

      // Spikes start around magnitude 1.9 — about two dozen stars in the whole
      // sky, which is the point. They are a lens artefact rather than anything
      // an eye produces, but they are the universal visual shorthand for "this
      // one is bright", and rationing them to the stars that genuinely are
      // keeps that shorthand true.
      const spikeLen = t > 0.55 ? Math.min(radius * (5 + 15 * ((t - 0.55) / 0.45)), 52) : 0;

      const half = Math.ceil(Math.max(haloR, spikeLen)) + 1;
      const side = half * 2;

      const c = document.createElement('canvas');
      c.width = c.height = Math.ceil(side * dpr);
      const g = c.getContext('2d');
      g.scale(dpr, dpr);
      g.translate(half, half);
      // Additive inside the sprite too, so the core sits *on top of* the halo's
      // light rather than punching a hole in it.
      g.globalCompositeOperation = 'lighter';

      if (spikeLen > 0) {
        const w = Math.max(0.7, radius * 0.3);
        for (let i = 0; i < 2; i++) {
          g.save();
          g.rotate((i * Math.PI) / 2);
          const grad = g.createLinearGradient(-spikeLen, 0, spikeLen, 0);
          grad.addColorStop(0, `rgba(${glow},0)`);
          grad.addColorStop(0.5, `rgba(${glow},${(alpha * 0.4).toFixed(3)})`);
          grad.addColorStop(1, `rgba(${glow},0)`);
          g.fillStyle = grad;
          // A lens rather than a rectangle: thickest at the star, tapering to
          // nothing. A constant-width bar reads as a drawn cross.
          g.beginPath();
          g.moveTo(-spikeLen, 0);
          g.lineTo(0, -w);
          g.lineTo(spikeLen, 0);
          g.lineTo(0, w);
          g.closePath();
          g.fill();
          g.restore();
        }
      }

      if (haloT > 0) {
        const halo = g.createRadialGradient(0, 0, 0, 0, 0, haloR);
        halo.addColorStop(0, `rgba(${glow},${(alpha * 0.5 * haloT).toFixed(3)})`);
        halo.addColorStop(0.22, `rgba(${glow},${(alpha * 0.18 * haloT).toFixed(3)})`);
        halo.addColorStop(1, `rgba(${glow},0)`);
        g.fillStyle = halo;
        g.beginPath();
        g.arc(0, 0, haloR, 0, TAU);
        g.fill();
      }

      const disc = g.createRadialGradient(0, 0, 0, 0, 0, radius);
      disc.addColorStop(0, `rgba(255,255,255,${alpha.toFixed(3)})`);
      disc.addColorStop(0.45, `rgba(${core},${alpha.toFixed(3)})`);
      disc.addColorStop(1, `rgba(${core},0)`);
      g.fillStyle = disc;
      g.beginPath();
      g.arc(0, 0, radius, 0, TAU);
      g.fill();

      return { canvas: c, half, side };
    };

    const spriteFor = (t, bv) => {
      const tb = Math.round(t * (BRIGHT_BUCKETS - 1));
      const cb = Math.round(
        Math.max(0, Math.min(1, (bv + 0.4) / 2.4)) * (COLOR_BUCKETS - 1)
      );
      const key = tb * COLOR_BUCKETS + cb;
      let sprite = sprites.get(key);
      if (!sprite) {
        sprite = buildSprite(tb / (BRIGHT_BUCKETS - 1), (cb / (COLOR_BUCKETS - 1)) * 2.4 - 0.4);
        sprites.set(key, sprite);
      }
      return sprite;
    };

    /**
     * Project the visible sky onto the canvas.
     *
     * Recomputed only when the clock moves on, not per frame. The sky turns 15
     * degrees an hour; at 60fps that is four ten-thousandths of a degree
     * between frames, and projecting 5,044 stars to discover that would be the
     * most expensive thing on the page.
     */
    let projected = [];
    let projectedAt = 0;

    const projectSky = (now) => {
      const lst = localSiderealTime(new Date(now), OBSERVER.longitude);
      const cam = cameraBasis();
      const out = [];

      for (let i = 0; i < STARS.length; i += STAR_STRIDE) {
        const ra = STARS[i] / 100;
        const dec = STARS[i + 1] / 100;
        const mag = STARS[i + 2] / 100;
        const bv = STARS[i + 3] / 100;
        const label = STAR_LABELS[i / STAR_STRIDE];

        const { altitude, azimuth } = horizontal(ra, dec, OBSERVER.latitude, lst);
        // Everything under the horizon is behind the planet.
        if (altitude < -2) continue;

        const a = altitude * DEG;
        const z = azimuth * DEG;
        const sx = Math.cos(a) * Math.sin(z);
        const sy = Math.cos(a) * Math.cos(z);
        const sz = Math.sin(a);

        const dot = sx * cam.fx + sy * cam.fy + sz * cam.fz;
        if (dot < -0.2) continue; // behind the viewer

        const k = 2 / (1 + dot);
        const px = width / 2 + k * (sx * cam.rx + sy * cam.ry) * cam.scale;
        const py = height / 2 - k * (sx * cam.ux + sy * cam.uy + sz * cam.uz) * cam.scale;
        if (px < -80 || px > width + 80 || py < -80 || py > height + 80) continue;

        out.push({
          x: px,
          y: py,
          // Which pre-rendered sprite to blit. Bucketing here rather than at
          // draw time means the quantisation happens once a second for the
          // whole sky instead of 60 times a second per star.
          sprite: spriteFor(magnitudeT(mag), bv),
          // Twinkle is atmospheric scintillation, and it is strongest for
          // stars low in the sky, where you are looking through the most air.
          // Giving every star the same shimmer is the giveaway that it is an
          // effect rather than an atmosphere.
          twinkle: Math.max(0, 1 - altitude / 50) * 0.5,
          phase: (ra + dec) * 0.7,
          // Undefined for all but the 519 stars bright enough to aim at, which
          // is what makes the hit test below cheap: it is a property check
          // before it is any arithmetic.
          label,
          altitude,
          azimuth,
        });
      }

      projected = out;
      projectedAt = now;
    };

    const projectConstellations = () => {
      const lst = localSiderealTime(new Date(projectedAt), OBSERVER.longitude);
      const cam = cameraBasis();

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
          const dot = sx * cam.fx + sy * cam.fy + sz * cam.fz;
          if (dot < 0.1) { points.length = 0; break; }
          const k = 2 / (1 + dot);
          points.push([
            width / 2 + k * (sx * cam.rx + sy * cam.ry) * cam.scale,
            height / 2 - k * (sx * cam.ux + sy * cam.uy + sz * cam.uz) * cam.scale,
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

    // --- Naming ---------------------------------------------------------
    // The sky is real and, until this existed, unprovably so — it looked
    // exactly like a particle field with a good palette. Pointing at a star
    // names it, which turns the claim into something a visitor can check
    // against any sky app.
    //
    // A previous pass deleted a pointer handler from this file for running a
    // distance check against every star on every frame. This one does not: the
    // nearest labelled star is found inside the draw loop that is already
    // walking the projected list, and only for the 519 that carry a name.
    let pointer = null;
    let hover = null;       // the star currently named
    let hoverAlpha = 0;     // eased, so it does not flicker between neighbours

    // Generous, because a magnitude-3 star is about two pixels across and
    // nobody can put a cursor on that. Small enough that it still feels aimed.
    const HIT_RADIUS = 26;

    const finePointer =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches;

    const onPointerMove = (e) => {
      // The canvas is fixed at the viewport origin, so client coordinates are
      // already canvas coordinates. No getBoundingClientRect per move.
      pointer = { x: e.clientX, y: e.clientY };
      requestPaintIfStill();
    };
    const onPointerLeave = () => {
      pointer = null;
      requestPaintIfStill();
    };

    /**
     * Under reduced motion the loop paints one frame and stops, so the label
     * would never appear. Naming a star on demand is a discrete response to an
     * intentional action rather than ambient movement, so it still runs — it
     * just costs one frame per pointer move instead of sixty a second.
     */
    let stillFrame = null;
    const requestPaintIfStill = () => {
      if (!reduce || stillFrame !== null) return;
      stillFrame = requestAnimationFrame((t) => {
        stillFrame = null;
        animate(t);
      });
    };

    const drawLabel = (ctx, star) => {
      const [name, constellation] = star.label;
      const full = CONSTELLATION_NAMES[constellation] || constellation;
      const x = star.x;
      const y = star.drawnY;

      ctx.save();
      ctx.globalAlpha = hoverAlpha;

      // A ring rather than a highlight on the star itself: brightening the dot
      // would be a lie about its magnitude, and the whole point of the field is
      // that the magnitudes are true.
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, TAU);
      ctx.stroke();

      const NAME_FONT = '600 13px ui-sans-serif, system-ui, -apple-system, sans-serif';
      const META_FONT = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
      const meta = `${full} · ${Math.round(star.altitude)}° ${compass(star.azimuth)}`;

      ctx.font = NAME_FONT;
      const nameWidth = ctx.measureText(name).width;
      ctx.font = META_FONT;
      const metaWidth = ctx.measureText(meta).width;

      const boxW = Math.max(nameWidth, metaWidth) + 20;
      const boxH = 44;
      // Flip to the other side rather than let the card leave the viewport.
      const left = x + 18 + boxW > width ? x - 18 - boxW : x + 18;
      // The ceiling is the bottom of the nav bar, not the top of the viewport.
      // A star near the top of the screen put the card under the fixed header,
      // which is opaque and sits above the canvas — the name was simply gone.
      const top = Math.min(Math.max(headerHeight + 8, y - boxH / 2), height - boxH - 8);

      ctx.fillStyle = 'rgba(8, 13, 30, 0.82)';
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // roundRect landed in Safari 16.4; a square card is a fine thing to fall
      // back to and a thrown TypeError is not.
      if (ctx.roundRect) ctx.roundRect(left, top, boxW, boxH, 6);
      else ctx.rect(left, top, boxW, boxH);
      ctx.fill();
      ctx.stroke();

      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.font = NAME_FONT;
      ctx.fillText(name, left + 10, top + 20);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = META_FONT;
      ctx.fillText(meta, left + 10, top + 35);

      ctx.restore();
    };

    // Duplicated from constants/observer rather than imported, because that one
    // returns prose for a sentence ("north-east") and this wants the compact
    // form a chart uses.
    const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const compass = (azimuth) =>
      COMPASS[Math.round((((azimuth % 360) + 360) % 360) / 45) % 8];

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
      // Was 0.2. Lifting the black is the one thing that cannot be undone by
      // brightening the stars: contrast is a ratio, so a wash that raises the
      // floor flattens the whole field no matter how much light is added on
      // top of it.
      gradient.addColorStop(0, 'rgba(22, 30, 64, 0.13)');
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
      // The figures have to stay subordinate to the stars. Any brighter and the
      // hero reads as a network diagram rather than a sky — the lines are
      // regular and the stars are not, so the eye finds them first at equal
      // weight.
      context.strokeStyle = 'rgba(120, 165, 235, 0.075)';
      context.lineWidth = 1;
      context.translate(0, -scrollY * 0.06);
      for (const segment of constellationSegments) {
        context.beginPath();
        context.moveTo(segment[0][0], segment[0][1]);
        for (let i = 1; i < segment.length; i++) context.lineTo(segment[i][0], segment[i][1]);
        context.stroke();
      }
      context.restore();

      // The stars themselves, and the meteors, added rather than painted.
      //
      // 'lighter' is what light does: two overlapping halos are brighter than
      // either, and nothing drawn later can dim what is underneath it. Under
      // the default 'source-over' a meteor's own faint trail erased every star
      // it crossed, and the dense parts of the field looked no denser than the
      // sparse parts, because each star was replacing its neighbour's glow
      // instead of adding to it.
      context.globalCompositeOperation = 'lighter';

      const seconds = time * 0.001;
      // Nearest named star to the pointer, found in the loop that is already
      // computing every drawn position rather than in a pass of its own.
      let nearest = null;
      let nearestD2 = HIT_RADIUS * HIT_RADIUS;

      for (const star of projected) {
        const sprite = star.sprite;
        // Parallax by brightness. Brighter stars carry bigger sprites, so tying
        // the shift to sprite size makes the big ones lead — which is backwards
        // for real distance and right for the illusion of depth on a scrolling
        // page.
        const y = star.y - scrollY * (0.02 + sprite.half * 0.004);
        if (y + sprite.half < 0 || y - sprite.half > height) continue;

        if (pointer && star.label) {
          const dx = star.x - pointer.x;
          const dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < nearestD2) {
            nearestD2 = d2;
            star.drawnY = y;   // the parallaxed position, which is where it is
            nearest = star;
          }
        }

        context.globalAlpha = star.twinkle
          ? 1 - star.twinkle * 0.5 * (0.5 + 0.5 * Math.sin(seconds * 2.1 + star.phase))
          : 1;
        context.drawImage(
          sprite.canvas,
          star.x - sprite.half,
          y - sprite.half,
          sprite.side,
          sprite.side
        );
      }
      context.globalAlpha = 1;

      // Update and draw meteors
      meteors.forEach(meteor => {
        meteor.update();
        meteor.draw(context);
      });

      context.globalCompositeOperation = 'source-over';

      // The name, over the sky but under the page — a card cannot be seen
      // through, and neither can a star behind one.
      if (nearest) hover = nearest;
      if (reduce) {
        hoverAlpha = nearest ? 1 : 0;
      } else {
        hoverAlpha = nearest
          ? Math.min(1, hoverAlpha + 0.14)
          : Math.max(0, hoverAlpha - 0.09);
      }
      if (hover && hoverAlpha > 0.01) drawLabel(context, hover);


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
    
    // A scroll handler used to live here writing `translateY(scrollY)` onto the
    // canvas. The canvas is `position: fixed`, so that translated it out of the
    // viewport at exactly the rate the page scrolled: measured at scrollY 1215
    // its bounding box was at y=1215, entirely off screen. The sky existed on
    // the first screenful and nowhere else, and everything written to make the
    // descent mean something — the depth gradient from cold blue to indigo, the
    // nebula thickening, the per-star parallax — was computed every frame for a
    // surface nobody could see. It went unnoticed because the hero globe used to
    // carry the rest of the page on its own.
    //
    // A fixed canvas needs no scroll handling at all. Removing the one line is
    // the whole fix.

    // Initialize
    updateDimensions();
    fillBackground(getDepth()); // Ensure the background is filled immediately
    window.addEventListener('resize', updateDimensions);
    // Touch devices have no hover, and a label that appears under your thumb
    // and follows it around is not the feature.
    if (finePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onPointerLeave);
    }

    // Start animation and meteors. `animate` paints one frame either way; only
    // the repeat is conditional. Meteors are skipped entirely under reduced
    // motion — objects streaking across the viewport are the most aggressive
    // movement on the page.
    animate();
    if (!reduce) createMeteor();

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (stillFrame !== null) cancelAnimationFrame(stillFrame);
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
          // `willChange: transform` went with the scroll handler that used to
          // write one. Nothing transforms this element now, and promising the
          // compositor a change that never comes just holds a layer open.
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