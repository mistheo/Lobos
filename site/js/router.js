/* Lobos — routeur de la page unique : bascule entre l'accueil et les 4 sections
   (à propos, services, galerie, contact), gère le hash pour les liens profonds
   et le bouton retour, et déclenche le rendu CMS d'une section à son premier
   affichage (mis en cache ensuite par data.js). */
import * as data from './data.js';
import * as render from './render.js';
import { initMarquee } from './marquee.js';

const VIEWS = ['accueil', 'a-propos', 'services', 'galerie', 'contact'];
const TITLES = {
  'accueil': 'Impression 3D à Toulouse · Lobos',
  'a-propos': 'À propos · Lobos',
  'services': 'Services et portfolio · Lobos',
  'galerie': 'Galerie · Lobos',
  'contact': 'Contact · Lobos'
};
const rendered = new Set();

function setSlot(slot, html) {
  const el = document.querySelector(`[data-slot="${slot}"]`);
  if (el) el.innerHTML = html;
}

function toggleSection(name, visible) {
  const el = document.querySelector(`[data-section="${name}"]`);
  if (el) el.hidden = !visible;
}

async function renderView(id) {
  if (rendered.has(id)) return;
  try {
    if (id === 'accueil') {
      const [services, atouts, projets] = await Promise.all([
        data.loadServices(), data.loadAtouts(), data.loadProjets()
      ]);
      setSlot('atouts', render.renderAtoutsList(atouts));
      setSlot('services-preview', render.renderServiceCards(services.slice(0, 3)));
      const phares = projets.filter((p) => p.phare);
      setSlot('projets-phares', render.renderProjectsPhares(phares));
      toggleSection('projets-phares', phares.length > 0);
    } else if (id === 'services') {
      setSlot('services', render.renderServiceRows(await data.loadServices()));
    } else if (id === 'galerie') {
      const projets = await data.loadProjets();
      setSlot('galerie', render.renderGalerieMarquee(projets));
      toggleSection('galerie-content', projets.length > 0);
      if (projets.length > 0) initMarquee(document.querySelector('[data-marquee]'));
    } else if (id === 'a-propos') {
      const [aPropos, equipe] = await Promise.all([data.loadAPropos(), data.loadEquipe()]);
      setSlot('a-propos-titre', escapeText(aPropos.titre));
      setSlot('a-propos-body', render.renderAProposBody(aPropos.bodyMarkdown));
      setSlot('a-propos-valeurs', render.renderAProposValeurs(aPropos.valeurs));
      setSlot('equipe', render.renderEquipe(equipe));
    }
    rendered.add(id);
  } catch (e) {
    console.error(`[router] rendu de la section "${id}" impossible :`, e);
  }
}

function escapeText(value) {
  const span = document.createElement('span');
  span.textContent = value ?? '';
  return span.innerHTML;
}

function showView(id) {
  document.querySelectorAll('[data-view]').forEach((section) => {
    const active = section.dataset.view === id;
    section.hidden = !active;
    if (active) {
      // relance l'animation .page-in (déjà utilisée pour les changements de page)
      section.classList.remove('page');
      void section.offsetWidth;
      section.classList.add('page');
    }
  });
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((a) => {
    const target = a.getAttribute('href').replace('#', '') || 'accueil';
    if (target === id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.title = TITLES[id] || TITLES.accueil;
}

function viewFromHash() {
  const id = location.hash.replace('#', '');
  return VIEWS.includes(id) ? id : 'accueil';
}

async function goTo(id, { push = true } = {}) {
  const view = VIEWS.includes(id) ? id : 'accueil';
  await renderView(view);
  showView(view);
  window.scrollTo(0, 0);
  if (push) {
    const url = view === 'accueil' ? location.pathname + location.search : `#${view}`;
    history.pushState({ view }, '', url);
  }
  document.getElementById('menu-mobile')?.setAttribute('hidden', '');
}

export function initRouter() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').replace('#', '') || 'accueil';
    if (!VIEWS.includes(id)) return;
    e.preventDefault();
    goTo(id);
  });
  window.addEventListener('popstate', () => goTo(viewFromHash(), { push: false }));
  goTo(viewFromHash(), { push: false });
}
