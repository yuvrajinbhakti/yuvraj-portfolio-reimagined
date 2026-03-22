import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

// --- FRONTEND: React-like Atom ---
const FrontendModel = ({ isHovered }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      const speed = isHovered ? 3.0 : 0.8;
      groupRef.current.rotation.y += speed * 0.01;
      groupRef.current.rotation.x += speed * 0.005;
      groupRef.current.rotation.z += speed * 0.008;
    }
  });

  return (
    <group ref={groupRef} scale={isHovered ? 1.2 : 1}>
      <Float speed={2} rotationIntensity={isHovered ? 3 : 1} floatIntensity={1}>
        <mesh>
          <Sphere args={[0.3, 32, 32]}>
            <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.5} roughness={0.1} metalness={0.8} />
          </Sphere>
        </mesh>
        
        {/* The 3 rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <Torus args={[0.8, 0.04, 16, 100]}>
            <meshBasicMaterial color="#60a5fa" transparent opacity={isHovered ? 0.8 : 0.4} />
          </Torus>
        </mesh>
        <mesh rotation={[Math.PI / 2, Math.PI / 3, 0]}>
          <Torus args={[0.8, 0.04, 16, 100]}>
            <meshBasicMaterial color="#60a5fa" transparent opacity={isHovered ? 0.8 : 0.4} />
          </Torus>
        </mesh>
        <mesh rotation={[Math.PI / 2, -Math.PI / 3, 0]}>
          <Torus args={[0.8, 0.04, 16, 100]}>
            <meshBasicMaterial color="#60a5fa" transparent opacity={isHovered ? 0.8 : 0.4} />
          </Torus>
        </mesh>
      </Float>
    </group>
  );
};

FrontendModel.propTypes = {
  isHovered: PropTypes.bool.isRequired,
};

// --- BACKEND: Floating Server Cubes ---
const BackendModel = ({ isHovered }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      const speed = isHovered ? 2.5 : 0.5;
      groupRef.current.rotation.y += speed * 0.015;
    }
  });

  const speedMultiplier = isHovered ? 2 : 0.8;

  return (
    <group ref={groupRef} scale={isHovered ? 1.15 : 1}>
      <Float speed={1.5 * speedMultiplier} rotationIntensity={isHovered ? 1 : 0.2} floatIntensity={isHovered ? 2 : 1} position={[0, 0.6, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 0.4, 1.2]} />
          <meshStandardMaterial color="#0ea5e9" opacity={0.85} transparent roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 0.5]}>
          <boxGeometry args={[0.2, 0.05, 0.05]} />
          <meshBasicMaterial color={isHovered ? "#34d399" : "#10b981"} />
        </mesh>
      </Float>
      
      <Float speed={2 * speedMultiplier} rotationIntensity={isHovered ? 1.2 : 0.3} floatIntensity={isHovered ? 1.5 : 0.8}>
        <mesh>
          <boxGeometry args={[1.2, 0.4, 1.2]} />
          <meshStandardMaterial color="#3b82f6" opacity={0.85} transparent roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 0.5]}>
          <boxGeometry args={[0.2, 0.05, 0.05]} />
          <meshBasicMaterial color={isHovered ? "#34d399" : "#10b981"} />
        </mesh>
      </Float>
      
      <Float speed={2.5 * speedMultiplier} rotationIntensity={isHovered ? 1.5 : 0.4} floatIntensity={isHovered ? 2 : 1} position={[0, -0.6, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 0.4, 1.2]} />
          <meshStandardMaterial color="#8b5cf6" opacity={0.85} transparent roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 0.5]}>
          <boxGeometry args={[0.2, 0.05, 0.05]} />
          <meshBasicMaterial color={isHovered ? "#34d399" : "#10b981"} />
        </mesh>
      </Float>
    </group>
  );
};

BackendModel.propTypes = {
  isHovered: PropTypes.bool.isRequired,
};

// --- MACHINE LEARNING: Neural Nodes ---
const MLModel = ({ isHovered }) => {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      const speed = isHovered ? 2.5 : 0.6;
      groupRef.current.rotation.y += speed * 0.01;
      groupRef.current.rotation.x = Math.sin(t * speed * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={isHovered ? 1.2 : 1}>
      <Float speed={isHovered ? 3 : 1} rotationIntensity={2} floatIntensity={isHovered ? 3 : 1.5}>
        {/* Wireframe shell */}
        <mesh>
           <icosahedronGeometry args={[0.8, 1]} />
           <meshBasicMaterial color="#a855f7" wireframe transparent opacity={isHovered ? 0.6 : 0.2} />
        </mesh>
        
        {/* Solid inner pulsating core */}
        <mesh>
           <Sphere args={[0.4, 32, 32]}>
             <MeshDistortMaterial 
               color="#d8b4fe"
               emissive="#7e22ce"
               emissiveIntensity={isHovered ? 1.5 : 0.5}
               distort={isHovered ? 0.4 : 0.2}
               speed={isHovered ? 4 : 1}
               roughness={0.2}
               metalness={0.8}
             />
           </Sphere>
        </mesh>
        
        {/* Floating outer nodes */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[
             Math.sin(i * Math.PI / 3) * 1.2,
             Math.cos(i * Math.PI / 3) * 0.4,
             Math.cos(i * Math.PI / 3) * 1.2
          ]}>
            <Sphere args={[0.1, 16, 16]}>
              <meshBasicMaterial color="#f0abfc" />
            </Sphere>
          </mesh>
        ))}
      </Float>
    </group>
  );
};

MLModel.propTypes = {
  isHovered: PropTypes.bool.isRequired,
};

// --- Shared Wrapper Component ---
export const ServiceIcon3D = ({ type, isHovered }) => {
  return (
    <div className="w-full h-40 sm:h-48 relative flex items-center justify-center pointer-events-none transition-transform duration-500">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -10, -5]} intensity={0.5} color="#a855f7" />
        
        {type === 'frontend' && <FrontendModel isHovered={isHovered} />}
        {type === 'backend' && <BackendModel isHovered={isHovered} />}
        {type === 'ml' && <MLModel isHovered={isHovered} />}
      </Canvas>
    </div>
  );
};

ServiceIcon3D.propTypes = {
  type: PropTypes.oneOf(['frontend', 'backend', 'ml']).isRequired,
  isHovered: PropTypes.bool.isRequired,
};

export default ServiceIcon3D;
