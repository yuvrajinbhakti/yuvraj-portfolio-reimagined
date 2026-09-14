import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { OBSERVER, formatLocalTime } from '../constants/observer';
import { nextSunrise, solarTimeline } from '../utils/sun';
import { subscribeSkyTime } from '../utils/skyClock';

/**
 * Where in the night the page is, in the bar.
 *
 * The whole page is one night: the sky behind it runs from dusk at the top to
 * the next sunrise over Chandigarh at the bottom, and the sections sit at
 * moments of that night. Until this existed the only place that said so was a
 * caption in the hero, which is the one part of the page a reader has scrolled
 * past by the time the sky has visibly changed. So a reader halfway down had a
 * darker sky and no idea why, and a reader at the bottom had a sunrise arriving
 * under the contact section as if by accident.
 *
 * This reads the same clock the canvas writes and names the twilight the hour
 * falls in — the astronomical bands, because they are what the sky is actually
 * drawing: "nautical dusk" is a real thing with a real definition (sun between
 * 6 and 12 degrees below the horizon), not a mood.
 *
 * Not in the hero, though — which is where it was wrong.
 *
 * The hero already carries the full readout: "Chandigarh · 06:26 pm IST ·
 * tonight", with the city and the zone that make the number mean something.
 * Showing the same hour in the bar at the same time was the same fact twice on
 * one screen, and in the bar it had none of that context — an hour on its own
 * reads as a broken clock to anyone outside India.
 *
 * So it appears only once the reader is past the hero, which is exactly when
 * the readout scrolls away and the sky starts visibly changing with nothing to
 * explain it. It also means the bare hour is only ever shown to someone who has
 * already read the caption that defines it. The nav computes that for free —
 * `activeSection` is null in the hero and a section id below it.
 *
 * In the corner, not the bar.
 *
 * The hero's readout sits at the bottom-left of the viewport, so putting this
 * in the nav meant the sky's caption jumped from the bottom of the screen to
 * the top the moment the reader scrolled past it. In a bottom corner it stays
 * where the caption already was — the same information in the same place, the
 * whole way down — and a navigation bar goes back to being for navigation.
 *
 * Bottom-right rather than bottom-left: the music toggle has the left corner.
 *
 * Desktop and a real pointer only. The bar had no room for it on a phone, and
 * the right corner on a touch device belongs to the tilt control — the two
 * could otherwise meet on a large tablet, where the lg breakpoint and a coarse
 * pointer are both true.
 *
 * Rendered from App rather than from the nav, which is where the first attempt
 * at this put it. A `position: fixed` element is positioned against the
 * viewport only if no ancestor establishes a containing block, and the header
 * carries backdrop-blur — a backdrop-filter does establish one. So the corner
 * it pinned to was the navbar's, not the screen's, and it sat above the top of
 * the viewport. Anything with a transform, a filter or a backdrop-filter does
 * this, which rules out the page transition wrapper too.
 */

const phaseFor = (t, tl) => {
  const at = (k) => +tl[k];
  if (t < at('sunset')) return 'before sunset';
  if (t < at('civilDusk')) return 'sunset';
  if (t < at('nauticalDusk')) return 'civil dusk';
  if (t < at('astroDusk')) return 'nautical dusk';
  if (t < at('astroDawn')) return 'night';
  if (t < at('nauticalDawn')) return 'astronomical dawn';
  if (t < at('civilDawn')) return 'nautical dawn';
  if (t < at('sunrise')) return 'civil dawn';
  return 'sunrise';
};

const SkyClock = () => {
  const { pathname } = useLocation();
  const ref = useRef(null);

  /*
   * Shown once the hero is behind the reader, which is the moment the hero's
   * own readout — the one with the city and the zone on it — scrolls away.
   * Two captions saying the same hour on one screen is one too many, and the
   * barer of the two should not be the one left on its own.
   *
   * Home only: a case study holds the sky still at the darkest part of the
   * night, so a clock there would name an hour that never moves.
   *
   * Written straight to the node rather than held in React state, which is
   * the pattern GlassCard already uses for its pointer values and for the same
   * reason — a scroll handler should not be asking React to re-render. Here it
   * also avoids a second problem: React deprioritises rendering a document
   * nobody is looking at, so a state-driven version of this simply does not
   * update in a background tab. Two style properties and an attribute do.
   */
  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const show = pathname === '/' && window.scrollY > window.innerHeight * 0.75;
      el.style.opacity = show ? '1' : '0';
      el.style.transform = show ? 'none' : 'translateY(4px)';
      el.setAttribute('aria-hidden', String(!show));
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [pathname]);
  // The night this page is drawing, computed once. The same reduction the
  // canvas uses, so the two cannot disagree about when dusk ends.
  const timeline = useMemo(() => {
    const sunrise = nextSunrise(new Date(), OBSERVER);
    return sunrise ? solarTimeline(sunrise, OBSERVER) : null;
  }, []);

  const [state, setState] = useState(() => ({ time: Date.now(), shifted: false }));

  useEffect(() => subscribeSkyTime((time, shifted) => setState({ time, shifted })), []);

  // At rest at the top of the page the sky is now, and now moves: tick the
  // minute over. Once the scroll has moved the sky, the store owns the value.
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => (prev.shifted ? prev : { time: Date.now(), shifted: false }));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!timeline) return null;

  return (
    // Fixed, so it is out of the bar's layout entirely — no collapsing width,
    // nothing to push sideways. It fades and rises a few pixels on arrival.
    // pointer-events-none: it is a caption, not a control, and it should never
    // eat a click meant for whatever is behind it.
    //
    // aria-hidden while invisible: a screen reader should not announce a clock
    // that is not being shown, and the hero's readout is the accessible
    // version of this anyway.
    <span
      ref={ref}
      aria-hidden="true"
      style={{ opacity: 0, transform: 'translateY(4px)' }}
      className="hidden lg:[@media(pointer:fine)]:flex fixed bottom-6 right-6 z-40 items-center gap-2 whitespace-nowrap font-mono text-[11px] text-white/35 tabular-nums select-none pointer-events-none transition-[opacity,transform] duration-500 ease-out"
      title={`${OBSERVER.city} — the hour the sky behind the page is showing`}
    >
      <span>{formatLocalTime(new Date(state.time))}</span>
      <span className="text-white/20" aria-hidden="true">·</span>
      <span>{phaseFor(state.time, timeline)}</span>
    </span>
  );
};

export default SkyClock;
