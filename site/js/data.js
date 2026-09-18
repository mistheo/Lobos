/* Lobos — couche de données : fetch des JSON générés depuis site/content/
   (voir scripts/build-content.mjs). Aucun contenu éditorial en dur ici. */

const cache = new Map();

function fetchJson(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(path, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`${path} : HTTP ${res.status}`);
      return res.json();
    }));
  }
  return cache.get(path);
}

export const loadProjets = () => fetchJson('data/projets.json');
export const loadServices = () => fetchJson('data/services.json');
export const loadAtouts = () => fetchJson('data/atouts.json');
export const loadEquipe = () => fetchJson('data/equipe.json');
export const loadAPropos = () => fetchJson('data/a-propos.json');
export const loadContact = () => fetchJson('data/contact.json');
