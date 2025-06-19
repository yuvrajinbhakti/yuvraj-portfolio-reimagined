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
      name: 'Enhanced Mini Game',
      icon: '🎮',
      category: 'Interactive',
      description: 'Advanced game with multiple modes, power-ups, and effects',
      difficulty: 'Advanced',
      tags: ['Game', 'Events', 'Animation', 'Audio'],
      code: {
        html: `<div class="game-container">
  <div class="game-header">
    <h2>🎮 Cosmic Collector</h2>
    <div class="game-stats">
      <div class="stat">Score: <span id="score">0</span></div>
      <div class="stat">High Score: <span id="highScore">0</span></div>
      <div class="stat">Level: <span id="level">1</span></div>
      <div class="stat">Lives: <span id="lives">3</span></div>
    </div>
  </div>
  
  <div class="game-modes">
    <button class="mode-btn active" data-mode="classic">Classic</button>
    <button class="mode-btn" data-mode="speed">Speed Mode</button>
    <button class="mode-btn" data-mode="survival">Survival</button>
  </div>
  
  <div class="game-area" id="gameArea">
    <div class="player" id="player">
      <div class="player-glow"></div>
    </div>
    <div class="power-up-bar">
      <div class="power-up-item" id="shieldPower">🛡️ <span id="shieldTime">0</span></div>
      <div class="power-up-item" id="slowPower">⏱️ <span id="slowTime">0</span></div>
      <div class="power-up-item" id="magnetPower">🧲 <span id="magnetTime">0</span></div>
    </div>
  </div>
  
  <div class="game-controls">
    <button class="control-btn" id="startBtn" onclick="startGame()">🚀 Start Game</button>
    <button class="control-btn" id="pauseBtn" onclick="pauseGame()" disabled>⏸️ Pause</button>
    <button class="control-btn" onclick="resetGame()">🔄 Reset</button>
  </div>
  
  <div class="instructions">
    <p><strong>🎮 How to Play:</strong></p>
    <p><strong>Controls:</strong> Arrow Keys / WASD / Touch & Drag / Mouse Drag</p>
    <p><strong>💡 Tip:</strong> Click on the game area first to focus, then use keyboard controls!</p>
    <p><strong>Collect:</strong> 🟡 Coins (+1) | 💎 Gems (+5) | ⭐ Stars (+10)</p>
    <p><strong>Power-ups:</strong> 🛡️ Shield | ⏱️ Slow Motion | 🧲 Magnet</p>
    <p><strong>Avoid:</strong> 💣 Bombs | ⚡ Lightning</p>
    <p><strong>Shortcuts:</strong> Space/P = Pause</p>
  </div>
  
  <div class="game-over-modal" id="gameOverModal">
    <div class="modal-content">
      <h3>Game Over!</h3>
      <p>Final Score: <span id="finalScore">0</span></p>
      <p id="newHighScore" style="display:none;">🎉 New High Score!</p>
      <button onclick="startGame()">Play Again</button>
      <button onclick="closeModal()">Close</button>
    </div>
  </div>
</div>`,
        css: `.game-container {
  text-align: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.game-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.game-header {
  position: relative;
  z-index: 10;
  margin-bottom: 20px;
}

.game-header h2 {
  font-size: 2.5rem;
  margin: 0 0 15px 0;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.game-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.stat {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  font-weight: bold;
  min-width: 80px;
}

.game-modes {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.mode-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.mode-btn.active {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-color: transparent;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
}

.game-area {
  position: relative;
  width: 500px;
  height: 400px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%);
  margin: 20px auto;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 50px rgba(0, 0, 0, 0.5),
    inset 0 0 50px rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;
}

.game-area:focus {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 
    0 0 50px rgba(0, 0, 0, 0.5),
    inset 0 0 50px rgba(255, 255, 255, 0.1),
    0 0 0 3px rgba(59, 130, 246, 0.3);
}

.game-area:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

.player {
  position: absolute;
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  border-radius: 50%;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.15s ease;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.6);
  z-index: 10;
}

.player-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 0.3; }
}

.power-up-bar {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
}

.power-up-item {
  background: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: none;
}

.power-up-item.active {
  display: block;
  animation: powerUpGlow 0.5s ease;
}

@keyframes powerUpGlow {
  0% { box-shadow: 0 0 0 rgba(255, 255, 255, 0.7); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.7); }
  100% { box-shadow: 0 0 0 rgba(255, 255, 255, 0.7); }
}

.item {
  position: absolute;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fall linear;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.coin {
  width: 25px;
  height: 25px;
  background: radial-gradient(circle, #ffd700, #ffed4e);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
}

.gem {
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #9d4edd, #c77dff);
  box-shadow: 0 0 15px rgba(157, 78, 221, 0.6);
  animation: fall linear, spin 2s linear infinite;
}

.star {
  width: 35px;
  height: 35px;
  background: radial-gradient(circle, #ffd60a, #ffbe0b);
  box-shadow: 0 0 20px rgba(255, 214, 10, 0.8);
  animation: fall linear, twinkle 1s ease-in-out infinite;
}

.bomb {
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #dc2626, #991b1b);
  box-shadow: 0 0 15px rgba(220, 38, 38, 0.6);
  animation: fall linear, shake 0.5s ease-in-out infinite;
}

.lightning {
  width: 25px;
  height: 35px;
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  clip-path: polygon(20% 0%, 40% 20%, 70% 10%, 80% 40%, 100% 30%, 60% 60%, 70% 100%, 40% 70%, 10% 80%, 40% 50%);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
  animation: fall linear, flash 0.3s ease-in-out infinite;
}

.power-up {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  animation: fall linear, float 2s ease-in-out infinite;
}

.shield-power {
  background: radial-gradient(circle, #06b6d4, #0891b2);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.6);
}

.slow-power {
  background: radial-gradient(circle, #8b5cf6, #7c3aed);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
}

.magnet-power {
  background: radial-gradient(circle, #f97316, #ea580c);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.6);
}

@keyframes fall {
  from { top: -50px; }
  to { top: 450px; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes twinkle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
}

.control-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.instructions {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.instructions p {
  margin: 8px 0;
  font-size: 0.9rem;
}

.game-over-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.modal-content h3 {
  margin: 0 0 20px 0;
  font-size: 2rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.modal-content button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  margin: 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-content button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  pointer-events: none;
  animation: particleFloat 1s ease-out forwards;
}

@keyframes particleFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(0);
  }
}

.player.shielded {
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.8);
  border: 3px solid rgba(6, 182, 212, 0.6);
}

.game-area.slow-motion .item {
  animation-duration: 8s !important;
}

@media (max-width: 600px) {
  .game-area {
    width: 90%;
    max-width: 400px;
    height: 300px;
  }
  
  .game-stats {
    gap: 10px;
  }
  
  .stat {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
  
  .control-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}`,
        js: `// Enhanced Mini Game - Cosmic Collector
let gameState = {
  score: 0,
  highScore: localStorage.getItem('cosmicCollectorHighScore') || 0,
  level: 1,
  lives: 3,
  gameRunning: false,
  gamePaused: false,
  mode: 'classic',
  powerUps: {
    shield: 0,
    slowMotion: 0,
    magnet: 0
  }
};

let gameElements = {
  player: null,
  gameArea: null,
  gameInterval: null,
  powerUpIntervals: {}
};

let gameConfig = {
  playerSpeed: 8,
  itemSpeed: 3,
  spawnRate: 1000,
  difficulty: 1
};

// Sound effects (using Web Audio API for better performance)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Initialize game
function initGame() {
  gameElements.player = document.getElementById('player');
  gameElements.gameArea = document.getElementById('gameArea');
  
  updateDisplay();
  setupControls();
  setupModeSelection();
  
  // Make the game area focusable and focus it
  gameElements.gameArea.setAttribute('tabindex', '0');
  gameElements.gameArea.focus();
  
  // Add click to focus functionality
  gameElements.gameArea.addEventListener('click', () => {
    gameElements.gameArea.focus();
  });
  
  // Resume audio context on user interaction
  document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }, { once: true });
}

// Setup game mode selection
function setupModeSelection() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.mode = btn.dataset.mode;
      
      // Update game config based on mode
      switch(gameState.mode) {
        case 'speed':
          gameConfig.itemSpeed = 5;
          gameConfig.spawnRate = 600;
          break;
        case 'survival':
          gameState.lives = 1;
          gameConfig.itemSpeed = 2;
          gameConfig.spawnRate = 1200;
          break;
        default:
          gameConfig.itemSpeed = 3;
          gameState.lives = 3;
      }
      updateDisplay();
    });
  });
}

// Setup controls
function setupControls() {
  let keys = {};
  let playerPosition = 50;
  
  // Add keyboard event listeners to both document and game area
  const handleKeyDown = (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
    
    // Pause game with space or P
    if ((e.key === ' ' || e.key.toLowerCase() === 'p') && gameState.gameRunning) {
      e.preventDefault();
      pauseGame();
    }
  };
  
  const handleKeyUp = (e) => {
    keys[e.key.toLowerCase()] = false;
  };
  
  // Add listeners to both document and game area for better compatibility
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  gameElements.gameArea.addEventListener('keydown', handleKeyDown);
  gameElements.gameArea.addEventListener('keyup', handleKeyUp);
  
  // Smooth movement with better performance
  function updatePlayerPosition() {
    if (!gameState.gameRunning || gameState.gamePaused) {
      requestAnimationFrame(updatePlayerPosition);
      return;
    }
    
    const speed = gameConfig.playerSpeed * 0.5; // Adjust speed for smoother movement
    
    if ((keys['arrowleft'] || keys['a']) && playerPosition > 5) {
      playerPosition -= speed;
    }
    if ((keys['arrowright'] || keys['d']) && playerPosition < 95) {
      playerPosition += speed;
    }
    
    playerPosition = Math.max(5, Math.min(95, playerPosition));
    if (gameElements.player) {
      gameElements.player.style.left = playerPosition + '%';
    }
    
    requestAnimationFrame(updatePlayerPosition);
  }
  
  updatePlayerPosition();
  
  // Enhanced touch controls
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouching = false;
  
  gameElements.gameArea.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isTouching = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    gameElements.gameArea.focus(); // Focus on touch
  });
  
  gameElements.gameArea.addEventListener('touchmove', (e) => {
    if (!gameState.gameRunning || gameState.gamePaused || !isTouching) return;
    e.preventDefault();
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchX - touchStartX;
    const diffY = touchY - touchStartY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 10 && playerPosition < 95) {
        playerPosition += 2;
      } else if (diffX < -10 && playerPosition > 5) {
        playerPosition -= 2;
      }
    }
    
    playerPosition = Math.max(5, Math.min(95, playerPosition));
    if (gameElements.player) {
      gameElements.player.style.left = playerPosition + '%';
    }
    
    touchStartX = touchX;
    touchStartY = touchY;
  });
  
  gameElements.gameArea.addEventListener('touchend', (e) => {
    e.preventDefault();
    isTouching = false;
  });
  
  // Add mouse controls as fallback
  let isMouseDown = false;
  let lastMouseX = 0;
  
  gameElements.gameArea.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    lastMouseX = e.clientX;
    gameElements.gameArea.focus(); // Focus on mouse interaction
  });
  
  gameElements.gameArea.addEventListener('mousemove', (e) => {
    if (!gameState.gameRunning || gameState.gamePaused || !isMouseDown) return;
    
    const diffX = e.clientX - lastMouseX;
    
    if (Math.abs(diffX) > 5) {
      if (diffX > 0 && playerPosition < 95) {
        playerPosition += 1;
      } else if (diffX < 0 && playerPosition > 5) {
        playerPosition -= 1;
      }
    }
    
    playerPosition = Math.max(5, Math.min(95, playerPosition));
    if (gameElements.player) {
      gameElements.player.style.left = playerPosition + '%';
    }
    
    lastMouseX = e.clientX;
  });
  
  document.addEventListener('mouseup', () => {
    isMouseDown = false;
  });
}

// Create game items
function createItem(type) {
  const item = document.createElement('div');
  item.className = \`item \${type}\`;
  
  const gameAreaRect = gameElements.gameArea.getBoundingClientRect();
  const itemSize = type === 'lightning' ? 25 : (type === 'star' || type === 'power-up' ? 35 : 30);
  const maxLeft = gameAreaRect.width - itemSize;
  
  item.style.left = Math.random() * maxLeft + 'px';
  item.style.animationDuration = (gameConfig.itemSpeed + Math.random() * 2) + 's';
  
  // Add appropriate emoji/content
  const content = {
    'coin': '🟡',
    'gem': '💎',
    'star': '⭐',
    'bomb': '💣',
    'lightning': '⚡',
    'shield-power': '🛡️',
    'slow-power': '⏱️',
    'magnet-power': '🧲'
  };
  
  item.textContent = content[type] || '?';
  
  if (type.includes('power')) {
    item.classList.add('power-up');
    item.classList.add(type);
  }
  
  gameElements.gameArea.appendChild(item);
  
  // Magnet effect
  if (gameState.powerUps.magnet > 0 && ['coin', 'gem', 'star'].includes(type)) {
    const magnetInterval = setInterval(() => {
      if (!item.parentNode) {
        clearInterval(magnetInterval);
        return;
      }
      
      const itemRect = item.getBoundingClientRect();
      const playerRect = gameElements.player.getBoundingClientRect();
      const distance = Math.sqrt(
        Math.pow(itemRect.left - playerRect.left, 2) + 
        Math.pow(itemRect.top - playerRect.top, 2)
      );
      
      if (distance < 150) {
        const angle = Math.atan2(playerRect.top - itemRect.top, playerRect.left - itemRect.left);
        const currentLeft = parseFloat(item.style.left);
        const currentTop = parseFloat(item.style.top || 0);
        
        item.style.left = (currentLeft + Math.cos(angle) * 2) + 'px';
        item.style.top = (currentTop + Math.sin(angle) * 2) + 'px';
      }
    }, 50);
  }
  
  // Collision detection
  const checkCollision = setInterval(() => {
    if (!item.parentNode) {
      clearInterval(checkCollision);
      return;
    }
    
    const itemRect = item.getBoundingClientRect();
    const playerRect = gameElements.player.getBoundingClientRect();
    const gameAreaRect = gameElements.gameArea.getBoundingClientRect();
    
    // Check if item hit player
    if (itemRect.bottom >= playerRect.top &&
        itemRect.top <= playerRect.bottom &&
        itemRect.left < playerRect.right &&
        itemRect.right > playerRect.left) {
      
      handleItemCollision(type, item);
      clearInterval(checkCollision);
      return;
    }
    
    // Check if item fell off screen
    if (itemRect.top > gameAreaRect.bottom) {
      item.remove();
      clearInterval(checkCollision);
    }
  }, 16);
  
  // Auto cleanup
  setTimeout(() => {
    if (item.parentNode) {
      item.remove();
      clearInterval(checkCollision);
    }
  }, 10000);
}

// Handle item collision
function handleItemCollision(type, item) {
  const playerRect = gameElements.player.getBoundingClientRect();
  
  switch(type) {
    case 'coin':
      gameState.score += 1;
      playSound(800, 0.1);
      createParticles(playerRect.left, playerRect.top, '#ffd700');
      break;
      
    case 'gem':
      gameState.score += 5;
      playSound(1000, 0.15);
      createParticles(playerRect.left, playerRect.top, '#9d4edd');
      break;
      
    case 'star':
      gameState.score += 10;
      playSound(1200, 0.2);
      createParticles(playerRect.left, playerRect.top, '#ffd60a');
      break;
      
    case 'bomb':
      if (gameState.powerUps.shield > 0) {
        playSound(400, 0.3, 'square');
        createParticles(playerRect.left, playerRect.top, '#06b6d4');
      } else {
        gameState.lives--;
        playSound(200, 0.5, 'sawtooth');
        createParticles(playerRect.left, playerRect.top, '#dc2626');
        flashScreen('#dc2626');
        
        if (gameState.lives <= 0) {
          endGame();
          return;
        }
      }
      break;
      
    case 'lightning':
      if (gameState.powerUps.shield > 0) {
        playSound(400, 0.3, 'square');
        createParticles(playerRect.left, playerRect.top, '#06b6d4');
      } else {
        gameState.lives--;
        playSound(150, 0.7, 'sawtooth');
        createParticles(playerRect.left, playerRect.top, '#fbbf24');
        flashScreen('#fbbf24');
        
        if (gameState.lives <= 0) {
          endGame();
          return;
        }
      }
      break;
      
    case 'shield-power':
      gameState.powerUps.shield = 10;
      gameElements.player.classList.add('shielded');
      activatePowerUp('shield');
      playSound(600, 0.3, 'triangle');
      break;
      
    case 'slow-power':
      gameState.powerUps.slowMotion = 8;
      gameElements.gameArea.classList.add('slow-motion');
      activatePowerUp('slow');
      playSound(500, 0.3, 'triangle');
      break;
      
    case 'magnet-power':
      gameState.powerUps.magnet = 12;
      activatePowerUp('magnet');
      playSound(700, 0.3, 'triangle');
      break;
  }
  
  item.remove();
  updateDisplay();
  
  // Level progression
  if (gameState.score > 0 && gameState.score % 50 === 0) {
    levelUp();
  }
}

// Activate power-up display
function activatePowerUp(type) {
  const powerUpElement = document.getElementById(type + 'Power');
  powerUpElement.classList.add('active');
  
  // Clear existing interval
  if (gameElements.powerUpIntervals[type]) {
    clearInterval(gameElements.powerUpIntervals[type]);
  }
  
  // Update timer
  gameElements.powerUpIntervals[type] = setInterval(() => {
    const timeSpan = powerUpElement.querySelector('span');
    const timeLeft = gameState.powerUps[type === 'slow' ? 'slowMotion' : type];
    
    if (timeLeft > 0) {
      timeSpan.textContent = timeLeft;
      gameState.powerUps[type === 'slow' ? 'slowMotion' : type]--;
    } else {
      // Deactivate power-up
      powerUpElement.classList.remove('active');
      clearInterval(gameElements.powerUpIntervals[type]);
      
      if (type === 'shield') {
        gameElements.player.classList.remove('shielded');
      } else if (type === 'slow') {
        gameElements.gameArea.classList.remove('slow-motion');
      }
    }
  }, 1000);
}

// Create particle effects
function createParticles(x, y, color) {
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.background = color;
    particle.style.left = x + Math.random() * 40 - 20 + 'px';
    particle.style.top = y + Math.random() * 40 - 20 + 'px';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.remove();
      }
    }, 1000);
  }
}

// Flash screen effect
function flashScreen(color) {
  const flash = document.createElement('div');
  flash.style.cssText = \`
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: \${color}; opacity: 0.3; pointer-events: none;
    z-index: 9999; animation: flashFade 0.3s ease-out;
  \`;
  
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes flashFade {
      0% { opacity: 0.5; }
      100% { opacity: 0; }
    }
  \`;
  document.head.appendChild(style);
  
  document.body.appendChild(flash);
  setTimeout(() => {
    flash.remove();
    style.remove();
  }, 300);
}

// Level up
function levelUp() {
  gameState.level++;
  gameConfig.difficulty += 0.2;
  gameConfig.spawnRate = Math.max(400, gameConfig.spawnRate - 50);
  
  playSound(1500, 0.5);
  flashScreen('#4ecdc4');
  
  // Restart game loop with new difficulty
  if (gameElements.gameInterval) {
    clearInterval(gameElements.gameInterval);
    startGameLoop();
  }
}

// Game loop
function startGameLoop() {
  gameElements.gameInterval = setInterval(() => {
    if (gameState.gamePaused) return;
    
    const rand = Math.random();
    let itemType;
    
    // Item spawn probabilities based on difficulty and mode
    if (rand < 0.4) {
      itemType = 'coin';
    } else if (rand < 0.6) {
      itemType = 'gem';
    } else if (rand < 0.7) {
      itemType = 'star';
    } else if (rand < 0.8) {
      itemType = Math.random() < 0.5 ? 'bomb' : 'lightning';
    } else {
      const powerUps = ['shield-power', 'slow-power', 'magnet-power'];
      itemType = powerUps[Math.floor(Math.random() * powerUps.length)];
    }
    
    createItem(itemType);
  }, gameConfig.spawnRate);
}

// Start game
function startGame() {
  if (gameState.gameRunning) {
    resetGame();
  }
  
  gameState.gameRunning = true;
  gameState.gamePaused = false;
  gameState.score = 0;
  gameState.level = 1;
  gameState.lives = gameState.mode === 'survival' ? 1 : 3;
  gameState.powerUps = { shield: 0, slowMotion: 0, magnet: 0 };
  
  // Reset game config
  gameConfig.difficulty = 1;
  gameConfig.spawnRate = gameState.mode === 'speed' ? 600 : (gameState.mode === 'survival' ? 1200 : 1000);
  gameConfig.itemSpeed = gameState.mode === 'speed' ? 5 : (gameState.mode === 'survival' ? 2 : 3);
  
  document.getElementById('startBtn').disabled = true;
  document.getElementById('pauseBtn').disabled = false;
  document.getElementById('gameOverModal').style.display = 'none';
  
  // Clear existing items
  document.querySelectorAll('.item').forEach(item => item.remove());
  
  // Reset player position
  gameElements.player.style.left = '50%';
  gameElements.player.classList.remove('shielded');
  gameElements.gameArea.classList.remove('slow-motion');
  
  // Focus the game area for keyboard input
  gameElements.gameArea.focus();
  
  // Hide power-up displays
  document.querySelectorAll('.power-up-item').forEach(item => {
    item.classList.remove('active');
  });
  
  updateDisplay();
  startGameLoop();
  
  playSound(800, 0.3);
}

// Pause game
function pauseGame() {
  if (!gameState.gameRunning) return;
  
  gameState.gamePaused = !gameState.gamePaused;
  const pauseBtn = document.getElementById('pauseBtn');
  
  if (gameState.gamePaused) {
    pauseBtn.textContent = '▶️ Resume';
    // Pause all animations
    document.querySelectorAll('.item').forEach(item => {
      item.style.animationPlayState = 'paused';
    });
  } else {
    pauseBtn.textContent = '⏸️ Pause';
    // Resume all animations
    document.querySelectorAll('.item').forEach(item => {
      item.style.animationPlayState = 'running';
    });
    // Refocus the game area
    gameElements.gameArea.focus();
  }
}

// Reset game
function resetGame() {
  gameState.gameRunning = false;
  gameState.gamePaused = false;
  
  if (gameElements.gameInterval) {
    clearInterval(gameElements.gameInterval);
  }
  
  // Clear all power-up intervals
  Object.values(gameElements.powerUpIntervals).forEach(interval => {
    clearInterval(interval);
  });
  gameElements.powerUpIntervals = {};
  
  // Clear items
  document.querySelectorAll('.item').forEach(item => item.remove());
  
  // Reset UI
  document.getElementById('startBtn').disabled = false;
  document.getElementById('pauseBtn').disabled = true;
  document.getElementById('pauseBtn').textContent = '⏸️ Pause';
  document.getElementById('gameOverModal').style.display = 'none';
  
  // Reset player
  gameElements.player.style.left = '50%';
  gameElements.player.classList.remove('shielded');
  gameElements.gameArea.classList.remove('slow-motion');
  
  // Hide power-up displays
  document.querySelectorAll('.power-up-item').forEach(item => {
    item.classList.remove('active');
  });
  
  gameState.score = 0;
  gameState.level = 1;
  gameState.lives = 3;
  gameState.powerUps = { shield: 0, slowMotion: 0, magnet: 0 };
  
  updateDisplay();
}

// End game
function endGame() {
  gameState.gameRunning = false;
  
  if (gameElements.gameInterval) {
    clearInterval(gameElements.gameInterval);
  }
  
  // Clear all power-up intervals
  Object.values(gameElements.powerUpIntervals).forEach(interval => {
    clearInterval(interval);
  });
  
  // Check for high score
  let newHighScore = false;
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem('cosmicCollectorHighScore', gameState.highScore);
    newHighScore = true;
  }
  
  // Show game over modal
  document.getElementById('finalScore').textContent = gameState.score;
  document.getElementById('newHighScore').style.display = newHighScore ? 'block' : 'none';
  document.getElementById('gameOverModal').style.display = 'flex';
  
  // Reset UI
  document.getElementById('startBtn').disabled = false;
  document.getElementById('pauseBtn').disabled = true;
  
  updateDisplay();
  playSound(300, 1, 'sawtooth');
}

// Close modal
function closeModal() {
  document.getElementById('gameOverModal').style.display = 'none';
}

// Update display
function updateDisplay() {
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('highScore').textContent = gameState.highScore;
  document.getElementById('level').textContent = gameState.level;
  document.getElementById('lives').textContent = gameState.lives;
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
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