import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../constants';
import GlassCard from './GlassCard';

gsap.registerPlugin(ScrollTrigger);

const HorizontalProjectScroll = () => {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);
  const isMobile = useRef(false);

  useEffect(() => {
    isMobile.current = window.innerWidth < 768;
    if (isMobile.current) return;

    const section = sectionRef.current;
    const scrollWidth = section.scrollWidth;
    const viewportWidth = window.innerWidth;

    const tween = gsap.to(section, {
      x: -(scrollWidth - viewportWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: triggerRef.current,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${scrollWidth - viewportWidth}`,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars?.trigger === triggerRef.current) t.kill();
      });
    };
  }, []);

  // Mobile: vertical grid fallback
  const mobileContent = (
    <section className="py-12 px-4 md:hidden">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Featured <span className="text-blue-400">Work</span>
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {projects.slice(0, 4).map((project) => (
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

  // Desktop: horizontal scroll
  const desktopContent = (
    <section ref={triggerRef} className="overflow-hidden hidden md:block">
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
            <div className="flex items-center gap-2 text-white/40 text-sm">
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

  return (
    <>
      {mobileContent}
      {desktopContent}
    </>
  );
};

const ProjectScrollCard = ({ project }) => {
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
            <span className="text-xs text-white/40">+{project.tags.length - 3}</span>
          )}
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/10">
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

export default HorizontalProjectScroll;
