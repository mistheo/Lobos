/* Fond animé du hero : lignes 3D façon blueprint (three.js). */
import * as THREE from 'https://unpkg.com/three@0.184.0/build/three.module.js';

const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const accentOf = () => new THREE.Color(
    getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#9184d9'
  );
  const size = () => ({ w: canvas.clientWidth || 1, h: canvas.clientHeight || 520 });
  const { w, h } = size();

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
  camera.position.set(2.6, 1.4, 5.2);
  camera.lookAt(0, 0, 0);

  const accent = accentOf();
  const wire = (geometry, opacity) => new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity })
  );

  const group = new THREE.Group();
  group.add(wire(new THREE.IcosahedronGeometry(1.35, 1), 0.5));
  const inner = wire(new THREE.BoxGeometry(1.1, 1.1, 1.1), 0.3);
  group.add(inner);
  group.position.set(1.9, 0.1, 0);
  scene.add(group);

  const grid = new THREE.GridHelper(22, 22, accent, accent);
  grid.material.transparent = true;
  grid.material.opacity = 0.12;
  grid.position.y = -1.9;
  scene.add(grid);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (!reduced) {
      t += 0.004;
      group.rotation.y = t;
      group.rotation.x = Math.sin(t * 0.7) * 0.25;
      inner.rotation.y = -t * 1.6;
    }
    renderer.render(scene, camera);
  }
  frame();

  addEventListener('resize', () => {
    const s = size();
    camera.aspect = s.w / s.h;
    camera.updateProjectionMatrix();
    renderer.setSize(s.w, s.h, false);
  });

  // le thème change la couleur des lignes
  new MutationObserver(() => {
    const c = accentOf();
    scene.traverse((o) => { if (o.material && o.material.color) o.material.color.copy(c); });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
