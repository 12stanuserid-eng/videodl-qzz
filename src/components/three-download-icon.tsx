'use client';

import { useEffect, useRef } from 'react';

export default function ThreeDownloadIcon() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup = false;
    let frame = 0;

    async function mount() {
      const THREE = await import('three');
      if (!ref.current || cleanup) return;

      const width = ref.current.clientWidth || 360;
      const height = ref.current.clientHeight || 360;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 7);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      ref.current.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const material = new THREE.MeshStandardMaterial({ color: '#5d5fef', metalness: 0.36, roughness: 0.25 });
      const accent = new THREE.MeshStandardMaterial({ color: '#8b5cf6', metalness: 0.28, roughness: 0.2 });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.16, 32, 90), accent);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.65, 32), material);
      shaft.position.y = 0.45;
      group.add(shaft);

      const head = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.82, 32), material);
      head.rotation.x = Math.PI;
      head.position.y = -0.65;
      group.add(head);

      const tray = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.22, 0.32), accent);
      tray.position.y = -1.45;
      group.add(tray);

      const ambient = new THREE.AmbientLight('#ffffff', 1.8);
      const key = new THREE.PointLight('#7c3aed', 45);
      key.position.set(3, 3, 4);
      const fill = new THREE.PointLight('#4f8cff', 30);
      fill.position.set(-3, -2, 4);
      scene.add(ambient, key, fill);

      const onResize = () => {
        if (!ref.current) return;
        const nextWidth = ref.current.clientWidth || 360;
        const nextHeight = ref.current.clientHeight || 360;
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(nextWidth, nextHeight);
      };
      window.addEventListener('resize', onResize);

      const animate = () => {
        frame = requestAnimationFrame(animate);
        const time = performance.now() / 1000;
        group.rotation.y = time * 0.8;
        group.rotation.x = Math.sin(time * 0.9) * 0.18;
        group.position.y = Math.sin(time * 1.4) * 0.16;
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        ref.current?.removeChild(renderer.domElement);
      };
    }

    let unmount: void | (() => void);
    mount().then((fn) => (unmount = fn));

    return () => {
      cleanup = true;
      if (unmount) unmount();
    };
  }, []);

  return <div ref={ref} aria-label="3D floating download icon" className="h-[280px] w-full sm:h-[360px]" />;
}
