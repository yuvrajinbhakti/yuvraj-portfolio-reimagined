import { motion } from 'framer-motion';
import { useRef } from 'react';
import InteractiveTerminal from '../Components/InteractiveTerminal';
import CodePlayground from '../Components/CodePlayground';
import AnimatedBackground from '../Components/AnimatedBackground';
import useDocumentMeta from '../hooks/useDocumentMeta';

const Interactive = () => {
  useDocumentMeta({
    title: 'Playground | Yuvraj Singh Nain',
    description: 'An interactive terminal and live code playground — explore my background through commands, or run code directly in the browser.',
    path: '/playground',
  });

  const containerRef = useRef(null);


  const features = [
    {
      title: "Interactive Terminal",
      description: "A shell that answers questions about my background. Type help to see what it knows.",
      component: <InteractiveTerminal />,
      gradient: "from-blue-600/20 to-blue-600/20",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Code Playground",
      description: "A live HTML, CSS and JavaScript editor with an instant preview. Edit anything; it re-runs as you type.",
      component: <CodePlayground />,
      gradient: "from-blue-600/20 to-blue-600/20",
      borderColor: "border-blue-500/20"
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

  return (
    <div className="min-h-screen bg-transparent text-white" ref={containerRef}>
      <AnimatedBackground>
        {/* Hero Section with Enhanced Animations */}
        <section className="relative pt-24 md:pt-32 pb-20 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 text-white"
              >
                Developer Playground
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Two things I built to answer questions about myself. Ask the terminal, or edit the code and watch it run.
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
              {features.map((feature) => (
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
                  
                  <div className="text-center mb-8 relative z-10">
                    {/* The heading used to open with a wobbling emoji. Emoji as
                        an icon system is the fastest way to make engineering
                        work read as a hobby project, and it was inside the h2,
                        so screen readers announced it as part of the heading. */}
                    <motion.h2
                      className="text-3xl md:text-4xl font-bold mb-4"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-white">
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

          </div>
        </section>
      </AnimatedBackground>
    </div>
  );
};

export default Interactive; 