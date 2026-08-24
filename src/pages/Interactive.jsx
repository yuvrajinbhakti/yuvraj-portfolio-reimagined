import { motion } from 'framer-motion';
import { useRef } from 'react';
import InteractiveTerminal from '../Components/InteractiveTerminal';
import CodePlayground from '../Components/CodePlayground';
import AnimatedBackground from '../Components/AnimatedBackground';
import useDocumentMeta from '../hooks/useDocumentMeta';

const Interactive = () => {
  useDocumentMeta({ path: '/playground' });

  const containerRef = useRef(null);


  const features = [
    {
      title: "Interactive Terminal",
      description: "A shell that answers questions about my background. Type help to see what it knows.",
      component: <InteractiveTerminal />,
    },
    {
      title: "Code Playground",
      description: "A live HTML, CSS and JavaScript editor with an instant preview. Edit anything; it re-runs as you type.",
      component: <CodePlayground />,
    }
  ];

  // The same entrance language as the rest of the site. This page was the odd
  // one out: cards arrived from 100px away with a -15deg rotateX, a scale-up
  // and a spring, staggered 0.3s apart, while Contact and Home fade 20-24px on
  // a fixed easing curve 0.12s apart. Different distance, different curve,
  // different physics — which is why the page felt out of step with itself and
  // with everything before it.
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white" ref={containerRef}>
      <AnimatedBackground>
        {/* Hero Section with Enhanced Animations */}
        <section className="relative pt-24 md:pt-32 pb-20 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                Developer Playground
              </h1>
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
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
                  className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10 relative overflow-hidden max-w-5xl mx-auto"
                >
                  <div className="text-center mb-8 relative z-10">
                    {/* The heading used to open with a wobbling emoji. Emoji as
                        an icon system is the fastest way to make engineering
                        work read as a hobby project, and it was inside the h2,
                        so screen readers announced it as part of the heading. */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      <span className="text-white">
                        {feature.title}
                      </span>
                    </h2>
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
                    transition={{ delay: 0.25, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
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