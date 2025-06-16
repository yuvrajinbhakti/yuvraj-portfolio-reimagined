import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveTerminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  // Terminal data
  const terminalData = {
    about: {
      name: "Yuvraj Singh Nain",
      role: "Frontend Engineering Intern @ Razorpay",
      location: "India",
      email: "yuvraj@example.com",
      bio: "Passionate full-stack developer with expertise in React, Node.js, and modern web technologies."
    },
    education: [
      {
        degree: "Bachelor of Technology",
        field: "Computer Science Engineering",
        institution: "Your University",
        year: "2021-2025",
        gpa: "8.5/10"
      }
    ],
    experience: [
      {
        role: "Frontend Engineering Intern",
        company: "Razorpay",
        duration: "July 2023 - Present",
        achievements: [
          "Reduced database load by 30% by eliminating unnecessary API requests",
          "Fixed multiple critical bugs, improving system stability by 20%",
          "Boosted user satisfaction by 30% through user-centric design"
        ]
      }
    ],
    skills: {
      frontend: ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind CSS"],
      backend: ["Node.js", "Express.js", "MongoDB", "GoLang"],
      tools: ["Git", "Docker", "Kubernetes", "AWS", "Vite"],
      other: ["Three.js", "GSAP", "Framer Motion"]
    },
    projects: [
      {
        name: "3D Portfolio",
        tech: ["React", "Three.js", "Tailwind CSS"],
        description: "Interactive 3D portfolio with immersive animations"
      },
      {
        name: "Real-time Code Editor",
        tech: ["React", "Socket.io", "Monaco Editor"],
        description: "Collaborative code editor with live sharing"
      }
    ]
  };

  // Available commands
  const commands = {
    help: () => ({
      output: [
        "Available commands:",
        "  help          - Show this help message",
        "  about         - Display personal information",
        "  education     - Show educational background",
        "  experience    - Display work experience",
        "  skills        - List technical skills",
        "  projects      - Show featured projects",
        "  contact       - Get contact information",
        "  clear         - Clear terminal",
        "  whoami        - Display current user",
        "  ls            - List available sections",
        "  cat <section> - Display detailed info about a section",
        "  tree          - Show portfolio structure",
        "",
        "Type any command to explore!"
      ]
    }),
    
    about: () => ({
      output: [
        `Name: ${terminalData.about.name}`,
        `Role: ${terminalData.about.role}`,
        `Location: ${terminalData.about.location}`,
        `Email: ${terminalData.about.email}`,
        "",
        `Bio: ${terminalData.about.bio}`
      ]
    }),
    
    education: () => ({
      output: terminalData.education.flatMap(edu => [
        `${edu.degree} in ${edu.field}`,
        `${edu.institution} (${edu.year})`,
        `GPA: ${edu.gpa}`,
        ""
      ])
    }),
    
    experience: () => ({
      output: terminalData.experience.flatMap(exp => [
        `${exp.role} @ ${exp.company}`,
        `Duration: ${exp.duration}`,
        "Key Achievements:",
        ...exp.achievements.map(achievement => `  • ${achievement}`),
        ""
      ])
    }),
    
    skills: () => ({
      output: [
        "Technical Skills:",
        "",
        `Frontend: ${terminalData.skills.frontend.join(', ')}`,
        `Backend: ${terminalData.skills.backend.join(', ')}`,
        `Tools: ${terminalData.skills.tools.join(', ')}`,
        `Other: ${terminalData.skills.other.join(', ')}`
      ]
    }),
    
    projects: () => ({
      output: terminalData.projects.flatMap(project => [
        `${project.name}`,
        `Tech Stack: ${project.tech.join(', ')}`,
        `Description: ${project.description}`,
        ""
      ])
    }),
    
    contact: () => ({
      output: [
        "Contact Information:",
        `Email: ${terminalData.about.email}`,
        "LinkedIn: linkedin.com/in/yuvraj-singh-nain",
        "GitHub: github.com/yuvraj-singh-nain",
        "Portfolio: yuvraj-portfolio.vercel.app"
      ]
    }),
    
    whoami: () => ({
      output: ["visitor@yuvraj-portfolio:~$"]
    }),
    
    ls: () => ({
      output: [
        "about/",
        "education/",
        "experience/",
        "skills/",
        "projects/",
        "contact/"
      ]
    }),
    
    tree: () => ({
      output: [
        "yuvraj-portfolio/",
        "├── about/",
        "│   ├── personal-info",
        "│   └── bio",
        "├── education/",
        "│   └── btech-cse",
        "├── experience/",
        "│   └── razorpay-intern",
        "├── skills/",
        "│   ├── frontend/",
        "│   ├── backend/",
        "│   └── tools/",
        "├── projects/",
        "│   ├── 3d-portfolio/",
        "│   └── code-editor/",
        "└── contact/"
      ]
    }),
    
    clear: () => ({
      output: [],
      clear: true
    })
  };

  // Handle command execution
  const executeCommand = async (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    if (!trimmedCmd) return;
    
    // Add command to history
    setHistory(prev => [...prev, { type: 'input', content: `visitor@yuvraj-portfolio:~$ ${cmd}` }]);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    
    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (commands[trimmedCmd]) {
      const result = commands[trimmedCmd]();
      
      if (result.clear) {
        setHistory([]);
      } else {
        setHistory(prev => [...prev, { type: 'output', content: result.output }]);
      }
    } else if (trimmedCmd.startsWith('cat ')) {
      const section = trimmedCmd.split(' ')[1];
      if (commands[section]) {
        const result = commands[section]();
        setHistory(prev => [...prev, { type: 'output', content: result.output }]);
      } else {
        setHistory(prev => [...prev, { type: 'error', content: [`cat: ${section}: No such file or directory`] }]);
      }
    } else {
      setHistory(prev => [...prev, { 
        type: 'error', 
        content: [`Command not found: ${trimmedCmd}`, "Type 'help' for available commands."] 
      }]);
    }
    
    setIsTyping(false);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Welcome message
  useEffect(() => {
    setHistory([
      { type: 'output', content: [
        "Welcome to Yuvraj's Interactive Terminal!",
        "",
        "Type 'help' to see available commands.",
        "Explore my background, skills, and projects through terminal commands.",
        ""
      ]}
    ]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/90 backdrop-blur-sm rounded-lg border border-green-500/30 shadow-2xl overflow-hidden font-mono text-sm"
    >
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-gray-300 ml-4">yuvraj@portfolio:~</span>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="h-96 overflow-y-auto p-4 bg-black text-green-400"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {history.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-1"
            >
              {entry.type === 'input' && (
                <div className="text-green-400">{entry.content}</div>
              )}
              {entry.type === 'output' && (
                <div className="text-gray-300">
                  {entry.content.map((line, lineIndex) => (
                    <div key={lineIndex}>{line}</div>
                  ))}
                </div>
              )}
              {entry.type === 'error' && (
                <div className="text-red-400">
                  {entry.content.map((line, lineIndex) => (
                    <div key={lineIndex}>{line}</div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Current Input Line */}
        <div className="flex items-center text-green-400">
          <span className="mr-2">visitor@yuvraj-portfolio:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
            autoComplete="off"
            spellCheck="false"
          />
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="ml-1"
            >
              ▋
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveTerminal; 