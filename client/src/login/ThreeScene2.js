import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing"; 
import Model from "./Model";
import TWEEN from "@tweenjs/tween.js";
import "./canvas.css";

const ThreeScene = () => {
  return (
    <Canvas
      className="canvas-container"
      style={{ width: "680px", height: "770px", display: "block" }}
      camera={{ position: [0, 1, 5], fov: 50 }}
      shadows
    >

      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 2]} intensity={2} castShadow />
      <ContactShadows position={[0, -1.1, 0]} opacity={0.5} scale={10} blur={2} />
      

      <Model path="/models/badmintonChar.glb"/>

      
      <EffectComposer>
        <Bloom luminanceThreshold={0.05} luminanceSmoothing={0.05} intensity={0.05} />
      </EffectComposer>

      <OrbitControls
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.7}
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={0}
        enablePan={false}
      />
    </Canvas>
  );
};

export default ThreeScene;
