/* Lobos — gabarits HTML pilotés par les données du CMS (site/data/*.json).
   Chaque fonction reprend exactement les classes CSS déjà stylées dans
   css/lobos.css : rien de nouveau à styler côté CSS. */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Carte service (aperçu accueil, "Ce que nous faisons").
export function renderServiceCards(services) {
  return services.map((s) => `
    <article class="card elev-sm">
      <div class="card-kicker">Service</div>
      <i class="ph ph-${escapeHtml(s.icone)} card-icon"></i>
      <h3 class="card-title">${escapeHtml(s.titre)}</h3>
      <p class="card-body">${escapeHtml(s.description)}</p>
    </article>`).join('');
}

// Ligne service (page Services, liste complète).
export function renderServiceRows(services) {
  return services.map((s) => `
    <div class="service"><i class="ph ph-${escapeHtml(s.icone)}"></i><div><h4>${escapeHtml(s.titre)}</h4><p>${escapeHtml(s.description)}</p></div></div>`).join('');
}

// Puce du hero accueil ("Atouts (accueil)").
export function renderAtoutsList(atouts) {
  return atouts.map((a, i) => `
    <li><span class="num">${String(i + 1).padStart(2, '0')}</span><p>${escapeHtml(a.titre)}</p></li>`).join('');
}

// Carte projet, réutilisée pour les projets phares (accueil) et la galerie.
function projectCard(p, { hidden = false } = {}) {
  const ariaHidden = hidden ? ' aria-hidden="true"' : '';
  return `
    <article class="card elev-sm project"${ariaHidden}>
      <div class="ph-slot ratio-43"><span>photo projet</span></div>
      <div class="card-kicker">${escapeHtml(p.categorie)}</div>
      <h3 class="card-title">${escapeHtml(p.titre)}</h3>
      <p class="card-body">${escapeHtml(p.description)}</p>
      <a class="btn btn-primary btn-block" href="#contact">Discuter de mon projet</a>
    </article>`;
}

// Projets phares (accueil) : uniquement les fiches cochées "phare", triées par ordre.
export function renderProjectsPhares(projets) {
  return projets.filter((p) => p.phare).map((p) => projectCard(p)).join('');
}

// Carrousel de la galerie : toutes les fiches, plus un doublon aria-hidden pour la boucle infinie.
export function renderGalerieMarquee(projets) {
  const cards = projets.map((p) => projectCard(p)).join('');
  const clones = projets.map((p) => projectCard(p, { hidden: true })).join('');
  return cards + clones;
}

// Fiche équipe (aside "à propos").
export function renderEquipe(equipe) {
  return equipe.map((m) => `
    <div class="member"><div class="avatar"></div><div><strong>${escapeHtml(m.nom)}</strong><span>${escapeHtml(m.role)}</span></div></div>`).join('');
}

// Cartes valeurs (page "à propos").
export function renderAProposValeurs(valeurs) {
  return valeurs.map((v) => `
    <div><i class="ph ph-${escapeHtml(v.icone)} card-icon"></i><h5>${escapeHtml(v.titre)}</h5><p>${escapeHtml(v.texte)}</p></div>`).join('');
}

// Corps de la page "à propos" : Markdown rendu via marked.js (chargé en CDN dans index.html).
export function renderAProposBody(bodyMarkdown) {
  return `<div class="prose">${marked.parse(bodyMarkdown || '')}</div>`;
}
