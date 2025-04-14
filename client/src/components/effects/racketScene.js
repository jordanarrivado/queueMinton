import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing"; // ✅ Import Bloom Effect
import RacketModel from "./racketModel";
import TWEEN from "@tweenjs/tween.js";
import "./racketModel.css";

const RacketScene = () => {


  return (
    <Canvas
      className="racket-container"
      style={{ width: "19.6vw", height: "50vh", display: "block" }}
      camera={{ position: [0, 1, 5], fov: 75 }}
      shadows
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 2]} intensity={2} castShadow />
      <ContactShadows position={[0, -1.1, 0]} opacity={0.5} scale={10} blur={2} />
      <Environment preset="city" />

      <RacketModel path="/models/br.glb" />

      
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

export default RacketScene;
