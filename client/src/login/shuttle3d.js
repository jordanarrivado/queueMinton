import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';


const Model = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);

  return <primitive object={scene} scale={1} />;
};

const ThreeJSScene = () => {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />

      <spotLight position={[10, 10, 10]} intensity={1} />

      <Model modelPath="/models/shuttle.glb" />

      <OrbitControls />
    </Canvas>
  );
};

export default ThreeJSScene;
