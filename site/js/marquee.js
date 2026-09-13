/* Lobos — carrousel portfolio (galerie) : défilement automatique en JS, avec
   pause au survol et glisser à la souris / au doigt pour naviguer manuellement.
   Remplace l'animation CSS (@keyframes marquee) une fois initialisé, celle-ci
   reste le filet de sécurité si ce module ne s'exécute pas (JS désactivé). */

const SPEED = 40; // px/s

export function initMarquee(root) {
  if (!root || root.dataset.dragInit) return;
  const track = root.querySelector('.marquee-track');
  if (!track) return;
  root.dataset.dragInit = '1';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let halfWidth = 0;
  let position = 0;
  let dragging = false;
  let hovering = false;
  let startX = 0;
  let startPosition = 0;
  let dragDistance = 0;
  let lastTime = null;

  track.style.animation = 'none';

  const resizeObserver = new ResizeObserver(() => {
    halfWidth = track.scrollWidth / 2;
  });
  resizeObserver.observe(track);

  function wrap() {
    if (halfWidth <= 0) return;
    while (position <= -halfWidth) position += halfWidth;
    while (position > 0) position -= halfWidth;
  }

  function apply() {
    track.style.transform = `translateX(${position}px)`;
  }

  function frame(time) {
    if (lastTime === null) lastTime = time;
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    if (!dragging && !hovering && !reduceMotion && root.offsetParent !== null) {
      position -= SPEED * dt;
      wrap();
      apply();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  root.addEventListener('mouseenter', () => { hovering = true; });
  root.addEventListener('mouseleave', () => { hovering = false; });
  root.addEventListener('focusin', () => { hovering = true; });
  root.addEventListener('focusout', () => { hovering = false; });
  root.addEventListener('dragstart', (e) => e.preventDefault());

  root.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    dragDistance = 0;
    startX = e.clientX;
    startPosition = position;
    root.classList.add('is-dragging');
    root.setPointerCapture?.(e.pointerId);
  });

  root.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const delta = e.clientX - startX;
    dragDistance = Math.max(dragDistance, Math.abs(delta));
    position = startPosition + delta;
    wrap();
    apply();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    root.releasePointerCapture?.(e.pointerId);
  }
  root.addEventListener('pointerup', endDrag);
  root.addEventListener('pointercancel', endDrag);

  // évite de déclencher les liens des cartes après un glisser
  root.addEventListener('click', (e) => {
    if (dragDistance > 6) { e.preventDefault(); e.stopPropagation(); }
  }, true);
}
