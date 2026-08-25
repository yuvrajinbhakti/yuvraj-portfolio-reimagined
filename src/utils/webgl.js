/**
 * Can this browser actually give us a WebGL context?
 *
 * Worth answering separately from catching the failure. WebGLBoundary catches a
 * context that dies *after* three.js has been fetched, parsed and run. This
 * runs before the lazy import is triggered at all, so a device that cannot
 * render the globe never downloads the 226 kB gzip needed to find that out.
 *
 * Cached: the answer cannot change within a page load, and creating a throwaway
 * canvas on every render would be its own small waste.
 *
 * Lives apart from the component it serves because a module that exports both a
 * component and a plain function breaks Fast Refresh.
 */
let cached = null;

export const supportsWebGL = () => {
  if (cached !== null) return cached;
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    cached = Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
    );
  } catch {
    // Some privacy extensions throw from getContext rather than returning null.
    cached = false;
  }
  return cached;
};

export default supportsWebGL;
