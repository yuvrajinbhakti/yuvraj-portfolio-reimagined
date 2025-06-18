import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { projects } from "../constants";
import CTA from "../Components/CTA";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import AnimatedBackground from "../Components/AnimatedBackground";
import GlassCard from "../Components/GlassCard";

// Pre-generate particle positions outside component to avoid recalculation
const PARTICLE_POSITIONS = Array.from({ length: 3 }, (_, i) => ({
  id: i,
  startX: Math.random() * 100,
  startY: Math.random() * 100,
  endX: Math.random() * 100 - 50,
  endY: Math.random() * 100 - 50,
  duration: 4 + Math.random() * 2,
  delay: i * 1
}));

// Move ProjectCard outside to prevent recreation on every render
const ProjectCard = ({ project, index, setCursorVariant }) => {
  const [imageError, setImageError] = useState(false);
  const [cardMousePosition, setCardMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  
  // Use once: true and larger margin for better performance
  const isInView = useInView(cardRef, { 
    once: true, 
    margin: "-10% 0px -10% 0px" 
  });
  
  // Optimized magnetic hover effect with throttling
  const handleCardMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setCardMousePosition({ x: x * 0.03, y: y * 0.03 });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setCardMousePosition({ x: 0, y: 0 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setCursorVariant("project");
  }, [setCursorVariant]);

  const handleLinkMouseEnter = useCallback(() => {
    setCursorVariant("link");
  }, [setCursorVariant]);

  const handleLinkMouseLeave = useCallback(() => {
    setCursorVariant("project");
  }, [setCursorVariant]);
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
          duration: 0.6, 
          delay: index * 0.08,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      } : {}}
      whileHover={{ 
        y: -8,
        scale: 1.01,
        transition: { 
          duration: 0.3, 
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="group relative h-full cursor-pointer"
    >
      {/* Simplified glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <motion.div
        animate={{
          x: cardMousePosition.x,
          y: cardMousePosition.y,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 250, mass: 0.5 }}
      >
        <GlassCard className="h-full overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-xl bg-black/20 rounded-3xl">
          {/* Optimized Image Section */}
          <div className="relative overflow-hidden h-64 rounded-t-3xl">
            {/* Static gradient background - no animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-pink-500/8" />
            
            <div className="w-full h-full relative z-10">
              {!imageError && project.image ? (
                <motion.img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-contain bg-gradient-to-br from-gray-900/40 to-gray-800/40 p-8 transition-all duration-300"
                  onError={() => setImageError(true)}
                  whileHover={{ 
                    scale: 1.03,
                    filter: "brightness(1.02)"
                  }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <motion.div 
                  className={`w-full h-full bg-gradient-to-br ${project.gradient} flex items-center justify-center relative overflow-hidden`}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Simplified particles with better performance */}
                  {PARTICLE_POSITIONS.map((particle) => (
                    <motion.div
                      key={particle.id}
                      className="absolute w-0.5 h-0.5 bg-white/20 rounded-full"
                      animate={{
                        x: [0, particle.endX],
                        y: [0, particle.endY],
                        opacity: [0, 0.6, 0],
                      }}
                      transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut"
                      }}
                      style={{
                        left: `${particle.startX}%`,
                        top: `${particle.startY}%`,
                      }}
                    />
                  ))}
                  
                  {/* Simplified project icon */}
                  {project.iconUrl && (
                    <motion.img
                      src={project.iconUrl}
                      alt={project.name}
                      className="w-16 h-16 object-contain filter brightness-0 invert opacity-90 relative z-10"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  
                  {/* Simplified fallback icon */}
                  {!project.iconUrl && (
                    <motion.div 
                      className="text-5xl opacity-90 relative z-10"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      💻
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* Status Badge */}
            <motion.div 
              className="absolute top-3 right-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
            >
              <span 
                className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${
                  project.status === 'Completed' 
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' 
                    : 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                }`}
              >
                {project.status}
              </span>
            </motion.div>
            
            {/* Simplified Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="p-3 w-full">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags && project.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className="text-xs bg-white/10 backdrop-blur-md text-white px-2 py-0.5 rounded-full border border-white/20"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags && project.tags.length > 3 && (
                    <span className="text-xs text-white/60">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Simplified Project Info */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="flex-grow">
              <motion.h3 
                className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-200"
                initial={{ opacity: 0, x: -15 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
              >
                {project.name}
              </motion.h3>
              <motion.p 
                className="text-gray-300 mb-3 line-clamp-3 leading-relaxed text-sm"
                initial={{ opacity: 0, x: -15 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.25 + index * 0.05, duration: 0.3 }}
              >
                {project.description}
              </motion.p>
            </div>
            
            {/* Simplified Action Buttons */}
            <motion.div 
              className="flex justify-between items-center mt-auto pt-3 border-t border-white/10"
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
            >
              {project.source_code_link && (
                <motion.a
                  href={project.source_code_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm group/link cursor-pointer"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={handleLinkMouseEnter}
                  onMouseLeave={handleLinkMouseLeave}
                >
                  <div className="p-1 rounded-full bg-blue-500/10 border border-blue-500/20 group-hover/link:bg-blue-500/15 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <span>Code</span>
                </motion.a>
              )}
              
              {project.demo_link && (
                <motion.a
                  href={project.demo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-sm group/link cursor-pointer"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={handleLinkMouseEnter}
                  onMouseLeave={handleLinkMouseLeave}
                >
                  <div className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 group-hover/link:bg-emerald-500/15 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span>Demo</span>
                </motion.a>
              )}
              
              {!project.demo_link && (
                <span className="text-gray-500 text-xs italic">
                  Demo soon
                </span>
              )}
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

// PropTypes validation for ProjectCard
ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
    iconUrl: PropTypes.string,
    gradient: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string.isRequired,
    source_code_link: PropTypes.string,
    demo_link: PropTypes.string
  }).isRequired,
  index: PropTypes.number.isRequired,
  setCursorVariant: PropTypes.func.isRequired
};

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [cursorVariant, setCursorVariant] = useState("default");
  
  // Refs for scroll animations
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  
  // Stable mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Create stable spring configs
  const springConfig = useMemo(() => ({ 
    damping: 60, 
    stiffness: 300, 
    mass: 0.2 
  }), []);
  
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  // Stable scroll progress tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Stable transforms
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  
  // Stable mouse tracking callback
  const handleMouseMove = useCallback((e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  // Stable cursor variant callbacks
  const handleSetCursorVariant = useCallback((variant) => {
    setCursorVariant(variant);
  }, []);

  const handleDefaultCursor = useCallback(() => {
    setCursorVariant("default");
  }, []);

  const handleLinkCursor = useCallback(() => {
    setCursorVariant("link");
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredProjects(projects);
      return;
    }
    
    const filtered = projects.filter((project) =>
      project.tags && project.tags.includes(activeFilter)
    );
    setFilteredProjects(filtered);
  }, [activeFilter]);

  // Stable memoized tags
  const allTags = useMemo(() => 
    ["All", ...new Set(projects.flatMap(project => project.tags || []))], 
    []
  );

  return (
    <div className="overflow-y-auto overflow-x-hidden" ref={containerRef} style={{ scrollBehavior: 'smooth' }}>
      {/* Enhanced Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-difference"
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.3 }}
      >
        <motion.div
          className="relative -translate-x-1/2 -translate-y-1/2"
          variants={{
            default: {
              width: 16,
              height: 16,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "50%",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            },
            project: {
              width: 48,
              height: 48,
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              borderRadius: "50%",
              border: "2px solid rgba(59, 130, 246, 0.6)",
            },
            link: {
              width: 32,
              height: 32,
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              borderRadius: "50%",
              border: "2px solid rgba(16, 185, 129, 0.6)",
            }
          }}
          animate={cursorVariant}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        />
      </motion.div>
      
      {/* Simplified Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-40 origin-left will-change-transform"
        style={{ width: progressBarWidth }}
      />
      
      <AnimatedBackground>
        <section className="w-full pt-20 px-4 mb-16" style={{ willChange: 'transform' }}>
          <div className="max-w-6xl mx-auto">
            {/* Optimized Hero Section */}
            <motion.div
              ref={heroRef}
              style={{
                y: heroY,
                opacity: heroOpacity,
              }}
              className="text-center mb-12 will-change-transform"
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-black text-white mb-4 relative leading-tight will-change-transform"
                initial={{ opacity: 0, y: -40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <span className="block">My</span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Projects
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Explore my portfolio of <span className="font-semibold text-white">innovative web applications</span>, 
                <span className="font-semibold text-white"> mobile apps</span>, and 
                <span className="font-semibold text-white"> development tools</span>. 
                Each project showcases cutting-edge technologies and creative problem-solving.
              </motion.p>
              
              {/* Simplified Project Stats */}
              <motion.div 
                ref={statsRef}
                className="flex justify-center gap-6 mt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {[
                  { value: projects.length, label: "Projects", color: "text-blue-400" },
                  { value: Math.max(0, allTags.length - 1), label: "Technologies", color: "text-emerald-400" },
                  { value: 100, label: "Open Source", color: "text-purple-400", suffix: "%" }
                ].map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    className="text-center p-3 rounded-lg bg-black/15 border border-white/10 will-change-transform cursor-pointer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                    whileHover={{ 
                      scale: 1.03, 
                      y: -2,
                      transition: { duration: 0.15 }
                    }}
                    onMouseEnter={handleLinkCursor}
                    onMouseLeave={handleDefaultCursor}
                  >
                    <div className={`text-2xl font-bold ${stat.color} mb-0.5`}>
                      {stat.value}{stat.suffix || ""}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Simplified Filter Buttons */}
            <motion.div 
              className="flex flex-wrap justify-center gap-2 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {allTags.map((tag, index) => (
                <motion.button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative overflow-hidden backdrop-blur-md will-change-transform cursor-pointer ${
                    activeFilter === tag
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md border border-white/20"
                      : "bg-black/15 text-gray-300 hover:bg-white/10 border border-white/10 hover:border-white/20"
                  }`}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1 + index * 0.03, duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -1,
                    transition: { duration: 0.15 }
                  }}
                  whileTap={{ scale: 0.97 }}
                  onMouseEnter={handleLinkCursor}
                  onMouseLeave={handleDefaultCursor}
                >
                  {activeFilter === tag && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"
                      layoutId="activeFilterBg"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <span className="relative z-10">{tag}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Optimized Projects Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
              transition={{ duration: 0.3 }}
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} setCursorVariant={handleSetCursorVariant} />
              ))}
            </motion.div>

            {/* Simplified Empty State */}
            {filteredProjects.length === 0 && (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Projects Found</h3>
                <p className="text-gray-300 mb-6">No projects match the selected filter.</p>
                <motion.button
                  onClick={() => setActiveFilter("All")}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-md transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onMouseEnter={handleLinkCursor}
                  onMouseLeave={handleDefaultCursor}
                >
                  Show All Projects
                </motion.button>
              </motion.div>
            )}

            {/* Simplified CTA Section */}
            <motion.div 
              className="mt-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <CTA />
            </motion.div>
          </div>
        </section>
      </AnimatedBackground>
    </div>
  );
};

export default Projects;
