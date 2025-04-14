import { useEffect } from 'react';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { LensDistortionShader } from './LensDistortionShader.js';

const ThreeScene = () => {
  useEffect(() => {
    /*** SETUP ***/
    const container = document.createElement('div');
    document.body.appendChild(container);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc0c0c);

    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(34, 16, -20);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Optimized pixel ratio
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.minDistance = 0.5;
    controls.maxDistance = 9;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.5;
    controls.autoRotate = false; // Disabled auto-rotate

    /*** DRACO LOADER ***/
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    /*** LOAD MODEL ***/
    loader.load('./models/shuttle3.glb', (gltf) => {
      gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
          const sampler = new MeshSurfaceSampler(obj).build();
          createPointCloud(sampler);
        }
      });
    });

    /*** CREATE POINT CLOUD ***/
    let uniforms = { mousePos: { value: new THREE.Vector3() } };
    const pointsGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const tempPosition = new THREE.Vector3();

    function createPointCloud(sampler) {
      for (let i = 0; i < 30000; i++) { // Reduced from 99,000 to 30,000
        sampler.sample(tempPosition);
        vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
      }

      pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      const pointsMaterial = new THREE.PointsMaterial({
        color: 0x5c0b17,
        size: 0.1,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        sizeAttenuation: true,
        alphaMap: new THREE.TextureLoader().load('particle-texture.jpg'),
      });

      pointsMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.mousePos = uniforms.mousePos;
        shader.vertexShader = `uniform vec3 mousePos;
          varying float vNormal;
          ${shader.vertexShader}`.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
            vec3 seg = position - mousePos;
            vec3 dir = normalize(seg);
            float dist = length(seg);
            if (dist < 1.5) {
              float force = clamp(1.0 / (dist * dist), -0., .5);
              transformed += dir * force;
              vNormal = force / 0.5;
            }`
        );
      };

      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      scene.add(points);
    }

    /*** CAMERA ANIMATION ***/
    function animateCamera() {
      controls.enabled = false;
      const tween = new TWEEN.Tween(camera.position)
        .to({ x: 2, y: -0.4, z: 6.1 }, 6500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
          controls.enabled = true;
          TWEEN.remove(tween); // Remove tween from update loop
        })
        .start();
    }
    animateCamera();

    /*** POST-PROCESSING ***/
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Optimized pixel ratio

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const distortPass = new ShaderPass(LensDistortionShader);
    distortPass.material.uniforms.baseIor.value = 0.910;
    distortPass.material.uniforms.bandOffset.value = 0.0019;
    distortPass.material.uniforms.jitterIntensity.value = 5.0; // Reduced intensity
    distortPass.material.defines.BAND_MODE = 2;
    distortPass.enabled = true;
    composer.addPass(distortPass);

    /*** RENDER LOOP ***/
    const clock = new THREE.Clock();
    function renderLoop() {
      TWEEN.update();
      controls.update();
      composer.render();
      distortPass.material.uniforms.jitterOffset.value += 0.01;
      distortPass.material.uniforms.iTime.value = clock.getElapsedTime();
      requestAnimationFrame(renderLoop);
    }
    renderLoop();

    /*** MOUSE MOVE EVENT (THROTTLED) ***/
    const cursor = { x: 0, y: 0 };
    let mouseMoveTimeout;
    function onMouseMove(event) {
      if (mouseMoveTimeout) cancelAnimationFrame(mouseMoveTimeout);
      mouseMoveTimeout = requestAnimationFrame(() => {
        cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
        cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
        uniforms.mousePos.value.set(cursor.x, cursor.y, 0);
      });
    }
    document.addEventListener('mousemove', onMouseMove);

    /*** CLEANUP ***/
    return () => {
      document.body.removeChild(container);
      document.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      pointsGeometry.dispose();
    };
  }, []);

  return null;
};

export default ThreeScene;
