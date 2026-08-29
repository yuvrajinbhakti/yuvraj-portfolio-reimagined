import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useReducedMotion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import WebGLBoundary from './WebGLBoundary';

const OrganicShape = ({ mouse }) => {
  const meshRef = useRef();
  const wireRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mx = mouse.current.x;
    const my = mouse.current.y;

    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.1 + my * 0.3;
      meshRef.current.rotation.y = t * 0.15 + mx * 0.3;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = t * 0.15 - my * 0.2;
      wireRef.current.rotation.y = -t * 0.1 + mx * 0.2;
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
          {/* Was violet-500. The core sits behind a translucent wireframe, so
              its colour is what the whole globe glows — and it was glowing a
              hue this site does not otherwise use. */}
          <meshBasicMaterial color="#2563eb" transparent opacity={0.6} />
        </Sphere>
      </mesh>
    </Float>
  );
};

// A ref, not a value: pointer position is read inside useFrame at 60Hz, so it
// deliberately never passes through React state.
const mouseRef = PropTypes.shape({
  current: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
});

OrganicShape.propTypes = {
  mouse: mouseRef.isRequired,
};


const HeroAnimation = () => {
  const mouse = useRef({ x: 0, y: 0 });
  // frameloop="demand" paints one frame and stops, freezing the rotating globe.
  const reduce = useReducedMotion();

  useEffect(() => {
    const handleMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {/* Readability scrim.
          It used to start at `from-transparent`, which put its weakest point at
          the top of the hero — exactly where the globe's wireframe is densest
          and where the headline sits. At 375px the grid ran straight through
          "I'm Yuvraj Singh Nain". A veil across the top costs very little of the
          globe and buys back the headline; the heavy bottom fade is unchanged,
          since that is what blends the sphere into the section below. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/45 via-[#020617]/30 to-[#020617]/80 z-10"></div>

      {/* Without this, a browser that refuses a WebGL context takes the whole
          page down: Canvas throws, nothing catches it, and React unmounts from
          the root. The globe is decoration; the page is not. */}
      <WebGLBoundary>
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true }} frameloop={reduce ? 'demand' : 'always'}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#3b82f6" />
          {/* The fill light. A violet fill against a blue key tints every
              surface it reaches, so this was tinting the entire globe rather
              than just the few meshes named above. Cyan is the cool
              counterpoint the wireframe already uses. */}
          <directionalLight position={[-10, -10, -5]} intensity={1} color="#06b6d4" />

          <OrganicShape mouse={mouse} />
          {/* The 150-point star cloud that sat here is gone. The page
              already draws a starfield on the canvas behind this scene, and
              two of them never agreed: the canvas sky is fixed while this one
              rotated and drifted with the cursor, at a different scale and
              density. Reading them together is what stopped either looking
              like a sky.
              One sky, and it is the one that covers the whole page rather
              than just the hero — which also takes a texture, a geometry and
              a draw call out of the heaviest chunk this site ships. */}

          <fog attach="fog" args={['#020617', 5, 15]} />
        </Canvas>
      </WebGLBoundary>
    </div>
  );
};

export default HeroAnimation;
