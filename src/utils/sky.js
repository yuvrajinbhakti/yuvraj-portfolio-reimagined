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
 * B-V colour index to an RGB triple.
 *
 * B-V is the difference between a star's brightness through a blue filter and
 * through a visual one, and it is a direct read on surface temperature: about
 * -0.3 for a 30,000K blue giant, 0.00 for Vega by definition, 0.65 for the
 * sun, 1.4 and up for a cool red giant like Betelgeuse.
 *
 * These are the standard tabulated values rather than a formula. The previous
 * version interpolated three linear ramps, which put its green channel out of
 * step with the other two around B-V 0.3 and gave the solar-type stars — much
 * the largest group in any catalogue — a faint sickly cast. A table costs
 * nothing here: it is read once per colour bucket at startup, not per star.
 */
const BV_TABLE = [
  [-0.4, 155, 176, 255],
  [-0.2, 170, 191, 255],
  [0.0, 202, 215, 255],
  [0.2, 225, 230, 255],
  [0.4, 248, 247, 255],
  [0.6, 255, 244, 234],
  [0.8, 255, 235, 213],
  [1.0, 255, 224, 188],
  [1.2, 255, 210, 161],
  [1.4, 255, 199, 142],
  [1.6, 255, 187, 123],
  [2.0, 255, 166, 95],
];

function starRGB(bv) {
  const v = Math.max(BV_TABLE[0][0], Math.min(BV_TABLE[BV_TABLE.length - 1][0], bv));
  let i = 0;
  while (i < BV_TABLE.length - 2 && v > BV_TABLE[i + 1][0]) i++;
  const [a0, ar, ag, ab] = BV_TABLE[i];
  const [b0, br, bg, bb] = BV_TABLE[i + 1];
  const f = b0 === a0 ? 0 : (v - a0) / (b0 - a0);
  return [ar + (br - ar) * f, ag + (bg - ag) * f, ab + (bb - ab) * f];
}

/**
 * The star's own colour, as the eye would have it: close to white.
 *
 * Real star colours are far less saturated than photographs suggest, because
 * at those brightnesses colour vision has barely engaged. A sky of vividly
 * coloured dots is a false-colour image, not a night.
 */
export function starColor(bv) {
  const [r, g, b] = starRGB(bv);
  return `${Math.round(r)},${Math.round(g)},${Math.round(b)}`;
}

/**
 * The same colour, pushed, for the halo around a bright star.
 *
 * Not decoration for its own sake. A bright point source overwhelms the centre
 * of whatever is receiving it — retina or sensor — and reads as white there,
 * while the light spread into the wings stays under that ceiling and keeps its
 * hue. So the honest way to draw a bright star is a white core inside a
 * coloured glow, which is also why Betelgeuse looks orange to the naked eye
 * and a magnitude-5 star of identical temperature does not.
 *
 * The push is a move away from the brightest channel rather than a saturation
 * multiply, so the hue is unchanged and only its depth grows.
 */
export function starGlowColor(bv) {
  const rgb = starRGB(bv);
  const m = Math.max(...rgb);
  return rgb.map((c) => Math.round(Math.max(0, m - (m - c) * 1.7))).join(',');
}

/**
 * Magnitude to a 0..1 brightness, where 0 is the faintest star in the
 * catalogue and 1 is Sirius.
 *
 * The magnitude scale is logarithmic and backwards: every 5 steps down is a
 * hundredfold increase in received light, so Sirius at -1.4 is roughly 700
 * times brighter than a magnitude 6 star. Drawing that literally would leave
 * one blazing dot and five thousand invisible ones, so what follows compresses
 * it hard. What survives is the ordering and a strong sense that some stars
 * are obviously brighter, which is what the eye actually takes from a sky.
 */
export function magnitudeT(mag, limit = 6.0) {
  return Math.max(0, Math.min(1, (limit - mag) / (limit + 1.5)));
}

/**
 * The floor is doing most of the work in both curves below, and it took two
 * passes to believe that. Magnitudes are heavily skewed faint — most of a
 * catalogue sits near its own limit — so a curve tuned for the bright end put
 * the median star at alpha 0.19 under a pixel wide, and 611 correctly-placed
 * stars rendered as an empty screen. Counting them proved the projection was
 * right and the drawing was not.
 *
 * The exponents are steeper than that fix left them. With the canvas now
 * rendering at device resolution a sub-pixel star is a crisp point rather than
 * a grey smear, which buys back the room to make the bright end genuinely
 * bigger: the spread across the visible sky is roughly 0.6px to 3.7px, where
 * it used to be 0.7 to 2.65.
 *
 * The floor is passed in rather than fixed because it is not really a length —
 * it is "the smallest mark the rasteriser still draws as a point", and that is
 * measured in *device* pixels. Hard-coding it in CSS pixels tunes it for one
 * display and abandons the other: 0.62 is a solid dot on a 2x screen and an
 * almost invisible one on a 1x monitor, where the whole faint half of the
 * catalogue disappeared.
 */
export function radiusForT(t, floor = 0.62) {
  return floor + 3.1 * t ** 2.4;
}

export function alphaForT(t) {
  return 0.62 + 0.38 * t ** 0.85;
}
