// Caches every poster referenced in data/*.csv into public/posters/ so the site
// doesn't depend on hotlinked images that other sites can block or delete.
//
//   npm run posters            # download only missing posters
//   npm run posters -- --force # re-download every poster
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { parseAllStoriesCSV, parseTopStoriesCSV } from '../src/lib/storyCsv.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src', 'data');
const csvDir = path.join(root, 'data');
const posterDir = path.join(root, 'public', 'posters');
const force = process.argv.includes('--force');

const POSTER_MAX_PX = 600;
const CONCURRENCY = 6;

// Same slug rules as src/lib/stories.js (kept inline to avoid Vite-only imports).
const slugify = (name) => String(name)
  .normalize('NFKD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[’']/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const writeJSON = (file, data) =>
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2) + '\n', 'utf8');

const hasSips = (() => {
  try { execFileSync('which', ['sips'], { stdio: 'ignore' }); return true; } catch { return false; }
})();

async function downloadPoster(url, slug) {
  const target = path.join(posterDir, `${slug}.jpg`);
  if (!force && fs.existsSync(target)) return true;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (PeakFiction poster sync)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Some CDNs send "image" or "binary/octet-stream"; only reject obvious pages.
  const type = res.headers.get('content-type') || '';
  if (/text\/html|json/.test(type)) throw new Error(`not an image (${type})`);

  const tmp = `${target}.download`;
  fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));

  try {
    if (hasSips) {
      // Resize + re-encode as JPEG (handles webp/png/avif sources too; fails on non-images).
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '80',
        '-Z', String(POSTER_MAX_PX), tmp, '--out', target], { stdio: 'ignore' });
    } else {
      fs.copyFileSync(tmp, target);
    }
  } catch {
    throw new Error('could not decode image');
  } finally {
    fs.rmSync(tmp, { force: true });
  }
  return true;
}

async function syncPosters(records) {
  fs.mkdirSync(posterDir, { recursive: true });
  const bySlug = new Map();
  for (const r of records) {
    const slug = slugify(r.name);
    if (slug && r.imageUrl && !bySlug.has(slug)) bySlug.set(slug, r.imageUrl);
  }

  const manifest = {};
  const failures = [];
  const queue = [...bySlug.entries()];

  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const [slug, url] = queue.shift();
      try {
        await downloadPoster(url, slug);
        manifest[slug] = `/posters/${slug}.jpg`;
      } catch (err) {
        failures.push(`${slug}: ${err.message}`);
      }
    }
  }));

  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  writeJSON('posters.json', sorted);
  console.log(`Posters: ${Object.keys(manifest).length} cached, ${failures.length} failed`);
  failures.forEach(f => console.log(`  ✗ ${f}`));
}

function main() {
  const read = (file) => fs.readFileSync(path.join(csvDir, file), 'utf8');
  const stories = parseAllStoriesCSV(read('stories.csv'));
  const topStories = parseTopStoriesCSV(read('top25.csv'));
  console.log(`Read ${stories.length} stories and ${topStories.length} top stories.`);
  return syncPosters([...stories, ...topStories]);
}

main();
