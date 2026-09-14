import { useEffect, useMemo, useState } from 'react';
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
 * Desktop only. The bar has no room for it on a phone, and the phone gets the
 * tilt control instead.
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
    <span
      className="hidden lg:inline-flex items-center gap-2 font-mono text-[11px] text-white/35 tabular-nums select-none"
      title={`${OBSERVER.city} — the hour the sky behind the page is showing`}
    >
      <span>{formatLocalTime(new Date(state.time))}</span>
      <span className="text-white/20" aria-hidden="true">·</span>
      <span>{phaseFor(state.time, timeline)}</span>
    </span>
  );
};

export default SkyClock;
