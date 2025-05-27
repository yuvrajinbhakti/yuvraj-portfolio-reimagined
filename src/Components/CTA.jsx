import React from "react";
import { Link } from "react-router-dom";
import GlassCard from "./GlassCard";
import ScrollReveal from "./ScrollReveal";

const CTA = () => {
  return (
    <ScrollReveal animation="fade">
      <GlassCard className="p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Let's Work <span className="text-blue-400">Together</span>
        </h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          I'm currently available for freelance work or full-time opportunities.
          If you're looking for a developer who can bring your ideas to life, let's talk!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/contact"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl"
          >
            Contact Me
          </Link>
          <a
            href="https://drive.google.com/uc?id=1DB4Z1-gKTDQ6Q1_l-BkJhRXuBo1LOs15&export=download"
            download
            className="px-8 py-4 bg-transparent border border-white/30 backdrop-blur-sm text-white rounded-lg hover:bg-white/10 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl"
          >
            Download Resume
          </a>
        </div>
      </GlassCard>
    </ScrollReveal>
  );
};

export default CTA;
