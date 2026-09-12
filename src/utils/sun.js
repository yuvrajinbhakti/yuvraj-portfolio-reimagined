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
