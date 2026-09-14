import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { experiences } from "../constants";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { Link } from "react-router-dom";
import ScrollReveal from "../Components/ScrollReveal";
import ServiceCards from "../Components/ServiceCards";
import { motion } from "framer-motion";

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
          <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
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

AnimatedTimelineLine.propTypes = { itemCount: PropTypes.number };

const About = () => {

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
                      {/* Roughly 6,100px down a 12,000px page. Nothing here is
                          on screen when the page loads, so none of it belongs
                          in the first wave of requests. */}
                      <img
                        src={experience.icon}
                        alt={experience.company_name}
                        loading="lazy"
                        decoding="async"
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="!h-8 !w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="!h-8 !w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div>
        <section className="w-full pt-12 md:pt-20 px-4 md:px-8 mb-12 md:mb-20">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fade">
              <div className="flex flex-col items-center">
                {/* h2, not h1. Each of these was the title of its own route, and one h1
                    per document is the whole point of h1 — five of them on one page
                    leaves a screen reader's heading list with five competing titles
                    and no outline. The hero keeps the only h1 on the page. */}
                {/*
                  * "About" with a line under it — the heading was never the
                  * real problem.
                  *
                  * It has been wrong twice. It said "Hello, I'm Yuvraj" one
                  * screen below a hero reading "I'm Yuvraj Singh Nain", which
                  * is the same introduction twice; that became a bare "About",
                  * which was the only one of the four section titles with
                  * nothing beneath it — Featured work, Developer Playground
                  * and Get in touch all carry a second line. A bare word
                  * centred over prose is what looked plain, not the word.
                  *
                  * So the standard heading stays, and the line beneath does
                  * the work it does in the other three: says what is in the
                  * section. Here that is its three parts, in order — the
                  * prose, the cards, the timeline.
                  */}
                <motion.h2
                  className="text-3xl md:text-4xl font-bold mb-3 text-center text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  About
                </motion.h2>
                <motion.p
                  className="text-base md:text-lg text-white/60 mb-10 text-center max-w-xl mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  Where I work, what I&apos;ve shipped there, and what I build outside it.
                </motion.p>

                {/* Four sentences. Every number in them is a Measured row of the
                    Impact Inventory and appears once across the page's summary
                    layers — hero, this prose, the cards, the project cards. The
                    experience tab below repeats them by design: it is the
                    record the cards link to as evidence. The old prose carried
                    +25%, 40%, 1,000 clients, 10,000 operations a second, 75ms
                    and 0.5%; the first two are in no source, and the rest belong
                    to the project card and its write-up. */}
                <div className="w-full max-w-2xl mx-auto">
                  <motion.div
                    className="text-base md:text-lg text-gray-300 mb-12 space-y-4 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {/* D1, measured: "currently live for ~15k merchants". This
                        said 16,000+, a figure that appears nowhere in the
                        inventory the rest of the page is now traced to. */}
                    <p>
                      I&apos;m a frontend engineer at Razorpay, on the reporting and data
                      platform. I joined as an intern in July 2024 and was made full-time a year
                      later, and I was the sole frontend engineer on the embedded-analytics
                      product now live for
                      <strong className="text-white font-semibold"> ~15,000 merchants</strong>.
                    </p>
                    {/* B6 (four or five days to one) and B10 (the suite, three
                        regions, zero incidents). The old sentence's 40% cut in
                        report generation time is not in the inventory and is
                        gone. */}
                    <p>
                      Most of what I&apos;ve shipped there is the unglamorous middle of a data
                      product — the Airflow migration nobody sees, a config-driven onboarding
                      UI that took a new report field from four days to one, and the
                      end-to-end suite that gates deploys across three regions.
                    </p>
                    <p>
                      Outside work I build the things I&apos;d want to read a write-up of: a
                      collaborative editor whose merge logic I later proved wrong, then right,
                      and this page, whose{" "}
                      <Link
                        to="/work/the-sky"
                        className="text-white underline decoration-white/25 underline-offset-4 hover:decoration-blue-400 transition-colors"
                      >
                        sky is real
                      </Link>
                      .
                    </p>
                  </motion.div>
                </div>

                {/* The three cards that were their own "What I Do" section. */}
                <div className="w-full mb-16">
                  <ServiceCards />
                </div>
              </div>
            </ScrollReveal>

            {/* The skills wall went. Fourteen logos with the names hidden until
                hover is the one section every template portfolio has and the
                one no reader learns anything from: "React" as a picture says
                less than the paragraph above it, which says React in production
                for sixteen thousand merchants. The stack is named where it did
                something — in the prose here, on each project card, and in the
                case studies — which is the only place a technology means
                anything. */}

            {/* Experience/Education/Achievements Tabs.
                id, so the cards above can point at the evidence for their
                numbers — the Razorpay role in full is the first tab. */}
            <ScrollReveal animation="fade">
              <div id="experience" className="w-full max-w-4xl mx-auto scroll-mt-24">
                {/* Three tabs at space-x-8 plus px-4 each overflowed a 375px
                    viewport by 14px, which pushed the whole document wider than
                    the screen. Tighter gaps on small screens, and the strip
                    scrolls on its own rather than dragging the page with it. */}
                <div className="mb-8 flex justify-center max-w-full overflow-x-auto">
                  <div className="border-b border-gray-700 flex space-x-2 sm:space-x-8 shrink-0">
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

            {/* The social card that sat here is gone with the CTA below it.
                Three ways to reach him inside the About section, at the halfway
                point of a page whose last section is Contact — and the footer
                carries the same three links on every screen. Repetition is not
                emphasis; it just makes the real one arrive as the fourth ask. */}

            {/* The CTA that used to close this page is gone. It made sense
                when About was a route and this was the bottom of it; on one page
                it asked the reader to get in touch at the halfway mark, with the
                projects, the playground and the actual contact section still
                below. The end of the page does that job once. */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
