import { useState, useEffect } from "react";
import { projects } from "../constants";
import CTA from "../Components/CTA";
import { motion } from "framer-motion";
import ScrollReveal from "../Components/ScrollReveal";
import AnimatedBackground from "../Components/AnimatedBackground";
import GlassCard from "../Components/GlassCard";

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [isHovered, setIsHovered] = useState(null);

  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredProjects(projects);
      return;
    }
    
    const filtered = projects.filter((project) =>
      project.tags.includes(activeFilter)
    );
    setFilteredProjects(filtered);
  }, [activeFilter]);

  // Get unique tags from all projects
  const allTags = ["All", ...new Set(projects.flatMap(project => project.tags))];

  return (
    <div className="overflow-y-auto overflow-x-hidden">
      <AnimatedBackground>
        <section className="w-full pt-28 px-8 mb-20">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fade">
              <motion.h1 
                className="text-5xl font-bold text-white text-center mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                My <span className="text-blue-400">Projects</span>
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-300 text-center mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Explore my portfolio of web applications, machine learning projects, and more
              </motion.p>
            </ScrollReveal>

            {/* Filter Buttons */}
            <ScrollReveal animation="fade">
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveFilter(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeFilter === tag
                        ? "bg-blue-500 text-white"
                        : "bg-[#0f172a]/60 backdrop-blur-sm text-gray-300 hover:bg-blue-500/20"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <ScrollReveal 
                  key={project.id} 
                  animation="slide" 
                  direction={["left", "up", "right"][index % 3]} 
                  delay={index * 0.1}
                >
                  <GlassCard className="h-full overflow-hidden">
                    <div 
                      className="group relative"
                      onMouseEnter={() => setIsHovered(project.id)}
                      onMouseLeave={() => setIsHovered(null)}
                    >
                      {/* Project Image */}
                      <div className="relative overflow-hidden rounded-t-lg h-48">
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Overlay on hover */}
                        <div 
                          className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end transition-opacity duration-300 ${
                            isHovered === project.id ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <div className="p-4 w-full">
                            <div className="flex gap-2 mb-2">
                              {project.tags && project.tags.slice(0, 3).map((tag) => (
                                <span 
                                  key={tag} 
                                  className="text-xs bg-blue-500/70 text-white px-2 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {project.tags && project.tags.length > 3 && (
                                <span className="text-xs text-white">+{project.tags.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Project Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                        <p className="text-gray-300 mb-4 line-clamp-3">{project.description}</p>
                        
                        <div className="flex justify-between mt-4">
                          {project.source_code_link && (
                            <a
                              href={project.source_code_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                              className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Demo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>

            {/* Show message if no projects match the filter */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-10">
                <p className="text-lg text-gray-300">No projects found with the selected filter.</p>
              </div>
            )}

            <div className="mt-16">
              <CTA />
            </div>
          </div>
        </section>
      </AnimatedBackground>
    </div>
  );
};

export default Projects;
