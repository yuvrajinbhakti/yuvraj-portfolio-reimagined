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
  
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // Voice commands mapping
  const commands = {
    // Navigation commands
    'go home': () => navigate('/'),
    'go to home': () => navigate('/'),
    'home page': () => navigate('/'),
    'navigate home': () => navigate('/'),
    
    'go to about': () => navigate('/about'),
    'about page': () => navigate('/about'),
    'show about': () => navigate('/about'),
    'navigate to about': () => navigate('/about'),
    
    'go to projects': () => navigate('/projects'),
    'projects page': () => navigate('/projects'),
    'show projects': () => navigate('/projects'),
    'my projects': () => navigate('/projects'),
    'portfolio projects': () => navigate('/projects'),
    
    'go to contact': () => navigate('/contact'),
    'contact page': () => navigate('/contact'),
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
      const musicButton = document.querySelector('[aria-label*="music"], [aria-label*="audio"]');
      if (musicButton) musicButton.click();
    },
    'stop music': () => {
      const musicButton = document.querySelector('[aria-label*="music"], [aria-label*="audio"]');
      if (musicButton) musicButton.click();
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
      setShowFeedback(true);
      setLastCommand('Available commands: go home, go to about, go to projects, go to contact, scroll up, scroll down, play music, help');
      setTimeout(() => setShowFeedback(false), 5000);
    },
    'what can i say': () => {
      setShowFeedback(true);
      setLastCommand('Try saying: "go home", "show projects", "scroll down", "contact me", or "help"');
      setTimeout(() => setShowFeedback(false), 5000);
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
          setLastCommand('Microphone access denied. Please allow microphone access to use voice navigation.');
          setShowFeedback(true);
          setTimeout(() => setShowFeedback(false), 3000);
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
      setLastCommand(`Executing: "${matchedCommand}"`);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      
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
      setLastCommand(`Command not recognized: "${command}". Try saying "help" for available commands.`);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
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
            <div className="bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg border border-white/20 shadow-xl">
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
              
              <div className="text-xs text-gray-400 mt-2">
                Try: &ldquo;go home&rdquo;, &ldquo;show projects&rdquo;, &ldquo;scroll down&rdquo;
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
            onClick={() => setShowFeedback(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Voice Navigation Commands
              </h3>
              
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <strong>Navigation:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• &ldquo;go home&rdquo; or &ldquo;home page&rdquo;</li>
                    <li>• &ldquo;go to about&rdquo; or &ldquo;about page&rdquo;</li>
                    <li>• &ldquo;show projects&rdquo; or &ldquo;my projects&rdquo;</li>
                    <li>• &ldquo;contact me&rdquo; or &ldquo;get in touch&rdquo;</li>
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
                  </ul>
                </div>
              </div>
              
              <button
                onClick={() => setShowFeedback(false)}
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