import React, { useRef, useState, useEffect } from 'react';

const GlassCard = ({ 
  children, 
  className = '', 
  glareEffect = true,
  tiltEffect = true,
  hoverScale = true,
  gradientBorder = true,
  maxTilt = 5,
  glareOpacity = 0.15,
  transitionDuration = 300,
  style = {} 
}) => {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!tiltEffect && !glareEffect) return;
    
    const card = cardRef.current;
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate mouse position relative to card center (-1 to 1)
    const relativeX = (mouseX - centerX) / (rect.width / 2);
    const relativeY = (mouseY - centerY) / (rect.height / 2);
    
    // Update tilt
    if (tiltEffect) {
      setPosition({
        x: relativeY * -maxTilt, // Reversed for correct tilt direction
        y: relativeX * maxTilt
      });
    }
    
    // Update glare position
    if (glareEffect) {
      // Convert from -1:1 to 0:100 range for background position
      const glareX = ((relativeX + 1) / 2) * 100;
      const glareY = ((relativeY + 1) / 2) * 100;
      
      setGlarePosition({ x: glareX, y: glareY });
    }
  };
  
  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
    setGlarePosition({ x: 50, y: 50 });
  };
  
  // Generate border gradient
  const borderGradient = gradientBorder ? {
    borderImage: 'linear-gradient(45deg, rgba(74, 144, 226, 0.3), rgba(138, 43, 226, 0.3)) 1',
    borderStyle: 'solid',
    borderWidth: '1px',
  } : {};
  
  return (
    <div
      ref={cardRef}
      className={`
        relative overflow-hidden rounded-xl
        ${hoverScale ? 'hover:scale-105' : ''}
        ${className}
      `}
      style={{
        transform: `perspective(1000px) rotateX(${position.x}deg) rotateY(${position.y}deg) ${isHovered && hoverScale ? 'scale(1.03)' : 'scale(1)'}`,
        transition: `transform ${isHovered ? '0' : transitionDuration}ms ease-out`,
        background: 'rgba(10, 15, 30, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        ...borderGradient,
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glare effect */}
      {glareEffect && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glareOpacity}), transparent 80%)`,
          }}
        />
      )}
      
      {/* Card content */}
      <div className="relative z-20">
        {children}
      </div>
      
      {/* Subtle inner border */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      />
    </div>
  );
};

export default GlassCard; 