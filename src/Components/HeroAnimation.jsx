import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Float, PresentationControls, ContactShadows, useProgress, Html, Stars } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';

// Loading component
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 border-4 border-t-blue-500 border-opacity-20 rounded-full animate-spin mb-4"></div>
        <div className="text-white text-xl">{progress.toFixed(0)}%</div>
      </div>
    </Html>
  );
};

// Custom particle system
const Particles = ({ count = 2000 }) => {
  const mesh = useRef();
  const [positions, setPositions] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const positions = [];
    const sizes = [];
    const colors = [];
    const color1 = new THREE.Color('#4169e1'); // Royal Blue
    const color2 = new THREE.Color('#8a2be2'); // Blue Violet

    for (let i = 0; i < count; i++) {
      // Random positions in a spherical pattern
      const radius = 10 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);
      
      // Random sizes
      sizes.push(Math.random() * 1.5);
      
      // Gradient colors between blue and purple
      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors.push(mixedColor.r, mixedColor.g, mixedColor.b);
    }

    setPositions(positions);
    setSizes(sizes);
    setColors(colors);
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.x = time * 0.05;
    mesh.current.rotation.y = time * 0.05;
  });

  if (positions.length === 0) return null;

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={new Float32Array(positions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={new Float32Array(sizes)}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={new Float32Array(colors)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Floating computer model
const ComputerModel = ({ scale = 0.75, position = [0, -1, 0] }) => {
  const computer = useRef();
  const { scene } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf');
  
  useEffect(() => {
    if (computer.current) {
      // Initial animation
      gsap.to(computer.current.rotation, {
        y: computer.current.rotation.y - Math.PI * 2,
        duration: 2,
        ease: "power2.inOut"
      });
      
      // Create a continuous animation
      const timeline = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: { duration: 4, ease: "power1.inOut" }
      });
      
      timeline
        .to(computer.current.rotation, { y: computer.current.rotation.y + Math.PI * 0.2 })
        .to(computer.current.rotation, { x: computer.current.rotation.x + 0.1 }, "<");
    }
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (computer.current) {
      // Gentle floating animation
      computer.current.position.y = position[1] + Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group ref={computer} position={position} scale={scale}>
      <primitive object={scene} rotation={[0, Math.PI * 0.75, 0]} />
    </group>
  );
};

// Energy field effect
const EnergyField = ({ position = [0, 0, 0], size = 3, color = '#4169e1' }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.scale.x = 1 + Math.sin(t) * 0.05;
      mesh.current.scale.y = 1 + Math.cos(t * 0.7) * 0.05;
      mesh.current.scale.z = 1 + Math.sin(t * 0.5) * 0.05;
      mesh.current.rotation.y = t * 0.1;
    }
  });
  
  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.08} 
        roughness={0.2}
        metalness={0.8}
        envMapIntensity={1.5}
      />
    </mesh>
  );
};

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
      <Canvas 
        shadows
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ 
          preserveDrawingBuffer: true, 
          antialias: true, 
          alpha: true,
          clearColor: [0, 0, 0, 0] 
        }}
        style={{ 
          background: 'transparent', 
          width: '100%', 
          height: '100%'
        }}
        className={canInteract ? "" : "pointer-events-none"}
      >
        <color attach="background" args={['transparent']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Interactive controls */}
        <PresentationControls
          global
          rotation={[0.13, 0.1, 0]}
          polar={[-0.4, 0.2]}
          azimuth={[-1, 0.75]}
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 400 }}
          enabled={canInteract}
        >
          <Float rotationIntensity={0.4} floatIntensity={0.6} speed={1.5}>
            <ComputerModel scale={[0.8, 0.8, 0.8]} position={[0, -1, 0]} />
            <EnergyField position={[0, -1, 0]} size={4} color="#4169e1" />
          </Float>
        </PresentationControls>
        
        {/* Particle effects */}
        <Particles count={2000} />
        
        {/* Add stars to the background */}
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1}
        />
        
        <ContactShadows 
          position={[0, -2, 0]} 
          opacity={0.4} 
          scale={5} 
          blur={2.4} 
        />
        
        <Environment preset="night" />
      </Canvas>
      
      {/* Instruction overlay */}
      {canInteract && (
        <div className="absolute bottom-5 left-5 text-white/50 text-xs bg-black/20 backdrop-blur-sm p-2 rounded-md pointer-events-none">
          Click and drag to interact with 3D model
        </div>
      )}
    </div>
  );
};

export default HeroAnimation; 