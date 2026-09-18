# Lobos — site vitrine

Page unique (SPA) : `index.html` charge les 5 vues (Accueil, À propos, Services, Galerie,
Contact) et bascule entre elles en JS, sans rechargement. Les tokens du design system
Nocturne, un menu mobile en JS natif, three.js pour le fond animé du hero.

## CSS : Tailwind pur (Play CDN), aucune classe composant

Il n'y a plus aucune classe composant (`.btn`, `.card`…) : chaque élément porte
directement ses utilitaires Tailwind dans le HTML (et dans les gabarits de
`js/render.js`). La seule configuration Tailwind vit dans `css/tailwind-config.css`,
compilée au runtime par `@tailwindcss/browser` (CDN, pas d'étape de build) :

`@tailwindcss/browser` ne sait lire que des balises `<style type="text/tailwindcss">`
inline (pas de `<link>` ni de `<script src>` vers un fichier externe). Pour garder la
config dans un fichier à part quand même, `index.html` charge `css/tailwind-config.css`
en JS et injecte son contenu dans une balise `<style type="text/tailwindcss" id="tw-config">`
vide ; le compilateur observe cette balise et recompile dès que son contenu change.
Contrepartie : un très bref flash sans style le temps du `fetch()`.

`css/tailwind-config.css` ne contient que de la configuration Tailwind :

- `@theme` déclare les tokens du design system Nocturne (couleurs, rayons, ombres,
  espacement, polices, animations) — ce sont eux qui génèrent les utilitaires
  (`bg-accent`, `shadow-sm`, `rounded-xs`, `font-heading`, `animate-marquee`…).
  `--spacing: 2.8px` aligne l'échelle numérique Tailwind (`p-4`, `gap-8`…) sur
  l'ancienne échelle `--space-*` de Nocturne.
- `@custom-variant theme-dark` / `theme-light` permettent de cibler `[data-theme]`
  directement avec des utilitaires (`theme-dark:hidden`…).
- `html[data-theme="light"] { --color-*: … }` redéfinit les tokens en thème clair.
- Deux `@keyframes` (page-in, marquee) sont requis par `--animate-page-in` /
  `--animate-marquee` (Tailwind ne génère pas les keyframes elles-mêmes).

Pour les valeurs qui n'ont pas d'équivalent en utilitaire nommé (masques CSS,
dégradés de fond, ratios non standard…), on utilise la syntaxe valeur arbitraire de
Tailwind (`[mask-image:...]`, `bg-[linear-gradient(...)]`) directement dans la
classe — jamais une règle CSS séparée.

Le contenu Markdown du CMS (page « à propos », rendu par `marked.js`) n'a pas de
classe CSS globale à laquelle s'accrocher (pas de plugin `@tailwindcss/typography`
disponible avec le CDN navigateur) : `js/render.js` parse le Markdown puis pose les
utilitaires Tailwind après coup sur chaque balise générée (`<p>`, `<h2>`, `<ul>`,
`<a>`…) via le DOM, plutôt que via un `marked.Renderer` custom (dont la signature a
changé entre versions de `marked`).

## Fichiers

    site/
      index.html               Coquille unique : header/footer + les 5 <section data-view="…">
      css/tailwind-config.css  Configuration Tailwind (@theme, variantes, keyframes) — voir ci-dessus
      assets/logo.svg    Logo Lobos (affiché en masque CSS : il prend la couleur du thème)
      assets/favicon.svg Favicon (logo en violet accent)
      js/app.js          Bascule de thème (cookie) + menu mobile
      js/hero.js         Fond animé blueprint (module three.js)
      js/main.js         Point d'entrée : démarre le routeur
      js/router.js       Bascule entre les vues, hash routing, cache le rendu par section
      js/data.js         fetch() des JSON de site/data/
      js/render.js        Gabarits HTML pilotés par les données du CMS
      js/marquee.js       Carrousel portfolio : défilement auto + glisser à la souris/au doigt
      content/           Contenus édités via PagesCMS (source de vérité éditoriale)
      data/              JSON générés depuis content/ — NE PAS ÉDITER À LA MAIN (voir plus bas)
    .pages.yml           Configuration PagesCMS (à la racine du dépôt)
    scripts/build-content.mjs  Génère site/data/*.json depuis site/content/**
    .github/workflows/build-content.yml  Relance ce script à chaque commit PagesCMS

## Comment le contenu du CMS arrive sur le site

1. Un⋅e éditeur⋅ice modifie une fiche dans PagesCMS → ça commit un `.md` dans
   `site/content/<collection>/`.
2. Le workflow **Générer les données du CMS** (`.github/workflows/build-content.yml`) se
   déclenche, exécute `npm run build:content`, et commit les `site/data/*.json` régénérés.
3. Le site (`site/js/data.js`) fetch ces JSON au chargement de chaque vue et les rend via
   `site/js/render.js` — aucun copier-coller à la main dans le HTML.

Pour régénérer localement : `npm install && npm run build:content`.

## Thème clair / sombre

Le bouton en haut à droite écrit un cookie `lobos-theme` (365 jours, `path=/`), donc le choix
est global au site. Un script inline dans le `<head>` applique le thème avant le premier
rendu pour éviter le flash. Les couleurs passent par `html[data-theme="light"]` dans le bloc
`<style type="text/tailwindcss">` de `index.html` : seules les variables sont redéfinies.

## Ajouter un projet au portfolio

1. Ouvrir PagesCMS, collection **Portfolio**.
2. « New entry » : titre, catégorie, image, description, ordre.
3. Cocher **Projet phare** pour l'afficher aussi sur l'accueil (trois fiches cochées : c'est la place
   disponible dans la grille). Sans la case, le projet n'apparaît que dans la galerie.
4. Enregistrer — PagesCMS commit le fichier dans `site/content/projets/`, la CI régénère
   `site/data/projets.json`, et la fiche apparaît sur le site (galerie + accueil si « phare »).
   Le doublon `aria-hidden="true"` du carrousel est généré automatiquement par `render.js`.

Les collections **Services**, **Atouts (accueil)**, **Équipe** et la page **À propos** fonctionnent de la même façon.

Si la collection **Portfolio** est vide, la section « Projets phares » (accueil) et le
carrousel de la galerie restent masqués plutôt que de s'afficher vides (`js/router.js`).

## Carrousel du portfolio

Le carrousel de la galerie défile automatiquement et se met en pause au survol ; `js/marquee.js`
permet en plus de le faire glisser à la souris (cliquer-glisser) ou au doigt sur écran tactile.
Le défilement respecte `prefers-reduced-motion`.

## Déployer

    git tag v1.0.0
    git push --tags

Un workflow GitHub Actions déclenché par un tag `vx.x.x` doit envoyer `site/` sur O2 Switch
(FTP/SFTP ou rsync) — ce workflow reste à créer (nécessite les identifiants d'hébergement en
secrets du dépôt). Aucune étape de build pour le site lui-même : les fichiers sont servis tels
quels, seule la génération de `site/data/*.json` tourne en CI.

## À compléter

- Workflow GitHub Actions de déploiement vers O2 Switch (identifiants à ajouter en secrets).
- Photos de projets et de l'atelier (placeholders rayés aujourd'hui).
- Plan d'accès de la page contact (image statique ou iframe).
- Endpoint du formulaire de contact (`action` du `<form>`) : service tiers, l'hébergement est statique.
