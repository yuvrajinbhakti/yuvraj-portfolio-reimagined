import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const VoiceNavigation = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  // Voice commands mapping
  const commands = {
    // Navigation commands - HOME
    'go home': () => navigate('/'),
    'go to home': () => navigate('/'),
    'home page': () => navigate('/'),
    'show home': () => navigate('/'),
    'navigate to home': () => navigate('/'),
    'home': () => navigate('/'),
    
    // Navigation commands - ABOUT
    'go about': () => navigate('/about'),
    'go to about': () => navigate('/about'),
    'about page': () => navigate('/about'),
    'show about': () => navigate('/about'),
    'navigate to about': () => navigate('/about'),
    'about': () => navigate('/about'),
    
    // Navigation commands - PROJECTS
    'go projects': () => navigate('/projects'),
    'go to projects': () => navigate('/projects'),
    'projects page': () => navigate('/projects'),
    'show projects': () => navigate('/projects'),
    'navigate to projects': () => navigate('/projects'),
    'projects': () => navigate('/projects'),
    'my projects': () => navigate('/projects'),
    'portfolio projects': () => navigate('/projects'),
    
    // Navigation commands - PLAYGROUND
    'go playground': () => navigate('/playground'),
    'go to playground': () => navigate('/playground'),
    'playground page': () => navigate('/playground'),
    'show playground': () => navigate('/playground'),
    'navigate to playground': () => navigate('/playground'),
    'playground': () => navigate('/playground'),
    'interactive playground': () => navigate('/playground'),
    'code playground': () => navigate('/playground'),
    
    // Navigation commands - CONTACT
    'go contact': () => navigate('/contact'),
    'go to contact': () => navigate('/contact'),
    'contact page': () => navigate('/contact'),
    'show contact': () => navigate('/contact'),
    'navigate to contact': () => navigate('/contact'),
    'contact': () => navigate('/contact'),
    'contact me': () => navigate('/contact'),
    'get in touch': () => navigate('/contact'),
    
    // Scroll commands
    'scroll up': () => window.scrollBy({ top: -300, behavior: 'smooth' }),
    'scroll down': () => window.scrollBy({ top: 300, behavior: 'smooth' }),
    'scroll to top': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    'go to top': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    'scroll to bottom': () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
    
    // Interaction commands
    'play music': () => {
      const musicButton = document.querySelector('[aria-label="Play music"]');
      if (musicButton) {
        musicButton.click();
      } else {
        // If already playing, don't do anything
        console.log('Music is already playing');
      }
    },
    'stop music': () => {
      const musicButton = document.querySelector('[aria-label="Mute"]');
      if (musicButton) {
        musicButton.click();
      } else {
        // If already stopped, don't do anything
        console.log('Music is already stopped');
      }
    },
    'toggle music': () => {
      // This will always work regardless of state
      const musicButton = document.querySelector('[aria-label="Play music"], [aria-label="Mute"]');
      if (musicButton) {
        musicButton.click();
      } else {
        // Fallback: try to find any music-related button
        const fallbackButton = document.querySelector('button[aria-label*="music"], button[aria-label*="sound"], button[aria-label*="audio"]');
        if (fallbackButton) fallbackButton.click();
      }
    },
    
    // Accessibility commands
    'increase text size': () => {
      document.body.style.fontSize = (parseFloat(getComputedStyle(document.body).fontSize) * 1.1) + 'px';
    },
    'decrease text size': () => {
      document.body.style.fontSize = (parseFloat(getComputedStyle(document.body).fontSize) * 0.9) + 'px';
    },
    'reset text size': () => {
      document.body.style.fontSize = '';
    },
    
    // Help command
    'help': () => {
      showFeedbackWithTimer('Available commands: go home, go about, go projects, go playground, go contact, scroll up, scroll down, play music, stop music, toggle music, help');
    },
    'what can i say': () => {
      showFeedbackWithTimer('Try saying: "go home", "go about", "go projects", "go playground", "go contact", "play music", "stop music", or "help"');
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          processCommand(finalTranscript.toLowerCase().trim());
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          showFeedbackWithTimer('Microphone access denied. Please allow microphone access to use voice navigation.');
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setTranscript('');
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Process voice command
  const processCommand = (command) => {
    console.log('Processing command:', command);
    
    // Find matching command
    const matchedCommand = Object.keys(commands).find(cmd => 
      command.includes(cmd) || 
      cmd.split(' ').every(word => command.includes(word))
    );
    
    if (matchedCommand) {
      showFeedbackWithTimer(`Executing: "${matchedCommand}"`);
      
      // Execute command
      commands[matchedCommand]();
      
      // Provide audio feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Navigating to ${matchedCommand.replace('go to ', '').replace('go ', '')}`);
        utterance.volume = 0.3;
        utterance.rate = 1.2;
        speechSynthesis.speak(utterance);
      }
    } else {
      showFeedbackWithTimer(`Command not recognized: "${command}". Try saying "help" for available commands.`);
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // Keyboard shortcut to activate voice navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Shift + V to toggle voice navigation
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        toggleListening();
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isListening]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Helper function to show feedback with timer
  const showFeedbackWithTimer = (message, duration = 15000) => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setLastCommand(message);
    setShowFeedback(true);
    setTimeRemaining(duration);
    
    // Update timer every second
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    
    // Hide feedback after duration
    timeoutRef.current = setTimeout(() => {
      setShowFeedback(false);
      setTimeRemaining(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }, duration);
  };

  // Helper function to hide feedback
  const hideFeedback = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowFeedback(false);
    setTimeRemaining(0);
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <>
      {/* Voice Navigation Button */}
      <motion.button
        onClick={toggleListening}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isListening ? 'Stop Voice Navigation (Ctrl+Shift+V)' : 'Start Voice Navigation (Ctrl+Shift+V)'}
        aria-label={isListening ? 'Stop voice navigation' : 'Start voice navigation'}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🎤
          </motion.div>
        ) : (
          '🎙️'
        )}
      </motion.button>

      {/* Voice Feedback Overlay */}
      <AnimatePresence>
        {(isListening || showFeedback) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 max-w-sm"
          >
            <div className="bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg border border-white/20 shadow-xl relative">
              {isListening && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    <span className="text-sm font-medium">Listening...</span>
                  </div>
                  
                  {transcript && (
                    <div className="text-sm text-gray-300 mb-2">
                      &ldquo;{transcript}&rdquo;
                    </div>
                  )}
                  
                  {confidence > 0 && (
                    <div className="text-xs text-gray-400">
                      Confidence: {Math.round(confidence * 100)}%
                    </div>
                  )}
                </div>
              )}
              
              {showFeedback && lastCommand && (
                <div className="text-sm text-green-400">
                  {lastCommand}
                </div>
              )}
              
              {/* Progress Bar */}
              {showFeedback && timeRemaining > 0 && (
                <div className="mt-3 mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Auto-close in {Math.ceil(timeRemaining / 1000)}s</span>
                    <span>{Math.ceil((timeRemaining / 15000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <motion.div
                      className="bg-blue-500 h-1 rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeRemaining / 15000) * 100}%` }}
                      transition={{ duration: 0.5, ease: "linear" }}
                    />
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-400 mt-2">
                Try: &ldquo;go home&rdquo;, &ldquo;go projects&rdquo;, &ldquo;go playground&rdquo;, &ldquo;play music&rdquo;
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showFeedback && lastCommand.includes('Available commands') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={hideFeedback}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Voice Navigation Commands
                </h3>
                <button
                  onClick={hideFeedback}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                  title="Close help"
                  aria-label="Close help"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                    <strong>💡 Tip:</strong> Multiple patterns work for each page!
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Try: &ldquo;go [page]&rdquo;, &ldquo;go to [page]&rdquo;, &ldquo;show [page]&rdquo;, &ldquo;[page] page&rdquo;, or just &ldquo;[page]&rdquo;
                  </p>
                </div>
                
                <div>
                  <strong>Navigation:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• &ldquo;go home&rdquo; or &ldquo;home&rdquo;</li>
                    <li>• &ldquo;go about&rdquo; or &ldquo;about&rdquo;</li>
                    <li>• &ldquo;go projects&rdquo; or &ldquo;projects&rdquo;</li>
                    <li>• &ldquo;go playground&rdquo; or &ldquo;playground&rdquo;</li>
                    <li>• &ldquo;go contact&rdquo; or &ldquo;contact&rdquo;</li>
                  </ul>
                </div>
                
                <div>
                  <strong>Scrolling:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• &ldquo;scroll up&rdquo; or &ldquo;scroll down&rdquo;</li>
                    <li>• &ldquo;go to top&rdquo; or &ldquo;scroll to bottom&rdquo;</li>
                  </ul>
                </div>
                
                <div>
                  <strong>Accessibility:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• &ldquo;increase text size&rdquo;</li>
                    <li>• &ldquo;decrease text size&rdquo;</li>
                    <li>• &ldquo;play music&rdquo; or &ldquo;stop music&rdquo;</li>
                    <li>• &ldquo;toggle music&rdquo;</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={hideFeedback}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceNavigation; 