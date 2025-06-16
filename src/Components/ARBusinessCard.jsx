import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ARBusinessCard = () => {
  const [showCard, setShowCard] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef(null);

  // Generate QR Code for AR experience
  const generateQRCode = async () => {
    setIsGenerating(true);
    
    // Simple QR code generation using canvas
    // In a real implementation, you'd use a QR code library like qrcode.js
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Create a simple pattern (placeholder for actual QR code)
    ctx.fillStyle = '#000000';
    const moduleSize = size / 25;
    
    // Generate a pattern that looks like a QR code
    const pattern = [
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
      [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1],
      [0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0],
      [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1],
      [0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0],
      [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1],
      [0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,1,0,1,0,1,0],
      [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,1,1,0,1,0,0,1,0,1,0,0,0,1,0,1,0,1,0],
      [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,1,0,1,0,0,0,1,0,1,0,1,0],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]
    ];
    
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Add corner markers
    const drawCornerMarker = (x, y) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3);
    };
    
    drawCornerMarker(0, 0);
    drawCornerMarker(size - moduleSize * 7, 0);
    drawCornerMarker(0, size - moduleSize * 7);
    
    const dataURL = canvas.toDataURL();
    setQrCode(dataURL);
    setIsGenerating(false);
  };

  // AR Experience URL (would be your actual AR experience)
  const arExperienceUrl = `${window.location.origin}/ar-experience?portfolio=yuvraj`;

  useEffect(() => {
    if (showCard && !qrCode) {
      generateQRCode();
    }
  }, [showCard, qrCode, arExperienceUrl]);

  // Business card data
  const cardData = {
    name: "Yuvraj Singh Nain",
    title: "Frontend Engineering Intern",
    company: "Razorpay",
    email: "yuvraj@example.com",
    phone: "+91 XXXXX XXXXX",
    website: "yuvraj-portfolio.vercel.app",
    linkedin: "linkedin.com/in/yuvraj-singh-nain",
    github: "github.com/yuvraj-singh-nain"
  };

  const downloadCard = () => {
    // Create a downloadable business card
    const cardCanvas = document.createElement('canvas');
    const ctx = cardCanvas.getContext('2d');
    
    // Business card dimensions (standard: 3.5" x 2" at 300 DPI)
    const width = 1050;
    const height = 600;
    cardCanvas.width = width;
    cardCanvas.height = height;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some geometric shapes for design
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, 100, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.8, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // Text styling
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    
    // Name
    ctx.font = 'bold 48px Arial';
    ctx.fillText(cardData.name, 50, 100);
    
    // Title
    ctx.font = '28px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(cardData.title, 50, 140);
    
    // Company
    ctx.font = '24px Arial';
    ctx.fillText(`@ ${cardData.company}`, 50, 170);
    
    // Contact info
    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`📧 ${cardData.email}`, 50, 220);
    ctx.fillText(`🌐 ${cardData.website}`, 50, 250);
    ctx.fillText(`💼 ${cardData.linkedin}`, 50, 280);
    ctx.fillText(`💻 ${cardData.github}`, 50, 310);
    
    // QR Code
    if (qrCode) {
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, width - 220, height - 220, 200, 200);
        
        // QR Code label
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Scan for AR Experience', width - 120, height - 30);
        
        // Download the card
        const link = document.createElement('a');
        link.download = 'yuvraj-ar-business-card.png';
        link.href = cardCanvas.toDataURL();
        link.click();
      };
      qrImg.src = qrCode;
    }
  };

  return (
    <>
      {/* AR Business Card Trigger Button */}
      <motion.button
        onClick={() => setShowCard(true)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-lg transition-all duration-300"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        title="View AR Business Card"
        aria-label="Open AR business card"
      >
        <motion.div
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          📱
        </motion.div>
      </motion.button>

      {/* AR Business Card Modal */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCard(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl shadow-2xl max-w-4xl mx-4 border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Business Card Preview */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-3xl">🎴</span>
                    AR Business Card
                  </h2>
                  
                  {/* Card Design */}
                  <motion.div
                    className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-xl shadow-xl text-white overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    style={{ aspectRatio: '1.75/1', minHeight: '300px' }}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full"></div>
                      <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full opacity-50"></div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{cardData.name}</h3>
                        <p className="text-lg opacity-90 mb-1">{cardData.title}</p>
                        <p className="text-base opacity-80">@ {cardData.company}</p>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <span>📧</span> {cardData.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <span>🌐</span> {cardData.website}
                        </p>
                        <p className="flex items-center gap-2">
                          <span>💼</span> LinkedIn Profile
                        </p>
                        <p className="flex items-center gap-2">
                          <span>💻</span> GitHub Profile
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* QR Code Section */}
                <div className="flex-1 flex flex-col items-center">
                  <h3 className="text-xl font-semibold text-white mb-4 text-center">
                    Scan for AR Experience
                  </h3>
                  
                  <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                    {isGenerating ? (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                        />
                      </div>
                    ) : qrCode ? (
                      <img 
                        src={qrCode} 
                        alt="QR Code for AR Experience" 
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                        QR Code
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-300 text-center text-sm mb-6 max-w-xs">
                    Point your phone camera at this QR code to experience my portfolio in Augmented Reality!
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <motion.button
                      onClick={downloadCard}
                      className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>💾</span>
                      Download Business Card
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        navigator.clipboard.writeText(arExperienceUrl);
                        alert('AR Experience URL copied to clipboard!');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>🔗</span>
                      Copy AR Link
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setShowCard(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                <h4 className="text-white font-semibold mb-2">How to use AR Experience:</h4>
                <ol className="text-gray-300 text-sm space-y-1">
                  <li>1. Open your phone&apos;s camera app</li>
                  <li>2. Point it at the QR code above</li>
                  <li>3. Tap the notification to open the AR experience</li>
                  <li>4. Allow camera permissions when prompted</li>
                  <li>5. Enjoy the interactive 3D portfolio!</li>
                </ol>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden canvas for QR code generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
};

export default ARBusinessCard; 