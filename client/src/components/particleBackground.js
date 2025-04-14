import React, { useMemo, useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesOptions = useMemo(() => ({
    autoPlay: true,
    background: { color: { value: "transparent" } },
    fullScreen: { enable: true, zIndex: 0 },
    fpsLimit: 60,
    particles: {
      number: { value: 30, density: { enable: true, area: 1000 } },
      color: { value: "#ff0000" },
      shape: { type: "circle" },
      opacity: { value: 0.3 },
      size: { value: { min: 1, max: 3 } },
      move: {
        enable: true,
        speed: 0.5,
        direction: "none",
        outModes: { default: "out" },
      },
      links: {
        enable: true,
        distance: 120,
        color: "#ffffff",
        opacity: 0.3,
        width: 0.8,
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        repulse: { distance: 100, duration: 0.3 },
        push: { quantity: 2 },
      },
    },
    detectRetina: true,
  }), []);

  return <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />;
};

export default ParticlesBackground;
