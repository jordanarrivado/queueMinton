import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";

const RacketModel = ({ path }) => {
  const { scene } = useGLTF(path);
  const particleRef = useRef();
  const { scene: threeScene } = useThree();


  useEffect(() => {
    if (!scene) return;

    const particles = [];
    const numParticlesPerMesh = 2800;

    scene.traverse((child) => {
      if (child.isMesh) {
        const sampler = new MeshSurfaceSampler(child).build();
        const positions = new Float32Array(numParticlesPerMesh * 3);
        const colors = new Float32Array(numParticlesPerMesh * 3);

        for (let i = 0; i < numParticlesPerMesh; i++) {
          const tempPosition = new THREE.Vector3();
          sampler.sample(tempPosition);
          positions.set(tempPosition.toArray(), i * 3);

          const color = new THREE.Color(0x00FFFF); // Glowing aqua color
          colors.set(color.toArray(), i * 3);
        }

        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        // 🔥 Glowing Effect (Emissive Material)
        const particleMaterial = new THREE.PointsMaterial({
          vertexColors: true,
          size: 0.001,
          transparent: true,
          opacity: 0.8,
          emissive: new THREE.Color(0x00FFFF), // Glow color
          emissiveIntensity: 2, // Boost emissive glow
        });

        const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
        particleSystem.position.set(1, -5, 0);  // Adjust Y position

        threeScene.add(particleSystem);
        particles.push({ geometry: particlesGeometry, material: particleMaterial, mesh: particleSystem });
      }
    });

    particleRef.current = particles;

    return () => {
      particles.forEach(({ geometry, material, mesh }) => {
        threeScene.remove(mesh);
        geometry.dispose();
        material.dispose();
      });
    };
  }, [scene, threeScene]);

  useFrame(() => {
    if (particleRef.current) {
      particleRef.current.forEach(({ mesh }) => {
        mesh.rotation.y += 0.002;
      });
    }
  });

  return null;
};

export default RacketModel;
