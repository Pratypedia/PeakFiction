// Live Google Sheets synchronization service.
// Returns raw records; normalisation happens in ./stories.js.
// Kept free of Vite-only imports so scripts/sync_sheet.js can reuse it from Node.
import { parseCSV } from './csv.js';

export const SHEET_ALL_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhn1KH6zYm5auAK5TO9NG4EFx-ID9__brfvFMBOcVO6qPiDkWbZzOfkZ3kmfBrrvcH8u3xq1LEDsio/pub?gid=0&single=true&output=csv';
export const SHEET_TOP_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhn1KH6zYm5auAK5TO9NG4EFx-ID9__brfvFMBOcVO6qPiDkWbZzOfkZ3kmfBrrvcH8u3xq1LEDsio/pub?gid=1718171764&single=true&output=csv';

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

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
}

export async function fetchLiveSheetData() {
  const [all, top] = await Promise.allSettled([
    fetchCSV(SHEET_ALL_CSV_URL),
    fetchCSV(SHEET_TOP_CSV_URL),
  ]);

  if (all.status === 'rejected' || top.status === 'rejected') {
    console.warn('Google Sheets fetch failed, using local fallback where needed.',
      all.reason ?? '', top.reason ?? '');
  }

  return {
    stories: all.status === 'fulfilled' ? parseAllStoriesCSV(all.value) : null,
    topStories: top.status === 'fulfilled' ? parseTopStoriesCSV(top.value) : null,
  };
}
