import { createContext, useContext } from 'react';

/**
 * Shared on/off state for the cursor layer.
 *
 * This is a bare context module with no components in it on purpose: a file
 * that exports both a component and a hook trips react-refresh's
 * only-export-components rule and costs the whole file its fast-refresh
 * boundary during development.
 */

export const CursorPresenceContext = createContext({
  enabled: false,
  setEnabled: () => {},
  // False on touch devices and anywhere without a real pointer. Distinct from
  // `enabled` because the footer control should disappear entirely rather than
  // offer a switch that cannot do anything.
  supported: false,
});

export const useCursorPresence = () => useContext(CursorPresenceContext);
