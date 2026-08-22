import { useRef, useCallback, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Glass card with pointer tilt and glare.
 *
 * Tilt and glare are written to CSS custom properties on the node inside a
 * rAF, rather than held in React state. The previous version called setState
 * on every mousemove, which re-rendered the whole card subtree once per frame
 * while the pointer was over it.
 *
 * The lift/shadow/border live in `.glass-card` (index.css) so reduced-motion
 * can switch them off declaratively.
 */
const GlassCard = ({
  children,
  className = '',
  glareEffect = true,
  tiltEffect = true,
  maxTilt = 4,
  glareOpacity = 0.15,
  style = {},
}) => {
  const cardRef = useRef(null);
  const frameRef = useRef(0);
  const reduce = useReducedMotion();

  // No pointer effects when the visitor asked for less motion.
  const interactive = (tiltEffect || glareEffect) && !reduce;

  const write = useCallback((vars) => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      Object.entries(vars).forEach(([k, v]) => card.style.setProperty(k, v));
    });
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!interactive) return;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      // 0..1 across the card
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      write({
        '--tilt-x': tiltEffect ? `${(0.5 - py) * 2 * maxTilt}deg` : '0deg',
        '--tilt-y': tiltEffect ? `${(px - 0.5) * 2 * maxTilt}deg` : '0deg',
        '--glare-x': `${px * 100}%`,
        '--glare-y': `${py * 100}%`,
      });
    },
    [interactive, tiltEffect, maxTilt, write]
  );

  const handleMouseLeave = useCallback(() => {
    write({
      '--tilt-x': '0deg',
      '--tilt-y': '0deg',
      '--glare-x': '50%',
      '--glare-y': '50%',
    });
  }, [write]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  return (
    <div
      ref={cardRef}
      className={`glass-card ${interactive ? 'glass-card--interactive' : ''} ${className}`}
      style={{ '--glare-opacity': glareOpacity, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {glareEffect && !reduce && <div className="glass-card__glare" aria-hidden="true" />}

      <div className="relative z-20">{children}</div>

      <div className="glass-card__edge" aria-hidden="true" />
    </div>
  );
};

GlassCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  glareEffect: PropTypes.bool,
  tiltEffect: PropTypes.bool,
  maxTilt: PropTypes.number,
  glareOpacity: PropTypes.number,
  style: PropTypes.object,
};

export default GlassCard;
