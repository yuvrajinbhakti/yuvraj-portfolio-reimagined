import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const CodePlayground = () => {
  const [activeTab, setActiveTab] = useState('html');
  const [code, setCode] = useState({
    html: `<div class="container">
  <h1 class="title">Hello, World!</h1>
  <p class="description">Welcome to the interactive playground!</p>
  <button onclick="changeColor()" class="btn">Change Color</button>
</div>`,
    css: `.container {
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  font-family: 'Arial', sans-serif;
}

.title {
  font-size: 2rem;
  margin-bottom: 10px;
  animation: fadeIn 1s ease-in;
}

.description {
  font-size: 1.1rem;
  margin-bottom: 20px;
  opacity: 0.9;
}

.btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}`,
    js: `function changeColor() {
  const container = document.querySelector('.container');
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  container.style.background = randomColor;
  
  // Add a fun animation
  container.style.transform = 'scale(1.05)';
  setTimeout(() => {
    container.style.transform = 'scale(1)';
  }, 200);
}

// Auto-change color every 5 seconds
setInterval(() => {
  if (Math.random() > 0.7) {
    changeColor();
  }
}, 5000);

// Add some interactive particles
function createParticle() {
  const particle = document.createElement('div');
  particle.style.cssText = \`
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255,255,255,0.8);
    border-radius: 50%;
    pointer-events: none;
    animation: float 3s ease-out forwards;
  \`;
  
  particle.style.left = Math.random() * 100 + '%';
  particle.style.top = '100%';
  
  document.querySelector('.container').appendChild(particle);
  
  setTimeout(() => particle.remove(), 3000);
}

// Create particles periodically
setInterval(createParticle, 1000);`
  });

  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layout, setLayout] = useState('horizontal');
  const [editorWidth, setEditorWidth] = useState(50);
  const [playgroundHeight, setPlaygroundHeight] = useState(500);
  const iframeRef = useRef(null);
  const resizerRef = useRef(null);
  const isResizing = useRef(false);

  // Professional example configuration
  const EXAMPLES = {
    'hello-world': {
      name: 'Hello World',
      icon: '👋',
      category: 'Basic',
      description: 'Interactive buttons with animations',
      difficulty: 'Beginner',
      tags: ['HTML', 'CSS', 'JS'],
      code: {
        html: `<div class="container">
  <h1 class="title">Hello, World!</h1>
  <p class="description">Welcome to the interactive playground!</p>
  <button onclick="changeColor()" class="btn">Change Color</button>
</div>`,
        css: `.container {
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  font-family: 'Arial', sans-serif;
}

.title {
  font-size: 2rem;
  margin-bottom: 10px;
  animation: fadeIn 1s ease-in;
}

.description {
  font-size: 1.1rem;
  margin-bottom: 20px;
  opacity: 0.9;
}

.btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}`,
        js: `function changeColor() {
  const container = document.querySelector('.container');
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  container.style.background = randomColor;
  
  // Add a fun animation
  container.style.transform = 'scale(1.05)';
  setTimeout(() => {
    container.style.transform = 'scale(1)';
  }, 200);
}

// Auto-change color every 5 seconds
setInterval(() => {
  if (Math.random() > 0.7) {
    changeColor();
  }
}, 5000);

// Add some interactive particles
function createParticle() {
  const particle = document.createElement('div');
  particle.style.cssText = \`
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255,255,255,0.8);
    border-radius: 50%;
    pointer-events: none;
    animation: float 3s ease-out forwards;
  \`;
  
  particle.style.left = Math.random() * 100 + '%';
  particle.style.top = '100%';
  
  document.querySelector('.container').appendChild(particle);
  
  setTimeout(() => particle.remove(), 3000);
}

// Create particles periodically
setInterval(createParticle, 1000);`
      }
    },
    'react-counter': {
      name: 'React Counter',
      icon: '🔢',
      category: 'Interactive',
      description: 'State management demonstration',
      difficulty: 'Intermediate',
      tags: ['React-like', 'State', 'Events'],
      code: {
        html: `<div id="root"></div>`,
        css: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 20px;
  background: #f0f2f5;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 0 auto;
}

.counter {
  text-align: center;
}

.count {
  font-size: 3rem;
  font-weight: bold;
  color: #1976d2;
  margin: 20px 0;
}

.button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin: 0 8px;
  transition: all 0.2s;
}

.button:hover {
  background: #1565c0;
  transform: translateY(-1px);
}`,
        js: `// Simple React-like counter component
class Counter {
  constructor() {
    this.count = 0;
    this.render();
  }
  
  increment() {
    this.count++;
    this.render();
  }
  
  decrement() {
    this.count--;
    this.render();
  }
  
  render() {
    document.getElementById('root').innerHTML = \`
      <div class="card">
        <div class="counter">
          <h2>Interactive Counter</h2>
          <div class="count">\${this.count}</div>
          <button class="button" onclick="counter.decrement()">-</button>
          <button class="button" onclick="counter.increment()">+</button>
        </div>
      </div>
    \`;
  }
}

const counter = new Counter();`
      }
    },
    'css-animation': {
      name: 'CSS Animation',
      icon: '✨',
      category: 'Visual',
      description: 'Advanced CSS animations and effects',
      difficulty: 'Advanced',
      tags: ['CSS', 'Animation', 'Keyframes'],
      code: {
        html: `<div class="animation-container">
  <div class="floating-shapes">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
    <div class="shape shape-4"></div>
  </div>
  <h1 class="animated-title">CSS Animations</h1>
</div>`,
        css: `body {
  margin: 0;
  padding: 0;
  background: linear-gradient(45deg, #1e3c72, #2a5298);
  height: 100vh;
  overflow: hidden;
}

.animation-container {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.animated-title {
  font-size: 3rem;
  color: white;
  text-align: center;
  z-index: 10;
  position: relative;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 20px rgba(255,255,255,0.5); }
  to { text-shadow: 0 0 30px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.6); }
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  background: rgba(255, 107, 107, 0.7);
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 60px;
  height: 60px;
  background: rgba(107, 255, 107, 0.7);
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  background: rgba(107, 107, 255, 0.7);
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 107, 0.7);
  top: 30%;
  right: 30%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(90deg); }
  50% { transform: translateY(0px) rotate(180deg); }
  75% { transform: translateY(20px) rotate(270deg); }
}`,
        js: `// Add interactive hover effects
document.querySelectorAll('.shape').forEach(shape => {
  shape.addEventListener('mouseenter', () => {
    shape.style.transform = 'scale(1.5)';
    shape.style.transition = 'transform 0.3s ease';
  });
  
  shape.addEventListener('mouseleave', () => {
    shape.style.transform = 'scale(1)';
  });
});

// Change colors on click
let colorIndex = 0;
const colors = [
  'rgba(255, 107, 107, 0.7)',
  'rgba(107, 255, 107, 0.7)',
  'rgba(107, 107, 255, 0.7)',
  'rgba(255, 255, 107, 0.7)',
  'rgba(255, 107, 255, 0.7)',
  'rgba(107, 255, 255, 0.7)'
];

document.addEventListener('click', () => {
  document.querySelectorAll('.shape').forEach(shape => {
    colorIndex = (colorIndex + 1) % colors.length;
    shape.style.background = colors[colorIndex];
  });
});`
      }
    },
    'mini-game': {
      name: 'Mini Game',
      icon: '🎮',
      category: 'Interactive',
      description: 'Complete game with collision detection',
      difficulty: 'Advanced',
      tags: ['Game', 'Events', 'Animation'],
      code: {
        html: `<div class="game-container">
  <h2>Catch the Dots Game</h2>
  <div class="score">Score: <span id="score">0</span></div>
  <div class="game-area" id="gameArea">
    <div class="player" id="player"></div>
  </div>
  <button class="start-btn" onclick="startGame()">Start Game</button>
  <p class="instructions">Use arrow keys or touch to move</p>
</div>`,
        css: `.game-container {
  text-align: center;
  padding: 20px;
  font-family: Arial, sans-serif;
  background: #2c3e50;
  color: white;
  min-height: 100vh;
}

.score {
  font-size: 1.5rem;
  margin: 20px 0;
  color: #f39c12;
}

.game-area {
  position: relative;
  width: 400px;
  height: 300px;
  background: #34495e;
  margin: 20px auto;
  border: 3px solid #3498db;
  border-radius: 10px;
  overflow: hidden;
}

.player {
  position: absolute;
  width: 30px;
  height: 30px;
  background: #e74c3c;
  border-radius: 50%;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  transition: left 0.1s;
}

.dot {
  position: absolute;
  width: 15px;
  height: 15px;
  background: #f1c40f;
  border-radius: 50%;
  animation: fall 3s linear;
}

@keyframes fall {
  from { top: -15px; }
  to { top: 300px; }
}

.start-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin: 20px 10px;
}

.start-btn:hover {
  background: #229954;
}

.instructions {
  font-size: 0.9rem;
  color: #bdc3c7;
  margin-top: 10px;
}`,
        js: `let score = 0;
let gameRunning = false;
let gameInterval;
let player = document.getElementById('player');
let gameArea = document.getElementById('gameArea');
let playerPosition = 50; // percentage

// Player movement
document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  
  if (e.key === 'ArrowLeft' && playerPosition > 5) {
    playerPosition -= 5;
    player.style.left = playerPosition + '%';
  } else if (e.key === 'ArrowRight' && playerPosition < 95) {
    playerPosition += 5;
    player.style.left = playerPosition + '%';
  }
});

// Touch controls for mobile
let touchStartX = 0;
gameArea.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

gameArea.addEventListener('touchmove', (e) => {
  if (!gameRunning) return;
  e.preventDefault();
  
  const touchX = e.touches[0].clientX;
  const diff = touchX - touchStartX;
  
  if (Math.abs(diff) > 10) {
    if (diff > 0 && playerPosition < 95) {
      playerPosition += 3;
    } else if (diff < 0 && playerPosition > 5) {
      playerPosition -= 3;
    }
    player.style.left = playerPosition + '%';
    touchStartX = touchX;
  }
});

function createDot() {
  const dot = document.createElement('div');
  dot.className = 'dot';
  dot.style.left = Math.random() * 385 + 'px';
  gameArea.appendChild(dot);
  
  // Check for collision
  const checkCollision = setInterval(() => {
    const dotRect = dot.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    
    if (dotRect.bottom >= playerRect.top &&
        dotRect.left < playerRect.right &&
        dotRect.right > playerRect.left) {
      score++;
      document.getElementById('score').textContent = score;
      dot.remove();
      clearInterval(checkCollision);
    } else if (dotRect.top > gameArea.offsetHeight) {
      dot.remove();
      clearInterval(checkCollision);
    }
  }, 50);
  
  setTimeout(() => {
    if (dot.parentNode) {
      dot.remove();
      clearInterval(checkCollision);
    }
  }, 3000);
}

function startGame() {
  if (gameRunning) return;
  
  gameRunning = true;
  score = 0;
  document.getElementById('score').textContent = score;
  
  gameInterval = setInterval(createDot, 800);
  
  // Stop game after 30 seconds
  setTimeout(() => {
    clearInterval(gameInterval);
    gameRunning = false;
    alert(\`Game Over! Final Score: \${score}\`);
  }, 30000);
}`
      }
    }
  };

  const LAYOUT_OPTIONS = [
    { value: 'horizontal', icon: '⬌', label: 'Side by Side', shortcut: 'H' },
    { value: 'vertical', icon: '⬍', label: 'Top & Bottom', shortcut: 'V' },
    { value: 'output-only', icon: '🖥️', label: 'Preview Only', shortcut: 'P' }
  ];

  const TABS = [
    { id: 'html', name: 'HTML', icon: '🌐', color: 'text-orange-400' },
    { id: 'css', name: 'CSS', icon: '🎨', color: 'text-blue-400' },
    { id: 'js', name: 'JavaScript', icon: '⚡', color: 'text-yellow-400' }
  ];

  // Professional event handlers
  const handleExampleLoad = useCallback((exampleKey) => {
    const example = EXAMPLES[exampleKey];
    if (example) {
      setCode(example.code);
    }
  }, []);

  const handleFreshStart = useCallback(() => {
    setCode({
      html: '<div class="container">\n  <h1>Your HTML here</h1>\n  <p>Start building something amazing!</p>\n</div>',
      css: '.container {\n  padding: 2rem;\n  text-align: center;\n  font-family: system-ui, sans-serif;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  border-radius: 12px;\n  margin: 1rem;\n}',
      js: '// Your JavaScript here\nconsole.log("Welcome to the playground!");\n\n// Try adding some interactivity!'
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            runCode();
            break;
          case 'h':
            e.preventDefault();
            setLayout('horizontal');
            break;
          case 'v':
            e.preventDefault();
            setLayout('vertical');
            break;
          case 'p':
            e.preventDefault();
            setLayout('output-only');
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  // Resizer functionality
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      
      const container = resizerRef.current?.parentElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (newWidth >= 20 && newWidth <= 80) {
        setEditorWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Run code in iframe
  const runCode = useCallback(() => {
    setIsRunning(true);
    
    const htmlCode = code.html;
    const cssCode = `<style>${code.css}</style>`;
    const jsCode = `<script>${code.js}</script>`;
    
    const fullCode = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code Playground Output</title>
          ${cssCode}
        </head>
        <body>
          ${htmlCode}
          ${jsCode}
        </body>
      </html>
    `;
    
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.srcdoc = fullCode;
    }
    
    setTimeout(() => setIsRunning(false), 1000);
  }, [code]);

  // Auto-run on code change
  useEffect(() => {
    const timer = setTimeout(runCode, 500);
    return () => clearTimeout(timer);
  }, [code, runCode]);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setPlaygroundHeight(window.innerHeight - 100);
    } else {
      setPlaygroundHeight(500);
    }
  }, [isFullscreen]);

  return (
    <>
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden ${
          isFullscreen ? 'fixed inset-4 z-50' : ''
        }`}
        style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : `${playgroundHeight}px` }}
      >
        {/* Professional Header */}
        <div className="bg-gray-900 border-b border-gray-700">
          {/* Compact Top Bar */}
          <div className="px-6 py-2 flex items-center justify-between">
            {/* <div className="flex items-center gap-3"> */}
              {/* <div className="flex items-center gap-2"> */}
                {/* <div>
                  <h1 className="text-white font-semibold text-base">Code Playground</h1>
                  <p className="text-gray-400 text-xs">Live coding environment</p>
                </div> */}
              {/* </div> */}
            {/* </div> */}
            
            <div className="flex items-center gap-2">
              {/* Compact Run Button */}
              <button
                onClick={runCode}
                disabled={isRunning}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-gray-600 disabled:to-gray-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg min-w-[70px]"
                title="Run Code (Ctrl+Enter)"
              >
                {isRunning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <span className="text-sm">▶</span>
                )}
                <span className="text-sm">{isRunning ? 'Running' : 'Run'}</span>
              </button>

              {/* Compact Layout Controls */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-md p-0.5">
                {LAYOUT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLayout(option.value)}
                    className={`p-1.5 text-xs rounded transition-all duration-200 ${
                      layout === option.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title={`${option.label} (Ctrl+${option.shortcut})`}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>

              {/* Compact Settings */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-all duration-200"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-all duration-200"
                  title="Toggle Fullscreen (Ctrl+F)"
                >
                  {isFullscreen ? '⤓' : '⤢'}
                </button>
              </div>

              {/* Compact Height Control */}
              {!isFullscreen && (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-gray-400 text-xs">H:</span>
                  <input
                    type="range"
                    min="400"
                    max="800"
                    value={playgroundHeight}
                    onChange={(e) => setPlaygroundHeight(parseInt(e.target.value))}
                    className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-gray-400 text-xs font-mono w-8">{Math.round(playgroundHeight/100)*100}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compact Scrollable Examples Bar */}
          <div className="px-6 py-1.5 bg-gray-850 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-xs font-medium shrink-0">Try it:</span>   
              
              {/* Horizontally Scrollable Examples */}
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 pb-0.5">
                  {Object.entries(EXAMPLES).map(([key, example]) => (
                    <button
                      key={key}
                      onClick={() => handleExampleLoad(key)}
                      className="group flex items-center gap-2 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md transition-all duration-200 text-xs whitespace-nowrap shrink-0"
                      title={example.description}
                    >
                      <span className="text-sm">{example.icon}</span>
                      <span className="font-medium">{example.name}</span>
                    </button>
                  ))}
                  
                  <div className="w-px h-3 bg-gray-600 mx-1 shrink-0"></div>
                  
                  <button
                    onClick={handleFreshStart}
                    className="flex items-center gap-2 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-md transition-all duration-200 text-xs font-medium whitespace-nowrap shrink-0"
                    title="Start with clean template"
                  >
                    <span className="text-sm">✨</span>
                    <span>New Project</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div 
          className={`flex h-full ${
            layout === 'vertical' ? 'flex-col' : 'flex-row'
          }`}
          style={{ height: 'calc(100% - 4rem)' }}
        >
          {/* Code Editor */}
          {layout !== 'output-only' && (
            <div 
              className={`flex flex-col ${layout === 'vertical' ? 'w-full' : ''} bg-gray-850`}
              style={{ 
                width: layout === 'horizontal' ? `${editorWidth}%` : '100%',
                height: layout === 'vertical' ? '50%' : '100%'
              }}
            >
              {/* Enhanced Tabs */}
              <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
                      activeTab === tab.id
                        ? `bg-gray-700 text-white border-blue-500 ${tab.color}`
                        : 'text-gray-400 hover:text-white hover:bg-gray-750 border-transparent'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Enhanced Code Input */}
              <div className="flex-1 relative">
                <textarea
                  value={code[activeTab]}
                  onChange={(e) => setCode(prev => ({ ...prev, [activeTab]: e.target.value }))}
                  className={`w-full h-full p-4 pl-16 font-mono text-sm resize-none outline-none leading-relaxed ${
                    theme === 'dark' 
                      ? 'bg-gray-900 text-gray-100' 
                      : 'bg-white text-gray-800'
                  }`}
                  placeholder={`Enter your ${activeTab.toUpperCase()} code here...\n\nTip: Use Ctrl+Enter to run your code`}
                  spellCheck="false"
                />
                
                {/* Professional Line Numbers */}
                <div className="absolute top-0 left-0 w-14 h-full bg-gray-800 border-r border-gray-700 flex flex-col text-xs text-gray-500 pt-4 overflow-hidden select-none">
                  {code[activeTab].split('\n').map((_, index) => (
                    <div key={index} className="h-5 flex items-center justify-end pr-3 leading-relaxed font-mono">
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Professional Resizer */}
          {layout === 'horizontal' && (
            <div
              ref={resizerRef}
              className="cursor-col-resize hover:bg-blue-500/20 transition-all duration-200 flex items-center justify-center group relative"
              style={{ width: '6px' }}
              onMouseDown={() => {
                isResizing.current = true;
                document.body.style.cursor = 'col-resize';
              }}
            >
              <div className="w-1 h-20 bg-gray-600 group-hover:bg-blue-500 transition-all duration-200 rounded-full"></div>
              <div className="absolute inset-0 -mx-2"></div>
            </div>
          )}

          {/* Enhanced Output */}
          <div 
            className={`border-l border-gray-700 ${layout === 'output-only' ? 'w-full' : ''} bg-white`}
            style={{ 
              width: layout === 'horizontal' ? `${100 - editorWidth}%` : '100%',
              height: layout === 'vertical' ? '50%' : '100%'
            }}
          >
            <div className="bg-gray-800 px-4 py-3 text-white text-sm font-medium flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <span>🖥️</span>
                <span>Live Preview</span>
                {isRunning && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                  />
                )}
              </div>
              
              {layout === 'output-only' && (
                <button
                  onClick={() => setLayout('horizontal')}
                  className="text-xs text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-all duration-200"
                >
                  Show Editor
                </button>
              )}
            </div>
            
            <iframe
              ref={iframeRef}
              className="w-full bg-white"
              style={{ height: 'calc(100% - 3rem)' }}
              title="Code Playground Output"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>

        {/* Professional Footer */}
        <div className="bg-gray-900 px-6 py-2 text-xs text-gray-400 flex items-center justify-between border-t border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span>Ready</span>
            </div>
            <span>💡 Auto-runs on change</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Ctrl+Enter</kbd>
              <span>Run</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Ctrl+F</kbd>
              <span>Fullscreen</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default CodePlayground; 