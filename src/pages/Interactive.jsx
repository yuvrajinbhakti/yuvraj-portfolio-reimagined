import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import InteractiveTerminal from '../Components/InteractiveTerminal';
import CodePlayground from '../Components/CodePlayground';
// import VoiceNavigation from '../Components/VoiceNavigation';
// import ARBusinessCard from '../Components/ARBusinessCard';
import AnimatedBackground from '../Components/AnimatedBackground';

const Interactive = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax transforms for different elements
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.9]);

  const features = [
    {
      title: "Interactive Terminal",
      description: "Explore my background, skills, and experience through terminal commands. Type 'help' to get started!",
      icon: "💻",
      component: <InteractiveTerminal />,
      gradient: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Code Playground",
      description: "Experiment with live code examples and see real-time results. Try the interactive games and animations!",
      icon: "⚡",
      component: <CodePlayground />,
      gradient: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/20"
    }
  ];

  // Animation variants for scroll-triggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 100,
      rotateX: -15,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white" ref={containerRef}>
      <AnimatedBackground>
        {/* Commented out components */}
        {/* <VoiceNavigation /> */}
        {/* <ARBusinessCard /> */}

        {/* Hero Section with Enhanced Animations */}
        <section className="relative pt-24 md:pt-32 pb-20 px-4 overflow-hidden">
          {/* Floating Background Elements */}
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
            style={{ y: y1, rotate }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 rounded-full blur-xl"
            style={{ y: y2, scale }}
          />

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                variants={floatingVariants}
                animate="animate"
              >
                Developer Playground
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Experiment with cutting-edge web technologies and explore innovative development tools
              </motion.p>
            </motion.div>

            {/* Enhanced Feature Grid - Each in separate row */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="mt-16 space-y-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: 2,
                    transition: { duration: 0.3 }
                  }}
                  className={`bg-gradient-to-br ${feature.gradient} backdrop-blur-sm rounded-3xl p-8 ${feature.borderColor} border-2 shadow-2xl relative overflow-hidden group max-w-5xl mx-auto`}
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: "1000px"
                  }}
                >
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse" />
                  
                  {/* Floating Particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${10 + (i % 3) * 30}%`,
                        }}
                        animate={{
                          y: [-10, 10, -10],
                          opacity: [0.2, 0.8, 0.2],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>

                  <div className="text-center mb-8 relative z-10">
                    <motion.h2 
                      className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.span 
                        className="text-4xl md:text-5xl"
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.5
                        }}
                      >
                        {feature.icon}
                      </motion.span>
                      <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {feature.title}
                      </span>
                    </motion.h2>
                    <motion.p 
                      className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="relative z-10"
                  >
                    {feature.component}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Instructions with Scroll Animation */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-20 bg-black/30 backdrop-blur-sm rounded-3xl p-8 border border-white/10 relative overflow-hidden group"
            >
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-full bg-black/30 backdrop-blur-sm rounded-3xl" />
              </div>
              
              <div className="relative z-10">
                <motion.h3 
                  className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  How to Use These Tools
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <motion.div
                    whileHover={{ scale: 1.05, x: 10 }}
                    className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 p-6 rounded-xl border border-blue-500/20"
                  >
                    <h4 className="font-semibold text-blue-400 mb-3 text-lg flex items-center gap-2">
                      <span>💻</span> Terminal
                    </h4>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Type commands to explore my background</li>
                      <li>• Use arrow keys for command history</li>
                      <li>• Try &lsquo;help&rsquo; to see all available commands</li>
                      <li>• Discover hidden easter eggs!</li>
                    </ul>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, x: 10 }}
                    className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 p-6 rounded-xl border border-purple-500/20"
                  >
                    <h4 className="font-semibold text-purple-400 mb-3 text-lg flex items-center gap-2">
                      <span>⚡</span> Code Playground
                    </h4>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Edit HTML, CSS, JavaScript in real-time</li>
                      <li>• See live results instantly</li>
                      <li>• Try the interactive example projects</li>
                      <li>• Experiment with animations and games</li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </AnimatedBackground>
    </div>
  );
};

export default Interactive; 