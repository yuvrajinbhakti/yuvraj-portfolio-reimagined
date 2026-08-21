import { Link, useParams, Navigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';
import AnimatedBackground from '../Components/AnimatedBackground';
import GlassCard from '../Components/GlassCard';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { getCaseStudy, caseStudies } from '../constants/caseStudies';

const Metric = ({ value, label }) => (
  <div className="text-center px-4 py-5 rounded-xl bg-white/5 border border-white/10">
    <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">{value}</div>
    <div className="text-sm text-white/60 leading-snug">{label}</div>
  </div>
);

Metric.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

const CaseStudy = () => {
  const { slug } = useParams();
  const study = getCaseStudy(slug);
  const reduce = useReducedMotion();

  // Hooks must run unconditionally, so the redirect happens after this call.
  useDocumentMeta({
    title: study ? `${study.title} | Yuvraj Singh Nain` : 'Case study | Yuvraj Singh Nain',
    description: study ? study.tagline : 'Project case study.',
    path: study ? `/work/${study.slug}` : '/work',
  });

  if (!study) return <Navigate to="/projects" replace />;

  const fade = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
        };

  const others = caseStudies.filter((c) => c.slug !== study.slug);

  return (
    <div className="w-full">
      <AnimatedBackground>
        <article className="w-full pt-28 md:pt-36 pb-16 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Back */}
            <motion.div {...fade()}>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-blue-400 transition-colors mb-8"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                All projects
              </Link>
            </motion.div>

            {/* Header */}
            <motion.header {...fade(0.05)} className="mb-10">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {study.title}
              </h1>
              <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-6">
                {study.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/50 mb-6">
                <span>{study.role}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {study.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-full border border-white/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {study.links.demo && (
                  <a
                    href={study.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    View live demo
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                {study.links.code && (
                  <a
                    href={study.links.code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/25 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Source code
                  </a>
                )}
              </div>
            </motion.header>

            {/* Metrics */}
            <motion.div {...fade(0.1)} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
              {study.metrics.map((m) => (
                <Metric key={m.label} value={m.value} label={m.label} />
              ))}
            </motion.div>

            {/* Body */}
            <div className="space-y-10">
              {study.sections.map((section, i) => (
                <motion.section key={section.heading} {...fade(0.15 + i * 0.05)}>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {section.heading}
                  </h2>
                  <p className="text-white/70 leading-relaxed text-base md:text-lg">
                    {section.body}
                  </p>
                </motion.section>
              ))}
            </div>

            {/* Takeaway */}
            <motion.div {...fade(0.4)} className="mt-12">
              <GlassCard className="p-6 md:p-8 border-l-2 border-l-blue-500">
                <h2 className="text-sm uppercase tracking-[0.15em] text-blue-400 font-semibold mb-3">
                  What I took from it
                </h2>
                <p className="text-white/80 leading-relaxed text-base md:text-lg">
                  {study.takeaway}
                </p>
              </GlassCard>
            </motion.div>

            {/* Next case study */}
            {others.length > 0 && (
              <motion.nav {...fade(0.45)} className="mt-14 pt-8 border-t border-white/10">
                <h2 className="text-sm uppercase tracking-[0.15em] text-white/50 font-semibold mb-4">
                  Read next
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {others.map((o) => (
                    <Link
                      key={o.slug}
                      to={`/work/${o.slug}`}
                      className="group block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-400/40 hover:bg-white/10 transition-all"
                    >
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                        {o.title}
                      </div>
                      <div className="text-sm text-white/60 leading-snug">{o.tagline}</div>
                    </Link>
                  ))}
                </div>
              </motion.nav>
            )}
          </div>
        </article>
      </AnimatedBackground>
    </div>
  );
};

export default CaseStudy;
