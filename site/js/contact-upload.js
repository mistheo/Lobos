/* Formulaire de contact : dépôt (drag & drop) de fichiers 3D (STL, OBJ, 3MF)
   sur le champ "Votre projet", en plus du bouton "parcourez vos fichiers". */
const dropzone = document.querySelector('[data-file-dropzone]');
const input = document.getElementById('fichiers');
const browseBtn = document.querySelector('[data-file-browse]');
const list = document.querySelector('[data-file-list]');

if (dropzone && input && list) {
  const EXTENSIONS = ['.stl', '.obj', '.3mf'];
  let files = [];

  const isModel3D = (file) => EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

  function syncInput() {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
  }

  function renderList() {
    list.innerHTML = files.map((file, index) => `
      <li class="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] border border-divider">
        <i class="ph ph-cube text-accent"></i>${escapeHtml(file.name)}
        <button class="cursor-pointer bg-transparent border-0 p-0 leading-none text-[color-mix(in_srgb,var(--color-text)_55%,transparent)] hover:text-accent outline-hidden focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2" type="button" data-remove-file="${index}" aria-label="Retirer ${escapeHtml(file.name)}">
          <i class="ph ph-x"></i>
        </button>
      </li>
    `).join('');
  }

  function escapeHtml(value) {
    const span = document.createElement('span');
    span.textContent = value;
    return span.innerHTML;
  }

  function addFiles(incoming) {
    Array.from(incoming)
      .filter(isModel3D)
      .forEach((file) => {
        if (!files.some((f) => f.name === file.name && f.size === file.size)) files.push(file);
      });
    syncInput();
    renderList();
  }

  ['dragenter', 'dragover'].forEach((type) => {
    dropzone.addEventListener(type, (e) => {
      e.preventDefault();
      dropzone.setAttribute('data-dragover', '');
    });
  });
  ['dragleave', 'dragend'].forEach((type) => {
    dropzone.addEventListener(type, () => dropzone.removeAttribute('data-dragover'));
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.removeAttribute('data-dragover');
    addFiles(e.dataTransfer.files);
  });

  browseBtn?.addEventListener('click', () => input.click());
  input.addEventListener('change', () => addFiles(input.files));

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-file]');
    if (!btn) return;
    files.splice(Number(btn.dataset.removeFile), 1);
    syncInput();
    renderList();
  });
}
