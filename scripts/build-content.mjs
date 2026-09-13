#!/usr/bin/env node
// Génère site/data/*.json à partir des fichiers Markdown édités via PagesCMS
// (site/content/**), pour que le site (site/js/data.js) puisse les charger en
// fetch() au runtime sans jamais recopier le contenu à la main dans le HTML.
// Lancé en CI par .github/workflows/build-content.yml à chaque changement
// sous site/content/**, et peut être relancé localement via `npm run build:content`.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'site/content');
const dataDir = join(root, 'site/data');

// Collections définies dans .pages.yml (type: collection, un fichier par fiche).
const COLLECTIONS = ['projets', 'services', 'atouts', 'equipe'];

async function readCollection(name) {
  const dir = join(contentDir, name);
  const files = (await readdir(dir)).filter((file) => file.endsWith('.md'));
  const entries = await Promise.all(
    files.map(async (file) => matter(await readFile(join(dir, file), 'utf8')).data)
  );
  entries.sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
  return entries;
}

// Page « à propos » : collection type: file, un seul fichier avec un corps Markdown.
async function readAPropos() {
  const raw = await readFile(join(contentDir, 'a-propos.md'), 'utf8');
  const { data, content } = matter(raw);
  return { ...data, bodyMarkdown: content.trim() };
}

async function main() {
  await mkdir(dataDir, { recursive: true });

  for (const name of COLLECTIONS) {
    const entries = await readCollection(name);
    await writeFile(join(dataDir, `${name}.json`), JSON.stringify(entries, null, 2) + '\n');
    console.log(`data/${name}.json : ${entries.length} fiche(s)`);
  }

  const aPropos = await readAPropos();
  await writeFile(join(dataDir, 'a-propos.json'), JSON.stringify(aPropos, null, 2) + '\n');
  console.log('data/a-propos.json');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
