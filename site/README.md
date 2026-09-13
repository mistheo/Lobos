# Lobos — site vitrine

Page unique (SPA) : `index.html` charge les 5 vues (Accueil, À propos, Services, Galerie,
Contact) et bascule entre elles en JS, sans rechargement. Les tokens du design system
Nocturne, un menu mobile en JS natif, three.js pour le fond animé du hero.

## Fichiers

    site/
      index.html        Coquille unique : header/footer + les 5 <section data-view="…">
      a-propos.html      Redirection vers index.html#a-propos (compat anciens liens)
      services.html      Redirection vers index.html#services
      galerie.html       Redirection vers index.html#galerie
      contact.html       Redirection vers index.html#contact
      assets/logo.svg    Logo Lobos (affiché en masque CSS : il prend la couleur du thème)
      assets/favicon.svg Favicon (logo en violet accent)
      css/nocturne.css   Tokens et composants du design system (ne pas modifier ici)
      css/lobos.css      Couche site : layout, thème clair, carrousel
      js/app.js          Bascule de thème (cookie) + menu mobile
      js/hero.js         Fond animé blueprint (module three.js)
      js/main.js         Point d'entrée : démarre le routeur
      js/router.js       Bascule entre les vues, hash routing, cache le rendu par section
      js/data.js         fetch() des JSON de site/data/
      js/render.js        Gabarits HTML pilotés par les données du CMS
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
rendu pour éviter le flash. Les couleurs passent par `html[data-theme="light"]` dans
`css/lobos.css` : seules les variables sont redéfinies.

## Ajouter un projet au portfolio

1. Ouvrir PagesCMS, collection **Portfolio**.
2. « New entry » : titre, catégorie, image, description, ordre.
3. Cocher **Projet phare** pour l'afficher aussi sur l'accueil (trois fiches cochées : c'est la place
   disponible dans la grille). Sans la case, le projet n'apparaît que dans la galerie.
4. Enregistrer — PagesCMS commit le fichier dans `site/content/projets/`, la CI régénère
   `site/data/projets.json`, et la fiche apparaît sur le site (galerie + accueil si « phare »).
   Le doublon `aria-hidden="true"` du carrousel est généré automatiquement par `render.js`.

Les collections **Services**, **Atouts (accueil)**, **Équipe** et la page **À propos** fonctionnent de la même façon.

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
