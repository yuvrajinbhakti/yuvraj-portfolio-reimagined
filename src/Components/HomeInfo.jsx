import React from "react";
import { Link } from "react-router-dom";
import { arrow } from "../assets/icons";
import { motion } from "framer-motion";

const InfoBox = ({ text, link, btnText }) => (
  <motion.div 
    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl max-w-lg mx-auto"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <p className="text-gray-800 font-medium text-lg md:text-xl text-center mb-4">{text}</p>
    <Link 
      to={link} 
      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-medium transition-all hover:bg-blue-700 hover:scale-105 duration-300 mx-auto"
    >
      {btnText}
      <img src={arrow} className="w-4 h-4 object-contain" alt="arrow" />
    </Link>
  </motion.div>
);

const renderContent = {
  1: (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-xl md:text-2xl text-center font-bold text-gray-800 mb-2">
        Hi, I am <span className="text-blue-600">Yuvraj</span> 👋
      </h1>
      <p className="text-center text-gray-600">
        A Software Engineer & Full Stack Developer from India
      </p>
    </motion.div>
  ),
  2: (
    <InfoBox
      text="I've worked with leading companies and built a diverse skill set in web development, cloud technologies, and machine learning."
      link="/about"
      btnText="Learn more"
    />
  ),
  3: (
    <InfoBox
      text="I've led multiple projects from concept to deployment. Want to see what I've built and the impact it's made?"
      link="/projects"
      btnText="View my work"
    />
  ),
  4: (
    <InfoBox
      text="Looking for a skilled developer for your next project? I'm available for freelance work and full-time opportunities."
      link="/contact"
      btnText="Let's connect"
    />
  ),
};

const HomeInfo = ({ currentStage }) => {
  return renderContent[currentStage] || null;
};

export default HomeInfo;
