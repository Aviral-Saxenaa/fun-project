"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function GhostThreeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return; // Graceful exit if WebGL disabled
    }

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x7c3aed, 1.2);
    scene.add(ambientLight);

    const purplePoint = new THREE.PointLight(0xa855f7, 4, 15);
    purplePoint.position.set(2, 3, 4);
    scene.add(purplePoint);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 3, 12);
    cyanPoint.position.set(-3, -2, 3);
    scene.add(cyanPoint);

    // Create 3D Ghost Group
    const ghostGroup = new THREE.Group();
    scene.add(ghostGroup);

    // Ghost Material - Ethereal Translucent Glow
    const ghostMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
    });

    // 1. Ghost Head (Sphere)
    const headGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, ghostMaterial);
    headMesh.position.y = 0.6;
    ghostGroup.add(headMesh);

    // 2. Ghost Body / Mantle (Tapered flowing cylinder)
    const bodyGeo = new THREE.CylinderGeometry(1.15, 1.45, 1.6, 32, 16, true);
    const bodyMesh = new THREE.Mesh(bodyGeo, ghostMaterial);
    bodyMesh.position.y = -0.2;
    ghostGroup.add(bodyMesh);

    // 3. Ghost Skirt / Flounces (Base ruffle ring)
    const skirtGeo = new THREE.TorusGeometry(1.4, 0.22, 16, 32);
    const skirtMesh = new THREE.Mesh(skirtGeo, ghostMaterial);
    skirtMesh.rotation.x = Math.PI / 2;
    skirtMesh.position.y = -0.95;
    ghostGroup.add(skirtMesh);

    // 4. Ghost Eyes (Cute dark glossy oval orbs)
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x090a0f });
    const eyePupilMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), eyeMaterial);
    leftEye.position.set(-0.42, 0.7, 1.08);
    leftEye.scale.set(1, 1.3, 0.8);
    ghostGroup.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), eyeMaterial);
    rightEye.position.set(0.42, 0.7, 1.08);
    rightEye.scale.set(1, 1.3, 0.8);
    ghostGroup.add(rightEye);

    // Cyan eye highlights
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyePupilMaterial);
    leftPupil.position.set(-0.4, 0.76, 1.22);
    ghostGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyePupilMaterial);
    rightPupil.position.set(0.44, 0.76, 1.22);
    ghostGroup.add(rightPupil);

    // 5. Ghost Cheeks (Cute blush glow)
    const blushMaterial = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.45 });
    const leftBlush = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), blushMaterial);
    leftBlush.position.set(-0.65, 0.48, 1.0);
    ghostGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), blushMaterial);
    rightBlush.position.set(0.65, 0.48, 1.0);
    ghostGroup.add(rightBlush);

    // Ghost Floating Arms (Friendly floating stubs)
    const armGeo = new THREE.SphereGeometry(0.35, 16, 16);
    armGeo.scale(1.4, 0.7, 0.7);

    const leftArm = new THREE.Mesh(armGeo, ghostMaterial);
    leftArm.position.set(-1.3, 0.1, 0.3);
    leftArm.rotation.z = Math.PI / 6;
    leftArm.rotation.y = -Math.PI / 8;
    ghostGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, ghostMaterial);
    rightArm.position.set(1.3, 0.1, 0.3);
    rightArm.rotation.z = -Math.PI / 6;
    rightArm.rotation.y = Math.PI / 8;
    ghostGroup.add(rightArm);

    // 6. Secondary Mini-Ghost floating companion
    const miniGhost = new THREE.Group();
    const miniBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0xe0e7ff,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.8,
      })
    );
    miniGhost.add(miniBody);

    const miniLeftEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), eyeMaterial);
    miniLeftEye.position.set(-0.14, 0.05, 0.42);
    miniGhost.add(miniLeftEye);
    const miniRightEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), eyeMaterial);
    miniRightEye.position.set(0.14, 0.05, 0.42);
    miniGhost.add(miniRightEye);

    miniGhost.position.set(2.8, -0.6, -1);
    scene.add(miniGhost);

    // 7. Floating Ectoplasm Star Dust / Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cPurple = new THREE.Color(0xa855f7);
    const cCyan = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      const mixed = Math.random() > 0.5 ? cPurple : cCyan;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particles);

    // Mouse Tracking for Smooth Parallax & Look-At
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    // Interactive spin on click/tap
    let spinAngle = 0;
    let spinVelocity = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 1.2;
      targetY = y * 0.8;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        targetX = x * 1.2;
        targetY = y * 0.8;
      }
    };

    const handleClick = () => {
      spinVelocity = Math.PI * 4;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("click", handleClick);

    // Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      // Handle spin impulse
      if (Math.abs(spinVelocity) > 0.01) {
        spinAngle += spinVelocity * 0.05;
        spinVelocity *= 0.93;
      } else {
        spinVelocity = 0;
      }

      // Primary Ghost Floating Sine Wave
      ghostGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.35 + currentY * 0.5;
      ghostGroup.position.x = Math.cos(elapsedTime * 0.9) * 0.2 + currentX * 0.8;

      // Ghost subtle look rotation & tilt + spin reaction
      ghostGroup.rotation.y = currentX * 0.6 + Math.sin(elapsedTime * 0.8) * 0.08 + spinAngle;
      ghostGroup.rotation.x = -currentY * 0.3 + Math.sin(elapsedTime * 1.4) * 0.05;
      ghostGroup.rotation.z = Math.sin(elapsedTime * 1.2) * 0.05 - currentX * 0.15;

      // Cute arm waggle
      leftArm.rotation.z = Math.PI / 6 + Math.sin(elapsedTime * 3) * 0.1;
      rightArm.rotation.z = -Math.PI / 6 - Math.sin(elapsedTime * 3) * 0.1;

      // Mini Ghost Orbital Floating
      miniGhost.position.x = 2.4 + Math.sin(elapsedTime * 2.2) * 0.5 + currentX * 0.3;
      miniGhost.position.y = -0.5 + Math.cos(elapsedTime * 2.5) * 0.4 + currentY * 0.3;
      miniGhost.position.z = Math.sin(elapsedTime * 1.5) * 0.8;
      miniGhost.rotation.y = Math.sin(elapsedTime * 1.5) * 0.4;

      // Subtle particle float
      const posArray = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 1] += 0.008;
        if (posArray[i * 3 + 1] > 5) {
          posArray[i * 3 + 1] = -5;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="ghost-three-canvas"
      aria-label="Interactive 3D Ghost mascot"
      className="w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
    />
  );
}
