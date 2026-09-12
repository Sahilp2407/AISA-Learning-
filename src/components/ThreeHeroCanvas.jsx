import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeHeroCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 42;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Group for constellation & floating nodes
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 32 : 55;
    const nodes = [];

    // Geometry templates
    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
    const icosaGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const torusGeo = new THREE.TorusGeometry(1.1, 0.25, 16, 40);
    const octaGeo = new THREE.OctahedronGeometry(1, 0);

    // Materials - Warm Amber/Coral #ED7D31, Radiant Wheat, Frosted Glass
    const coralMat = new THREE.MeshPhysicalMaterial({
      color: 0xED7D31,
      emissive: 0xB34E0B,
      emissiveIntensity: 0.2,
      roughness: 0.2,
      metalness: 0.7,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      transparent: true,
      opacity: 0.65,
    });

    const wheatMat = new THREE.MeshPhysicalMaterial({
      color: 0xF5DEB3,
      emissive: 0xE6C280,
      emissiveIntensity: 0.15,
      roughness: 0.35,
      metalness: 0.3,
      transparent: true,
      opacity: 0.55,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xED7D31,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFAF0,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      thickness: 1.2,
      transparent: true,
      opacity: 0.45,
    });

    // Distribute nodes mostly around the periphery / deep background
    for (let i = 0; i < nodeCount; i++) {
      const type = Math.random();
      let mesh;
      let scale = 0.45 + Math.random() * 0.75;

      if (type < 0.35) {
        mesh = new THREE.Mesh(sphereGeo, Math.random() > 0.4 ? coralMat : wheatMat);
      } else if (type < 0.6) {
        mesh = new THREE.Mesh(icosaGeo, wireMat);
        scale *= 1.2;
      } else if (type < 0.8) {
        mesh = new THREE.Mesh(octaGeo, Math.random() > 0.5 ? glassMat : wheatMat);
      } else {
        mesh = new THREE.Mesh(torusGeo, wireMat);
        scale *= 0.8;
      }

      mesh.scale.set(scale, scale, scale);

      const angle = (i / nodeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const minRadius = isMobile ? 12 : 18;
      const radius = minRadius + Math.random() * (isMobile ? 14 : 26);
      
      const x = Math.cos(angle) * radius * (isMobile ? 0.9 : 1.3);
      const y = Math.sin(angle) * radius * 0.75 + (Math.random() - 0.5) * 6;
      const z = -4 - Math.random() * 22;

      mesh.position.set(x, y, z);

      mesh.userData = {
        vx: (Math.random() - 0.5) * 0.008,
        vy: (Math.random() - 0.5) * 0.008,
        rotX: (Math.random() - 0.5) * 0.012,
        rotY: (Math.random() - 0.5) * 0.015,
        baseX: x,
        baseY: y,
        baseZ: z,
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.4 + Math.random() * 0.6,
      };

      mainGroup.add(mesh);
      nodes.push(mesh);
    }

    // Dynamic Constellation Connecting Lines
    const maxLines = isMobile ? 45 : 90;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.NormalBlending,
    });

    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    mainGroup.add(lineMesh);

    // Warm Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    keyLight.position.set(25, 30, 20);
    scene.add(keyLight);

    const coralPointLight1 = new THREE.PointLight(0xED7D31, 2.2, 50);
    coralPointLight1.position.set(-15, 10, 10);
    scene.add(coralPointLight1);

    const coralPointLight2 = new THREE.PointLight(0xF7A364, 1.8, 50);
    coralPointLight2.position.set(18, -10, 5);
    scene.add(coralPointLight2);

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      currentX += (mouseX * 2.5 - currentX) * 0.035;
      currentY += (mouseY * 1.8 - currentY) * 0.035;

      mainGroup.rotation.y = elapsedTime * 0.025 + currentX * 0.12;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.02) * 0.04 + currentY * 0.08;
      mainGroup.position.x = currentX * 0.6;
      mainGroup.position.y = currentY * 0.6;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const { rotX, rotY, baseX, baseY, phase, floatSpeed } = node.userData;

        node.rotation.x += rotX;
        node.rotation.y += rotY;

        node.position.x = baseX + Math.sin(elapsedTime * floatSpeed + phase) * 0.8;
        node.position.y = baseY + Math.cos(elapsedTime * floatSpeed * 0.8 + phase) * 0.9;
      }

      let lineIndex = 0;
      const posArray = lineGeometry.attributes.position.array;
      const colArray = lineGeometry.attributes.color.array;
      const maxDistance = isMobile ? 9.5 : 12.5;

      const coralCol = new THREE.Color(0xED7D31);
      const wheatCol = new THREE.Color(0xE8D4A8);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (lineIndex >= maxLines) break;

          const dist = nodes[i].position.distanceTo(nodes[j].position);
          if (dist < maxDistance) {
            const pIndex = lineIndex * 6;
            posArray[pIndex] = nodes[i].position.x;
            posArray[pIndex + 1] = nodes[i].position.y;
            posArray[pIndex + 2] = nodes[i].position.z;

            posArray[pIndex + 3] = nodes[j].position.x;
            posArray[pIndex + 4] = nodes[j].position.y;
            posArray[pIndex + 5] = nodes[j].position.z;

            const alpha = 1 - dist / maxDistance;
            const c = wheatCol.clone().lerp(coralCol, alpha);

            colArray[pIndex] = c.r;
            colArray[pIndex + 1] = c.g;
            colArray[pIndex + 2] = c.b;

            colArray[pIndex + 3] = c.r;
            colArray[pIndex + 4] = c.g;
            colArray[pIndex + 5] = c.b;

            lineIndex++;
          }
        }
      }

      for (let k = lineIndex * 6; k < maxLines * 6; k++) {
        posArray[k] = 0;
        colArray[k] = 0;
      }

      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      sphereGeo.dispose();
      icosaGeo.dispose();
      torusGeo.dispose();
      octaGeo.dispose();
      coralMat.dispose();
      wheatMat.dispose();
      wireMat.dispose();
      glassMat.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FDFCF7]/60 via-[#FDFCF7]/85 to-[#FDFCF7] pointer-events-none" />
    </div>
  );
}
