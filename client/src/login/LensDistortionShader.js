
import * as THREE from 'three';
export const LensDistortionShader = {
  uniforms: {
    iTime: { value: 0.0 },
    baseIor: { value: 0.910 },
    bandOffset: { value: 0.0019 },
    jitterIntensity: { value: 20.7 },
    jitterOffset: { value: 0.0 },
    mousePos: { value: new THREE.Vector2() }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float iTime;
    varying vec2 vUv;
    void main() {
      vec3 color = vec3(0.0, 0.0, 1.0) * sin(iTime * 2.0);
      gl_FragColor = vec4(color, 1.0);
    }
  `
};
