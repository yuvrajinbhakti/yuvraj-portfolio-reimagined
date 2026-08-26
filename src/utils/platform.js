/**
 * Which modifier to name in a keyboard hint.
 *
 * Showing "Ctrl K" to someone on a Mac is the kind of detail that quietly says
 * the shortcut was never really tested — and the shortcut handler accepts both
 * modifiers anyway, so this only decides what the label reads.
 *
 * navigator.platform is deprecated but is still the only synchronous answer;
 * userAgentData exists on Chromium alone. Both are checked, and the fallback is
 * the user agent string, which every browser still carries. Computed once:
 * nobody switches operating system mid-session.
 *
 * Safe to evaluate at module scope because this app has no server render — the
 * prerendered HTML is a meta-only shell with an empty root, so there is no
 * markup for a client/server disagreement to corrupt.
 */
const isApplePlatform = () => {
  if (typeof navigator === 'undefined') return false;
  const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform);
};

export const IS_APPLE = isApplePlatform();

/** The symbol to print in a shortcut hint — "⌘" on Apple hardware, "Ctrl" elsewhere. */
export const MOD_KEY = IS_APPLE ? '⌘' : 'Ctrl';

export default MOD_KEY;
