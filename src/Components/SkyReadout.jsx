import { useEffect, useState } from 'react';
import { STARS, STAR_STRIDE, STAR_LABELS, NOTABLE } from '../constants/starCatalog';
import { localSiderealTime, horizontal } from '../utils/sky';
import { OBSERVER, formatLocalTime, compassPoint } from '../constants/observer';
import { subscribeSkyTime } from '../utils/skyClock';

/**
 * The caption the sky did not have.
 *
 * The background is a real star field at a real place and time, and until this
 * line existed a visitor had no way to know that — it was indistinguishable
 * from a particle effect with a good palette. Everything else on this site
 * attaches evidence to its claims; this was the one remarkable claim with no
 * surface at all.
 *
 * So it says something checkable. "Arcturus, 47 degrees above the west" is
 * either true against any sky app right now or it is not, and it comes from the
 * same projection that positions the dots.
 */

// High enough that the star is unambiguously up rather than skimming the
// horizon, where refraction and the observer's own hills make any claim shaky.
const MIN_ALTITUDE = 12;

const currentSubject = (date) => {
  const lst = localSiderealTime(date, OBSERVER.longitude);
  // NOTABLE is sorted brightest first, so the first star that is up is also the
  // most impressive one that is up, and the scan stops there.
  for (let n = 0; n < NOTABLE.length; n++) {
    const index = NOTABLE[n];
    const ra = STARS[index * STAR_STRIDE] / 100;
    const dec = STARS[index * STAR_STRIDE + 1] / 100;
    const { altitude, azimuth } = horizontal(ra, dec, OBSERVER.latitude, lst);
    if (altitude < MIN_ALTITUDE) continue;
    return {
      name: STAR_LABELS[index]?.[0],
      altitude: Math.round(altitude),
      direction: compassPoint(azimuth),
    };
  }
  return null;
};

const read = (when = Date.now(), shifted = false) => ({
  time: formatLocalTime(new Date(when)),
  star: currentSubject(new Date(when)),
  shifted,
});

const SkyReadout = () => {
  const [state, setState] = useState(() => read());

  /*
   * This line names the place and the hour the sky above it is showing, and the
   * sky is no longer always now — scrolling runs it forward to the next sunrise.
   * So the words follow the canvas rather than the wall clock, and say when they
   * have left it.
   *
   * Two sources, deliberately. The subscription covers scrolling; the interval
   * covers standing still, because a reader who stops at the top of the page
   * should still watch the minute tick over. The store ignores changes under a
   * minute, so the subscription cannot outpace what this renders.
   */
  useEffect(() => subscribeSkyTime((time, shifted) => setState(read(time, shifted))), []);

  useEffect(() => {
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let interval;
    const tick = () => setState((prev) => (prev.shifted ? prev : read()));
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, msToNextMinute);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);

  return (
    <div className="font-mono text-[11px] leading-relaxed text-white/40 select-none">
      <p>
        {OBSERVER.city}
        <span className="text-white/25"> · </span>
        <span className="tabular-nums">{state.time}</span>
        <span className="text-white/25"> IST</span>
        {/* The one word that keeps this honest. Without it the line reads as a
            report of the current time, and it is not one: the page shows the
            night that ends at the next sunrise, so the hour named here is an
            hour of that night rather than this one. It said "scrolled" while
            depth 0 meant now and scrolling was the only thing that could move
            it — that stopped being true when the top of the page became
            nightfall, and a label that survives the thing it described is just
            a wrong label. */}
        {state.shifted && <span className="text-white/25"> · tonight</span>}
      </p>
      {/* Nothing bright enough is up — which happens, and saying so is better
          than promoting a star nobody has heard of to keep the line full. The
          two wordings exist because "right now" stops being true the moment the
          scroll has moved the sky, and this is the sentence whose whole job is
          to be true. */}
      <p className="text-white/30">
        {state.star
          ? `${state.star.name}, ${state.star.altitude}° above the ${state.star.direction}`
          : 'the sky above, at that hour'}
      </p>
      {/* Only where there is a pointer to hover with, and hidden from screen
          readers everywhere: an instruction to point at something is not an
          instruction anyone reaching this by keyboard or voice can follow. The
          two lines above stay readable, because what the background *is* is
          worth knowing however you are reading. */}
      <p aria-hidden="true" className="mt-1 hidden text-white/20 [@media(pointer:fine)]:block">
        point at a star to name it
      </p>
    </div>
  );
};

export default SkyReadout;
