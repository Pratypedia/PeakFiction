import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, '..', 'Peak Fiction - Sheet1.csv');
const jsonOutputPath = path.join(__dirname, '..', 'src', 'data', 'stories.json');

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

function deriveTierFromScore(scoreVal) {
  if (!scoreVal || isNaN(scoreVal)) return null;
  const num = parseFloat(scoreVal);
  if (num >= 9.0) return 'Peak';
  if (num >= 7.5) return 'S';
  if (num >= 5.0) return 'A';
  return 'B';
}

function processCSV() {
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) return;

  const headers = parseCSVLine(lines[0]);
  console.log('Headers:', headers);

  // Find column indices dynamically by header name
  const nameIdx = headers.findIndex(h => h.toLowerCase() === 'name');
  const mediumIdx = headers.findIndex(h => h.toLowerCase() === 'medium');
  const genreIdx = headers.findIndex(h => h.toLowerCase() === 'genre');
  const lengthIdx = headers.findIndex(h => h.toLowerCase() === 'length');
  const scoreIdx = headers.findIndex(h => h.toLowerCase().includes('score'));
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
    const medium = (mediumIdx !== -1 ? row[mediumIdx] || '' : row[1] || '').split(',').map(m => m.trim()).filter(Boolean);
    const genre = (genreIdx !== -1 ? row[genreIdx] || '' : row[2] || '').split(',').map(g => g.trim()).filter(Boolean);
    const length = lengthIdx !== -1 ? row[lengthIdx] || '' : row[3] || '';
    const score = scoreIdx !== -1 ? (row[scoreIdx] && row[scoreIdx] !== '-' ? row[scoreIdx] : '') : '';
    
    let rankingPratyush = pratyushRankIdx !== -1 ? (row[pratyushRankIdx] && row[pratyushRankIdx] !== '-' ? row[pratyushRankIdx] : '') : '';
    if (!rankingPratyush && score) {
      const derived = deriveTierFromScore(score);
      if (derived) rankingPratyush = derived;
    }

    const commentsPratyush = pratyushCommentIdx !== -1 ? row[pratyushCommentIdx] || '' : '';
    const rankingKanav = kanavRankIdx !== -1 ? (row[kanavRankIdx] && row[kanavRankIdx] !== '-' ? row[kanavRankIdx] : '') : '';
    const commentsKanav = kanavCommentIdx !== -1 ? row[kanavCommentIdx] || '' : '';
    const favoriteCharacters = row[9] || '';
    const imageUrl = row[10] || '';

    stories.push({
      id: `story-${i}`,
      name,
      medium,
      genre,
      length,
      score,
      rankingPratyush,
      commentsPratyush,
      rankingKanav,
      commentsKanav,
      favoriteCharacters,
      imageUrl
    });
  }

  const outputDir = path.dirname(jsonOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(jsonOutputPath, JSON.stringify(stories, null, 2), 'utf8');
  console.log(`Successfully parsed ${stories.length} stories with Image_URLs into ${jsonOutputPath}`);
}

processCSV();
