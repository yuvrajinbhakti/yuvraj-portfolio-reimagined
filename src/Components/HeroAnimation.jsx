import { useRef, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useReducedMotion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
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

/**
 * A soft round sprite, drawn once and shared by every point.
 *
 * The alternative is what this used to be: 150 octahedron meshes. An
 * octahedron seen from anywhere near head-on is a diamond, so the sky was
 * scattered with crystals rather than stars — and each one was its own draw
 * call. One texture and one geometry replaces all of it.
 */
const starTexture = () => {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  // A bright core falling off fast, then a long faint skirt. Starlight is
  // mostly the skirt; a hard-edged dot reads as a pixel, not a light.
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const OrbitingParticles = ({ count = 150, mouse }) => {
  const groupRef = useRef();

  const { positions, sizes, sprite } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
      // Heavily weighted small. A real field is mostly faint points with a few
      // bright ones; a uniform distribution gives an evenly-lit sky, which is
      // the thing that reads as generated.
      sizes[i] = 0.05 + Math.random() ** 3 * 0.22;
    }
    return { positions, sizes, sprite: starTexture() };
  }, [count]);

  // Textures hold GPU memory until they are told not to.
  useEffect(() => () => sprite.dispose(), [sprite]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.z = clock.getElapsedTime() * 0.02;
      // Subtle push away from cursor
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x, -mouse.current.x * 0.5, 0.05
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y, -mouse.current.y * 0.5, 0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        {/* Additive, so overlapping points brighten each other the way real
            light does rather than compositing into a flat disc — and with
            depthWrite off, so a near star never punches a hole in the glow of
            one behind it. sizeAttenuation keeps the far ones small, which is
            where the depth comes from now the shapes are gone. */}
        <pointsMaterial
          map={sprite}
          size={0.16}
          sizeAttenuation
          color="#9ec5ff"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

OrbitingParticles.propTypes = {
  count: PropTypes.number,
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
          <OrbitingParticles count={150} mouse={mouse} />

          <fog attach="fog" args={['#020617', 5, 15]} />
        </Canvas>
      </WebGLBoundary>
    </div>
  );
};

export default HeroAnimation;
