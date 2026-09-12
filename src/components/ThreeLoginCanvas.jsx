import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeLoginCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Subtle Torus Knot & Orbiting particles
    const geometry = new THREE.TorusKnotGeometry(2.2, 0.6, 100, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xED7D31,
      roughness: 0.35,
      metalness: 0.3,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Inner subtle glowing icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0xF5DEB3,
      roughness: 0.4,
      metalness: 0.2,
      transparent: true,
      opacity: 0.3,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    scene.add(icoMesh);

    // Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xED7D31, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      torusKnot.rotation.x += 0.004;
      torusKnot.rotation.y += 0.006;
      icoMesh.rotation.y -= 0.005;
      icoMesh.rotation.z += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
