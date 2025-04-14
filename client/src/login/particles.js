import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./particle.css";

const Particles = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    particlesRef.current.appendChild(renderer.domElement);

    const particleCount = 2500;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
    });

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleSystem = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particleSystem);

    const animateParticles = () => {
      requestAnimationFrame(animateParticles);

      particleSystem.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animateParticles();

    return () => {
      if (particlesRef.current && renderer.domElement) {
        particlesRef.current.removeChild(renderer.domElement);
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={particlesRef} className="particles-cursor"></div>;
};

export default Particles;
