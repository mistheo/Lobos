/* Lobos — gabarits HTML pilotés par les données du CMS (site/data/*.json).
   Tout le style vient d'utilitaires Tailwind écrits directement dans les
   gabarits ci-dessous — aucune classe composant, rien à ajouter côté CSS. */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

const CARD = 'flex flex-col gap-2 p-3 rounded-md bg-surface shadow-sm';
const CARD_KICKER = 'text-[10px] tracking-[0.1em] uppercase text-accent';
const CARD_TITLE = 'font-heading font-medium text-[17px] leading-[1.2] m-0';
const CARD_BODY = 'm-0 text-[13px] opacity-80 flex-1';
const BTN_PRIMARY_BLOCK = 'inline-flex items-center justify-center gap-1.5 cursor-pointer no-underline font-heading font-medium text-sm leading-[1.2] text-accent bg-transparent border border-accent rounded-xs px-[10.08px] py-2 w-full mt-2 outline-hidden focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] active:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)]';
const PH_SLOT_43 = 'grid place-items-center text-center aspect-[4/3] [background:repeating-linear-gradient(135deg,var(--color-surface)_0_9px,color-mix(in_srgb,var(--color-text)_7%,transparent)_9px_18px)]';
const PH_SLOT_SPAN = 'font-mono text-[10px] tracking-[0.1em] text-[color-mix(in_srgb,var(--color-text)_55%,transparent)]';

// Carte service (aperçu accueil, "Ce que nous faisons").
export function renderServiceCards(services) {
  return services.map((s) => `
    <article class="${CARD} flex flex-col p-4">
  <div class="flex items-center gap-3 my-3">
    <i class="ph ph-${escapeHtml(s.icone)} text-accent text-[22px] flex-shrink-0"></i>
    <h3 class="${CARD_TITLE} text-lg font-bold text-gray-900 leading-tight">
      ${escapeHtml(s.titre)}
    </h3>
  </div>
  <p class="${CARD_BODY} text-gray-600 text-sm leading-relaxed">
    ${escapeHtml(s.description)}
  </p>
</article>`).join('');
}

// Ligne service (page Services, liste complète).
export function renderServiceRows(services) {
  return services.map((s) => `
    <div class="flex gap-6 py-8 border-b border-divider"><i class="ph ph-${escapeHtml(s.icone)} text-2xl text-accent shrink-0"></i><div><h4 class="font-heading font-medium leading-[1.12] tracking-[-0.015em] text-[20px] mb-2">${escapeHtml(s.titre)}</h4><p class="m-0 text-sm text-[color-mix(in_srgb,var(--color-text)_65%,transparent)]">${escapeHtml(s.description)}</p></div></div>`).join('');
}

// Puce du hero accueil ("Atouts (accueil)").
export function renderAtoutsList(atouts) {
  return atouts.map((a, i) => `
    <li><span class="block font-mono text-[10px] tracking-[0.12em] text-accent mb-2">${String(i + 1).padStart(2, '0')}</span><p class="m-0 text-sm text-[color-mix(in_srgb,var(--color-text)_70%,transparent)]">${escapeHtml(a.titre)}</p></li>`).join('');
}

// Carte projet, réutilisée pour les projets phares (accueil) et la galerie.
function projectCard(p, { hidden = false } = {}) {
  const ariaHidden = hidden ? ' aria-hidden="true"' : '';
  return `
    <article class="${CARD} shrink-0 w-[300px]"${ariaHidden}>
      <div class="${PH_SLOT_43}"><span class="${PH_SLOT_SPAN}">photo projet</span></div>
      <div class="${CARD_KICKER}">${escapeHtml(p.categorie)}</div>
      <h3 class="${CARD_TITLE}">${escapeHtml(p.titre)}</h3>
      <p class="${CARD_BODY}">${escapeHtml(p.description)}</p>
      <a class="${BTN_PRIMARY_BLOCK}" href="#projet/${encodeURIComponent(p.slug)}">Voir le projet</a>
    </article>`;
}

