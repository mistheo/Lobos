# Lobos — site vitrine

Site statique : 4 pages HTML, les tokens du design system Nocturne, un menu mobile en JS natif,
three.js pour le fond animé du hero.

## Fichiers

    site/
      index.html        Accueil (hero three.js, services, 3 projets phares)
      a-propos.html     À propos (histoire, valeurs, équipe)
      services.html     Services (renvoi vers la galerie)
      galerie.html      Tous les projets, carrousel infini
      contact.html      Formulaire + coordonnées
      assets/logo.svg   Logo Lobos (affiché en masque CSS : il prend la couleur du thème)
      assets/favicon.svg Favicon (logo en violet accent)
      css/nocturne.css  Tokens et composants du design system (ne pas modifier ici)
      css/lobos.css     Couche site : layout, thème clair, carrousel
      js/app.js         Bascule de thème (cookie)
      js/hero.js        Fond animé blueprint (module three.js)
      content/          Contenus éditables via PagesCMS
    .pages.yml          Configuration PagesCMS (à la racine du dépôt)

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
4. Enregistrer — PagesCMS commit le fichier dans `site/content/projets/`.

Les collections **Services**, **Atouts (accueil)**, **Équipe** et la page **À propos** fonctionnent de la même façon.
Le carrousel duplique la liste des projets pour la boucle infinie : au moment du câblage CMS,
générer le second jeu de cartes avec `aria-hidden="true"` (comme dans le HTML actuel).

## Déployer

    git tag v1.0.0
    git push --tags

Le workflow GitHub Actions déclenché par un tag `vx.x.x` envoie `site/` sur O2 Switch (FTP/SFTP
ou rsync). Aucune étape de build : les fichiers sont servis tels quels.

## À compléter

- Photos de projets et de l'atelier (placeholders rayés aujourd'hui).
- Plan d'accès de la page contact (image statique ou iframe).
- Endpoint du formulaire de contact (`action` du `<form>`) : service tiers, l'hébergement est statique.
