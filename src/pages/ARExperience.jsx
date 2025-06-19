import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ARExperience = () => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  useEffect(() => {
    // Check for AR support
    const checkARSupport = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const hasWebXR = 'xr' in navigator;
      
      setIsARSupported(hasWebXR || isIOS || isAndroid);
      setDeviceInfo({
        isIOS,
        isAndroid,
        hasWebXR,
        userAgent: navigator.userAgent,
        isMobile: /Mobi|Android/i.test(navigator.userAgent)
      });
    };

    checkARSupport();
  }, []);

  const portfolioData = {
    name: "Yuvraj Singh Nain",
    title: "Frontend Engineering Intern @ Razorpay",
    skills: ["React", "JavaScript", "Node.js", "Three.js", "GSAP"],
    projects: [
      {
        name: "3D Portfolio",
        description: "Interactive portfolio with 3D animations",
        tech: ["React", "Three.js", "Tailwind CSS"]
      },
      {
        name: "Code Playground",
        description: "Live code editor with real-time preview",
        tech: ["React", "Monaco Editor", "WebSockets"]
      }
    ],
    achievements: [
      "Reduced database load by 30%",
      "Improved system stability by 20%",
      "Boosted user satisfaction by 30%"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white pt-24 md:pt-32 p-4">
      {/* AR Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          AR Portfolio Experience
        </h1>
        <p className="text-gray-300">Welcome to my interactive AR portfolio!</p>
      </motion.div>

      {/* AR Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/20"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${isARSupported ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-semibold">
            {isARSupported ? 'AR Ready!' : 'AR Not Available'}
          </span>
        </div>
        
        <div className="text-sm text-gray-300 space-y-1">
          <p>Device: {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}</p>
          <p>Platform: {deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'Other'}</p>
          <p>WebXR: {deviceInfo.hasWebXR ? 'Supported' : 'Not Supported'}</p>
        </div>
      </motion.div>

      {/* 3D Card Effect */}
      <motion.div
        initial={{ opacity: 0, rotateY: -90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ duration: 1, type: "spring" }}
        className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20 transform-gpu"
        style={{ 
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold"
          >
            YSN
          </motion.div>
          <h2 className="text-2xl font-bold mb-1">{portfolioData.name}</h2>
          <p className="text-blue-300">{portfolioData.title}</p>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Skills</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {portfolioData.skills.map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-white/20"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Featured Projects</h3>
          <div className="space-y-3">
            {portfolioData.projects.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-black/20 rounded-lg p-4 border border-white/10"
              >
                <h4 className="font-semibold text-blue-300 mb-1">{project.name}</h4>
                <p className="text-sm text-gray-300 mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.tech.map((tech) => (
                    <span key={tech} className="text-xs bg-purple-500/20 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-center">Key Achievements</h3>
          <div className="space-y-2">
            {portfolioData.achievements.map((achievement, index) => (
              <motion.div
                key={achievement}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-green-400">✓</span>
                <span>{achievement}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AR Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 backdrop-blur-sm rounded-lg p-4 border border-pink-500/20"
      >
        <h3 className="font-semibold mb-2 text-center">🚀 Future AR Features</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <p>• 3D model interactions</p>
          <p>• Virtual business card placement</p>
          <p>• Interactive project demos</p>
          <p>• Gesture-based navigation</p>
          <p>• Real-time collaboration spaces</p>
        </div>
      </motion.div>

      {/* Contact Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 flex flex-col gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open('mailto:yuvraj@example.com', '_blank')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold"
        >
          📧 Get in Touch
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open(window.location.origin, '_blank')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold"
        >
          🌐 View Full Portfolio
        </motion.button>
      </motion.div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ARExperience; 