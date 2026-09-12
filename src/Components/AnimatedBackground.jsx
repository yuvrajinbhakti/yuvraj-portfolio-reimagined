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
import { sunPosition, nextSunrise, nightfallBefore } from '../utils/sun';
import { moonHorizontal, moonPhase } from '../utils/moon';
import { setSkyTime, resetSkyTime } from '../utils/skyClock';
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
    /**
     * The descent is a clock.
     *
     * The sky here is not decorative — it is this catalogue, reduced for
     * Chandigarh's latitude at an actual moment, and the readout in the hero
     * says so out loud. Which means a scroll that simply faded the palette from
     * dark to light would make that readout a lie: daylight above a caption
     * claiming 3am.
     *
     * So the scroll moves the moment instead of the mood. Depth 0 is now. Depth
     * 1 is the next time the sun comes up over that latitude. Everything between
     * is the sky that will actually be there — stars wheel west at fifteen
     * degrees an hour because that is what the Earth does, and the horizon warms
     * because the sun is genuinely on its way up. Scroll back and it runs
     * backwards.
     *
     * ## One night, not "from here"
     *
     * The span used to start at the visitor's own clock and run to the next
     * sunrise, on the reasoning that the top of the page should be the sky
     * actually overhead. It read well at two in the morning and badly at two in
     * the afternoon, which is when most people look at it: the page opened in
     * broad daylight with the sun drawn straight through the headline, and the
     * dark star field this whole background exists for did not appear until you
     * had already scrolled past the hero.
     *
     * So the page shows a night — the one that ends at the next sunrise. Depth 0
     * is the end of evening twilight, which is the darkest the sky gets, and
     * depth 1 is the sun on the horizon. Everyone arrives at the same opening
     * and everyone ends at the same sunrise, whatever the hour they turned up.
     *
     * What that costs is the claim that the sky is the one currently overhead,
     * and the readout is changed to match rather than left saying something that
     * stopped being true. It still names a real hour of a real night at a real
     * place; it no longer implies that hour is this one.
     */
    let skyNow = Date.now();
    let sunriseAt = null;
    /** Where the night begins. See refreshSunrise. */
    let nightAt = null;
    // Where on the horizon it will come up. Not a constant: due east only at the
    // equinoxes, and swinging about 28 degrees either side of it across the year
    // at this latitude. The view turns to face this, so it has to be the real one.
    let sunriseAzimuth = 90;

    const refreshSunrise = () => {
      const found = nextSunrise(new Date(), OBSERVER);
      // Null above the polar circles in the season where the sun never rises.
      // Not a case Chandigarh can reach, handled because the function can
      // return it and a crash behind every page would be a poor way to find out.
      sunriseAt = found ? found.getTime() : Date.now() + 12 * 3600 * 1000;
      if (found) sunriseAzimuth = sunPosition(found, OBSERVER).azimuth;

      /*
       * And where that night started: the sunset before it, not the nightfall.
       *
       * It began at the end of astronomical twilight, on the reasoning that the
       * darkest possible sky was the right thing to open on. Two things were
       * wrong with it. The sky then had nowhere to go but down for the first
       * half of the page — the sun was already as far below the horizon as it
       * was going to get, so nothing changed until the dawn, and the sunrise
       * arrived as an event tacked onto the last stretch rather than the end of
       * anything. And it cut the moon out: a young crescent is a dusk object,
       * it follows the sun down, and tonight it set at 19:13 against a night
       * that began at 19:54. Near new moon there is no moon in the night at all.
       *
       * From sunset the page has an actual shape — dusk burning down through
       * the hero, the dark hours in the middle, dawn coming up to meet it — and
       * the moon is where it really is, which near new moon is low in the west
       * at the top of the page and gone by the time you have scrolled past it.
       */
      const dark = found ? nightfallBefore(found, OBSERVER, 0) : null;
      nightAt = dark ? dark.getTime() : sunriseAt - 11 * 3600 * 1000;
    };
    refreshSunrise();

    /**
     * Scroll depth to time — weighted, not linear.
     *
     * Linear was the obvious mapping and it wasted the page. A night is mostly
     * nothing happening: measured over a typical span, the sun spends about half
     * of it below eighteen degrees, where the sky is as dark as it is going to
     * get and one hour is indistinguishable from the next. Mapping that straight
     * onto scroll spent half the page on a sky that never changed, and then had
     * to fit the whole of dawn into the last three per cent — the part somebody
     * actually scrolled down to see went past in a flick of the wheel.
     *
     * So the pixels follow the change rather than the clock. Each slice of the
     * span is weighted by how much the sky actually moves across it, plus a floor
     * so the dead middle of the night still costs some scrolling instead of
     * snapping through. Inverting that gives a depth that is uniform in *change*:
     * twilight at both ends opens out, the flat stretches compress.
     *
     * Nothing false comes of it, which is the reason it is allowed. The readout
     * reads the clock this returns, so it still names the true hour at every
     * depth — it is the scrollbar that stops being a linear clock, and the
     * scrollbar never claimed to be one.
     */
    const SAMPLES = 240;
    /*
     * How much there is to look at, at a given moment. The weighting above
     * spends scroll in proportion to how fast this moves.
     *
     * Two terms, because two different things change. The sky's own brightness
     * is the big one, and it is finished either side of a band: below about -18°
     * the night is as dark as it gets, above about +6° the day is as bright as
     * it gets. That term alone was the first version, and it gave the daytime
     * ten per cent of the page — correct by its own logic, since the sky really
     * does stop changing once the sun is up, and wrong in effect, because the
     * sun is now drawn and it crossed the whole frame and set inside half a
     * screen of scrolling.
     *
     * So the second term is the sun's own height. While it is up it is an object
     * in the picture and its movement is worth pixels even though the background
     * behind it has stopped changing.
     */
    const lightness = (t) => {
      const altitude = sunPosition(new Date(t), OBSERVER).altitude;
      const sky = Math.min(1, Math.max(0, (altitude + 18) / 24));
      const sunInFrame = Math.max(0, altitude) / 90;
      return sky + sunInFrame * 0.6;
    };
    /*
     * What an hour of nothing-happening is worth, in scroll.
     *
     * At zero the dark hours would collapse to a seam and the sky would jump
     * across it; at the old 0.003 they took nearly half the page. Half the page
     * of a sky that does not change is how the sunrise ended up feeling like
     * something bolted onto the end — there was no build, just a long hold and
     * then an event.
     *
     * At 0.0015 the two twilights take about eighty per cent of the scroll
     * between them and the dark hours take the rest, which is the right way
     * round: the page spends its length on the part that moves.
     */
    const FLAT_FLOOR = 0.0015;

    let depthTable = null;
    let tableBuiltAt = 0;

    const buildDepthTable = () => {
      const start = nightAt;
      const span = Math.max(0, sunriseAt - start);

      const weights = new Float64Array(SAMPLES);
      let total = 0;
      let prev = lightness(start);
      for (let i = 0; i < SAMPLES; i++) {
        const here = lightness(start + ((i + 1) / SAMPLES) * span);
        const w = Math.abs(here - prev) + FLAT_FLOOR;
        weights[i] = w;
        total += w;
        prev = here;
      }

      // Invert the cumulative distribution: walk it in equal steps of weight and
      // record the time each step lands on.
      const table = new Float64Array(SAMPLES + 1);
      table[0] = start;
      let acc = 0;
      let j = 0;
      for (let k = 1; k <= SAMPLES; k++) {
        const target = (k / SAMPLES) * total;
        while (j < SAMPLES - 1 && acc + weights[j] < target) {
          acc += weights[j];
          j++;
        }
        const within = weights[j] > 0 ? Math.min(1, (target - acc) / weights[j]) : 0;
        table[k] = start + ((j + within) / SAMPLES) * span;
      }

      depthTable = table;
      tableBuiltAt = start;
    };

    /** The moment this scroll depth corresponds to. */
    const timeAtDepth = (depth) => {
      // Somebody who has asked their system for less motion has not asked for a
      // sky that runs at a thousand times real speed under their thumb. They get
      // the top of the page, held still: the same dark sky everyone else opens
      // on, and no sun swinging through the headline at two in the afternoon.
      if (reduce) return nightAt;

      // Rebuilt rather than built once, because depth 0 has to stay the real
      // present on a page somebody leaves open. A minute of drift is invisible
      // at this scale, and 240 solar positions is well under a millisecond.
      if (!depthTable || Date.now() - tableBuiltAt > 60_000) {
        refreshSunrise();
        buildDepthTable();
      }

      const x = Math.min(1, Math.max(0, depth)) * SAMPLES;
      const i = Math.min(SAMPLES - 1, Math.floor(x));
      return depthTable[i] + (depthTable[i + 1] - depthTable[i]) * (x - i);
    };

    const SKY_TOP = [[2, 6, 23], [15, 23, 42]];   // cold near-black blue
    // Deeper and warmer-toward-blue, not indigo. The old bottom stop was
    // (26, 16, 56) — red above green with blue well clear of both, which is
    // violet, and with the canvas finally staying on screen past the hero it
    // turned the entire lower half of the page purple. Green now leads red, so
    // the descent deepens within the blue this site actually uses.
    const SKY_DEEP = [[3, 7, 28], [16, 30, 72]];

    const lerp = (a, b, t) => a + (b - a) * t;
    // Two forms because the twilight sky is mixed twice — night toward dawn, and
    // then the result toward the gradient stop above it — and rounding to a CSS
    // string in between loses the second mix's precision at these low values.
    const mixArr = (c1, c2, t) => [
      lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t),
    ];
    const rgbStr = (c) => `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`;

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
    /*
     * How far the view has dropped toward the horizon, in degrees.
     *
     * The camera is aimed to keep the horizon just under the bottom edge, which
     * is right for a page about stars and wrong for the end of this one. The sun
     * comes up at depth 1 by construction — that is what the span is — but "up"
     * means an altitude of zero, and zero was six degrees below the frame. The
     * sunrise the whole scroll is built toward was happening just off-screen.
     *
     * So the last stretch looks down. Nothing before 0.6 moves at all, which
     * keeps the hero and the whole night exactly as they were; from there it
     * eases in, and by the bottom of the page the horizon is inside the frame
     * with the sun sitting on it.
     *
     * Squared rather than linear so the movement starts imperceptibly. A camera
     * that begins tilting the instant you cross a threshold reads as a camera;
     * one that drifts reads as looking down.
     *
     * Eleven degrees rather than fifteen, and the four degrees are a legibility
     * decision rather than a compositional one. Tilting further does not push
     * the sun down the frame, it pulls it *up* — a view aimed lower puts the
     * horizon nearer the middle. At fifteen the disc came to rest across the
     * last line of type, and the email address underneath it measured 3.5:1
     * against a 4.5:1 floor. At eleven the sun sits below the text with the
     * horizon still comfortably inside the frame.
     */
    const HORIZON_DROP = 11;
    const horizonTilt = (depth) => {
      if (reduce) return 0;
      const t = Math.max(0, Math.min(1, (depth - 0.6) / 0.4));
      return t * t * HORIZON_DROP;
    };

    /*
     * Which way the view faces, in degrees of azimuth.
     *
     * Due south for the whole of the page that is about stars, because from
     * thirty degrees north that is where the sky is worth looking at. Then it
     * turns, because the sun does not come up in the south.
     *
     * Dropping the view to the horizon was half the problem and the smaller
     * half. The sun rises in the east, the frame is about seventy-five degrees
     * wide, and south to east is ninety — so the sunrise the entire scroll is
     * built toward was not merely below the frame, it was a quarter turn outside
     * it. No amount of tilting was going to find it.
     *
     * So the last stretch turns to face where the sun will actually come up.
     * That bearing is computed from the sunrise this page is counting down to,
     * not assumed to be east: it is only due east at the equinoxes, and wanders
     * about twenty-eight degrees either side across the year.
     *
     * Smoothstep rather than the squared curve the tilt uses — this one has to
     * arrive as well as leave, and a pan that stops abruptly at the bottom of
     * the page reads as a scroll that ran out rather than a view that settled.
     */
    const viewAzimuth = (depth) => {
      if (reduce) return VIEW_AZIMUTH;
      const t = Math.max(0, Math.min(1, (depth - 0.55) / 0.45));
      const eased = t * t * (3 - 2 * t);
      // Signed shortest way round, so it turns east through south-east rather
      // than the long way round through west.
      const delta = ((sunriseAzimuth - VIEW_AZIMUTH + 540) % 360) - 180;
      return VIEW_AZIMUTH + delta * eased;
    };

    const cameraBasis = (tiltDown = 0, azimuth = VIEW_AZIMUTH) => {
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
      const altitude = Math.min(74, edge + 6) - tiltDown;

      const fAlt = altitude * DEG;
      const fAz = azimuth * DEG;
      const fx = Math.cos(fAlt) * Math.sin(fAz);
      const fy = Math.cos(fAlt) * Math.cos(fAz);
      const fz = Math.sin(fAlt);
      /*
       * right = forward x world-up, normalised; up = right x forward.
       *
       * The signs matter and were wrong. World +x is east and +y is north, so
       * the cross product of a southward forward with world-up is (fy, -fx, 0),
       * which points west — and west is indeed what is on your right when you
       * are facing south. The old pair negated both this and the up vector, so
       * the two cancelled and the view stayed upright while being flipped
       * east-for-west.
       *
       * Nothing about that looks broken until you check it. A mirrored sky is
       * still a plausible sky: the stars are in plausible places, they wheel at
       * the right rate, they rise and set on schedule. What it costs is the two
       * things this background exists for. The constellations were drawn as
       * mirror images of themselves, so the one moment the whole feature is
       * built around — somebody recognising Orion — was the moment it would look
       * subtly wrong. And the readout names a compass direction, so "Arcturus,
       * 63 degrees above the east" sat over an Arcturus drawn on the western
       * side of the frame. The caption and the picture disagreed.
       */
      const horiz = Math.hypot(fx, fy) || 1;
      const rx = fy / horiz;
      const ry = -fx / horiz;
      return {
        scale,
        // Where it is pointing, kept on the object so the background can ask.
        // The gradient needs the altitude to know how far the bottom of the
        // frame is from the horizon, and the glow needs the azimuth to know
        // which side the sun is on.
        altitude, azimuth,
        edge,
        fx, fy, fz,
        rx, ry,
        ux: ry * fz,
        uy: -rx * fz,
        uz: rx * fy - ry * fx,
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
    /** The bearing the cached projection was built for. See the re-projection test. */
    let projectedFacing = VIEW_AZIMUTH;

    const projectSky = (now, cam = cameraBasis()) => {
      const lst = localSiderealTime(new Date(now), OBSERVER.longitude);
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

    const projectConstellations = (cam = cameraBasis()) => {
      const lst = localSiderealTime(new Date(projectedAt), OBSERVER.longitude);

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
    
    /**
     * How close the sun is to rising, 0 to 1.
     *
     * Astronomical twilight begins at -18 degrees and sunrise is 0, so that is
     * the range worth reacting to — above the horizon is irrelevant here because
     * the page never scrolls past dawn.
     */
    /**
     * How much twilight is in the sky, 0 to 1.
     *
     * Twilight is the band from eighteen degrees below the horizon up to the
     * horizon itself — the conventional definition, not a choice — and it
     * happens twice: once on the way down and once on the way up. This does not
     * distinguish them, because the sky does not either. Dusk and dawn are the
     * same geometry running in opposite directions and they look alike.
     *
     * So a full scroll gets an arc rather than a flat stretch with a surprise at
     * the end: daylight, the warmth of sunset, the long dark middle where the
     * sun is far below the horizon and the stars are at their best, then the
     * warmth returning on the other side.
     *
     * The quarter-degree tolerance is not fussiness. Depth 1 is sunrise, which
     * means altitude zero, which in floating point is as likely to be a hair
     * above as a hair below — and an `altitude > 0` cutoff turned the last pixel
     * of the page black after the glow had been building for the previous
     * hundred. The bottom of the page is exactly where that must not happen.
     */
    const twilightGlow = (when) => {
      const altitude = sunPosition(new Date(when), OBSERVER).altitude;
      if (altitude > 0.25) return 0;
      const t = Math.min(1, Math.max(0, (altitude + 18) / 18));
      /*
       * Curved, not linear, and the curve is the difference between a sky that
       * is changing and a sky that appears to change only at the end.
       *
       * Linearly, the sun at -12° — a sky a person would describe as visibly
       * blue, an hour of real dusk — scored 0.33 and rendered as almost nothing.
       * Everything worth seeing was crammed into the last few degrees above the
       * horizon, so however the scroll was distributed the colour still arrived
       * all at once. The exponent pulls the middle of the range up: -12° now
       * reads 0.44, -9° reads 0.60, and the arc has a middle instead of a wall.
       *
       * It also roughly matches how the sky actually behaves. Twilight
       * brightness against solar altitude is not a straight line — it falls off
       * steeply just under the horizon and then flattens, which is why the light
       * seems to go out of an evening much faster than the last degrees suggest.
       */
      return Math.pow(t, 0.72);
    };

    /*
     * Twilight, in three bands rather than one.
     *
     * A single warm stop at the bottom was the first attempt and it did not read
     * as morning, for the reason a photograph of a sunrise is not one colour:
     * the warmth is a band sitting *on* the horizon, there is a rose-violet above
     * it, and the sky over your head is still deep blue and full of stars. Mixing
     * the horizon amber into the bottom of a two-stop gradient produced a flat
     * mauve wash — the amber and the indigo averaged into each other across the
     * whole viewport and cancelled out.
     *
     * These three are sampled toward the sun through civil twilight, and the
     * gradient keeps them apart: warm only where the sun is, cold overhead.
     */
    const DAWN_HORIZON = [132, 88, 70];  // the amber band on the horizon itself
    const DAWN_MID = [72, 58, 88];       // rose-violet, the transition above it
    const DAWN_TOP = [14, 24, 52];       // still night overhead, no longer black

    /*
     * How bright the horizon is allowed to get.
     *
     * The canvas sits behind every paragraph on the site and the page is light
     * text on near-black, so this is a contrast budget, not a taste decision.
     * DAWN_HORIZON puts white text at about 6.9:1 — just inside WCAG AAA for
     * body text, with AA at 4.5:1 well clear. The previous value was 12.7:1,
     * which sounds like a virtue and was actually the bug: it left most of the
     * budget unspent and bought a sunrise nobody could see.
     */
    /**
     * Where the light is coming from, as a screen x.
     *
     * Twilight is not a uniform wash and the vertical gradient alone could never
     * say so: dusk and dawn came out pixel-identical, because a gradient from
     * dark to warm has no opinion about *which way* the sun is. It is the one
     * cue that tells them apart without reading the clock — the sun sets in the
     * west and rises in the east, and this camera faces due south, which puts
     * west on the right of the frame and east on the left.
     *
     * The sun itself is never in shot. The view is tilted to keep the horizon
     * just below the bottom edge, and through twilight the sun is below that
     * again, so there is nothing to draw and no sun is drawn. What is drawn is
     * where its light enters the frame from, which is a real direction.
     *
     * Past about 110 degrees off-axis the stereographic projection runs away
     * toward infinity, so the angle is clamped before it is projected rather
     * than the result afterwards — the glow then sits off the frame edge on the
     * correct side instead of at an undefined coordinate.
     */
    const sunGlowX = (when, facing) => {
      const { azimuth } = sunPosition(new Date(when), OBSERVER);

      // Measured against where the view is actually pointing, not due south.
      // Once the pan exists, a glow anchored to a fixed bearing slides the wrong
      // way across the frame as the camera turns under it.
      const off = ((azimuth - facing + 540) % 360) - 180;
      const clamped = Math.max(-110, Math.min(110, off));
      return width / 2 + 2 * Math.tan((clamped * DEG) / 2) * cameraBasis().scale;
    };

    /*
     * The sun and the moon.
     *
     * Everything else in this sky is a fixed catalogue turned by the Earth. These
     * two move against it, which is the entire reason they were worth adding:
     * the star field says "a real sky", and a moon in the right phase climbing
     * the right part of it says "and a real night", which is the thing scrolling
     * was supposed to be about.
     *
     * They are in frame for the same reason the Milky Way is — the camera looks
     * due south, and from thirty degrees north everything on the ecliptic crosses
     * the southern sky. The sun rides through the upper half of the view around
     * noon, sets off to the right, and is gone; the moon does its own version on
     * its own schedule, which on most days is not the sun's.
     *
     * Size is the one thing here that is not true. Both are about half a degree
     * across, which at this projection is four pixels — a dot indistinguishable
     * from a mediocre star, and at four or five times that still only a bright
     * speck. Nine times is where they stop being specks and start being objects:
     * the moon is wide enough to read a phase off, and the sun is wide enough to
     * sit on the horizon rather than hover above it.
     *
     * Which is a real exaggeration and worth being plain about. Every sky app
     * does the same thing for the same reason — a true half-degree moon on a
     * phone screen is a pixel and a half, and nobody would call that a moon. The
     * licence is taken in the radius and nowhere else: where they sit, when they
     * rise and set, how far away the moon is on the night you look, and which of
     * its limbs is lit are all computed, and those are the parts somebody could
     * check by stepping outside.
     */
    const BODY_EXAGGERATION = 9;

    /** Screen position of an alt/az direction, or null if it is behind the view. */
    const projectBody = (altitude, azimuth, cam) => {
      const a = altitude * DEG;
      const z = azimuth * DEG;
      const sx = Math.cos(a) * Math.sin(z);
      const sy = Math.cos(a) * Math.cos(z);
      const sz = Math.sin(a);

      const dot = sx * cam.fx + sy * cam.fy + sz * cam.fz;
      if (dot < -0.2) return null;

      const k = 2 / (1 + dot);
      return {
        x: width / 2 + k * (sx * cam.rx + sy * cam.ry) * cam.scale,
        y: height / 2 - k * (sx * cam.ux + sy * cam.uy + sz * cam.uz) * cam.scale,
      };
    };

    /** A soft halo. Both bodies have one; the sun's is enormous and the moon's isn't. */
    const haloAt = (x, y, radius, color, strength) => {
      const halo = context.createRadialGradient(x, y, 0, x, y, radius);
      halo.addColorStop(0, `rgba(${color}, ${strength})`);
      halo.addColorStop(0.35, `rgba(${color}, ${strength * 0.28})`);
      halo.addColorStop(1, `rgba(${color}, 0)`);
      context.fillStyle = halo;
      context.beginPath();
      context.arc(x, y, radius, 0, TAU);
      context.fill();
    };

    /**
     * The moon, lit the way it is actually lit.
     *
     * The terminator is an ellipse, not an arc — the shadow boundary is a circle
     * on the sphere seen at an angle, so it projects to an ellipse whose width
     * runs from the full radius at new and full down through zero at the
     * quarters. Drawing it as a circular bite is the usual shortcut and it makes
     * every phase except the quarters visibly wrong.
     *
     * Which limb is lit is the other half. In the northern hemisphere a waxing
     * moon is lit on the right and a waning one on the left; a crescent facing
     * the wrong way is the kind of mistake everyone notices and nobody can name.
     */
    const drawMoon = (when, cam, fade) => {
      const date = new Date(when);
      const { altitude, azimuth, distance } = moonHorizontal(date, OBSERVER);
      if (altitude < -1) return;                       // under the horizon

      const spot = projectBody(altitude, azimuth, cam);
      if (!spot) return;

      const { illuminated, waxing } = moonPhase(date);
      // Angular radius from the actual distance, so perigee really is bigger.
      const angular = Math.atan(1737.4 / distance);
      const r = angular * cam.scale * BODY_EXAGGERATION;

      // A thin crescent carries very little light and a full moon washes out the
      // sky around it; the halo follows the lit fraction rather than being fixed.
      const lit = 0.25 + illuminated * 0.75;
      context.globalCompositeOperation = 'lighter';
      haloAt(spot.x, spot.y, r * 3.5, '206, 214, 235', 0.11 * lit * fade);

      // The disc occludes: a star behind the moon is behind the moon.
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = fade;
      context.fillStyle = 'rgb(228, 231, 224)';
      context.beginPath();
      const waist = Math.abs(2 * illuminated - 1) * r;
      const inward = illuminated < 0.5;   // crescent: terminator cuts into the lit side
      if (waxing) {
        context.arc(spot.x, spot.y, r, -Math.PI / 2, Math.PI / 2, false);
        context.ellipse(spot.x, spot.y, waist, r, 0, Math.PI / 2, -Math.PI / 2, inward);
      } else {
        context.arc(spot.x, spot.y, r, Math.PI / 2, -Math.PI / 2, false);
        context.ellipse(spot.x, spot.y, waist, r, 0, -Math.PI / 2, Math.PI / 2, inward);
      }
      context.fill();
      context.globalAlpha = 1;
    };

    /**
     * The sun.
     *
     * Drawn a little below the horizon as well as above it, because the last
     * minutes before it sets are the ones worth seeing and cutting it off at
     * exactly zero makes it vanish mid-descent.
     */
    const drawSun = (when, cam) => {
      const { altitude, azimuth } = sunPosition(new Date(when), OBSERVER);
      if (altitude < -3) return;

      const spot = projectBody(altitude, azimuth, cam);
      if (!spot) return;

      // Reddened as it goes down. Blue scatters out of the beam first and green
      // second, over a path length that grows fast near the horizon — which is
      // the same fact as the sky being blue, seen from the other end, and why a
      // setting sun is one you can look at.
      const low = Math.max(0, Math.min(1, (10 - altitude) / 13));
      const body = `255, ${Math.round(244 - low * 95)}, ${Math.round(214 - low * 190)}`;
      const strength = 1 - low * 0.3;

      const r = Math.atan(696340 / 149597870) * cam.scale * BODY_EXAGGERATION;

      // The bloom widens as it reddens. A sun on the horizon is not a brighter
      // disc than a sun overhead — it is a dimmer one inside a much larger glow,
      // because that is where all the light it lost has gone.
      // Multipliers of the radius, so they had to come down when the disc went
      // up — otherwise enlarging the sun also doubled a glow that was already
      // a quarter of the screen across.
      context.globalCompositeOperation = 'lighter';
      haloAt(spot.x, spot.y, r * (8 + low * 8), body, 0.17 + low * 0.07);
      haloAt(spot.x, spot.y, r * 2.4, body, 0.30 * strength);

      /*
       * The disc is painted, not added, and that is the difference between a
       * sunrise and a smudge.
       *
       * Additively it was three layers deep — two halos and the body — over a
       * sky that was already warm, and the channels went to (501, 337, 171)
       * before clamping. Red and green both pinned at 255, which does not make
       * a brighter orange, it makes a pale yellow: clipping two of three
       * channels throws the hue away and leaves only the blue deficit behind.
       * On screen it read as khaki.
       *
       * Drawn opaque, the disc is exactly the colour the atmosphere calculation
       * says it should be, and the halos bloom around it instead of through it.
       */
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = `rgb(${body})`;
      context.beginPath();
      context.arc(spot.x, spot.y, r, 0, TAU);
      context.fill();
    };

    /*
     * How much of the horizon's own glow actually reaches the bottom of the frame.
     *
     * The gradient's last stop is the bottom edge of the viewport, and the view
     * is aimed above the horizon for most of the page — at the top it is six
     * degrees clear of it. The brightest part of a twilight sky is the two or
     * three degrees immediately over the horizon, and at the top of the page
     * that band is simply not in shot. Painting it there anyway was both wrong
     * and the brightest thing behind the hero's dimmest line of type.
     *
     * So the warmth arrives as the view comes down to meet it: about a third of
     * it while the frame is still well up, all of it once the horizon is inside
     * the frame, which is the same last stretch where the sun appears.
     */
    const horizonReach = (cam) => {
      const bottomAltitude = cam.altitude - cam.edge;
      return Math.min(1, Math.max(0.34, 1 - bottomAltitude / 9));
    };

    const fillBackground = (depth = 0, dawn = null, when = null, cam = null) => {
      const view = cam || cameraBasis(horizonTilt(depth), viewAzimuth(depth));
      const facing = view.azimuth;
      const moment = when === null ? timeAtDepth(depth) : when;
      const glow = dawn === null ? twilightGlow(moment) : dawn;

      // The night sky, unchanged — what the page looks like with the sun well
      // down, and at depth 0 the only thing that paints.
      const nightTop = mixArr(SKY_TOP[0], SKY_DEEP[0], depth);
      const nightBottom = mixArr(SKY_TOP[1], SKY_DEEP[1], depth);

      const gradient = context.createLinearGradient(0, 0, 0, height);

      // Overhead barely moves; the horizon carries the change. That difference
      // is the whole effect — a sky that brightened uniformly would read as
      // someone turning up a dimmer, not as the sun arriving.
      // Weighted hard toward the bottom. Spread evenly the warmth had nowhere to
      // be the brightest thing, and the result was a brown wash over the whole
      // viewport rather than a sunrise — a sky that had been tinted, not lit.
      // Keeping the top nearly as dark as it was at midnight is what gives the
      // horizon something to be brighter *than*.
      const reach = horizonReach(view);
      gradient.addColorStop(0, rgbStr(mixArr(nightTop, DAWN_TOP, glow * 0.5)));
      gradient.addColorStop(
        0.74,
        rgbStr(mixArr(mixArr(nightTop, nightBottom, 0.74), DAWN_MID, glow * 0.62 * (0.55 + reach * 0.45)))
      );
      gradient.addColorStop(1, rgbStr(mixArr(nightBottom, DAWN_HORIZON, glow * reach)));

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      // The directional half, over the top of the vertical one. Anchored just
      // below the bottom edge because that is where the horizon is — the glow
      // enters the frame rather than sitting in it.
      if (glow > 0.01) {
        const gx = Math.max(-width * 0.4, Math.min(width * 1.4, sunGlowX(moment, facing)));
        const gy = height * 1.04;
        const reach = Math.max(width, height) * 0.9;

        const radial = context.createRadialGradient(gx, gy, 0, gx, gy, reach);
        const [r, g, b] = DAWN_HORIZON;
        radial.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.42 * glow})`);
        radial.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.16 * glow})`);
        radial.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        context.fillStyle = radial;
        context.fillRect(0, 0, width, height);
      }
    };
    
    // Animation loop
    const animate = (time = 0) => {
      
      // Clear canvas
      context.clearRect(0, 0, width, height);
      
      const depth = getDepth();

      /*
       * How far into twilight this depth is, computed once and spent three times.
       *
       * The sky brightening was only ever half of a sunrise. The other half is
       * that the stars go out — and they did not, so the last frame of the scroll
       * was a full night's star field sitting on top of an orange horizon, which
       * is the one thing a morning sky never looks like. Whatever this number
       * does to the background it has to do, inverted, to everything drawn on it.
       */
      const when = timeAtDepth(depth);
      const dawn = twilightGlow(when);
      // One camera for the whole frame. The stars are projected through it only
      // when the clock moves on, and the sun and moon every frame, so handing
      // both the same object is what stops them drifting apart from each other.
      const facing = viewAzimuth(depth);
      const cam = cameraBasis(horizonTilt(depth), facing);

      // Stars hold through nautical twilight and then go quickly, which is what
      // they do: the sky brightens on a curve and the faint ones are lost long
      // before the bright ones. The floor keeps the brightest few just visible at
      // sunrise, as Venus and Sirius genuinely are.
      const starVisibility = Math.max(0.05, 1 - Math.pow(dawn, 2.2) * 0.98);

      fillBackground(depth, dawn, when, cam);
      
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

      // Re-project when the sky has actually moved.
      //
      // It used to be once a second against the wall clock, on the reasoning
      // that the sky turns fifteen degrees an hour and therefore four
      // ten-thousandths of a degree between frames. That still holds while the
      // page is still. It stops holding the moment the scroll is driving the
      // clock, because then a flick of the wheel is worth hours and the sky has
      // to keep up — so the trigger is the time itself changing rather than a
      // second elapsing.
      //
      // One test covers both cases, which is the reason there is only one. At
      // the top of the page `wanted` is the wall clock, so it pulls away from
      // the last projection at a millisecond per millisecond and trips this
      // after twenty seconds — twenty seconds being eight hundredths of a
      // degree of rotation, which nobody can see. Under the scroll the same
      // distance opens in a frame, and it re-projects in that frame.
      //
      // Affordable either way: a full re-projection of 5,044 stars measures at
      // 0.51ms, which is three per cent of a sixty-hertz frame.
      //
      // The camera is the second trigger, and it is not redundant. Time and
      // camera are both driven by depth, so it is tempting to let one stand for
      // the other — but they move at wildly different rates. Over the last
      // stretch the view swings ninety degrees while the clock advances about
      // forty minutes, so the pan covers in a frame what the clock needs
      // hundreds of times longer to match. Keyed on time alone, the stars would
      // lag behind a sun and moon that are re-projected every frame, and the
      // sky would visibly shear.
      const wanted = timeAtDepth(depth);
      if (Math.abs(wanted - skyNow) > 20000 || Math.abs(facing - projectedFacing) > 0.25) {
        skyNow = wanted;
        projectSky(skyNow, cam);
        constellationSegments = projectConstellations(cam);
        projectedFacing = facing;
        // The readouts name this time in words. They used to read the wall
        // clock, which was right until the scroll started moving the sky and
        // then said quarter past one over a sky seventeen hours later.
        setSkyTime(skyNow);
      }

      // The figures, under everything, at the edge of visible. They are there
      // for the moment somebody recognises Orion, not to be read.
      context.save();
      // The figures have to stay subordinate to the stars. Any brighter and the
      // hero reads as a network diagram rather than a sky — the lines are
      // regular and the stars are not, so the eye finds them first at equal
      // weight.
      // Faded with the stars they connect. A figure outlining stars that twilight
      // has already washed out is a diagram, not a constellation.
      context.strokeStyle = `rgba(120, 165, 235, ${0.075 * starVisibility})`;
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

        context.globalAlpha = starVisibility * (star.twinkle
          ? 1 - star.twinkle * 0.5 * (0.5 + 0.5 * Math.sin(seconds * 2.1 + star.phase))
          : 1);
        context.drawImage(
          sprite.canvas,
          star.x - sprite.half,
          y - sprite.half,
          sprite.side,
          sprite.side
        );
      }
      // Meteors fade with everything else. A shooting star is a faint thing —
      // the ones bright enough to survive a brightening sky are rare enough that
      // drawing them at full strength over a dawn horizon would look like a
      // scratch on the screen rather than a meteor.
      context.globalAlpha = starVisibility;
      meteors.forEach(meteor => {
        meteor.update();
        meteor.draw(context);
      });
      context.globalAlpha = 1;

      // The moon dims as the sky brightens, but nothing like as fast as a star:
      // it is routinely visible in a blue afternoon, which is the whole reason
      // people are surprised to see it there. The sun does not dim at all.
      drawMoon(when, cam, 0.35 + starVisibility * 0.65);
      drawSun(when, cam);

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
      // Module state outlives this component; leaving a scrolled time behind
      // would have the next mount's readouts open on a stale hour.
      resetSkyTime();
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