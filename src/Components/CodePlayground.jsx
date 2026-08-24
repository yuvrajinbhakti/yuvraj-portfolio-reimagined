import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
// Examples live in their own module — a 1,500-line object of template
// literals is content, not component logic.
import { EXAMPLES, BLANK_PROJECT } from '../constants/playgroundExamples';

const CodePlayground = () => {
  const [activeTab, setActiveTab] = useState('html');
  // Opens on the Operational Transform demo rather than a Hello World. It is
  // the most interesting thing in here and there is no reason to make anyone
  // click to find it.
  const [code, setCode] = useState(EXAMPLES['operational-transform'].code);

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

  const LAYOUT_OPTIONS = [
    { value: 'horizontal', icon: '⬌', label: 'Side by Side', shortcut: 'H' },
    { value: 'vertical', icon: '⬍', label: 'Top & Bottom', shortcut: 'V' },
    { value: 'output-only', icon: '', label: 'Preview Only', shortcut: 'P' }
  ];

  const TABS = [
    { id: 'html', name: 'HTML', icon: '', color: 'text-orange-400' },
    { id: 'css', name: 'CSS', icon: '', color: 'text-blue-400' },
    { id: 'js', name: 'JavaScript', icon: '', color: 'text-yellow-400' }
  ];

  // Professional event handlers
  const handleExampleLoad = useCallback((exampleKey) => {
    const example = EXAMPLES[exampleKey];
    if (example) {
      setCode(example.code);
    }
  }, []);

  const handleFreshStart = useCallback(() => {
    setCode(BLANK_PROJECT);
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
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg min-w-[70px]"
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
                    className={`min-w-[28px] min-h-[28px] inline-flex items-center justify-center p-1.5 text-xs rounded transition-all duration-200 ${
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
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200"
                  title="Toggle editor theme"
                  aria-label={theme === 'dark' ? 'Switch editor to light theme' : 'Switch editor to dark theme'}
                >
                  {theme === 'dark' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <circle cx="12" cy="12" r="4" />
                      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="min-w-[28px] min-h-[28px] inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-all duration-200"
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
                    className="w-16 h-6 py-2.5 bg-clip-content bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
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
                    className="flex items-center gap-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all duration-200 text-xs font-medium whitespace-nowrap shrink-0"
                    title="Start with clean template"
                  >
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
            className={`border-l border-white/10 ${layout === 'output-only' ? 'w-full' : ''} bg-[#0b1020]`}
            style={{ 
              width: layout === 'horizontal' ? `${100 - editorWidth}%` : '100%',
              height: layout === 'vertical' ? '50%' : '100%'
            }}
          >
            <div className="bg-white/5 px-4 py-3 text-white text-sm font-medium flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
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
            <span>Auto-runs on change</span>
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