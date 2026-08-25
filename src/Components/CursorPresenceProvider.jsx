import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { CursorPresenceContext } from '../contexts/cursorPresence';

const STORAGE_KEY = 'ysn:cursors';

/**
 * Decides whether the cursor layer runs at all, and remembers the answer.
 *
 * Five things can switch it off, in descending order of authority:
 *
 *   1. No fine pointer (phones, tablets). Hard off — there is no cursor to
 *      mirror, so the feature is meaningless and only costs battery. Not even
 *      offered as a control.
 *   2. An explicit choice the visitor made and we stored. Beats the defaults
 *      in both directions.
 *   3. prefers-reduced-motion. A second cursor drifting across the page with
 *      nobody asking for it is precisely what that setting exists to stop, so
 *      it flips the default to off — but an explicit opt-in above still wins,
 *      because guessing at someone's needs over their stated choice is worse
 *      than the motion is.
 *   4. The tab being hidden, handled in GhostCursors: nothing broadcasts while
 *      nobody is looking.
 *   5. Going idle, also in GhostCursors: a parked foreign cursor fades out
 *      rather than sitting on the page forever.
 */

const query = (mq) => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(mq).matches;
};

const readStored = () => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'on' || value === 'off' ? value : null;
  } catch {
    // Safari in private mode throws on localStorage access rather than
    // returning null. Treat it as "no preference recorded".
    return null;
  }
};

const CursorPresenceProvider = ({ children }) => {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabledState] = useState(false);

  // Resolved after mount rather than during render: matchMedia and
  // localStorage are both unavailable while prerendering, and reading them in
  // an initialiser would make the build output disagree with the first client
  // render.
  useEffect(() => {
    const finePointer = query('(pointer: fine)');
    setSupported(finePointer);
    if (!finePointer) return undefined;

    const stored = readStored();
    const resolve = () =>
      stored ? stored === 'on' : !query('(prefers-reduced-motion: reduce)');

    setEnabledState(resolve());

    // Someone can change the OS setting while the page is open, and if they
    // have not made a choice here we should follow it.
    if (stored) return undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setEnabledState(!motion.matches);
    motion.addEventListener('change', onChange);
    return () => motion.removeEventListener('change', onChange);
  }, []);

  const setEnabled = useCallback((next) => {
    setEnabledState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
    } catch {
      // Preference is lost on reload, the toggle still works for this visit.
    }
  }, []);

  const value = useMemo(
    () => ({ enabled, setEnabled, supported }),
    [enabled, setEnabled, supported]
  );

  return (
    <CursorPresenceContext.Provider value={value}>
      {children}
    </CursorPresenceContext.Provider>
  );
};

CursorPresenceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CursorPresenceProvider;
