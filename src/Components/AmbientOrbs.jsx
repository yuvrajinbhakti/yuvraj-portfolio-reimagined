import { motion } from 'framer-motion';

const orbs = [
  { id: 0, size: 600, color: 'rgba(59,130,246,0.07)', top: '-10%', left: '-5%',  duration: 22, xRange: 40, yRange: 30 },
  { id: 1, size: 500, color: 'rgba(139,92,246,0.07)', top: '30%',  left: '60%',  duration: 28, xRange: -35, yRange: 40 },
  { id: 2, size: 400, color: 'rgba(6,182,212,0.06)',  top: '70%',  left: '10%',  duration: 20, xRange: 50, yRange: -30 },
  { id: 3, size: 350, color: 'rgba(99,102,241,0.06)', top: '55%',  left: '75%',  duration: 34, xRange: -40, yRange: -25 },
  { id: 4, size: 300, color: 'rgba(236,72,153,0.05)', top: '15%',  left: '40%',  duration: 26, xRange: 30, yRange: 35 },
];

const AmbientOrbs = () => {
  return (
    // overflow-hidden matters: several orbs are positioned past 50% and are
    // 350-600px wide, so on narrower viewports they pushed the document wider
    // than the screen and produced a horizontal scrollbar on every page.
    // They're blurred decoration, so clipping them costs nothing visually.
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width:  orb.size,
            height: orb.size,
            background: `radial-gradient(circle at 40% 40%, ${orb.color}, transparent 70%)`,
            top:  orb.top,
            left: orb.left,
            filter: 'blur(60px)',
            willChange: 'transform',
          }}
          animate={{
            x: [0, orb.xRange, 0, -orb.xRange / 2, 0],
            y: [0, orb.yRange, orb.yRange / 2, 0, 0],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default AmbientOrbs;
