import { useRef, useState, useEffect } from 'react';

// Main Hero Animation component
const HeroAnimation = () => {
  const containerRef = useRef();
  const [canInteract, setCanInteract] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCanInteract(true);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-transparent"
      style={{ 
        position: 'absolute', 
        zIndex: 10, 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0
      }}
    >
      {/* Canvas component removed to prevent rendering of three.js canvas */}
      
      {/* Instruction overlay */}
      {canInteract && (
        <div className="absolute bottom-5 left-5 text-white/50 text-xs bg-black/20 backdrop-blur-sm p-2 rounded-md pointer-events-none">
          3D model interaction removed
        </div>
      )}
    </div>
  );
};

export default HeroAnimation; 