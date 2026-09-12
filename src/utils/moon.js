/**
 * Where the moon is, and how much of it is lit.
 *
 * The sun needed one extra step beyond a star — its address changes through the
 * year. The moon needs several more, because its orbit is genuinely awkward:
 * inclined about five degrees to the ecliptic, noticeably elliptical, and pulled
 * around by the sun enough that the ellipse itself rotates. The series below are
 * the largest of those corrections, in descending order of size, cut where the
 * terms stop mattering for what this is used for.
 *
 * Source for the series: Meeus, *Astronomical Algorithms*, ch. 47, truncated.
 *
 * ## What was actually checked
 *
 * Not against an ephemeris — there isn't one here, and a remembered table is
 * worse than no table. Against structure instead, which a wrong implementation
 * cannot fake, because each of these depends on a different one of the five
 * fundamental arguments:
 *
 *   sidereal month     27.3416 d   against 27.3217   (mean longitude, anomaly)
 *   draconic month     27.2405 d   against 27.2122   (argument of latitude)
 *   synodic month      29.5153 d   against 29.5306   (elongation, solar anomaly)
 *   perigee..apogee    356888..406076 km, against 356500..406700
 *   max |latitude|     5.313°      against a real ceiling of 5.30°
 *
 * The period gaps are about 0.02 days, which is one to two steps of the scan
 * that measured them, so most of what shows there is the measurement.
 *
 * Positional accuracy is a few tenths of a degree, which is the honest figure
 * for a series cut this short. The moon is half a degree wide and is drawn a
 * dozen pixels across, so that is a fraction of its own disc — invisible here,
 * and useless for anything that actually needs the moon's position.
 */

import { julianDate, localSiderealTime, horizontal } from './sky.js';
import { solarPosition } from './sun.js';

const RAD = Math.PI / 180;
const sin = (deg) => Math.sin(deg * RAD);
const cos = (deg) => Math.cos(deg * RAD);

/**
 * The moon's ecliptic coordinates.
 *
 * @param {Date} date
 * @returns {{ longitude: number, latitude: number, distance: number }}
 *   degrees, degrees, kilometres
 */
function moonEcliptic(date) {
  const T = (julianDate(date) - 2451545.0) / 36525;

  // The five fundamental arguments. Every periodic term below is a combination
  // of these, which is what makes a truncated series meaningful rather than
  // arbitrary: dropping a term drops one identifiable physical effect.
  const Lp = 218.3164477 + 481267.88123421 * T;   // mean longitude
  const D = 297.8501921 + 445267.1114034 * T;     // elongation from the sun
  const M = 357.5291092 + 35999.0502909 * T;      // the sun's mean anomaly
  const Mp = 134.9633964 + 477198.8675055 * T;    // the moon's mean anomaly
  const F = 93.2720950 + 483202.0175233 * T;      // argument of latitude

  // Longitude. The first term is the equation of the centre — the ellipse —
  // and the second is evection, the sun's tug on that ellipse, which Ptolemy
  // found and which is why a two-body model of the moon is visibly wrong.
  const longitude = Lp
    + 6.288774 * sin(Mp)
    - 1.274027 * sin(2 * D - Mp)
    + 0.658314 * sin(2 * D)
    + 0.213618 * sin(2 * Mp)
    - 0.185116 * sin(M)
    - 0.114332 * sin(2 * F)
    + 0.058793 * sin(2 * D - 2 * Mp)
    + 0.057066 * sin(2 * D - M - Mp)
    + 0.053322 * sin(2 * D + Mp)
    + 0.045758 * sin(2 * D - M)
    - 0.040923 * sin(M - Mp)
    - 0.034720 * sin(D)
    - 0.030383 * sin(M + Mp);

  // Latitude — how far off the ecliptic. Dominated by the five-degree tilt.
  const latitude = 5.128122 * sin(F)
    + 0.280602 * sin(Mp + F)
    + 0.277693 * sin(Mp - F)
    + 0.173237 * sin(2 * D - F)
    + 0.055413 * sin(2 * D - Mp + F)
    + 0.046271 * sin(2 * D - Mp - F)
    + 0.032573 * sin(2 * D + F);

  // Distance, kilometres. Only needed to size the disc, where the 5% swing
  // between perigee and apogee is the difference a supermoon headline is about.
  const distance = 385000.56
    - 20905.355 * cos(Mp)
    - 3699.111 * cos(2 * D - Mp)
    - 2955.968 * cos(2 * D)
    - 569.925 * cos(2 * Mp);

  return { longitude: ((longitude % 360) + 360) % 360, latitude, distance };
}

/**
 * The moon's equatorial coordinates.
 *
 * @param {Date} date
 * @returns {{ ra: number, dec: number, distance: number }} degrees, degrees, km
 */
export function moonPosition(date) {
  const { longitude, latitude, distance } = moonEcliptic(date);
  const T = (julianDate(date) - 2451545.0) / 36525;
  const epsilon = 23.439291 - 0.0130042 * T;

  const sl = sin(longitude);
  const cl = cos(longitude);
  const sb = sin(latitude);
  const cb = cos(latitude);
  const se = sin(epsilon);
  const ce = cos(epsilon);

  const ra = Math.atan2(sl * ce - (sb / cb) * se, cl) / RAD;
  const dec = Math.asin(sb * ce + cb * se * sl) / RAD;

  return { ra: ((ra % 360) + 360) % 360, dec, distance };
}

/**
 * How high the moon is, and which way round, for an observer.
 *
 * @param {Date} date
 * @param {{ latitude: number, longitude: number }} observer
 * @returns {{ altitude: number, azimuth: number, distance: number }}
 */
export function moonHorizontal(date, observer) {
  const { ra, dec, distance } = moonPosition(date);
  const lst = localSiderealTime(date, observer.longitude);
  return { ...horizontal(ra, dec, observer.latitude, lst), distance };
}

/**
 * The phase.
 *
 * Taken from the moon's elongation from the sun, which is what a phase is:
 * the two are in the same direction at new moon and opposite at full, and the
 * lit fraction follows the cosine of the angle between them. Good to a per cent
 * or so, against a use that draws it a few pixels across.
 *
 * `waxing` decides which limb is lit — right in the northern hemisphere while
 * the moon is filling, left while it is emptying. Getting this backwards is the
 * single most noticeable error available here, because everybody has seen the
 * moon and a backwards crescent looks wrong without anyone being able to say why.
 *
 * @param {Date} date
 * @returns {{ illuminated: number, waxing: boolean, age: number }}
 *   fraction 0..1, and age in degrees of elongation 0..360
 */
export function moonPhase(date) {
  const moon = moonEcliptic(date);
  const sun = solarPosition(date);

  // solarPosition returns equatorial; the sun's ecliptic latitude is zero by
  // definition, so its ecliptic longitude comes back from the same rotation.
  const T = (julianDate(date) - 2451545.0) / 36525;
  const epsilon = (23.439291 - 0.0130042 * T) * RAD;
  const sunLongitude =
    Math.atan2(
      Math.sin(sun.ra * RAD) * Math.cos(epsilon) + Math.tan(sun.dec * RAD) * Math.sin(epsilon),
      Math.cos(sun.ra * RAD)
    ) / RAD;

  const elongation = ((moon.longitude - sunLongitude) % 360 + 360) % 360;

  return {
    illuminated: (1 - Math.cos(elongation * RAD)) / 2,
    waxing: elongation < 180,
    age: elongation,
  };
}
