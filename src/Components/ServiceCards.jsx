import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import GlassCard from './GlassCard';
import ServiceIcon from './ServiceIcon';

/*
 * The three cards that used to be a section of their own, titled "What I Do",
 * sitting between the hero and the project stack — and then, one screen later,
 * a second section titled "Hello, I'm Yuvraj" that said the same three things
 * again in prose, with the same numbers. Two introductions in a row is one
 * more than a page needs. These are the About now: the prose above them says
 * who, and the cards say what, with a number each, once.
 *
 * Each card carries a concrete proof point rather than a capability claim.
 * "Creating responsive, performant user interfaces" is something anyone can
 * write; "95 days → 5 years of history" is not.
 *
 * Every number traces to a Measured row of the Impact Inventory (Sep 2026);
 * the row id is beside it. The cards used to say "+25% platform adoption" and
 * "2 weeks → 24 hours" — the first appears nowhere in the inventory, and the
 * second is recorded there as "weeks", not two.
 */
const SERVICES = [
  {
    type: 'frontend',
    title: 'Frontend Engineering',
    description:
      'React and TypeScript in production at Razorpay — an embedded-analytics product, the reporting UI across two dashboards, and the end-to-end suite that gates their deploys.',
    // B8 — report exports extended from 95 days to five years.
    proof: 'Exports: 95 days → 5 years of history',
    // The role in full is the experience tab directly below these cards.
    to: '/#experience',
    linkLabel: 'The role, in full',
  },
  {
    type: 'backend',
    title: 'Backend & Infrastructure',
    description:
      'Airflow, Spark and EMR alongside the UI — a warehouse migration with zero data gaps, and the root cause of cluster failures the team had written off as flakiness.',
    // D2 — self-serve onboarding, turnaround weeks → 24 hours.
    proof: 'Onboarding: weeks → 24 hours',
    // The deepest backend build on this site that can actually be read: Node,
    // Redis, Docker, and the reasoning behind each.
    to: '/work/secure-file-sharing',
    linkLabel: 'Read a backend build',
  },
  {
    type: 'ml',
    title: 'Machine Learning',
    description:
      'Amazon ML Summer School alumnus. Built an ML-powered fraud detection system for real-time transaction monitoring.',
    proof: 'Top 0.2% of 91,000 applicants',
    to: '/#experience',
    linkLabel: 'Background and coursework',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const ServiceCard = ({ service }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    // A link, not a div. Each of these cards makes a specific claim — five
    // years of export history, weeks down to twenty-four hours, top 0.2% of
    // 91,000 — and a number with no route to its evidence is just an assertion.
    //
    // aria-label rather than letting the accessible name fall out of the
    // contents: unlabelled, a screen reader announces the heading, the whole
    // description and the statistic as one link name.
    <Link
      to={service.to}
      aria-label={`${service.title} — ${service.linkLabel}`}
      className="h-full block rounded-2xl focus-visible:outline-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <GlassCard className="h-full p-6 md:p-8 flex flex-col group">
        <div className="mb-3 relative z-0">
          <ServiceIcon type={service.type} isHovered={isHovered} />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300 relative z-10">
          {service.title}
        </h3>
        <p className="text-white/70 text-sm md:text-base leading-relaxed relative z-10 flex-1">
          {service.description}
        </p>
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10">
          <span className="block text-sm font-semibold text-blue-300">{service.proof}</span>
          <span
            aria-hidden="true"
            className="mt-2 text-xs text-white/40 group-hover:text-blue-300 transition-colors inline-flex items-center gap-1"
          >
            {service.linkLabel}
            <svg
              className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </GlassCard>
    </Link>
  );
};

ServiceCard.propTypes = {
  service: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    proof: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    linkLabel: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['frontend', 'backend', 'ml']).isRequired,
  }).isRequired,
};

const ServiceCards = () => (
  // One direction, staggered. MotionConfig drops the y-offset under reduced
  // motion.
  <motion.div
    className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-80px' }}
    variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
  >
    {SERVICES.map((service) => (
      <motion.div key={service.type} variants={cardVariants}>
        <ServiceCard service={service} />
      </motion.div>
    ))}
  </motion.div>
);

export default ServiceCards;
