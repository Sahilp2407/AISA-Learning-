import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, ShieldCheck, Zap, BookOpen, Database, Code2, Terminal, Cpu } from 'lucide-react';

export default function InteractiveHero3D({ onNavigate }) {
  const mountRef = useRef(null);
  const [activeNode, setActiveNode] = useState('DBMS');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Main Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Color Palette: Coral/Amber #ED7D31, Wheat #F5DEB3, Gold #FFD700
    const coralColor = new THREE.Color(0xED7D31);
    const wheatColor = new THREE.Color(0xF5DEB3);
    const goldColor = new THREE.Color(0xFFD700);

    // 1. Central Glowing Core (Icosahedron)
    const centralGeo = new THREE.IcosahedronGeometry(3.6, 1);
    const centralMat = new THREE.MeshPhysicalMaterial({
      color: coralColor,
      emissive: 0xB34E0B,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.8,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const centralMesh = new THREE.Mesh(centralGeo, centralMat);
    coreGroup.add(centralMesh);

    // 2. Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xFEEBDD,
      emissive: 0xED7D31,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // 3. Orbiting Gyroscope Rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: goldColor,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });

    const ring1Geo = new THREE.TorusGeometry(6.2, 0.08, 16, 100);
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(7.5, 0.08, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat);
    ring2.rotation.x = Math.PI / 3;
    coreGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(8.8, 0.08, 16, 100);
    const ring3 = new THREE.Mesh(ring3Geo, ringMat);
    ring3.rotation.y = Math.PI / 3;
    coreGroup.add(ring3);

    // 4. Orbiting Subject Satellite Nodes
    const satelliteCount = 6;
    const satellites = [];
    const satGeo = new THREE.OctahedronGeometry(0.85, 0);
    const satMat = new THREE.MeshStandardMaterial({
      color: coralColor,
      emissive: 0xED7D31,
      emissiveIntensity: 0.4,
      metalness: 0.7,
      roughness: 0.2,
    });

    for (let i = 0; i < satelliteCount; i++) {
      const satMesh = new THREE.Mesh(satGeo, satMat);
      const angle = (i / satelliteCount) * Math.PI * 2;
      const radius = 6.8 + (i % 2) * 1.8;
      
      satMesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * (radius * 0.5),
        Math.sin(angle) * 3
      );

      satMesh.userData = {
        angle,
        radius,
        speed: 0.008 + (i % 3) * 0.004,
        orbitYScale: 0.4 + (i % 2) * 0.3,
      };

      coreGroup.add(satMesh);
      satellites.push(satMesh);
    }

    // 5. Floating Particle Nebula
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 4.5 + Math.random() * 8.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      const col = Math.random() > 0.5 ? coralColor : wheatColor;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particles);

    // Studio Lighting
    const ambLight = new THREE.AmbientLight(0xfff8ee, 1.8);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.5);
    keyLight.position.set(10, 15, 15);
    scene.add(keyLight);

    const coralPointLight = new THREE.PointLight(0xED7D31, 3.5, 30);
    coralPointLight.position.set(0, 0, 5);
    scene.add(coralPointLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    container.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse lerp
      targetX += (mouseX * 1.5 - targetX) * 0.05;
      targetY += (mouseY * 1.2 - targetY) * 0.05;

      coreGroup.rotation.y = elapsed * 0.25 + targetX * 0.4;
      coreGroup.rotation.x = Math.sin(elapsed * 0.15) * 0.15 + targetY * 0.3;

      // Central core pulsations
      centralMesh.rotation.x += 0.006;
      centralMesh.rotation.y += 0.009;
      innerMesh.rotation.y -= 0.005;

      // Rotate rings on unique axes
      ring1.rotation.z += 0.008;
      ring2.rotation.x += 0.007;
      ring3.rotation.y += 0.009;

      // Orbit satellites
      satellites.forEach((sat, idx) => {
        sat.userData.angle += sat.userData.speed;
        const a = sat.userData.angle;
        const rad = sat.userData.radius;

        sat.position.x = Math.cos(a) * rad;
        sat.position.y = Math.sin(a) * (rad * sat.userData.orbitYScale);
        sat.position.z = Math.sin(a * 2) * 2;

        sat.rotation.x += 0.02;
        sat.rotation.y += 0.03;
      });

      // Particle subtle swirl
      particles.rotation.y = -elapsed * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      centralGeo.dispose();
      centralMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      ringMat.dispose();
      satGeo.dispose();
      satMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[440px] sm:h-[480px] md:h-[520px] flex items-center justify-center">
      {/* 3D Three.js Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* FLOATING INTERACTIVE FEATURE BADGES AROUND THE 3D CORE */}
      {/* Badge 1: Top Left */}
      <div className="absolute top-4 sm:top-8 left-2 sm:left-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-gold-300/80 shadow-soft animate-float-card flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gold-500/15 text-gold-700 flex items-center justify-center font-bold">
          <Database className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-charcoal">CS301: DBMS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-successSoft"></span>
          </div>
          <p className="text-[10px] text-charcoal-muted">B+ Trees & Normalization</p>
        </div>
      </div>

      {/* Badge 2: Top Right */}
      <div className="absolute top-6 sm:top-10 right-2 sm:right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-gold-300/80 shadow-soft animate-float-delayed flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gold-500/15 text-gold-700 flex items-center justify-center font-bold">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-charcoal">Exam-Safe Lockout</span>
            <span className="text-[9px] font-bold text-successSoft bg-green-50 px-1.5 py-0.2 rounded border border-green-200">ACTIVE</span>
          </div>
          <p className="text-[10px] text-charcoal-muted">Zero Plagiarism Risk</p>
        </div>
      </div>

      {/* Badge 3: Bottom Left */}
      <div className="absolute bottom-6 sm:bottom-10 left-2 sm:left-8 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-gold-300/80 shadow-soft animate-float-slow flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gold-500/15 text-gold-700 flex items-center justify-center font-bold">
          <Code2 className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-charcoal">CS204: Algorithms</span>
            <span className="w-1.5 h-1.5 rounded-full bg-successSoft"></span>
          </div>
          <p className="text-[10px] text-charcoal-muted">CLRS Textbook Grounded</p>
        </div>
      </div>

      {/* Badge 4: Bottom Right (Interactive CTA Pill) */}
      <button
        onClick={() => onNavigate('login')}
        className="absolute bottom-4 sm:bottom-8 right-2 sm:right-8 z-20 gold-button px-4 py-2.5 rounded-2xl text-xs font-bold shadow-soft flex items-center gap-2 cursor-pointer group"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Try Socratic Tutor →</span>
      </button>
    </div>
  );
}
