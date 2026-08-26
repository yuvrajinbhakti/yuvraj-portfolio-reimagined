import { createContext, useContext } from 'react';

/**
 * Open/close state for the command palette, so anything on the page can raise
 * it — the navbar chip, the mobile menu, a link in the footer.
 *
 * A bare context module with no components in it, matching cursorPresence.js
 * and for the same reason: a file exporting both a component and a hook trips
 * react-refresh's only-export-components rule and costs the whole file its
 * fast-refresh boundary in development.
 */

export const CommandPaletteContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
  // Called on hover/focus of anything that opens the palette, so the chunk is
  // already in flight by the time it is actually needed.
  prefetch: () => {},
});

export const useCommandPalette = () => useContext(CommandPaletteContext);
