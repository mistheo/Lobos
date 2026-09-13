/* Lobos — point d'entrée de la page unique : démarre le routeur (site/js/router.js)
   qui bascule entre l'accueil et les sections et charge leur contenu CMS. */
import { initRouter } from './router.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRouter);
} else {
  initRouter();
}
