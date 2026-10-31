// Turns the story CSVs in /data into raw records; normalisation happens in ./stories.js.
// Kept free of Vite-only imports so scripts/sync_posters.js can reuse it from Node.
import { parseCSV } from './csv.js';

// Header matchers, so renaming a column in the sheet ("Hours of my life" vs
// "Hours it would take...") doesn't break the site.
const COLUMNS = {
  name: h => h === 'name',
  medium: h => h === 'medium',
  genre: h => h === 'genre',
  length: h => h === 'length',
  hours: h => h.includes('hours'),
  rankingPratyush: h => h.includes('ranking - pratyush'),
  commentsPratyush: h => h.includes('comments - pratyush'),
  rankingKanav: h => h.includes('ranking - kanav'),
  commentsKanav: h => h.includes('comments - kanav'),
  favoriteCharacters: h => h.includes('favorite'),
  imageUrl: h => h.includes('image'),
};

function parseSheet(csvText, idPrefix) {
  const [headerRow = [], ...rows] = parseCSV(csvText);
  const headers = headerRow.map(h => h.toLowerCase());
  const indexes = Object.fromEntries(
    Object.entries(COLUMNS).map(([field, match]) => [field, headers.findIndex(match)])
  );

  return rows
    .map((cells, i) => {
      const record = { id: `${idPrefix}-${i + 1}` };
      for (const [field, idx] of Object.entries(indexes)) {
        record[field] = idx === -1 ? '' : cells[idx] ?? '';
      }
      return record;
    })
    .filter(record => record.name);
}

export function parseAllStoriesCSV(csvText) {
  return parseSheet(csvText, 'story');
}

export function parseTopStoriesCSV(csvText) {
  return parseSheet(csvText, 'top').map((record, i) => ({ ...record, rank: i + 1 }));
}
