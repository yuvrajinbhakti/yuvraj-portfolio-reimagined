import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const NotFound = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState([]);
  const [countdown, setCountdown] = useState(30);
  const [showPortal, setShowPortal] = useState(false);
  const [ripples, setRipples] = useState([]);
  const navigate = useNavigate();

  // Generate dynamic floating particles with enhanced physics
  useEffect(() => {
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 6 + 2,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 3 + 1,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      color: ['#3b82f6', '#8b5cf6', '#06d6a0', '#f72585', '#4cc9f0'][Math.floor(Math.random() * 5)],
    }));
    setParticles(newParticles);
  }, []);

  // Advanced particle animation with collision detection
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x + Math.cos(particle.angle) * particle.speed;
        let newY = particle.y + Math.sin(particle.angle) * particle.speed;
        let newAngle = particle.angle + particle.rotationSpeed;

        // Bounce off walls
        if (newX <= 0 || newX >= window.innerWidth) {
          newAngle = Math.PI - newAngle;
          newX = Math.max(0, Math.min(window.innerWidth, newX));
        }
        if (newY <= 0 || newY >= window.innerHeight) {
          newAngle = -newAngle;
          newY = Math.max(0, Math.min(window.innerHeight, newY));
        }

        return {
          ...particle,
          x: newX,
          y: newY,
          angle: newAngle,
        };
      }));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Enhanced mouse tracking with ripple effects
  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    // Create ripple effect on mouse move
    if (Math.random() < 0.1) {
      setRipples(prev => [...prev, {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        scale: 0,
      }]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Auto redirect with portal effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setShowPortal(true);
          setTimeout(() => navigate('/'), 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  // Clean up ripples
  useEffect(() => {
    const cleanup = setInterval(() => {
      setRipples(prev => prev.filter(ripple => Date.now() - ripple.id < 2000));
    }, 500);
    return () => clearInterval(cleanup);
  }, []);

  // Advanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const glitchVariants = {
    normal: { 
      x: 0, 
      textShadow: "0 0 0 transparent" 
    },
    glitch: {
      x: [-2, 2, -1, 1, 0],
      textShadow: [
        "2px 0 #ff0000, -2px 0 #00ff00",
        "-2px 0 #ff0000, 2px 0 #00ff00",
        "1px 0 #ff0000, -1px 0 #00ff00",
        "0 0 0 transparent"
      ],
      transition: { 
        duration: 0.2, 
        repeat: Infinity, 
        repeatType: "reverse",
        repeatDelay: Math.random() * 2 + 1
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background with Multiple Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f0f23] to-[#1a0033] -z-10" />
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20 -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              filter: 'blur(0.5px)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [particle.opacity, particle.opacity * 0.3, particle.opacity],
              rotate: [0, 360],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Interactive Cursor Effects */}
      <motion.div
        className="fixed pointer-events-none -z-10"
        style={{
          left: mousePosition.x - 100,
          top: mousePosition.y - 100,
          width: 200,
          height: 200,
        }}
        animate={{
          background: [
            `radial-gradient(circle, rgba(59, 130, 246, ${isHovering ? 0.3 : 0.1}) 0%, transparent 70%)`,
            `radial-gradient(circle, rgba(139, 92, 246, ${isHovering ? 0.3 : 0.1}) 0%, transparent 70%)`,
            `radial-gradient(circle, rgba(6, 214, 160, ${isHovering ? 0.3 : 0.1}) 0%, transparent 70%)`,
          ],
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Mouse Ripples */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="fixed pointer-events-none border border-blue-400/30 rounded-full"
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
              width: 50,
              height: 50,
              zIndex: -1,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 pt-24 md:pt-32" style={{ zIndex: 1 }}>
        <motion.div 
          className="text-center max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Glitch 404 Text with 3D Effect */}
          <motion.div
            className="mb-16 relative perspective-1000"
            variants={itemVariants}
          >
            <motion.h1 
              className="text-[8rem] sm:text-[12rem] lg:text-[16rem] font-black relative transform-gpu"
              variants={glitchVariants}
              animate="glitch"
              style={{
                fontFamily: 'Impact, Arial Black, sans-serif',
                transform: 'rotateX(15deg) rotateY(-5deg)',
                transformStyle: 'preserve-3d',
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <span className="inline-block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                4
              </span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  0
                </span>
                {/* Multiple Rotating Rings */}
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className={`absolute inset-${i * 2} border-${4 - i} border-blue-500/${30 + i * 10} rounded-full`}
                    animate={{ rotate: 360 * (i % 2 === 0 ? 1 : -1) }}
                    transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
                  />
                ))}
              </span>
              <span className="inline-block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                4
              </span>
            </motion.h1>
            
            {/* Enhanced Glitch Overlays */}
            <div className="absolute inset-0 mix-blend-screen opacity-0 animate-glitch-red pointer-events-none" />
            <div className="absolute inset-0 mix-blend-screen opacity-0 animate-glitch-blue pointer-events-none" />
            <div className="absolute inset-0 mix-blend-screen opacity-0 animate-glitch-green pointer-events-none" />
          </motion.div>

          {/* Enhanced Error Message with Hologram Effect */}
          <motion.div
            variants={itemVariants}
            className="mb-12 relative"
          >
            <motion.div
              className="relative p-8 rounded-3xl backdrop-blur-md bg-gradient-to-r from-white/5 to-white/10 border border-white/20 shadow-2xl"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 40px rgba(139, 92, 246, 0.3)",
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Holographic Border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 p-[2px] -z-10">
                <div className="w-full h-full bg-[#020617] rounded-3xl" />
              </div>
              
              <motion.h2 
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🚀 Lost in the Digital Cosmos
              </motion.h2>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                This page has been consumed by a black hole in cyberspace!
              </motion.p>
              
              <motion.p 
                className="text-lg text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                But don&apos;t worry, our quantum navigation system will guide you home.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Enhanced Interactive Buttons with 3D Effects */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotateY: 10 }} 
              whileTap={{ scale: 0.95 }}
              className="group perspective-1000"
            >
              <Link
                to="/"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform-gpu block"
                style={{ transformStyle: 'preserve-3d' }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  🏠 Return to Reality
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              </Link>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, rotateY: -10 }} 
              whileTap={{ scale: 0.95 }}
              className="group perspective-1000"
            >
              <button
                onClick={() => window.history.back()}
                className="group relative px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-gray-500/50 transform-gpu"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  ⬅️ Quantum Jump Back
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </motion.div>
          </motion.div>

          {/* Enhanced Quick Navigation with Glass Morphism */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
          >
            {[
              { name: 'About', path: '/about', icon: '👨‍🚀', color: 'from-blue-500 to-cyan-500', description: 'Discover my journey' },
              { name: 'Projects', path: '/projects', icon: '🚀', color: 'from-purple-500 to-pink-500', description: 'Explore my creations' },
              { name: 'Contact', path: '/contact', icon: '📡', color: 'from-green-500 to-blue-500', description: 'Send a transmission' },
            ].map((item, index) => (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.05, rotateY: 15, z: 50 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 + index * 0.1, type: "spring" }}
                className="perspective-1000"
              >
                <Link
                  to={item.path}
                  className={`block p-6 rounded-2xl bg-gradient-to-br ${item.color} bg-opacity-10 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all duration-300 group transform-gpu h-full`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 transform-gpu">
                    {item.icon}
                  </div>
                  <div className="text-white font-bold text-xl mb-2">{item.name}</div>
                  <div className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.description}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Countdown Timer with Portal Effect */}
          <motion.div
            variants={itemVariants}
            className="text-center relative"
          >
            <AnimatePresence>
              {!showPortal ? (
                <motion.div
                  exit={{ scale: 0, opacity: 0 }}
                  className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-black/40 backdrop-blur-lg border border-white/20"
                >
                  <motion.div 
                    className="w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-gray-300 text-lg">
                    Quantum portal opens in{' '}
                    <motion.span 
                      className="font-bold text-blue-400 text-xl"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {countdown}s
                    </motion.span>
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  className="text-6xl"
                >
                  🌀 Portal Opening...
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 right-10 text-6xl pointer-events-none"
            animate={{
              y: [-20, 20, -20],
              rotate: [-10, 10, -10],
              x: [-5, 5, -5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🧑‍🚀
          </motion.div>

          <motion.div
            className="absolute bottom-32 left-10 text-5xl pointer-events-none"
            animate={{
              y: [-15, 15, -15],
              x: [-10, 10, -10],
              rotate: [0, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🛸
          </motion.div>
        </motion.div>
      </div>

      {/* CSS Styles for Advanced Animations */}
      <style>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes glitch-red {
          0%, 100% { 
            opacity: 0; 
            transform: translateX(0) scaleX(1); 
            background: linear-gradient(90deg, #ff0000 0%, transparent 100%);
          }
          20% { 
            opacity: 0.8; 
            transform: translateX(-2px) scaleX(0.98); 
          }
          40% { 
            opacity: 0; 
            transform: translateX(2px) scaleX(1.02); 
          }
        }
        
        @keyframes glitch-blue {
          0%, 100% { 
            opacity: 0; 
            transform: translateX(0) scaleY(1); 
            background: linear-gradient(90deg, #0000ff 0%, transparent 100%);
          }
          30% { 
            opacity: 0.6; 
            transform: translateX(2px) scaleY(0.98); 
          }
          60% { 
            opacity: 0; 
            transform: translateX(-1px) scaleY(1.02); 
          }
        }
        
        @keyframes glitch-green {
          0%, 100% { 
            opacity: 0; 
            transform: translateY(0) scaleX(1); 
            background: linear-gradient(90deg, #00ff00 0%, transparent 100%);
          }
          10% { 
            opacity: 0.4; 
            transform: translateY(1px) scaleX(0.99); 
          }
          50% { 
            opacity: 0; 
            transform: translateY(-2px) scaleX(1.01); 
          }
        }
        
        .animate-glitch-red { animation: glitch-red 0.3s infinite; }
        .animate-glitch-blue { animation: glitch-blue 0.4s infinite; }
        .animate-glitch-green { animation: glitch-green 0.5s infinite; }
        
        .perspective-1000 { perspective: 1000px; }
        .transform-gpu { transform: translateZ(0); }
      `}</style>
    </div>
  );
};

export default NotFound; 