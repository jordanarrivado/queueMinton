import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

const ParticleText = () => {
  const [particles, setParticles] = useState(null);
  const textRef = useRef();

  // Create particle system around text
  useEffect(() => {
    if (textRef.current && textRef.current.geometry) {
      const textGeometry = textRef.current.geometry;
      const points = [];
      textGeometry.computeBoundingBox();
      const vertices = textGeometry.attributes.position.array;

      // Loop through vertices and create particle positions
      for (let i = 0; i < vertices.length; i += 3) {
        points.push(new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]));
      }

      const particleCount = points.length;
      const particlePositions = new Float32Array(particleCount * 3);

      // Populate particle positions from the geometry
      points.forEach((point, index) => {
        particlePositions.set([point.x, point.y, point.z], index * 3);
      });

      setParticles(particlePositions);
    }
  }, []);

  if (!particles) return null; // Ensure particles are set before rendering the Canvas

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight />
      <spotLight position={[10, 10, 10]} intensity={0.5} />
      
      {/* Render text */}
      <Text ref={textRef} fontSize={1} position={[-2, 0, 0]} color="#ff6f61">
        Particle Text
      </Text>

      {/* Particle system */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.2} color={0x00ff00} />
      </points>

      <OrbitControls />
    </Canvas>
  );
};

export default ParticleText;
