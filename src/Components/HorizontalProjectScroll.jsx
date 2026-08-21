import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';
import { projects } from '../constants';
import { caseStudyForProject } from '../constants/caseStudies';
import GlassCard from './GlassCard';

gsap.registerPlugin(ScrollTrigger);

const HorizontalProjectScroll = () => {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);
  const reduce = useReducedMotion();
  // Drives the overflow mode. Until the pin is confirmed active the strip stays
  // natively scrollable, so the cards can never end up unreachable if GSAP
  // fails to initialise for any reason.
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    // Re-evaluated on breakpoint change rather than once on mount. The previous
    // version read innerWidth a single time and bailed out on mobile with an
    // empty dep array, so loading narrow and then widening (resize, rotate,
    // maximise) left the desktop strip rendered by CSS but never animated —
    // stranding most of the cards outside an overflow-hidden container with no
    // way to scroll to them.
    // gsap.matchMedia() is built for exactly this: it creates the animation
    // when the query matches, reverts it when it stops matching, and re-runs on
    // resize. `prefers-reduced-motion: no-preference` in the query means the
    // pinned scroll never even gets built for someone who asked for less motion.
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const section = sectionRef.current;
      if (!section) return;

      // Measured lazily. When the query flips on resize the strip is still
      // display:none from the mobile breakpoint, so measuring here would read
      // scrollWidth 0 — the reason an eager guard bailed out permanently.
      const distance = () => Math.max(0, section.scrollWidth - window.innerWidth);

      gsap.to(section, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: triggerRef.current,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
          onRefresh: (self) => setPinned(self.end > self.start),
        },
      });

      // The strip has just been un-hidden by the breakpoint change, so let
      // layout settle before ScrollTrigger takes its measurements.
      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => setPinned(false);
    });

    return () => mm.revert();
  }, [reduce]);

  // Grid fallback: mobile always, and every width under reduced motion.
  const gridContent = (
    <section className={`py-12 px-4 ${reduce ? '' : 'md:hidden'}`}>
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-8">
          Featured <span className="text-blue-400">Work</span>
        </h2>
        {/* All projects, not the first four — the horizontal strip showed six
            while this showed four, so mobile visitors silently lost two. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectScrollCard key={project.id} project={project} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium"
          >
            View All Projects
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );

  // Desktop: pinned horizontal scroll
  const desktopContent = (
    <section
      ref={triggerRef}
      className={`hidden md:block ${pinned ? 'overflow-hidden' : 'overflow-x-auto'}`}
      aria-hidden={reduce}
    >
      <div
        ref={sectionRef}
        className="flex items-center gap-8 px-8 py-20 w-max min-h-screen"
      >
        {/* Intro card */}
        <div className="flex-shrink-0 w-[35vw] flex items-center pl-8">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Featured <span className="text-blue-400">Work</span>
            </h2>
            <p className="text-white/60 text-lg mb-6 max-w-md">
              Scroll to explore my projects — each one built with care, from concept to deployment.
            </p>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span>Keep scrolling</span>
            </div>
          </div>
        </div>

        {/* Project cards */}
        {projects.map((project) => (
          <div key={project.id} className="flex-shrink-0 w-[380px]">
            <ProjectScrollCard project={project} />
          </div>
        ))}

        {/* CTA card */}
        <div className="flex-shrink-0 w-[300px] flex items-center">
          <div className="text-center">
            <p className="text-white/60 mb-4">Want to see more?</p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
            >
              All Projects
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  // Scroll-jacking hijacks the reader's scroll to move content sideways, which
  // is precisely what SC 2.3.3 is about. Under reduced motion the strip is not
  // rendered at all and the grid covers every width.
  return (
    <>
      {gridContent}
      {!reduce && desktopContent}
    </>
  );
};

const ProjectScrollCard = ({ project }) => {
  const study = caseStudyForProject(project.id);

  return (
    <GlassCard className="h-full overflow-hidden hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-300">
      {/* Image / Gradient header */}
      <div className={`relative h-48 bg-gradient-to-br ${project.gradient} flex items-center justify-center overflow-hidden`}>
        {project.image ? (
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-contain p-6 bg-gradient-to-br from-gray-900/40 to-gray-800/40"
          />
        ) : (
          <span className="text-4xl">💻</span>
        )}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
            {project.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
        <p className="text-gray-300 text-sm line-clamp-2 mb-3 leading-relaxed">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-sm text-white/50">+{project.tags.length - 3}</span>
          )}
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/10">
          {study && (
            <Link
              to={`/work/${study.slug}`}
              className="flex items-center gap-1.5 text-white hover:text-blue-300 transition-colors text-sm font-semibold"
            >
              Read case study
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}
          {project.source_code_link && (
            <a
              href={project.source_code_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Code
            </a>
          )}
          {project.demo_link && (
            <a
              href={project.demo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Demo
            </a>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

ProjectScrollCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
    gradient: PropTypes.string,
    status: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    source_code_link: PropTypes.string,
    demo_link: PropTypes.string,
  }).isRequired,
};

export default HorizontalProjectScroll;
