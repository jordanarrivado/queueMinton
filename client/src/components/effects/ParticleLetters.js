import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const ParticleLetters = ({ text }) => {
  const letters = text.split('');
  const numLetters = letters.length;

  const meshRef = useRef();

  const positions = useMemo(() => {
    const positions = new Float32Array(numLetters * 3);
    for (let i = 0; i < numLetters; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [numLetters]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={meshRef}>
      {letters.map((letter, index) => (
        <Text
          key={index}
          position={[positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {letter}
        </Text>
      ))}
    </group>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <ParticleLetters text="Hello World" />
    </Canvas>
  );
};

export default Scene;