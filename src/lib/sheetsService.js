// Live Google Sheets synchronization service

export const SHEET_ALL_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhn1KH6zYm5auAK5TO9NG4EFx-ID9__brfvFMBOcVO6qPiDkWbZzOfkZ3kmfBrrvcH8u3xq1LEDsio/pub?gid=0&single=true&output=csv';
export const SHEET_TOP_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhn1KH6zYm5auAK5TO9NG4EFx-ID9__brfvFMBOcVO6qPiDkWbZzOfkZ3kmfBrrvcH8u3xq1LEDsio/pub?gid=1718171764&single=true&output=csv';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

export function parseAllStoriesCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);

  const nameIdx = headers.findIndex(h => h.toLowerCase() === 'name');
  const mediumIdx = headers.findIndex(h => h.toLowerCase() === 'medium');
  const genreIdx = headers.findIndex(h => h.toLowerCase() === 'genre');
  const lengthIdx = headers.findIndex(h => h.toLowerCase() === 'length');
  const hoursIdx = headers.findIndex(h => h.toLowerCase().includes('hours'));
  const pratyushRankIdx = headers.findIndex(h => h.toLowerCase().includes('ranking - pratyush'));
  const pratyushCommentIdx = headers.findIndex(h => h.toLowerCase().includes('comments - pratyush'));
  const kanavRankIdx = headers.findIndex(h => h.toLowerCase().includes('ranking - kanav'));
  const kanavCommentIdx = headers.findIndex(h => h.toLowerCase().includes('comments - kanav'));
  const favIdx = headers.findIndex(h => h.toLowerCase().includes('favorite'));
  const imageIdx = headers.findIndex(h => h.toLowerCase().includes('image'));

  const stories = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 2) continue;

    const name = nameIdx !== -1 ? row[nameIdx] || '' : row[0] || '';
    if (!name) continue;

    const medium = (mediumIdx !== -1 ? row[mediumIdx] || '' : row[1] || '').split(',').map(m => m.trim()).filter(Boolean);
    const genre = (genreIdx !== -1 ? row[genreIdx] || '' : row[2] || '').split(',').map(g => g.trim()).filter(Boolean);
    const length = lengthIdx !== -1 ? row[lengthIdx] || '' : row[3] || '';
    const hours = hoursIdx !== -1 ? row[hoursIdx] || '' : row[4] || '';
    
    const rankingPratyush = pratyushRankIdx !== -1 ? (row[pratyushRankIdx] && row[pratyushRankIdx] !== '-' ? row[pratyushRankIdx] : '') : '';
    const commentsPratyush = pratyushCommentIdx !== -1 ? row[pratyushCommentIdx] || '' : '';
    const rankingKanav = kanavRankIdx !== -1 ? (row[kanavRankIdx] && row[kanavRankIdx] !== '-' ? row[kanavRankIdx] : '') : '';
    const commentsKanav = kanavCommentIdx !== -1 ? row[kanavCommentIdx] || '' : '';
    const favoriteCharacters = favIdx !== -1 ? row[favIdx] || '' : '';
    const imageUrl = imageIdx !== -1 ? row[imageIdx] || '' : '';

    stories.push({
      id: `story-${i}`,
      name,
      medium,
      genre,
      length,
      hours,
      rankingPratyush,
      commentsPratyush,
      rankingKanav,
      commentsKanav,
      favoriteCharacters,
      imageUrl
    });
  }

  return stories;
}

export function parseTopStoriesCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);

  const nameIdx = headers.findIndex(h => h.toLowerCase() === 'name');
  const mediumIdx = headers.findIndex(h => h.toLowerCase() === 'medium');
  const genreIdx = headers.findIndex(h => h.toLowerCase() === 'genre');
  const lengthIdx = headers.findIndex(h => h.toLowerCase() === 'length');
  const hoursIdx = headers.findIndex(h => h.toLowerCase().includes('hours'));
  const pratyushRankIdx = headers.findIndex(h => h.toLowerCase().includes('ranking - pratyush'));
  const kanavRankIdx = headers.findIndex(h => h.toLowerCase().includes('ranking - kanav'));
  const imageIdx = headers.findIndex(h => h.toLowerCase().includes('image'));

  const stories = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 2) continue;

    const name = nameIdx !== -1 ? row[nameIdx] || '' : row[0] || '';
    if (!name) continue;

    const medium = (mediumIdx !== -1 ? row[mediumIdx] || '' : row[1] || '').split(',').map(m => m.trim()).filter(Boolean);
    const genre = (genreIdx !== -1 ? row[genreIdx] || '' : row[2] || '').split(',').map(g => g.trim()).filter(Boolean);
    const length = lengthIdx !== -1 ? row[lengthIdx] || '' : row[3] || '';
    const hours = hoursIdx !== -1 ? row[hoursIdx] || '' : '';
    
    let rankingPratyush = pratyushRankIdx !== -1 ? (row[pratyushRankIdx] && row[pratyushRankIdx] !== '-' ? row[pratyushRankIdx] : 'Unseen') : '';
    const rankingKanav = kanavRankIdx !== -1 ? (row[kanavRankIdx] && row[kanavRankIdx] !== '-' ? row[kanavRankIdx] : 'Unseen') : '';
    
    const imageUrl = imageIdx !== -1 ? row[imageIdx] || '' : row[7] || '';

    stories.push({
      id: `top-${i}`,
      rank: i,
      name,
      medium,
      genre,
      length,
      hours,
      rankingPratyush,
      rankingKanav,
      imageUrl
    });
  }

  return stories;
}

export async function fetchLiveSheetData() {
  try {
    const [allRes, topRes] = await Promise.all([
      fetch(SHEET_ALL_CSV_URL),
      fetch(SHEET_TOP_CSV_URL)
    ]);

    let stories = null;
    let topStories = null;

    if (allRes.ok) {
      const allText = await allRes.text();
      stories = parseAllStoriesCSV(allText);
    }

    if (topRes.ok) {
      const topText = await topRes.text();
      topStories = parseTopStoriesCSV(topText);
    }

    return { stories, topStories };
  } catch (error) {
    console.warn('Failed to fetch live Google Sheets data, using local fallback:', error);
    return { stories: null, topStories: null };
  }
}
