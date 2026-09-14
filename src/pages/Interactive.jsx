import { motion } from 'framer-motion';
import { useRef } from 'react';
import CodePlayground from '../Components/CodePlayground';
import ConvergenceProof from '../Components/ConvergenceProof';

/*
 * A section of the one page now, not a route of its own.
 *
 * It used to mount its own AnimatedBackground, and so did About, Projects and
 * Contact — five independent skies, each running the whole night from dusk to
 * sunrise across its own scroll height. The background is built on the idea
 * that the page is one night ending in one sunrise, and five copies of it made
 * that false five times over: this page alone got a complete dusk-to-dawn
 * inside four and a half thousand pixels.
 *
 * So the sky belongs to the page and the page is one. This keeps its own
 * anchor id, because the palette and the nav still aim at it — they just scroll
 * now instead of navigating.
 */
const Interactive = () => {
  const containerRef = useRef(null);


  // The ids are anchors. The command palette links straight at them — picking
  // a playground example from ⌘K should land on the editor, not at the top of
  // a page the editor happens to be near the bottom of.
  const features = [
    {
      // First, because it is the only thing on this site a reader can check
      // rather than take on trust — and the hardest thing here to have built.
      id: "convergence-proof",
      title: "Convergence, in your browser",
      description: "ot-core is my operational transformation library. Here is its correctness proof, running on your machine against a seed you choose.",
      component: <ConvergenceProof />,
    },
    // The terminal that sat between these two is gone. It answered questions
    // about the background the About section already answers in prose, with
    // a "type help" prompt as the price of admission — a novelty shell is the
    // second most common portfolio gimmick after the skills wall, and here it
    // was the one card that demonstrated nothing the rest of the page had not
    // already shown. Two things that each prove something beat three where
    // one is decoration.
    {
      id: "code-playground",
      title: "Code Playground",
      description: "Three problems from the work, built live: two people typing in the same line, a rupee input that groups in lakhs and crores, and a payment's lifecycle with every way it goes wrong. Edit anything; it re-runs as you type.",
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
    <div className="bg-transparent text-white" ref={containerRef}>
      {/* min-h-screen and the navbar clearance both went with the route. A
          section in the middle of a page does not need to fill a screen on its
          own, and nothing above it is a fixed bar to duck under. */}
      <div>
        <section className="relative pt-12 md:pt-20 pb-20 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* h2, not h1. Each of these was the title of its own route, and one h1
                    per document is the whole point of h1 — five of them on one page
                    leaves a screen reader's heading list with five competing titles
                    and no outline. The hero keeps the only h1 on the page. */}
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Developer Playground
              </h2>
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Check my hardest claim against your own machine, or edit the code and watch it run.
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
                  key={feature.id}
                  id={feature.id}
                  variants={itemVariants}
                  className="scroll-mt-24 md:scroll-mt-28 bg-white/[0.04] rounded-xl p-6 md:p-8 border border-white/10 relative overflow-hidden max-w-5xl mx-auto"
                >
                  <div className="text-center mb-8 relative z-10">
                    {/* The heading used to open with a wobbling emoji. Emoji as
                        an icon system is the fastest way to make engineering
                        work read as a hobby project, and it was inside the h2,
                        so screen readers announced it as part of the heading. */}
                    {/* h3, under the section's h2 — and the size that goes with
                        it. These were h2 at 36px, the same level and larger
                        than the heading of the section they sit inside. */}
                    <h3 className="text-xl md:text-2xl font-bold mb-4">
                      <span className="text-white">
                        {feature.title}
                      </span>
                    </h3>
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
      </div>
    </div>
  );
};

export default Interactive; 