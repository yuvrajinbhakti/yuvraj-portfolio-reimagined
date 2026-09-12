/**
 * The moment the sky is currently showing.
 *
 * The canvas maps scroll depth onto a clock: the top of the page is now, the
 * bottom is the next sunrise over Chandigarh, and everything between is the sky
 * that will actually be there. Two readouts — the one under the hero and the one
 * in the footer — name that place and that time in words.
 *
 * They used to call `formatLocalTime()` with no argument, which is always the
 * real clock. That was correct while the sky was always the real sky. The moment
 * scrolling started moving the sky, it stopped being correct: the caption said
 * quarter past one in the afternoon above a sky that had run on seventeen hours.
 * A page whose whole argument is that its claims are checkable cannot have a
 * label that disagrees with the thing it labels.
 *
 * So: one number, written by the canvas, read by anyone who displays it.
 *
 * ## Why not a context
 *
 * Scroll fires at frame rate. A context holding this value would re-render every
 * subscriber sixty times a second to change a string that only needs to be right
 * to the minute. Subscribers here decide their own cadence, and both of them
 * settle for roughly once a second.
 */

/** Milliseconds. Starts at the real now, which is also what depth 0 means. */
let current = Date.now();

/** True once the scroll has actually moved it away from the wall clock. */
let shifted = false;

const listeners = new Set();

/**
 * Called by the canvas as the scroll moves.
 *
 * Ignores changes under a minute so a subscriber rendering `hh:mm` is not woken
 * to redraw the same string — most frames of a slow scroll move the clock by
 * seconds.
 */
export function setSkyTime(ms) {
  const wasShifted = shifted;
  const nextShifted = Math.abs(ms - Date.now()) > 60_000;

  if (Math.abs(ms - current) < 60_000 && nextShifted === wasShifted) return;

  current = ms;
  shifted = nextShifted;
  for (const fn of listeners) fn(current, shifted);
}

/** @returns {{ time: number, shifted: boolean }} */
export function getSkyTime() {
  return { time: current, shifted };
}

/**
 * Subscribe. Returns an unsubscribe.
 *
 * Fires immediately with the current value, so a component mounting mid-scroll
 * is not stuck showing the wall clock until the next movement.
 */
export function subscribeSkyTime(fn) {
  listeners.add(fn);
  fn(current, shifted);
  return () => listeners.delete(fn);
}

/**
 * Put it back to the real clock.
 *
 * For the canvas unmounting, and for reduced motion, where the sky never leaves
 * now in the first place — but the store is module state and outlives any one
 * component, so it has to be told.
 */
export function resetSkyTime() {
  current = Date.now();
  if (shifted) {
    shifted = false;
    for (const fn of listeners) fn(current, false);
  }
}
