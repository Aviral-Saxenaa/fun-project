"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function GhostArchiveRadar3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 7.5);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x7c3aed, 1.8);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 4, 15);
    cyanLight.position.set(-3, 2, 4);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 5, 15);
    purpleLight.position.set(3, -1, 3);
    scene.add(purpleLight);

    const radarGroup = new THREE.Group();
    scene.add(radarGroup);

    // Central Ghost Core Orb
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      emissive: 0x6b21a8,
      emissiveIntensity: 0.6,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    radarGroup.add(coreMesh);

    // Inner Glowing Core
    const innerGeo = new THREE.SphereGeometry(0.7, 24, 24);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xa855f7,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    radarGroup.add(innerMesh);

    // Radar Concentric Rings
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    const ring1 = new THREE.Mesh(new THREE.RingGeometry(1.8, 1.86, 64), ringMat1);
    ring1.rotation.x = Math.PI / 2.3;
    radarGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.66, 64), ringMat2);
    ring2.rotation.x = Math.PI / 2.6;
    ring2.rotation.y = 0.4;
    radarGroup.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.25, 64), ringMat1);
    ring3.rotation.x = Math.PI / 3;
    ring3.rotation.z = -0.5;
    radarGroup.add(ring3);

    // Floating Ghost Beacons (representing Candidate Reports)
    const beaconsCount = 14;
    const beacons: { mesh: THREE.Mesh; speed: number; radius: number; angle: number; yOffset: number }[] = [];

    const beaconGeo = new THREE.OctahedronGeometry(0.18, 0);
    const beaconMatPurple = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xc084fc,
      emissiveIntensity: 0.8,
    });
    const beaconMatCyan = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x7dd3fc,
      emissiveIntensity: 0.8,
    });

    for (let i = 0; i < beaconsCount; i++) {
      const radius = 2.0 + (i % 3) * 0.6;
      const angle = (i / beaconsCount) * Math.PI * 2;
      const mesh = new THREE.Mesh(beaconGeo, i % 2 === 0 ? beaconMatPurple : beaconMatCyan);
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 1.5,
        Math.sin(angle) * radius
      );
      radarGroup.add(mesh);
      beacons.push({
        mesh,
        radius,
        angle,
        speed: 0.008 + (i % 4) * 0.004,
        yOffset: (Math.random() - 0.5) * 0.8,
      });
    }

    // Floating Particle Cloud
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = (Math.random() - 0.5) * 5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.3;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse damping
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      radarGroup.rotation.y = elapsed * 0.25 + mouseX;
      radarGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.1 + mouseY;

      coreMesh.rotation.y = elapsed * 0.4;
      coreMesh.rotation.z = elapsed * 0.2;

      ring1.rotation.z = elapsed * 0.5;
      ring2.rotation.z = -elapsed * 0.35;
      ring3.rotation.z = elapsed * 0.2;

      // Orbiting report beacons
      for (const b of beacons) {
        b.angle += b.speed;
        b.mesh.position.x = Math.cos(b.angle) * b.radius;
        b.mesh.position.z = Math.sin(b.angle) * b.radius;
        b.mesh.position.y = Math.sin(elapsed * 2 + b.angle) * 0.3 + b.yOffset;
        b.mesh.rotation.x += 0.02;
        b.mesh.rotation.y += 0.03;
      }

      particles.rotation.y = elapsed * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-48 sm:h-56 relative flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
    />
  );
}