// Projets phares (accueil) : reçoit déjà les fiches filtrées sur "phare" par le routeur.
export function renderProjectsPhares(phares) {
  return phares.map((p) => projectCard(p)).join('');
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
    <div class="flex items-center gap-4"><div class="w-[48px] h-[48px] shrink-0 rounded-full [background:repeating-linear-gradient(135deg,color-mix(in_srgb,var(--color-text)_8%,transparent)_0_6px,color-mix(in_srgb,var(--color-text)_14%,transparent)_6px_12px)]"></div><div><strong class="block text-sm font-medium">${escapeHtml(m.nom)}</strong><span class="text-xs text-[color-mix(in_srgb,var(--color-text)_60%,transparent)]">${escapeHtml(m.role)}</span></div></div>`).join('');
}

// Cartes valeurs (page "à propos").
export function renderAProposValeurs(valeurs) {
  return valeurs.map((v) => `
    <div><i class="ph ph-${escapeHtml(v.icone)} text-accent text-[22px]"></i><h5 class="font-heading font-medium leading-[1.12] tracking-[-0.015em] text-base mt-3 mb-2">${escapeHtml(v.titre)}</h5><p class="m-0 text-[13px] text-[color-mix(in_srgb,var(--color-text)_68%,transparent)]">${escapeHtml(v.texte)}</p></div>`).join('');
}

// Rendu du Markdown ("à propos") : marked.js produit du HTML brut, sans classe.
// On pose les utilitaires Tailwind après coup sur les balises générées (pas de
// plugin @tailwindcss/typography disponible avec le CDN navigateur). Passe par
// le DOM plutôt que par un marked.Renderer custom pour rester indépendant de
// la signature exacte de son API (elle a changé entre versions de marked).
const HEADING_CLASSES = {
  H1: 'text-[25px]', H2: 'text-[25px]', H3: 'text-[20px]',
  H4: 'text-[16px]', H5: 'text-[16px]', H6: 'text-[13px] tracking-[0.08em] uppercase',
};

// Lien tel: à partir d'un numéro affiché en français ("05 61 00 00 00" -> "+33561000000").
function telHref(telephone) {
  const digits = String(telephone ?? '').replace(/\D/g, '');
  return digits.startsWith('0') ? `+33${digits.slice(1)}` : digits;
}

// Aside "Nous joindre" (page contact) : email, téléphone, adresse, Instagram (si renseigné).
export function renderContactAside(contact) {
  const lignesAdresse = String(contact.adresse ?? '').split('\n').filter(Boolean);
  const instagram = contact.instagram
    ? `<li class="flex gap-4 items-start"><i class="ph ph-instagram-logo text-accent"></i><a class="text-inherit no-underline hover:text-accent outline-hidden focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2" href="${escapeHtml(contact.instagram)}" target="_blank" rel="noopener">Instagram</a></li>`
    : '';
  return `
    <li class="flex gap-4 items-start"><i class="ph ph-envelope-simple text-accent"></i><a class="text-inherit no-underline hover:text-accent outline-hidden focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2" href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></li>
    <li class="flex gap-4 items-start"><i class="ph ph-phone text-accent"></i><a class="text-inherit no-underline hover:text-accent outline-hidden focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2" href="tel:${escapeHtml(telHref(contact.telephone))}">${escapeHtml(contact.telephone)}</a></li>
    <li class="flex gap-4 items-start"><i class="ph ph-map-pin text-accent"></i><span>${lignesAdresse.map(escapeHtml).join('<br />')}</span></li>
    ${instagram}`;
}

// Bloc contact du pied de page : mêmes coordonnées, en texte simple.
export function renderFooterContact(contact) {
  const instagram = contact.instagram
    ? `<a class="text-inherit no-underline hover:text-accent outline-hidden focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2" href="${escapeHtml(contact.instagram)}" target="_blank" rel="noopener">Instagram</a>`
    : '';
  const adresse = String(contact.adresse ?? '').split('\n').filter(Boolean).join(', ');
  return `<span>${escapeHtml(contact.email)}</span><span>${escapeHtml(contact.telephone)}</span><span class="text-muted">${escapeHtml(adresse)}</span>${instagram}`;
}

export function renderAProposBody(bodyMarkdown) {
  const wrap = document.createElement('div');
  wrap.className = 'text-[17px] leading-[1.6]';
  wrap.innerHTML = marked.parse(bodyMarkdown || '');
  wrap.querySelectorAll('p').forEach((el) => el.classList.add('mb-4'));
  wrap.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
    el.classList.add('font-heading', 'font-medium', 'leading-[1.12]', 'tracking-[-0.015em]', 'mt-6', 'mb-2', ...HEADING_CLASSES[el.tagName].split(' '));
  });
  wrap.querySelectorAll('ul').forEach((el) => el.classList.add('list-disc', 'pl-5', 'mb-4', 'flex', 'flex-col', 'gap-1'));
  wrap.querySelectorAll('ol').forEach((el) => el.classList.add('list-decimal', 'pl-5', 'mb-4', 'flex', 'flex-col', 'gap-1'));
  wrap.querySelectorAll('a').forEach((el) => {
    el.classList.add('text-accent', 'underline-offset-[3px]', 'outline-hidden', 'focus-visible:outline-2', 'focus-visible:outline-accent', 'focus-visible:outline-offset-2');
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
  return wrap.outerHTML;
}
