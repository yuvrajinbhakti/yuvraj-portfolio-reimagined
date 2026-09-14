import { useEffect, useRef, useState, useCallback } from 'react';
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
import { sunPosition, nextSunrise, solarTimeline } from '../utils/sun';
import { moonHorizontal, moonPhase } from '../utils/moon';
import { setSkyTime, resetSkyTime } from '../utils/skyClock';
import PropTypes from 'prop-types';
import { useReducedMotion } from 'framer-motion';

/*
 * `still` pins the sky instead of running the night across the scroll.
 *
 * The scroll-driven night is the argument the home page makes, and it is the
 * wrong thing underneath a case study. Those pages are long-form reading, and
 * a sunrise arriving under the text while somebody is halfway through a
 * paragraph is an animation competing with prose. Held at the darkest point of
 * the night they get the star field, which is what the background was for
 * before any of this, and nothing that moves.
 */
const AnimatedBackground = ({ children, still = false }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const reduce = useReducedMotion();

  /*
   * Tilt to look around, on phones.
   *
   * The sky is the one thing here a phone can do better than a laptop. On a
   * desktop it is a picture you scroll past; held in a hand, with the device's
   * own orientation driving the bearing, it is a window — you turn, and the
   * sky turns the other way, the way a window does. That is worth more on the
   * small screen than any of the hover affordances, which a touch device
   * cannot reach at all.
   *
   * It is a ref rather than state because the animation loop reads it every
   * frame and a re-render per orientation event would be sixty pointless
   * React renders a second. The button is state, because the button is a
   * button.
   */
  const tiltOffsetRef = useRef(0);
  const [tilt, setTilt] = useState('unsupported');

  // Offered only where it can actually work. Desktop browsers define
  // DeviceOrientationEvent and then never fire one, so feature-detecting the
  // constructor alone would put a button on every laptop that does nothing
  // when pressed. A coarse pointer is the real question being asked: is this
  // a thing someone is holding.
  useEffect(() => {
    if (reduce || still) return;
    if (typeof window === 'undefined' || typeof window.DeviceOrientationEvent === 'undefined') return;
    if (!window.matchMedia?.('(pointer: coarse)').matches) return;
    setTilt('off');
  }, [reduce, still]);

  const enableTilt = useCallback(async () => {
    if (tilt === 'on') {
      setTilt('off');
      tiltOffsetRef.current = 0;
      return;
    }
    // iOS 13+ will not deliver a single event until this resolves, and it only
    // resolves from inside a user gesture — which is why this is a button and
    // not something the page turns on for you.
    const request = window.DeviceOrientationEvent?.requestPermission;
    if (typeof request === 'function') {
      try {
        if ((await request.call(window.DeviceOrientationEvent)) !== 'granted') {
          setTilt('denied');
          return;
        }
      } catch {
        setTilt('denied');
        return;
      }
    }
    setTilt('on');
  }, [tilt]);

  useEffect(() => {
    if (tilt !== 'on') return;

    /*
     * gamma is the left-right tilt, and it is the only axis used. beta would
     * be the natural way to look up and down, but the vertical framing here is
     * the scroll storyboard's — it is how far through the night the page is —
     * and letting a wrist argue with it would break the one thing the sky is
     * saying.
     *
     * Clamped to +-38 degrees, so the sunrise still arrives where the page
     * says it does; a visitor can look along the horizon, not spin away from
     * the story. Low-passed because raw orientation on a handheld device is
     * jittery enough to make the star field shimmer at rest.
     */
    const onOrientation = (event) => {
      const gamma = event.gamma;
      if (typeof gamma !== 'number') return;
      const target = Math.max(-38, Math.min(38, gamma * 0.8));
      tiltOffsetRef.current += (target - tiltOffsetRef.current) * 0.08;
    };

    window.addEventListener('deviceorientation', onOrientation, { passive: true });
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [tilt]);

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
      timeline = found ? solarTimeline(found, OBSERVER) : null;
      nightAt = timeline ? timeline[STORY[0][1]].getTime() : sunriseAt - 11 * 3600 * 1000;
    };
    /*
     * Scroll depth to time — a storyboard, not a formula.
     *
     * This was derived for a long time and it was the wrong approach. First
     * linearly from the clock, which spent half the page on a sky that does not
     * change; then weighted by how fast the sky was moving, with a floor
     * constant to stop the dark hours collapsing, and an exponent on the
     * twilight curve to drag the middle of the range up. Each knob fixed the
     * symptom the last one caused, and at no point had anybody decided what the
     * page actually does and where. The physics decided, and the physics has no
     * opinion about pacing: a real night is about eighty-five per cent
     * nothing-happening, so the answer kept coming back "dark for most of it,
     * then everything at once".
     *
     * So the pacing is declared. Each row below pins a scroll position to a
     * named moment of the night, and the time in between is interpolated. To
     * hold the hero dark for longer, move the first rows down. To spend more of
     * the page on the sunrise, give the last rows more room. That is the whole
     * control surface, and it is readable as a storyboard because it is one.
     *
     * The sky itself stays real. Every frame is a true projection of a true
     * moment — stars, sun and moon all where they actually are at the time this
     * returns — and the readout names that time. Only the *rate* is authored,
     * and a scrollbar was never a clock.
     */
    const STORY = [
      // Sunset, not civil dusk, and the reason is the frame rather than the
      // light. The view is tilted up until the page is well down, so its lower
      // edge sits about six degrees above the horizon: anything below that is
      // out of shot. A young moon follows the sun down, and at civil dusk it
      // was already at three degrees — up, real, and underneath the picture.
      // Half an hour earlier it clears the edge, which is the difference
      // between a moon in the hero and an empty sky.
      //
      // Starting in a brighter part of the evening does not mean a brighter
      // hero. The sky is kept dark by the gradient (see the glow multipliers);
      // what the timeline decides is where things *are*, not how lit it is.
      [0.00, 'sunset'],
      [0.10, 'civilDusk'],
      [0.17, 'nauticalDusk'],
      [0.24, 'astroDusk'],
      // The dark hours, compressed. Nothing observable happens between these
      // two beyond the stars turning, and the stars turning is the one thing
      // that reads well without any help.
      [0.38, 'deepest'],
      [0.52, 'astroDawn'],
      // And then the whole back half of the page is the sunrise arriving,
      // which is the part worth scrolling for.
      [0.68, 'nauticalDawn'],
      [0.85, 'civilDawn'],
      [1.00, 'sunrise'],
    ];

    let timeline = null;

    // Called here rather than at its definition: it reads STORY and writes
    // `timeline`, both of which are declared above this line and not above that
    // one. The whole night is resolved once, at mount.
    refreshSunrise();

    /** The moment this scroll depth corresponds to. */
    const timeAtDepth = (depth) => {
      // Somebody who has asked their system for less motion has not asked for a
      // sky that runs at a thousand times real speed under their thumb. They get
      // the top of the page, held still: the same dusk everyone else opens on.
      // Held pages sit at solar midnight — the darkest the sky gets, and the
      // one moment of the night that is not on its way somewhere.
      if (still) return timeline ? timeline.deepest.getTime() : nightAt;
      if (reduce) return nightAt;

      if (!timeline) return nightAt;

      // The night this page is showing has finished; pick up the next one. One
      // comparison a frame, and it rebuilds once a day at sunrise rather than on
      // a timer that spends the other twenty-three hours finding nothing.
      if (Date.now() > sunriseAt) refreshSunrise();

      const d = Math.min(1, Math.max(0, depth));
      for (let i = 0; i < STORY.length - 1; i++) {
        const [d0, k0] = STORY[i];
        const [d1, k1] = STORY[i + 1];
        if (d <= d1 || i === STORY.length - 2) {
          const t0 = timeline[k0].getTime();
          const t1 = timeline[k1].getTime();
          const across = d1 === d0 ? 0 : (d - d0) / (d1 - d0);
          return t0 + (t1 - t0) * Math.min(1, Math.max(0, across));
        }
      }
      return timeline.sunrise.getTime();
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
     * Sixteen degrees. It was fifteen, then eleven when the sun at fifteen came
     * to rest across the last line of type and left the email address at 3.5:1
     * against a 4.5:1 floor — and eleven then parked the sun on the very bottom
     * edge, half out of frame, with nothing but plain gradient above it.
     *
     * Note the direction, which is the opposite of what it looks like: tilting
     * further does not push the sun *down* the frame, it lifts it, because a
     * view aimed lower puts the horizon nearer the middle. Sixteen brings the
     * sun up off the edge into the frame proper. The contrast that forced the
     * retreat to eleven is no longer the binding constraint — footer body type
     * went to 65% white and is sitting at 6.3:1, so there is room to spend.
     */
    /*
     * Twenty-six, up from sixteen, and now it is the water setting this rather
     * than the sun.
     *
     * At sixteen the horizon landed at 88.7% of the frame, so the sea was an
     * eleven per cent strip along the bottom — a dark hem, not a foreground.
     * Twenty-six brings it to about three-quarters, which gives the water the
     * bottom quarter of the frame: enough to be the thing the light lands on.
     *
     * It also puts the sun *on* the horizon rather than above it, so the water
     * takes its lower half. A sun half out of the sea is the picture; a sun
     * hovering clear of it is a sticker on a backdrop.
     */
    const HORIZON_DROP = 26;
    const horizonTilt = (depth) => {
      if (reduce || still) return 0;
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
      if (reduce || still) return VIEW_AZIMUTH;
      const t = Math.max(0, Math.min(1, (depth - 0.55) / 0.45));
      const eased = t * t * (3 - 2 * t);
      // Signed shortest way round, so it turns east through south-east rather
      // than the long way round through west.
      const delta = ((sunriseAzimuth - VIEW_AZIMUTH + 540) % 360) - 180;
      // The handheld offset rides on top of the storyboard rather than
      // replacing it, so the pan to the sunrise still happens on a phone and
      // the visitor is looking around inside it.
      return VIEW_AZIMUTH + delta * eased + tiltOffsetRef.current;
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
     * How much of that twilight the page actually shows, by depth.
     *
     * This is the one place the sky is deliberately not literal, and it is worth
     * saying why rather than pretending otherwise.
     *
     * Rendered honestly, the brightness of the sky follows the sun, and that
     * costs the thing this background is for. At sunset the real sky is bright
     * enough to hide every star — so an honest hero at sunset is an empty one,
     * no constellations, nothing to point at, which is precisely what the star
     * field exists to show. The version of this site people liked has a dark sky
     * full of stars at half past three in the afternoon; the sky here was always
     * a stylised one, and the honest brightness curve quietly broke that without
     * anyone deciding to.
     *
     * So the *positions* stay real — where the sun and moon are, which stars are
     * up, which way the light comes from — and the *exposure* is authored. The
     * page holds a night-adapted sky for its whole length and opens up over the
     * last stretch, where the sunrise is the thing being looked at and there is
     * a scrim under the type to afford it.
     *
     * The readout is unaffected: it names the hour, and the hour is true.
     */
    const twilightEnvelope = (depth) => {
      const t = Math.min(1, Math.max(0, (depth - 0.45) / 0.55));
      return 0.1 + 0.9 * t * t * (3 - 2 * t);
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
    /*
     * The horizon went from (132,88,70) to (158,86,48), which is a stronger
     * colour that is also a *darker* one, and the two are not in tension the way
     * they look. Relative luminance weights green at 0.72 and red at 0.21, so
     * pulling green and blue down while pushing red up saturates the orange and
     * drops the luminance at the same time: it reads considerably hotter and
     * measures better against white type than the muddier version did.
     *
     * That is the whole reason the old one was muddy. It was desaturated toward
     * grey to keep it dim, when the thing making it dim could have been the
     * colour itself.
     */
    const DAWN_HORIZON = [158, 86, 48];  // the band on the horizon itself
    // Warmed from (78,54,82). The old one was a cool rose sitting directly on a
    // hot orange, and the join between them read as a line rather than a sky —
    // there was no orange-to-rose transit, the colour just stopped. Carrying
    // some of the horizon's red up into this stop is what turns the band into a
    // gradient you can look into.
    const DAWN_MID = [104, 62, 76];      // rose, the transition above the band
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
     * from a mediocre star. Every sky app exaggerates for the same reason: a
     * true half-degree moon on a phone screen is a pixel and a half, and nobody
     * would call that a moon.
     *
     * The two want different amounts of it, which is why there are two numbers.
     *
     * The sun wants a *small hard disc inside an enormous glow* — in a
     * photograph of a sunrise the disc is something you could cover with a
     * fingernail and the bloom takes half the frame. Five times was that
     * argument taken to its conclusion and it came out too timid: at the bottom
     * of the page the disc was twenty pixels across, which is a bright dot on
     * the horizon rather than a sunrise. Nine is the size asked for, and the
     * three-layer bloom introduced alongside it is what keeps it from reading as
     * a ball — the ratio is what matters, and the ratio is preserved.
     *
     * The moon is the opposite case. It has no glow to speak of and its whole
     * interest is its shape: a crescent is only a crescent if you can see the
     * terminator curve, and under about thirty pixels across a thin one
     * degenerates into a bright dash. Nine times is where the phase becomes
     * legible, so nine is where it stays.
     *
     * The licence is taken in the radius and nowhere else: where they sit, when
     * they rise and set, how far away the moon is on the night you look, and
     * which of its limbs is lit are all computed, and those are the parts
     * somebody could check by stepping outside.
     */
    // The sun is larger than the moon here, which is worth a word since in the
    // sky they are famously the same size — half a degree each, the coincidence
    // that makes total eclipses possible. The difference is what each one needs
    // to read: the moon needs enough disc to show a phase and no more, while the
    // sun is the thing the whole scroll arrives at and has to carry the bottom
    // of the page on its own.
    const SUN_EXAGGERATION = 20;
    const MOON_EXAGGERATION = 9;

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

    /**
     * A soft halo. Both bodies have one; the sun's is enormous and the moon's isn't.
     *
     * The radius is clamped, which is a cost fix rather than a visual one. The
     * sun's widest halo is a multiple of its own disc, so raising the sun to
     * fourteen times life size also took that fill to a radius of about nine
     * hundred and sixty pixels — an area several times the viewport, filled
     * every frame, almost all of it off-screen and all of it paid for. Bounding
     * it to the frame's own diagonal changes nothing anybody can see.
     */
    const haloAt = (x, y, radius, color, strength) => {
      radius = Math.min(radius, Math.hypot(width, height));
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
      const r = angular * cam.scale * MOON_EXAGGERATION;

      // A thin crescent carries very little light and a full moon washes out the
      // sky around it; the halo follows the lit fraction rather than being fixed.
      // The halo was a tenth of an alpha over three and a half radii, tuned
      // when the moon was a dot. At a size where the phase is legible that is
      // no glow at all — a full moon came out as a flat disc pasted on the sky,
      // when the thing everyone recognises about a full moon is the soft round
      // wash it puts around itself. Two of them now: a wide one for the wash and
      // a tight one so the limb does not end on a hard edge.
      //
      // Warm rather than blue, which is the other half of it. Moonlight is
      // sunlight, and it looks silver only because the eye gives up its colour
      // vision at that brightness — photographed, or drawn, it is a faintly
      // warm white. The old 206,214,235 was a deliberate blue and read as
      // metallic.
      /*
       * The glow no longer scales all the way down with the phase.
       *
       * It was 0.25 + illuminated * 0.75, which is honest — a three per cent
       * crescent really does throw almost no light — and it meant that for the
       * week either side of new moon the moon was drawn with a quarter of its
       * glow and effectively disappeared. That is the worst possible place to
       * be strictly correct, because a young crescent is also the only moon
       * that is up during the early evening, which is the top of this page.
       *
       * A floor of 0.45 keeps a sliver reading as a small bright thing with a
       * halo rather than a scratch. The phase itself stays exact; it is only
       * how much light the drawing gives it that is lifted.
       */
      const lit = 0.45 + illuminated * 0.55;
      context.globalCompositeOperation = 'lighter';
      haloAt(spot.x, spot.y, r * 6.5, '228, 228, 216', 0.17 * lit * fade);
      haloAt(spot.x, spot.y, r * 2.2, '244, 243, 232', 0.22 * lit * fade);

      // The disc occludes: a star behind the moon is behind the moon.
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = fade;
      // White, with only a trace of warmth in it. The moon you remember looking
      // at is white — the warmth belongs in the halo, and putting it in the disc
      // as well turned it the colour of the sun, which is the one thing it must
      // not be mistaken for on a page that draws both.
      context.fillStyle = 'rgb(250, 249, 243)';
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
    const drawSun = (when, cam, exposure = 1) => {
      const { altitude, azimuth } = sunPosition(new Date(when), OBSERVER);
      if (altitude < -3) return;

      const spot = projectBody(altitude, azimuth, cam);
      if (!spot) return;

      // Reddened as it goes down. Blue scatters out of the beam first and green
      // second, over a path length that grows fast near the horizon — which is
      // the same fact as the sky being blue, seen from the other end, and why a
      // setting sun is one you can look at.
      /*
       * Two colours, not one, and this is what the sun was missing.
       *
       * It used to draw the disc and its halos in the same reddened orange, and
       * that is not how a sunrise looks in life or in a photograph. The disc
       * itself is overwhelmingly bright — far past whatever is registering it,
       * eye or sensor — so it reads near-white with only a trace of gold, while
       * everything it has lost to the atmosphere is out in the glow around it.
       * Painting both the same orange gave a flat mid-tone lozenge: the colour
       * of a sunset with none of the light of one.
       *
       * So the core is a pale hot gold and the bloom carries the orange. Same
       * arrangement that makes the moon work — a brilliant middle with the
       * colour outside it.
       */
      const low = Math.max(0, Math.min(1, (10 - altitude) / 13));
      const core = `255, ${Math.round(248 - low * 34)}, ${Math.round(226 - low * 78)}`;
      const body = `255, ${Math.round(196 - low * 46)}, ${Math.round(132 - low * 68)}`;
      const strength = 1 - low * 0.3;

      const r = Math.atan(696340 / 149597870) * cam.scale * SUN_EXAGGERATION;

      // The bloom widens as it reddens. A sun on the horizon is not a brighter
      // disc than a sun overhead — it is a dimmer one inside a much larger glow,
      // because that is where all the light it lost has gone.
      // Three, spanning two orders of size: a wide wash that lifts the whole
      // quarter of the sky the sun is in, a middle bloom, and a tight core that
      // makes the disc look like it is emitting rather than painted. Multipliers
      // of the radius, so shrinking the disc widened them in proportion — which
      // is the right way round, and the reason the sun reads as brighter now
      // while actually putting less light into the pixels behind the type.
      context.globalCompositeOperation = 'lighter';
      // Alphas roughly doubled. The old ones were set while the sky underneath
      // was being washed bright, where a strong glow would only have added to
      // the mud; against a dark sky there is room for it, and a glow is what
      // makes a light source look like one.
      haloAt(spot.x, spot.y, r * (18 + low * 14), body, (0.17 + low * 0.08) * exposure);
      haloAt(spot.x, spot.y, r * 7, body, (0.22 + low * 0.08) * exposure);
      haloAt(spot.x, spot.y, r * 2.6, core, 0.45 * strength * exposure);

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
      /*
       * Flattened as it nears the horizon, which is the detail that sells it.
       *
       * Refraction lifts the lower limb more than the upper one — the light from
       * the bottom edge takes a longer, lower path through denser air and gets
       * bent further — so a sun on the horizon is measurably wider than it is
       * tall, by something like a fifth. Everyone has seen it and almost nobody
       * has noticed why, which makes it exactly the kind of thing whose absence
       * reads as wrong without being nameable.
       */
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = `rgb(${core})`;
      context.beginPath();
      context.ellipse(spot.x, spot.y, r, r * (1 - low * 0.2), 0, 0, TAU);
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
      // The floor came down from 0.34. Twenty minutes after sunset is a dark
      // sky with a bright edge, not a lit one, and at a third of the horizon
      // band reaching a frame aimed six degrees over it the hero read as
      // evening rather than night.
      return Math.min(1, Math.max(0.2, 1 - bottomAltitude / 9));
    };

    /*
     * Cloud, lit from underneath.
     *
     * The gradient could be coloured perfectly and the bottom of the page would
     * still look plain, because nothing was *in* it. What makes a photograph of
     * a sunrise worth looking at is not the sky, it is cloud catching light from
     * below while the sky behind stays dark — the sun lights their undersides
     * before it clears the horizon, which is the one time of day light arrives
     * from underneath, and the reason dawn looks like nothing else.
     *
     * It is also what gives the sun a size. A disc alone in an empty sky has
     * nothing to be measured against; put banks of cloud in the same frame and
     * the same disc reads much larger.
     *
     * Sea was the other candidate and is the reason there isn't one. Chandigarh
     * is landlocked. Every other thing here is checkable — the star positions,
     * the moon's phase, where the sun comes up — and an ocean under a real
     * Chandigarh sky would be the first invented thing on the page, and the
     * largest. Cloud costs nothing in honesty: there is cloud over everywhere.
     *
     * Placed in the sky rather than on the screen, which matters once the view
     * starts to tilt and turn over the last stretch. Each one has a real bearing
     * and a real height above the horizon and goes through the same projection
     * as everything else, so they swing with the camera instead of sitting on
     * the glass. They sit between one and twelve degrees up — dawn cloud is low
     * cloud — which also keeps them above the sun rather than across it.
     */
    const CLOUD_COUNT = 7;
    let clouds = null;
    /*
     * The bearing the current bank was laid out for.
     *
     * Built lazily against this rather than eagerly from refreshSunrise, which
     * is where it belongs logically and where it cannot go: refreshSunrise runs
     * at mount, above this line, and reaching down to a `const` declared later
     * is a temporal dead zone — the component threw on first render and the
     * page came up blank. Rebuilding when the bearing has moved gets the same
     * result, including the rebuild when the page rolls over to the next night.
     */
    let cloudsBuiltFor = null;

    const buildClouds = () => {
      // Fixed seed: the sky should be the same sky between reloads, and a cloud
      // bank that rearranges itself every refresh reads as noise.
      let seed = 0x5eed1e;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };

      clouds = [];
      for (let i = 0; i < CLOUD_COUNT; i++) {
        const puffs = [];
        const count = 4 + Math.floor(rnd() * 4);
        for (let p = 0; p < count; p++) {
          puffs.push({
            // Offsets in degrees from the cloud's own centre.
            dx: (p / (count - 1) - 0.5) * (1 + rnd() * 0.5),
            dy: (rnd() - 0.5) * 0.5,
            size: 0.45 + rnd() * 0.55,
          });
        }
        clouds.push({
          // Spread either side of where the sun will come up, so the bank is
          // where the light is rather than scattered round the whole sky.
          azimuth: sunriseAzimuth + (rnd() - 0.5) * 150,
          // Two to twenty-six degrees. The first attempt used one to twelve,
          // which is where dawn cloud really sits and was the wrong answer for
          // the frame: with the view tilted down that band lands between
          // seventy-five and ninety per cent of the way down, which is behind
          // the sun and behind the last rows of type. The empty part of the
          // picture is higher than the real cloud deck, so the deck goes up.
          altitude: 2.5 + rnd() * 23,
          width: 8 + rnd() * 15,        // degrees across
          squash: 0.22 + rnd() * 0.16,  // how flat; cloud is wider than it is tall
          drift: 0.4 + rnd() * 0.7,     // degrees of bearing per hour
          puffs,
        });
      }
    };

    const CLOUD_DARK = [30, 27, 46];
    const CLOUD_LIT = [214, 132, 84];

    const drawClouds = (when, cam, exposure) => {
      if (exposure < 0.02) return;
      if (cloudsBuiltFor !== sunriseAzimuth) {
        buildClouds();
        cloudsBuiltFor = sunriseAzimuth;
      }
      if (!clouds) return;

      const sun = sunPosition(new Date(when), OBSERVER);
      // Hours since the night began, so the bank drifts across the page rather
      // than across the wall clock.
      const hours = (when - nightAt) / 3600000;

      context.globalCompositeOperation = 'source-over';
      for (const cloud of clouds) {
        const azimuth = cloud.azimuth + cloud.drift * hours;
        const spot = projectBody(cloud.altitude, azimuth, cam);
        if (!spot) continue;

        // Pixels per degree here, measured rather than assumed — the
        // projection stretches toward the edges and a cloud has to stretch too.
        const edgePoint = projectBody(cloud.altitude, azimuth + 1, cam);
        if (!edgePoint) continue;
        const perDegree = Math.abs(edgePoint.x - spot.x);
        if (!(perDegree > 0.2)) continue;

        const halfWidth = cloud.width * perDegree * 0.5;
        if (spot.x + halfWidth < 0 || spot.x - halfWidth > width) continue;

        /*
         * How lit this one is: the sun has to be near it in bearing *and* low
         * enough to be shining along the underside rather than down onto the
         * top. Both fall off, so a cloud away to the side stays a grey bank
         * while the ones over the sunrise go to copper.
         */
        const offBearing = Math.abs(((azimuth - sun.azimuth + 540) % 360) - 180);
        const aligned = Math.max(0, 1 - offBearing / 75);
        // Widened from 14 degrees. Underlighting does not switch off the moment
        // the sun clears the horizon — it fades over the first half hour or so,
        // and a hard cutoff made the banks drop to grey while the sky beneath
        // them was still burning.
        const grazing = Math.max(0, 1 - Math.abs(sun.altitude) / 22);
        const lit = aligned * grazing;

        for (const puff of cloud.puffs) {
          const px = spot.x + puff.dx * cloud.width * perDegree;
          const py = spot.y + puff.dy * cloud.width * perDegree * cloud.squash;
          const radius = puff.size * cloud.width * perDegree * 0.5;
          if (radius < 1) continue;

          // Underside catches the light, top stays in shadow. Approximated by
          // the puff's own height within the cloud rather than a second
          // gradient per puff, which at seven clouds a frame would be thirty
          // gradient objects a frame for a difference nobody could see.
          const under = Math.max(0, Math.min(1, 0.5 + puff.dy * 2));
          const warmth = lit * under;
          const colour = mixArr(CLOUD_DARK, CLOUD_LIT, warmth);
          const alpha = exposure * (0.26 + warmth * 0.55);

          context.save();
          context.translate(px, py);
          context.scale(1, cloud.squash);
          const grad = context.createRadialGradient(0, 0, 0, 0, 0, radius);
          grad.addColorStop(0, `rgba(${colour.map(Math.round).join(',')}, ${alpha})`);
          grad.addColorStop(0.55, `rgba(${colour.map(Math.round).join(',')}, ${alpha * 0.55})`);
          grad.addColorStop(1, `rgba(${colour.map(Math.round).join(',')}, 0)`);
          context.fillStyle = grad;
          context.beginPath();
          context.arc(0, 0, radius, 0, TAU);
          context.fill();
          context.restore();
        }
      }
    };

    /*
     * Water, under the sunrise.
     *
     * The sun had nothing beneath it. It sat on the bottom edge of the frame
     * with a plain wash under it and plain gradient over it, and no amount of
     * colour was going to fix that, because what the picture was missing was not
     * light — it was a foreground. A sunrise is a composition: sky, the sun at
     * the join, and something underneath for the light to land on. Take away the
     * third and the other two are a swatch.
     *
     * I argued against this and was wrong about which objection mattered.
     * Chandigarh is landlocked, and I took that to mean water would be the first
     * invented thing on a page whose whole manner is that its claims check out.
     * But the claims this page makes are about the sky — where those stars are,
     * what the moon is doing, when the sun comes up — and they go on being true
     * with water under them. Nothing here says you are looking at Chandigarh's
     * ground. Scenery under a true sky is a stage, not a lie.
     *
     * The horizon is found rather than chosen: it is altitude zero through the
     * same projection as everything else, so it sits where the view is actually
     * pointing and moves correctly as the camera drops over the last stretch.
     * Above it, sky. Below it, the same light lying on water.
     */
    let horizonColour = [16, 30, 72];

    const drawWater = (when, cam, exposure, seconds) => {
      if (exposure < 0.02) return;

      const horizon = projectBody(0, cam.azimuth, cam);
      if (!horizon) return;
      const horizonY = horizon.y;
      // The horizon is below the bottom of the frame for most of the page —
      // the view only drops far enough to see it over the last stretch — and
      // there is no water to draw until it is.
      if (horizonY >= height - 2) return;

      const sun = sunPosition(new Date(when), OBSERVER);
      const depthBelow = height - horizonY;

      /*
       * Water is the sky, dimmer and colder. It is a mirror, so its colour is
       * the colour above it — which is why it is taken from the gradient's own
       * bottom stop rather than picked. Roughly forty per cent of the light
       * comes back at a shallow angle, and what does not is the sea's own
       * near-black.
       */
      const deep = [10, 12, 24];
      const surface = mixArr(deep, horizonColour, 0.62);
      const far = mixArr(deep, horizonColour, 0.38);
      const near = mixArr(deep, horizonColour, 0.14);

      // Four stops rather than three, and the falloff is gentler than the first
      // attempt, which reached its own near-black a third of the way down and
      // left a black hem under a lit sky. Water away from you is nearly all
      // reflected sky; it only goes dark close in, where you are looking into
      // it rather than across it.
      const sea = context.createLinearGradient(0, horizonY, 0, height);
      sea.addColorStop(0, rgbStr(surface));
      sea.addColorStop(0.42, rgbStr(far));
      sea.addColorStop(0.78, rgbStr(near));
      sea.addColorStop(1, rgbStr(deep));
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = sea;
      context.fillRect(0, horizonY, width, depthBelow);

      /*
       * Swell, coming in.
       *
       * The sea was a static gradient with a shivering column on it, which reads
       * as a photograph rather than water. What moves in real water, seen from a
       * shore, is not the surface texture — it is the rows of swell arriving,
       * and the thing that makes them read as distance is that they *accelerate*
       * as they come. Equal distances on the water are unequal on the screen:
       * near the horizon a hundred metres is a couple of pixels, at your feet it
       * is half the frame.
       *
       * So the rows are spaced by u squared rather than by u. That bunches them
       * against the horizon and spreads them toward the viewer, and because the
       * animation advances u rather than y, each row speeds up as it travels —
       * which is the whole illusion, and it comes out of the geometry rather
       * than being eased by hand.
       */
      const WAVES = 26;
      const crest = mixArr(surface, [255, 226, 198], 0.3);
      const crestRGB = crest.map(Math.round).join(',');
      // A row takes about seventeen seconds to come in. Measured rather than
      // eyeballed, because the pane I check in was throttled and could not show
      // me: at this rate a row moves 4px/s near the horizon and 23px/s by the
      // time it reaches the viewer. The first version ran a third slower and the
      // far half of the sea read as a still.
      const travel = seconds * 0.06;
      for (let i = 0; i < WAVES; i++) {
        const u = ((i / WAVES) + travel) % 1;
        const t = u * u;
        const y = horizonY + t * depthBelow;
        const thickness = Math.max(1, (0.35 + t * 2.4) * (depthBelow / WAVES));
        // Each row breathes on its own phase, so the set never pulses together.
        const breathe = 0.5 + 0.5 * Math.sin(seconds * 0.9 + i * 2.13);
        // Fading toward the viewer: close water is dark and you are looking
        // into it, so the crests stop catching the sky.
        const alpha = (0.05 + 0.055 * breathe) * (1 - t * 0.8) * exposure;
        if (alpha < 0.004) continue;
        context.fillStyle = `rgba(${crestRGB},${alpha})`;
        context.fillRect(0, y, width, thickness);
      }

      /*
       * The glitter path — the broken column of light under the sun.
       *
       * This is the part that reads as water rather than as a dark band, and it
       * is not a reflection in the mirror sense: each wavelet is a tilted facet,
       * so what you get is thousands of separate images of the sun, widening as
       * they recede because the facets nearer you are seen at a steeper angle.
       * Hence the taper — narrow at the horizon, spreading toward the viewer —
       * which is the opposite of a flat mirror and the reason a painted
       * reflection that does not taper looks wrong.
       */
      const glitterX = sunGlowX(when, cam.azimuth);
      const lit = Math.max(0, 1 - Math.abs(sun.altitude) / 16) * exposure;
      if (lit > 0.02 && glitterX > -width && glitterX < width * 2) {
        const [r, g, b] = [255, 176, 104];
        const ROWS = 26;
        for (let i = 0; i < ROWS; i++) {
          const t = i / (ROWS - 1);
          const y = horizonY + t * depthBelow;
          // Widens toward the viewer, and each band breaks up on its own
          // rhythm so the column shivers instead of pulsing as one piece.
          const spread = (0.04 + t * 1.0) * depthBelow * 1.5;
          // Phase-locked to the swell above, so the column breaks up along the
          // same water rather than flickering to a rhythm of its own. Two
          // rhythms on one surface is the tell that it was drawn.
          const shimmer = 0.55 + 0.45 * Math.sin(seconds * 1.7 + i * 1.31 - travel * 26);
          const halfWidth = spread * shimmer;
          const alpha = lit * (1 - t) * (1 - t) * 0.5;
          if (alpha < 0.004 || halfWidth < 1) continue;

          const band = context.createLinearGradient(
            glitterX - halfWidth, 0, glitterX + halfWidth, 0
          );
          band.addColorStop(0, `rgba(${r},${g},${b},0)`);
          band.addColorStop(0.5, `rgba(${r},${g},${b},${alpha})`);
          band.addColorStop(1, `rgba(${r},${g},${b},0)`);
          context.fillStyle = band;
          context.fillRect(
            glitterX - halfWidth, y, halfWidth * 2,
            Math.max(1.5, depthBelow / ROWS * 0.85)
          );
        }
      }

      // The join itself, a shade brighter than either side. Water meets sky at
      // a hard line — it is the one edge in a landscape that has no softness —
      // and without it the two gradients blend and the whole thing turns to haze.
      const rim = context.createLinearGradient(0, horizonY - 1.5, 0, horizonY + 1.5);
      const rimColour = mixArr(horizonColour, [255, 210, 170], 0.35 * exposure);
      rim.addColorStop(0, `rgba(${rimColour.map(Math.round).join(',')},0)`);
      rim.addColorStop(0.5, `rgba(${rimColour.map(Math.round).join(',')},${0.5 * exposure})`);
      rim.addColorStop(1, `rgba(${rimColour.map(Math.round).join(',')},0)`);
      context.fillStyle = rim;
      context.fillRect(0, horizonY - 1.5, width, 3);
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
      /*
       * The sky overhead stays night, the whole way down the page.
       *
       * These multipliers were 0.5 and 0.62 and are now 0.22 and 0.32, and that
       * is the single change that matters most here. Twilight does not light the
       * sky evenly — it lights the edge of it, and the part directly above you
       * stays close to black from dusk right through to the last minutes before
       * sunrise. Carrying the glow upward was doing two kinds of damage at once:
       * it made the hero read as an evening rather than a night, and it spent
       * the brightness budget in the one place that could not use it, because a
       * horizon can only look bright against something dark.
       *
       * All of it goes to the bottom stop instead. That is also where the page
       * can afford it — the footer scrim is there, and the type above the
       * horizon band is the sparse kind.
       */
      /*
       * The middle stop went 0.74 -> 0.64 to spread the dawn up the frame, and
       * that was the wrong move. Spread over the lower third, the orange averaged
       * into the navy and the whole bottom of the page turned a flat mid-brown —
       * more light, less sunrise. It also took away the one thing the sun needed,
       * because a mid-bright disc on a mid-bright sky has nothing to be brighter
       * than, and it read as a sticker.
       *
       * The moon is the proof. It looks right for one reason: a brilliant object
       * on a dark field. So the sky goes back to dark and the orange is
       * concentrated into the bottom fifth as a band, which is both what a
       * sunrise looks like and what gives the sun somewhere to burn.
       */
      const reach = horizonReach(view);
      gradient.addColorStop(0, rgbStr(mixArr(nightTop, DAWN_TOP, glow * 0.22)));
      gradient.addColorStop(
        0.8,
        rgbStr(mixArr(mixArr(nightTop, nightBottom, 0.8), DAWN_MID, glow * 0.28 * (0.55 + reach * 0.45)))
      );
      // Kept for the water, which is a mirror and therefore has to take its
      // colour from whatever the sky above it happens to be doing.
      horizonColour = mixArr(nightBottom, DAWN_HORIZON, glow * reach);
      gradient.addColorStop(1, rgbStr(horizonColour));

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
      // The physical twilight, and how much of it this part of the page shows.
      // Everything downstream — sky, stars, the sun's bloom — uses the second.
      const dawn = twilightGlow(when) * twilightEnvelope(depth);
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
      context.lineWidth = 1;
      context.translate(0, -scrollY * 0.06);
      /*
       * They were drawn at 0.075 alpha and nothing else, which meant that in
       * practice nobody ever saw one. The comment above is right that a sky of
       * figures at full strength reads as a network diagram — the lines are
       * regular and stars are not, so at equal weight the eye goes to the
       * lattice and the sky stops being a sky. But the conclusion drawn from
       * that was to make them permanently invisible, which throws away the
       * moment the whole thing exists for: somebody recognising Orion.
       *
       * Both can be true if the brightness is local. The figures stay at the
       * edge of visible across the sky, and lift only within a couple of
       * hundred pixels of the cursor — so at any instant the lattice covers a
       * small patch rather than the whole field, and moving the pointer walks
       * a pool of light over the constellations. Nothing to read, nothing to
       * click, no instructions: the reward is for moving the mouse, which
       * people do anyway.
       *
       * The pointer is in screen space and the segments are drawn through the
       * translate above, so it has to be moved into the same space to compare.
       */
      const pointerYInSky = pointer ? pointer.y + scrollY * 0.06 : 0;
      const GLOW_RADIUS = 210;
      const GLOW_R2 = GLOW_RADIUS * GLOW_RADIUS;

      for (const segment of constellationSegments) {
        let lift = 0;
        if (pointer) {
          // Nearest vertex, not nearest point on the line. A constellation's
          // vertices are its stars and they are close together relative to the
          // radius, so the difference is invisible and this is a handful of
          // subtractions instead of a projection per edge.
          let best = Infinity;
          for (let i = 0; i < segment.length; i++) {
            const dx = segment[i][0] - pointer.x;
            const dy = segment[i][1] - pointerYInSky;
            const d2 = dx * dx + dy * dy;
            if (d2 < best) best = d2;
          }
          if (best < GLOW_R2) {
            // Squared falloff, so the pool has a soft edge rather than a rim.
            const t = 1 - Math.sqrt(best) / GLOW_RADIUS;
            lift = t * t;
          }
        }

        context.strokeStyle = `rgba(120, 165, 235, ${((0.075 + lift * 0.3) * starVisibility).toFixed(3)})`;
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
      // The sun's bloom is twilight too, so it follows the same exposure. The
      // disc does not: if the sun is up it is up, and at the top of the page it
      // is below the frame anyway.
      drawSun(when, cam, dawn);
      // After the sun, because cloud is in front of it — that is what a lit
      // underside means. They sit above it in the sky rather than across it, so
      // the disc stays clear and the banks take the light off it.
      drawClouds(when, cam, dawn);
      // Last, because water is in front of all of it — it has to cover the
      // stars below the horizon and the lower half of the sun sitting on it.
      drawWater(when, cam, dawn, seconds);

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
      /*
       * Five stops on an eased falloff, where there were three on a linear one.
       *
       * Three stops with alpha stepping 0.02 -> 0.015 -> 0 is smooth in value
       * and kinked in slope, at the half stop and again at the rim. The eye is
       * far more sensitive to a discontinuity in the *rate* of change than to
       * one in brightness — that is what a Mach band is — so a gradient whose
       * alpha arrives at zero with a corner shows a visible ring even when the
       * step either side of it measures one or two levels out of 255 and no
       * amount of staring at the numbers finds it.
       *
       * These approach zero tangentially instead, so there is no corner to see.
       */
      const mid = `${Math.round(38 + 18 * depth)}, 74, 156`;
      nebulaGradient.addColorStop(0, `rgba(46, 86, 170, ${(0.02 * k).toFixed(4)})`);
      nebulaGradient.addColorStop(0.35, `rgba(${mid}, ${(0.0168 * k).toFixed(4)})`);
      nebulaGradient.addColorStop(0.6, `rgba(${mid}, ${(0.0104 * k).toFixed(4)})`);
      nebulaGradient.addColorStop(0.82, `rgba(${mid}, ${(0.0036 * k).toFixed(4)})`);
      nebulaGradient.addColorStop(1, `rgba(${mid}, 0)`);
      
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
  }, [reduce, still]);
  
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
      
      {/* Only ever rendered on a device that can actually deliver orientation
          events — see the coarse-pointer check above. On a laptop this is not
          a disabled button, it is nothing at all. */}
      {tilt !== 'unsupported' && (
        <button
          type="button"
          onClick={enableTilt}
          aria-pressed={tilt === 'on'}
          className={`fixed bottom-4 right-4 z-50 min-h-[44px] px-3.5 py-2 rounded-full text-xs font-medium border transition-colors duration-300 ${
            tilt === 'on'
              ? 'bg-blue-500/20 border-blue-300/40 text-blue-100'
              : 'bg-black/40 border-white/15 text-white/70'
          }`}
        >
          {/* A denial is not always final — on Android it can be a transient
              no, and the button stays live so a second tap can succeed. On
              iOS it sticks until site data is cleared, which is the browser's
              call to communicate, not this button's. Either way it says what
              tapping does rather than stating a dead end. */}
          {tilt === 'denied'
            ? 'Motion blocked · retry'
            : tilt === 'on'
              ? 'Tilt: on'
              : 'Tilt to look around'}
        </button>
      )}

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
  still: PropTypes.bool,
};

export default AnimatedBackground; 