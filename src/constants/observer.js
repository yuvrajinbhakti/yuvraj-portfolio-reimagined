/**
 * Where the sky is drawn from.
 *
 * Chandigarh, which is where the footer says the author is. The sky is
 * genuinely different from anywhere else, so the coordinates have to be
 * somebody's rather than a default — and the readout in the hero names this
 * city out loud, which is only honest if it is the same number the projection
 * uses. It lived inside the canvas component until that second reader existed.
 */
export const OBSERVER = {
  city: 'Chandigarh',
  latitude: 30.7333,
  longitude: 76.7794,
  timeZone: 'Asia/Kolkata',
};

/**
 * Always IST, whatever timezone the reader is in — the point is what time it is
 * where he is, not where they are. Which is also what makes the sky above
 * checkable: same place, same clock, same stars.
 */
export const formatLocalTime = (date = new Date()) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: OBSERVER.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

/** Azimuth in degrees to the compass point a sentence can use. */
const POINTS = [
  'north', 'north-east', 'east', 'south-east',
  'south', 'south-west', 'west', 'north-west',
];

export const compassPoint = (azimuth) =>
  POINTS[Math.round((((azimuth % 360) + 360) % 360) / 45) % 8];
