/**
 * Where the sun is, from where you are.
 *
 * The star field already converts a catalogue position to what an observer sees.
 * The sun needs one extra step, because unlike a star it does not have a fixed
 * address: its right ascension and declination change through the year as the
 * Earth goes round it. So this computes today's address first, then hands it to
 * the same horizontal() reduction the stars use.
 *
 * This is the low-precision solar position — good to about a hundredth of a
 * degree, against a use that needs about one. The expensive corrections buy
 * arcseconds, and nothing here can see an arcsecond: the output is the colour of
 * a gradient.
 *
 * Sources for the constants: the mean-longitude and mean-anomaly series and the
 * equation of the centre are the standard reduction found in Meeus, *Astronomical
 * Algorithms*, ch. 25, in its abridged form.
 */

import { julianDate, localSiderealTime, horizontal } from './sky.js';

const RAD = Math.PI / 180;

/**
 * The sun's celestial coordinates for a moment.
 *
 * @param {Date} date
 * @returns {{ ra: number, dec: number }} degrees
 */
export function solarPosition(date) {
  const n = julianDate(date) - 2451545.0; // days from J2000.0

  // Mean longitude and mean anomaly, both degrees, both growing roughly a
  // degree a day because that is what a year is.
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * RAD;

  // The equation of the centre: the correction from a circular orbit to the
  // ellipse the Earth actually travels. Two terms is plenty — the third is
  // under an arcsecond.
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD;

  // Obliquity of the ecliptic — the tilt that causes seasons, slowly decreasing.
  const epsilon = (23.439 - 0.0000004 * n) * RAD;

  // Ecliptic to equatorial.
  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda)) / RAD;
  const dec = Math.asin(Math.sin(epsilon) * Math.sin(lambda)) / RAD;

  return { ra: (ra + 360) % 360, dec };
}

/**
 * How high the sun is, and which way round, for an observer.
 *
 * @param {Date} date
 * @param {{ latitude: number, longitude: number }} observer
 * @returns {{ altitude: number, azimuth: number }} degrees; altitude is negative
 *   when the sun is below the horizon, which is most of what this is used for.
 */
export function sunPosition(date, observer) {
  const { ra, dec } = solarPosition(date);
  const lst = localSiderealTime(date, observer.longitude);
  return horizontal(ra, dec, observer.latitude, lst);
}

/**
 * The twilight bands, by solar altitude.
 *
 * These are the conventional definitions, not choices:
 *
 *   above  0°   day
 *    0 to -6°   civil twilight — the bright part of dusk, horizon still clear
 *   -6 to -12°  nautical twilight — horizon becoming indistinct
 *  -12 to -18°  astronomical twilight — the faintest stars still washed out
 *   below -18°  night, as dark as it is going to get
 *
 * Returned as a name plus a 0..1 position through the whole range, which is what
 * a gradient wants.
 */
export function twilightBand(altitude) {
  if (altitude > 0) return { name: 'day', t: 1 };
  if (altitude > -6) return { name: 'civil', t: 0.75 + (altitude / -6) * -0.25 };
  if (altitude > -12) return { name: 'nautical', t: 0.5 + ((altitude + 6) / -6) * -0.25 };
  if (altitude > -18) return { name: 'astronomical', t: 0.25 + ((altitude + 12) / -6) * -0.25 };
  return { name: 'night', t: 0 };
}

/**
 * The next moment the sun's altitude crosses zero going up.
 *
 * Scans forward in coarse steps to find the crossing, then bisects it. Ten
 * minutes is fine for the scan because the sun cannot rise and set inside one —
 * it moves at most about 2.5 degrees in that time at this latitude.
 *
 * Returns null above the Arctic and Antarctic circles in the seasons where the
 * sun does not rise at all, rather than looping for a day and a half to find out.
 * The caller decides what to do about a polar winter; here it is honestly
 * "there isn't one".
 *
 * @param {Date} from
 * @param {{ latitude: number, longitude: number }} observer
 * @param {number} [withinHours=36] how far ahead to give up
 * @returns {Date | null}
 */
/**
 * The eight moments a night is made of, working back from a sunrise.
 *
 * These are the named boundaries — sunset, the ends of civil, nautical and
 * astronomical twilight, the deepest point, and the same three coming back up —
 * and they exist so that the page can be *choreographed* against them instead of
 * against raw time.
 *
 * That distinction is the whole reason this function exists. Mapping clock time
 * onto scroll, however it was weighted, meant nobody had decided what the page
 * does and where: a real night is about eighty-five per cent nothing-happening,
 * so the physics chose the pacing and the answer was always "dark for most of
 * it, then everything at once". Keying the scroll to these instead means the
 * pacing is a decision — this much page for dusk, this much for the dark, this
 * much for dawn — while every frame in between still renders a true sky for a
 * true moment. Only the rate is authored.
 *
 * Phases that do not happen collapse rather than vanish. Above the Arctic circle
 * in June there is no astronomical night; those stops land on the darkest moment
 * there is, the segment between them has zero duration, and the caller
 * interpolates across it without noticing.
 *
 * @param {Date} sunrise the sunrise the night runs up to
 * @param {{ latitude: number, longitude: number }} observer
 * @returns {{ sunset: Date, civilDusk: Date, nauticalDusk: Date, astroDusk: Date,
 *   deepest: Date, astroDawn: Date, nauticalDawn: Date, civilDawn: Date,
 *   sunrise: Date }}
 */
