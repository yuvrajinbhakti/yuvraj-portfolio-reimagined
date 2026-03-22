import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

const OrganicShape = () => {
  const meshRef = useRef();
  const wireRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.1;
      meshRef.current.rotation.y = t * 0.15;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = t * 0.15;
      wireRef.current.rotation.y = -t * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
      {/* Glossy distorted blob */}
      <mesh ref={meshRef}>
        <Sphere args={[2.2, 64, 64]}>
          <MeshDistortMaterial
            color="#3b82f6"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.3}
          />
        </Sphere>
      </mesh>
      
      {/* Wireframe shell */}
      <mesh ref={wireRef}>
        <Sphere args={[2.5, 32, 32]}>
          <MeshDistortMaterial
            color="#06b6d4"
            attach="material"
            distort={0.3}
            speed={1.5}
            wireframe
            transparent
            opacity={0.15}
          />
        </Sphere>
      </mesh>
      
      {/* Inner glowing solid core */}
      <mesh>
        <Sphere args={[1.2, 32, 32]}>
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.6} />
        </Sphere>
      </mesh>
    </Float>
  );
};

const OrbitingParticles = ({ count = 150 }) => {
  const groupRef = useRef();
  
  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
      ],
      speed: 0.2 + Math.random() * 0.5,
      size: 0.03 + Math.random() * 0.05
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.z = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <octahedronGeometry args={[p.size, 0]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#3b82f6" : "#8b5cf6"} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

const HeroAnimation = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {/* Subtle overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/20 to-[#020617]/80 z-10"></div>
      
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#3b82f6" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#8b5cf6" />
        
        <OrganicShape />
        <OrbitingParticles count={150} />
        
        <fog attach="fog" args={['#020617', 5, 15]} />
      </Canvas>
    </div>
  );
};

export default HeroAnimation;