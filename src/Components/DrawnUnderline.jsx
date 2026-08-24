import { useRef, useEffect, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * A stroke that draws itself under a word.
 *
 * Not a border-bottom. The paths are irregular and overshoot their word, which
 * is the entire reason it reads as drawn by hand rather than measured by a
 * browser — a perfectly smooth curve is a border-bottom with extra steps.
 *
 * `double` adds a second, shorter pass at lower opacity that doesn't line up
 * with the first, the way people actually go back over an underline. Worth it
 * on a big heading; fussy on anything small, where one confident stroke is
 * better than two competing ones.
 */

// preserveAspectRatio="none" is what lets one path stretch to any word, and it
// is also the trap: the viewBox is 200 wide, so a 139px heading squashes it
// 0.7x horizontally while a 42px wordmark squashes it 0.21x — four times
// harder. The vertical squash barely changes either way, so the same curve that
// reads as a hand wobble under a heading becomes a swoosh under a wordmark.
//
// Measured as a ratio of vertical travel to rendered width: the heading lands
// at 0.026, the wordmark was at 0.089. COMPACT flattens the curve so short
// words land in the same range instead.
const PRIMARY = { d: 'M3 8.4C36 4.2 79 3.0 124 4.9C153 6.1 178 7.6 197 5.0', width: 2.5, delay: 0.45, duration: 0.85, opacity: 1 };
const SECOND  = { d: 'M14 10.4C52 7.6 96 6.6 138 8.0C160 8.7 182 9.6 204 8.2', width: 1.75, delay: 0.72, duration: 0.62, opacity: 0.55 };
const COMPACT = { d: 'M3 7.9C42 6.1 94 5.7 143 6.8C167 7.3 183 7.9 197 6.9', width: 2.5, delay: 0.45, duration: 0.7, opacity: 1 };

const DrawnUnderline = ({ onReady, double = false, compact = false, strokeWidth, delay = 0, className = '-bottom-2.5 h-3.5' }) => {
  const pathRefs = useRef([]);
  const reduce = useReducedMotion();

  const strokes = compact ? [COMPACT] : double ? [PRIMARY, SECOND] : [PRIMARY];

  const draw = useCallback((immediate = false) => {
    pathRefs.current.forEach((path, i) => {
      if (!path) return;
      const stroke = (compact ? [COMPACT] : double ? [PRIMARY, SECOND] : [PRIMARY])[i];
      const length = path.getTotalLength();

      if (immediate) {
        path.style.transition = 'none';
        path.style.strokeDasharray = 'none';
        path.style.strokeDashoffset = '0';
        return;
      }

      path.style.transition = 'none';
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      // Read a layout property to flush the reset before the transition goes
      // back on. Set both in one frame and the browser folds them into a single
      // style recalculation, so the redraw never animates.
      void path.getBoundingClientRect();
      path.style.transition =
        `stroke-dashoffset ${stroke.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${stroke.delay + delay}s`;
      path.style.strokeDashoffset = '0';
    });
  }, [double, compact, delay]);

  useEffect(() => {
    onReady?.(() => draw());
    // Reduced motion: drawn, but instantly. The mark is emphasis, so it stays —
    // only the drawing of it is movement.
    const id = requestAnimationFrame(() => draw(reduce));
    return () => cancelAnimationFrame(id);
  }, [reduce, draw, onReady]);

  return (
    <svg
      className={`absolute left-0 w-full overflow-visible pointer-events-none ${className}`}
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {strokes.map((s, i) => (
        <path
          key={s.d}
          ref={(el) => { pathRefs.current[i] = el; }}
          d={s.d}
          stroke="#60a5fa"
          strokeWidth={strokeWidth ?? s.width}
          strokeLinecap="round"
          strokeOpacity={s.opacity}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
};

DrawnUnderline.propTypes = {
  onReady: PropTypes.func,
  double: PropTypes.bool,
  compact: PropTypes.bool,
  strokeWidth: PropTypes.number,
  delay: PropTypes.number,
  className: PropTypes.string,
};

/**
 * A word with its underline, as one thing.
 *
 * The svg is pointer-events: none and has to stay that way or it would sit over
 * the text, so the hover target has to be this wrapper rather than the mark.
 */
export const DrawnName = ({ children, className = '', replayOnHover = true, ...underlineProps }) => {
  const replay = useRef(null);
  const reduce = useReducedMotion();

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={reduce || !replayOnHover ? undefined : () => replay.current?.()}
    >
      {children}
      <DrawnUnderline onReady={(fn) => { replay.current = fn; }} {...underlineProps} />
    </span>
  );
};

DrawnName.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  replayOnHover: PropTypes.bool,
};

export default DrawnUnderline;