export function solarTimeline(sunrise, observer) {
  const STEP_MS = 5 * 60 * 1000;
  const end = sunrise.getTime();
  const begin = end - 18 * 3600 * 1000;

  // Sample the whole night once; every boundary below is read off this.
  const times = [];
  const alts = [];
  for (let t = begin; t <= end; t += STEP_MS) {
    times.push(t);
    alts.push(sunPosition(new Date(t), observer).altitude);
  }

  // The darkest moment — solar midnight. Everything else is found either side.
  let deepestIndex = 0;
  for (let i = 1; i < alts.length; i++) if (alts[i] < alts[deepestIndex]) deepestIndex = i;

  /** Bisect the crossing of `target` between two samples, to the second. */
  const refine = (i, j, target) => {
    let lo = times[i];
    let hi = times[j];
    const loAbove = alts[i] > target;
    while (hi - lo > 1000) {
      const mid = (lo + hi) / 2;
      if (sunPosition(new Date(mid), observer).altitude > target === loAbove) lo = mid;
      else hi = mid;
    }
    return new Date(Math.round(hi));
  };

  /** Last time before the darkest point that the sun was above `target`. */
  const falling = (target) => {
    for (let i = deepestIndex; i > 0; i--) {
      if (alts[i] <= target && alts[i - 1] > target) return refine(i - 1, i, target);
    }
    return new Date(times[deepestIndex]);
  };

  /** First time after the darkest point that the sun climbs past `target`. */
  const rising = (target) => {
    for (let i = deepestIndex; i < alts.length - 1; i++) {
      if (alts[i] <= target && alts[i + 1] > target) return refine(i, i + 1, target);
    }
    return new Date(times[deepestIndex]);
  };

  return {
    sunset: falling(0),
    civilDusk: falling(-6),
    nauticalDusk: falling(-12),
    astroDusk: falling(-18),
    deepest: new Date(times[deepestIndex]),
    astroDawn: rising(-18),
    nauticalDawn: rising(-12),
    civilDawn: rising(-6),
    sunrise,
  };
}

/**
 * The evening before a sunrise, at whichever depth of dusk you ask for.
 *
 * The page shows one night, and a night has to start somewhere. `altitudeDeg`
 * picks where: 0 is sunset itself, -6 the end of civil twilight, -18 the end of
 * astronomical twilight, when the last of the sun is out of the sky.
 *
 * Scanning backwards from the sunrise rather than forwards from now, because
 * "the evening that leads to that sunrise" is well defined at any hour of the
 * day and "the next sunset" is not — ask at one in the morning and the honest
 * answer is tonight, which is the wrong night.
 *
 * Going back from sunrise the sun sinks, bottoms out around midnight and climbs
 * again toward dusk, so the first crossing back above the threshold is the one
 * wanted.
 *
 * @param {Date} sunrise
 * @param {{ latitude: number, longitude: number }} observer
 * @param {number} [altitudeDeg=-18] the sun's altitude that marks the start
 * @param {number} [withinHours=18] how far back to give up
 * @returns {Date | null} null when the sun never gets that low — a real case in
 *   summer at high latitudes, where astronomical night simply does not happen.
 */
export function nightfallBefore(sunrise, observer, altitudeDeg = -18, withinHours = 18) {
  const STEP_MS = 10 * 60 * 1000;
  const limit = sunrise.getTime() - withinHours * 3600 * 1000;

  let prevTime = sunrise.getTime();
  let prevAlt = sunPosition(sunrise, observer).altitude;

  for (let t = prevTime - STEP_MS; t >= limit; t -= STEP_MS) {
    const alt = sunPosition(new Date(t), observer).altitude;

    if (prevAlt <= altitudeDeg && alt > altitudeDeg) {
      let lo = t;          // earlier, brighter than the threshold
      let hi = prevTime;   // later, darker than it
      while (hi - lo > 1000) {
        const mid = (lo + hi) / 2;
        if (sunPosition(new Date(mid), observer).altitude > altitudeDeg) lo = mid;
        else hi = mid;
      }
      return new Date(Math.round(hi));
    }

    prevTime = t;
    prevAlt = alt;
  }

  return null;
}

export function nextSunrise(from, observer, withinHours = 36) {
  const STEP_MS = 10 * 60 * 1000;
  const limit = from.getTime() + withinHours * 3600 * 1000;

  let prevTime = from.getTime();
  let prevAlt = sunPosition(from, observer).altitude;

  for (let t = prevTime + STEP_MS; t <= limit; t += STEP_MS) {
    const alt = sunPosition(new Date(t), observer).altitude;

    if (prevAlt <= 0 && alt > 0) {
      // Crossing is somewhere in this step. Bisect to the second.
      let lo = prevTime;
      let hi = t;
      while (hi - lo > 1000) {
        const mid = (lo + hi) / 2;
        if (sunPosition(new Date(mid), observer).altitude > 0) hi = mid;
        else lo = mid;
      }
      return new Date(Math.round(hi));
    }

    prevTime = t;
    prevAlt = alt;
  }

  return null;
}
