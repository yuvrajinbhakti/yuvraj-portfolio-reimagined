/**
 * Where a star actually is, from where you actually are.
 *
 * A catalogue gives every star a right ascension and declination — its fixed
 * address on the celestial sphere, the same for everyone forever. What you see
 * out of a window is altitude and azimuth: how high, and which way round. The
 * conversion between them depends on where you are standing and what time it
 * is, which is the entire reason the sky looks different from Chandigarh at
 * 3am than from London at noon.
 *
 * This is the standard reduction and nothing clever. It ignores precession,
 * nutation, aberration and refraction — corrections worth arcseconds to
 * arcminutes, on a background where one pixel is several arcminutes wide.
 */

const DEG = Math.PI / 180;

/**
 * Julian Date: days since noon on 1 January 4713 BC, which is the epoch every
 * astronomical formula is written against.
 *
 * The Unix epoch is JD 2440587.5, and both count real days, so the conversion
 * is one division.
 */
export function julianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Greenwich Mean Sidereal Time, in degrees.
 *
 * Sidereal time runs against the stars rather than the sun, which is why the
 * coefficient is 360.98564736629 degrees per day and not 360: the Earth has to
 * turn very slightly further than one rotation for the sun to come back to the
 * same place, and slightly less far for a star. That extra ~0.986 degrees a
 * day is the whole difference, and it is what makes the night sky drift by two
 * hours a month.
 */
export function greenwichSiderealTime(date) {
  const d = julianDate(date) - 2451545.0; // days from J2000.0
  const gmst = 280.46061837 + 360.98564736629 * d;
  return ((gmst % 360) + 360) % 360;
}

/** Local sidereal time in degrees: what part of the sky is currently overhead. */
export function localSiderealTime(date, longitude) {
  const lst = greenwichSiderealTime(date) + longitude;
  return ((lst % 360) + 360) % 360;
}

/**
 * Convert a catalogue position to what an observer sees.
 *
 * @param {number} ra       right ascension, degrees
 * @param {number} dec      declination, degrees
 * @param {number} latitude observer, degrees north
 * @param {number} lst      local sidereal time, degrees — hoisted out because
 *                          it is the same for every star in a frame and is by
 *                          far the most expensive part
 * @returns {{ altitude: number, azimuth: number }} degrees; altitude is
 *          negative for anything below the horizon
 */
export function horizontal(ra, dec, latitude, lst) {
  // The hour angle is how far past the meridian the star has travelled.
  const hourAngle = (lst - ra) * DEG;
  const d = dec * DEG;
  const lat = latitude * DEG;

  const sinAlt =
    Math.sin(d) * Math.sin(lat) + Math.cos(d) * Math.cos(lat) * Math.cos(hourAngle);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

  const cosAz =
    (Math.sin(d) - Math.sin(altitude) * Math.sin(lat)) /
    (Math.cos(altitude) * Math.cos(lat));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz)));

  // acos cannot tell east from west, so the sign of the hour angle does. A
  // star past the meridian is setting, and belongs on the western half.
  if (Math.sin(hourAngle) > 0) azimuth = 2 * Math.PI - azimuth;

  return { altitude: altitude / DEG, azimuth: azimuth / DEG };
}

/**
 * B-V colour index to something a canvas can fill with.
 *
 * B-V is the difference between a star's brightness through a blue filter and
 * through a visual one, and it is a direct read on surface temperature: about
 * -0.3 for a 30,000K blue giant, 0.00 for Vega by definition, 0.65 for the
 * sun, 1.4 and up for a cool red giant like Betelgeuse.
 *
 * The mapping below is deliberately gentle. Real star colours are far less
 * saturated than photographs suggest — the eye sees almost all of them as
 * white, because at those brightnesses colour vision has barely engaged. A
 * sky of vividly coloured dots is a false-colour image, not a night.
 */
export function starColor(bv) {
  const t = Math.max(0, Math.min(1, (bv + 0.4) / 2.4)); // -0.4..2.0 → 0..1
  // Blue-white through white to amber, staying close to white throughout.
  const r = Math.round(190 + 65 * t);
  const g = Math.round(215 - 35 * Math.abs(t - 0.35) * 2);
  const b = Math.round(255 - 120 * t);
  return `${r},${Math.max(150, Math.min(235, g))},${b}`;
}

/**
 * How bright to draw a star of a given magnitude.
 *
 * The magnitude scale is logarithmic and backwards: every 5 steps down is a
 * hundredfold increase in received light, so Sirius at -1.4 is roughly 700
 * times brighter than the faintest star here at 5.5. Drawing that literally
 * would leave one blazing dot and 2,850 invisible ones.
 *
 * So this compresses hard. What survives is the ordering and a sense that some
 * stars are obviously brighter, which is what the eye actually takes from a
 * sky.
 */
export function magnitudeToAlpha(mag, limit = 6.0) {
  const t = Math.max(0, Math.min(1, (limit - mag) / (limit + 1.5)));
  // The floor is doing most of the work, and it took two passes to believe
  // that. Magnitudes are heavily skewed faint — most of a catalogue sits near
  // its own limit — so a curve tuned for the bright end put the median star at
  // alpha 0.19 under a pixel wide, and 611 correctly-placed stars rendered as
  // an empty screen. Counting them proved the projection was right and the
  // drawing was not.
  return 0.5 + 0.5 * t ** 1.1;
}

export function magnitudeToRadius(mag, limit = 6.0) {
  const t = Math.max(0, Math.min(1, (limit - mag) / (limit + 1.5)));
  // 0.6 is about the smallest arc that still reads as a point rather than as
  // faint noise, so that is the floor and everything else is headroom above it.
  return 0.7 + 2.0 * t ** 2;
}
