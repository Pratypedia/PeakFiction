import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, '..', 'Peak Fiction - Sheet1.csv');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Custom title search overrides for Wikipedia to ensure main franchise poster
const WIKI_TITLE_MAP = {
  'harry potter': 'Harry Potter and the Philosopher\'s Stone',
  'marvel cinematic universe': 'Marvel Cinematic Universe',
  'dcu': 'DC Extended Universe',
  'rick & morty': 'Rick and Morty',
  'ben 10': 'Ben 10',
  'john wick': 'John Wick (film)',
  'star wars': 'Star Wars',
  'stormlight archive': 'The Stormlight Archive',
  'michael vey': 'Michael Vey: The Prisoner of Cell 25',
  'the terrible two': 'The Terrible Two (book)',
  'wind breaker': 'Wind Breaker (manga)'
};

async function fetchWikipediaPoster(title) {
  try {
    const cleanLower = title.trim().toLowerCase();
    const searchTarget = WIKI_TITLE_MAP[cleanLower] || title.split('+')[0].replace(/\(.*?\)/g, '').trim();
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(searchTarget)}&piprop=original|thumbnail&pithumbsize=800`;
    const res = await fetch(searchUrl);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (pages) {
      for (const pageId in pages) {
        const page = pages[pageId];
        if (page.original?.source && !page.original.source.endsWith('.svg')) return page.original.source;
        if (page.thumbnail?.source && !page.thumbnail.source.endsWith('.svg')) return page.thumbnail.source;
      }
    }
  } catch (e) {}
  return null;
}

async function fetchAniListPoster(title, isAnimeManga) {
  try {
    const cleanTitle = title.replace(/\(.*?\)/g, '').split('+')[0].trim();
    const query = `
      query ($search: String) {
        Media (search: $search) {
          coverImage {
            extraLarge
            large
          }
        }
      }
    `;
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { search: cleanTitle } })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.Media?.coverImage?.extraLarge || data.data?.Media?.coverImage?.large;
  } catch (e) {
    return null;
  }
}

async function fetchKitsuPoster(title) {
  try {
    const cleanTitle = title.replace(/\(.*?\)/g, '').split('+')[0].trim();
    const url = `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(cleanTitle)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].attributes?.posterImage?.large || data.data[0].attributes?.posterImage?.original;
    }
  } catch (e) {}
  return null;
}

async function main() {
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return;

  const headers = parseCSVLine(lines[0]);
  const imageIdx = headers.findIndex(h => h.toLowerCase().includes('image'));
  const nameIdx = headers.findIndex(h => h.toLowerCase() === 'name');
  const mediumIdx = headers.findIndex(h => h.toLowerCase() === 'medium');

  console.log(`Checking CSV for missing poster images...`);

  let fetchedCount = 0;
  const updatedLines = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 2) continue;

    const name = row[nameIdx] || row[0] || '';
    const medium = (row[mediumIdx] || row[1] || '').toLowerCase();
    const existingImageUrl = imageIdx !== -1 ? (row[imageIdx] || '').trim() : '';

    // If already has Image_URL, preserve user's choice!
    if (existingImageUrl) {
      updatedLines.push(lines[i]);
      continue;
    }

    console.log(`\nFetching missing poster for: "${name}" (Medium: ${medium})`);

    const isWestern = medium.includes('book') || medium.includes('show') || medium.includes('movie') || medium.includes('comic') || name.toLowerCase().includes('harry potter') || name.toLowerCase().includes('marvel') || name.toLowerCase().includes('dcu') || name.toLowerCase().includes('star wars');

    let poster = null;

    if (isWestern) {
      // For Western Books/Movies/Shows -> Priority: WIKIPEDIA FIRST -> Kitsu -> AniList
      poster = await fetchWikipediaPoster(name);
      if (!poster) poster = await fetchKitsuPoster(name);
      if (!poster) poster = await fetchAniListPoster(name, false);
    } else {
      // For Anime / Manga / Manhwa -> Priority: AniList FIRST -> Kitsu -> Wikipedia
      poster = await fetchAniListPoster(name, true);
      if (!poster) poster = await fetchKitsuPoster(name);
      if (!poster) poster = await fetchWikipediaPoster(name);
    }

    if (poster) {
      console.log(`✅ Found poster: ${poster}`);
      fetchedCount++;
      if (imageIdx !== -1) {
        row[imageIdx] = poster;
      } else {
        row.push(poster);
      }
    } else {
      console.log(`⚠️ No poster found automatically for "${name}"`);
    }

    const formattedRow = row.map(val => `"${(val || '').replace(/"/g, '""')}"`);
    updatedLines.push(formattedRow.join(','));

    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync(csvFilePath, updatedLines.join('\n'), 'utf8');
  console.log(`\nFinished! Added ${fetchedCount} new poster URLs directly into ${csvFilePath}`);
}

main();
