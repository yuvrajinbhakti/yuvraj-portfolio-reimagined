import { useState, useRef, useEffect } from "react";
import { skills, experiences } from "../constants";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import CTA from "../Components/CTA";
import AnimatedBackground from "../Components/AnimatedBackground";
import ScrollReveal from "../Components/ScrollReveal";
import GlassCard from "../Components/GlassCard";
import { motion, useScroll, useTransform } from "framer-motion";
import useDocumentMeta from '../hooks/useDocumentMeta';

// Self-drawing animated SVG timeline accent line
const AnimatedTimelineLine = ({ itemCount = 4 }) => {
  const svgRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const length = line.getTotalLength();
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          line.style.transition = 'stroke-dashoffset 2.5s cubic-bezier(0.4, 0, 0.2, 1)';
          line.style.strokeDashoffset = '0';
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  const height = itemCount * 180;
  return (
    <svg
      ref={svgRef}
      width="4"
      height={height}
      viewBox={`0 0 4 ${height}`}
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ zIndex: 2, top: 0 }}
    >
      <defs>
        <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#3b82f6" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        ref={lineRef}
        d={`M 2 0 L 2 ${height}`}
        stroke="url(#timelineGrad)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

const About = () => {
  useDocumentMeta({
    title: 'About | Yuvraj Singh Nain',
    description: 'Frontend Engineer at Razorpay and Amazon ML Summer School alumnus. My experience, engineering background and the technologies I build with.',
    path: '/about',
  });

  const [activeTab, setActiveTab] = useState("experience");

  // Education data — kept in sync with resume.tex
  const education = [
    {
      degree: "Bachelor of Engineering in Computer Science",
      institution: "Chitkara University, Rajpura, Punjab",
      date: "June 2021 - July 2025",
      description: "Focused on machine learning, data structures, and full-stack development. Graduated with a 9.24/10 CGPA.",
      iconBg: "#e6f0ff"
    },
    {
      degree: "Machine Learning Specialization",
      institution: "Amazon Machine Learning Summer School",
      date: "July 2024",
      description: "Selected from 91,000+ applicants — the top 0.2%. Gained expertise in deep learning and reinforcement learning algorithms.",
      iconBg: "#ffeee6"
    }
  ];

  // Achievements data — kept in sync with resume.tex
  const achievements = [
    {
      title: "Top 5 Percentile — Adobe GenSolve Hackathon",
      date: "2024",
      description: "Placed in the top 5 percentile among thousands of participants nationwide.",
      iconBg: "#e6fff0"
    },
    {
      title: "Amazon ML Summer School — Top 0.2%",
      date: "2024",
      description: "Selected out of 91,000+ applicants for Amazon's Machine Learning Summer School.",
      iconBg: "#ffeee6"
    },
    {
      title: "National Semi-Finalist — Tata Imagination Challenge",
      date: "2024",
      description: "National semi-finalist at the Tata Imagination Challenge, and part of a Top 10 team at Smart India Hackathon (SIH) 2024.",
      iconBg: "#f0e6ff"
    },
    {
      title: "Competitive Programming",
      date: "Ongoing",
      description: "LeetCode rating 1661, CodeChef rank 131 (Starters 138), 5-star HackerRank in C++ and SQL, and 500+ problems solved across platforms.",
      iconBg: "#ffe6e6"
    }
  ];

  // Section to render based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case "experience":
        return (
          <div className="mt-12 relative">
            {/* Animated self-drawing SVG connector behind the timeline */}
            <AnimatedTimelineLine itemCount={experiences.length} />
            <VerticalTimeline animate={true} lineColor="rgba(74, 144, 226, 0.3)">
              {experiences.map((experience) => (
                <VerticalTimelineElement
                  key={experience.company_name}
                  date={experience.date}
                  icon={
                    <div className="flex justify-center items-center w-full h-full">
                      <img
                        src={experience.icon}
                        alt={experience.company_name}
                        className="w-[60%] h-[60%] object-contain"
                      />
                    </div>
                  }
                  iconStyle={{ background: experience.iconBg, boxShadow: "0 0 0 4px #4a90e2" }}
                  contentStyle={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(74, 144, 226, 0.2)",
                    backgroundColor: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(10px)",
                    padding: "24px"
                  }}
                  contentArrowStyle={{ borderRight: "10px solid rgba(15, 23, 42, 0.8)" }}
                >
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {experience.title}
                    </h3>
                    <p className="text-blue-400 font-medium text-base m-0">
                      {experience.company_name}
                    </p>
                  </div>
                  <ul className="mt-4 space-y-2 list-disc ml-5">
                    {experience.points.map((point, index) => (
                      <li
                        key={`experience-point-${index}`}
                        className="text-gray-300 font-normal text-sm"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </VerticalTimelineElement>
              ))}
            </VerticalTimeline>
          </div>
        );
      case "education":
        return (
          <div className="mt-12">
            <VerticalTimeline animate={true} lineColor="rgba(74, 144, 226, 0.3)">
              {education.map((item, index) => (
                <VerticalTimelineElement
                  key={`education-${index}`}
                  date={item.date}
                  icon={
                    <div className="flex justify-center items-center w-full h-full text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                  }
                  iconStyle={{ background: "#0f172a", boxShadow: "0 0 0 4px #4a90e2" }}
                  contentStyle={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(74, 144, 226, 0.2)",
                    backgroundColor: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(10px)",
                    padding: "24px"
                  }}
                  contentArrowStyle={{ borderRight: "10px solid rgba(15, 23, 42, 0.8)" }}
                >
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {item.degree}
                    </h3>
                    <p className="text-blue-400 font-medium text-base m-0">
                      {item.institution}
                    </p>
                  </div>
                  <p className="mt-4 text-gray-300">
                    {item.description}
                  </p>
                </VerticalTimelineElement>
              ))}
            </VerticalTimeline>
          </div>
        );
      case "achievements":
        return (
          <div className="mt-12">
            <VerticalTimeline animate={true} lineColor="rgba(74, 144, 226, 0.3)">
              {achievements.map((item, index) => (
                <VerticalTimelineElement
                  key={`achievement-${index}`}
                  date={item.date}
                  icon={
                    <div className="flex justify-center items-center w-full h-full text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  }
                  iconStyle={{ background: "#0f172a", boxShadow: "0 0 0 4px #4a90e2" }}
                  contentStyle={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(74, 144, 226, 0.2)",
                    backgroundColor: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(10px)",
                    padding: "24px"
                  }}
                  contentArrowStyle={{ borderRight: "10px solid rgba(15, 23, 42, 0.8)" }}
                >
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-4 text-gray-300">
                    {item.description}
                  </p>
                </VerticalTimelineElement>
              ))}
            </VerticalTimeline>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <AnimatedBackground>
        <section className="w-full pt-24 md:pt-32 px-4 md:px-8 mb-12 md:mb-20">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fade">
              <div className="flex flex-col items-center">
                <motion.h1 
                  className="text-5xl font-bold mb-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Hello, I&apos;m{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    Yuvraj
                  </span>
                </motion.h1>
                
                {/* Left-aligned prose, not a centred one-liner. This is the one
                    page where the reader wants to know who you are, and it
                    previously said "based in India, with a passion for creating
                    innovative web applications" — true of everyone, therefore
                    about no one. */}
                <div className="w-full max-w-2xl mx-auto">
                  <motion.div
                    className="text-lg text-gray-300 mb-12 space-y-4 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <p>
                      I&apos;m a Frontend Engineer at Razorpay, where I build the analytics and
                      reporting dashboards merchants use to understand their own payments. I
                      joined as an intern in 2024 and stayed.
                    </p>
                    <p>
                      Most of my work sits at the seam between the interface and the systems
                      behind it — an A/B testing framework, a change-data-capture pipeline that
                      took data onboarding from two weeks down to a day, a reporting stack
                      rebuilt from scratch. The problems I like are the ones where the frontend
                      answer depends on getting the backend right.
                    </p>
                    <p>
                      Outside work I build things that are harder than they need to be. The one
                      I&apos;m proudest of is a collaborative code editor with Operational
                      Transform written by hand — two people typing in the same line, neither
                      losing a keystroke.
                    </p>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>

            {/* Skills Section */}
            <ScrollReveal animation="fade">
              <div className="w-full max-w-4xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">My Skills</h2>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 justify-items-center">
                  {skills.map((skill, index) => (
                    <ScrollReveal
                      key={skill.name}
                      animation="scale"
                      delay={index * 0.05}
                    >
                      <div className="flex flex-col items-center group">
                        <div className="w-16 h-16 rounded-xl flex justify-center items-center bg-[#0f172a]/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110 border border-blue-500/20">
                          <img
                            src={skill.imageUrl}
                            alt={skill.name}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <span className="mt-2 text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {skill.name}
                        </span>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
            
            {/* Experience/Education/Achievements Tabs */}
            <ScrollReveal animation="fade">
              <div className="w-full max-w-4xl mx-auto">
                <div className="mb-8 flex justify-center">
                  <div className="border-b border-gray-700 flex space-x-8">
                    <button
                      onClick={() => setActiveTab("experience")}
                      className={`py-4 px-4 font-medium text-sm border-b-2 transition-colors duration-300 ${
                        activeTab === "experience" 
                          ? "border-blue-500 text-blue-400" 
                          : "border-transparent text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      Experience
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("education")}
                      className={`py-4 px-4 font-medium text-sm border-b-2 transition-colors duration-300 ${
                        activeTab === "education" 
                          ? "border-blue-500 text-blue-400" 
                          : "border-transparent text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      Education
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("achievements")}
                      className={`py-4 px-4 font-medium text-sm border-b-2 transition-colors duration-300 ${
                        activeTab === "achievements" 
                          ? "border-blue-500 text-blue-400" 
                          : "border-transparent text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      Achievements
                    </button>
                  </div>
                </div>
                
                {renderTabContent()}
              </div>
            </ScrollReveal>

            {/* Social Links */}
            <ScrollReveal animation="fade" delay={0.5}>
              <GlassCard className="max-w-3xl mx-auto mt-12 sm:mt-16 p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-white mb-4 sm:mb-6 md:mb-6 text-center">Connect with Me</h2>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-8">
                  <a
                    href="https://www.linkedin.com/in/yuvraj-singh-nain-76715921b/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 text-blue-400 hover:text-blue-300 transition-all duration-300 transform hover:scale-105 px-4 py-3 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 backdrop-blur-sm font-medium text-sm sm:text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://github.com/yuvrajinbhakti"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 px-4 py-3 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-500/10 border border-gray-500/20 hover:border-gray-500/40 backdrop-blur-sm font-medium text-sm sm:text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://drive.google.com/uc?id=1_dzEZhGuwzkkuKOPu-0xiafFrqLfB2Wg&export=download"
                    download
                    className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 text-green-400 hover:text-green-300 transition-all duration-300 transform hover:scale-105 px-4 py-3 sm:px-6 sm:py-3 rounded-lg hover:bg-green-500/10 border border-green-500/20 hover:border-green-500/40 backdrop-blur-sm font-medium text-sm sm:text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Resume</span>
                  </a>
                </div>
              </GlassCard>
            </ScrollReveal>

            <div className="mt-16">
              <CTA />
            </div>
          </div>
        </section>
      </AnimatedBackground>
    </div>
  );
};

export default About;
