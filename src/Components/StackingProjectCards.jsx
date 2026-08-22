import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';
import { projects } from '../constants';
import { caseStudyForProject } from '../constants/caseStudies';
import GlassCard from './GlassCard';

/**
 * Featured work as a sticky card stack.
 *
 * Replaces the pinned horizontal scroll. That version hijacked vertical scroll
 * to move content sideways, needed GSAP to do it, and could strand cards
 * off-screen when the viewport changed. This is CSS: each card sticks, and a
 * scroll-driven animation scales it down as the next one arrives over the top.
 *
 * Three tiers, degrading safely:
 *   1. animation-timeline supported  -> cards stick AND scale away
 *   2. sticky only (older browsers)  -> cards still stack, just no scale
 *   3. reduced motion / small screen -> plain grid, nothing sticks
 *
 * The scale animation runs on `transform`, so it stays on the compositor
 * thread and doesn't cause layout during scroll.
 */

const ProjectCard = ({ project }) => {
  const study = caseStudyForProject(project.id);

  // No h-full on the card. It is sized by min-height now, and a percentage
  // height does not resolve against that — worse, specifying any height at all
  // opts the element out of flex stretch, so the glass surface sat 45px short
  // of the card it was meant to fill. Leaving it auto lets stretch do the work.
  return (
    <GlassCard className="overflow-hidden">
      <div className="grid md:grid-cols-2 h-full">
        {/* Visual */}
        <div
          className="relative min-h-[200px] md:min-h-0 overflow-hidden"
        >
          {project.image ? (
            /* Absolutely positioned so the cover fills the column without
               contributing to layout height. Left in flow with h-full against
               a now auto-height card, it fell back to its intrinsic aspect
               ratio and drove the card ~180px taller than its copy needed.

               object-cover, so the cover's gradient runs to the panel edges
               and the feather gradients below can blend it into the copy. The
               mark is sized down in scripts/make-covers.py instead of being
               padded here: object-contain leaves the cover's own background
               visible as a hard-edged square sitting on the card, which reads
               as an image pasted on rather than part of the surface. */
            <img
              src={project.image}
              alt={project.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl">💻</span>
          )}
          {/* Feathers the cover into the text panel so the two halves read as
              one surface rather than an image pasted next to a card. */}
          <div
            className="absolute inset-0 pointer-events-none hidden md:block
                       bg-gradient-to-r from-transparent via-transparent to-[#0b1020]/85"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 pointer-events-none md:hidden
                       bg-gradient-to-b from-transparent via-transparent to-[#0b1020]/85"
            aria-hidden="true"
          />
          <span className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
            {project.status}
          </span>
        </div>

        {/* Copy */}
        <div className="p-5 md:p-7 flex flex-col justify-center">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{project.name}</h3>
          {/* Three lines, not four. The card is a teaser for the case study —
              the fourth line was buying almost no information and costing a
              row of card height on every card in the stack. */}
          <p className="text-white/70 text-sm md:text-base leading-relaxed mb-4 line-clamp-3">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/10">
            {study && (
              <Link
                to={`/work/${study.slug}`}
                className="inline-flex items-center gap-1.5 text-white hover:text-blue-300 transition-colors text-sm font-semibold"
              >
                Read case study
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            )}
            {project.source_code_link && (
              <a
                href={project.source_code_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
              >
                Code
              </a>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
    gradient: PropTypes.string,
    status: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    source_code_link: PropTypes.string,
  }).isRequired,
};

const SectionHeading = () => (
  <div className="text-center mb-10 md:mb-14">
    <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">
      Featured <span className="text-blue-400">Work</span>
    </h2>
    <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto">
      A few things I&apos;ve built, from concept through to deployment.
    </p>
  </div>
);

const ViewAll = () => (
  <div className="text-center mt-10">
    <Link
      to="/projects"
      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      View all projects
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </Link>
  </div>
);

// Four is enough to establish range without turning the landing page into a
// tunnel; the rest live on /projects. The first four include both projects
// that have a full case study.
const FEATURED_COUNT = 4;

const StackingProjectCards = () => {
  const reduce = useReducedMotion();
  const featured = projects.slice(0, FEATURED_COUNT);

  const grid = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {featured.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );

  // Reduced motion: nothing sticks, nothing scales — just read the list.
  if (reduce) {
    return (
      <section className="section-seam py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <SectionHeading />
          {grid}
          <ViewAll />
        </div>
      </section>
    );
  }

  return (
    <section className="section-seam py-16 px-4 md:px-8">
      <div className="container mx-auto max-w-5xl">
        <SectionHeading />

        {/* Small screens get the grid: a six-card stack is a lot of scrolling
            on a phone, and tall cards would outrun the viewport. */}
        <div className="md:hidden">{grid}</div>

        <ul className="card-stack hidden md:grid" style={{ '--numcards': featured.length }}>
          {featured.map((project, i) => (
            <li key={project.id} className="card-stack__item" style={{ '--index': i + 1 }}>
              <div className="card-stack__card">
                <ProjectCard project={project} />
              </div>
            </li>
          ))}
        </ul>

        <ViewAll />
      </div>
    </section>
  );
};

export default StackingProjectCards;
