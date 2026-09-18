/* Fond animé du hero : le logo Lobos en maillage 3D low-poly (three.js). */
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

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
  renderer.localClippingEnabled = true;

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
  group.position.set(1.9, 0.1, 0);
  scene.add(group);

  const grid = new THREE.GridHelper(22, 22, accent, accent);
  grid.material.transparent = true;
  grid.material.opacity = 0.12;
  grid.position.y = -1.9;
  scene.add(grid);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // plan de coupe qui révèle le logo du bas vers le haut, comme une impression 3D en cours
  const printPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  let printMinY = -1.6;
  let printMaxY = 1.6;
  let printRing;

  // extrude le tracé du logo en un maillage low-poly pour le rendu en fil de fer
  fetch('assets/logo.svg')
    .then((res) => res.text())
    .then((svgText) => {
      const { paths } = new SVGLoader().parse(svgText);
      const shapes = paths.flatMap((path) => SVGLoader.createShapes(path));
      const geometry = new THREE.ExtrudeGeometry(shapes, {
        depth: 110,
        bevelEnabled: false,
        curveSegments: 6,
      });

      // le SVG a l'axe Y vers le bas : on le remet à l'endroit puis on centre/redimensionne
      geometry.scale(1, -1, 1);
      geometry.computeBoundingBox();
      const bboxSize = new THREE.Vector3();
      const center = new THREE.Vector3();
      geometry.boundingBox.getSize(bboxSize);
      geometry.boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);
      const scale = 2.7 / Math.max(bboxSize.x, bboxSize.y);
      geometry.scale(scale, scale, scale);
      geometry.computeBoundingBox();
      printMinY = geometry.boundingBox.min.y * 1.15;
      printMaxY = geometry.boundingBox.max.y * 1.15;
      printPlane.constant = reduced ? printMaxY : printMinY;

      const logo = wire(geometry, 0.6);
      logo.material.clippingPlanes = [printPlane];
      group.add(logo);

      // anneau lumineux qui matérialise la "tête d'impression" au niveau du plan de coupe
      const ringRadius = Math.max(bboxSize.x, bboxSize.y) * scale * 0.62;
      printRing = new THREE.Mesh(
        new THREE.RingGeometry(ringRadius * 0.93, ringRadius, 40),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, side: THREE.DoubleSide })
      );
      printRing.rotation.x = -Math.PI / 2;
      printRing.visible = !reduced;
      scene.add(printRing);
    });

  let t = 0;
  const cycle = 5.2; // secondes : construction du logo puis pause avant la reprise
  const buildFraction = 0.72;
  function frame() {
    requestAnimationFrame(frame);
    if (!reduced) {
      t += 0.004;
      group.rotation.y = t;
      group.rotation.x = Math.sin(t * 0.7) * 0.18;

      const progress = (t % cycle) / cycle;
      const buildT = Math.min(progress / buildFraction, 1);
      const revealY = printMinY + (printMaxY - printMinY) * buildT;
      printPlane.constant = revealY;
      if (printRing) {
        printRing.position.set(group.position.x, revealY, group.position.z);
        printRing.material.opacity = buildT < 1 ? 0.55 : 0;
      }
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
