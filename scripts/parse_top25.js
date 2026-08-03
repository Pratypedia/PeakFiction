import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, '..', 'top-25.csv');
const jsonOutputPath = path.join(__dirname, '..', 'src', 'data', 'top25.json');

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

function processCSV() {
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) return;

  const headers = parseCSVLine(lines[0]);
  console.log('Headers:', headers);

  // Column matching
  const nameIdx = headers.findIndex(h => h.toLowerCase() === 'name');
  const mediumIdx = headers.findIndex(h => h.toLowerCase() === 'medium');
  const genreIdx = headers.findIndex(h => h.toLowerCase() === 'genre');
  const lengthIdx = headers.findIndex(h => h.toLowerCase() === 'length');
  const hoursIdx = headers.findIndex(h => h.toLowerCase().includes('hours of my life'));
  const pratyushRankIdx = headers.findIndex(h => h.toLowerCase().includes('ranking - pratyush'));
  const kanavRankIdx = headers.findIndex(h => h.toLowerCase().includes('ranking - kanav'));
  const imageIdx = headers.findIndex(h => h.toLowerCase().includes('image_url'));

  const stories = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 2) continue;

    const name = nameIdx !== -1 ? row[nameIdx] || '' : row[0] || '';
    const medium = (mediumIdx !== -1 ? row[mediumIdx] || '' : row[1] || '').split(',').map(m => m.trim()).filter(Boolean);
    const genre = (genreIdx !== -1 ? row[genreIdx] || '' : row[2] || '').split(',').map(g => g.trim()).filter(Boolean);
    const length = lengthIdx !== -1 ? row[lengthIdx] || '' : row[3] || '';
    const hours = hoursIdx !== -1 ? row[hoursIdx] || '' : '';
    
    let rankingPratyush = pratyushRankIdx !== -1 ? (row[pratyushRankIdx] && row[pratyushRankIdx] !== '-' ? row[pratyushRankIdx] : 'Unseen') : '';
    const rankingKanav = kanavRankIdx !== -1 ? (row[kanavRankIdx] && row[kanavRankIdx] !== '-' ? row[kanavRankIdx] : 'Unseen') : '';
    
    const imageUrl = imageIdx !== -1 ? row[imageIdx] || '' : row[7] || '';

    stories.push({
      id: `top25-${i}`,
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

  const outputDir = path.dirname(jsonOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(jsonOutputPath, JSON.stringify(stories, null, 2), 'utf8');
  console.log(`Successfully parsed ${stories.length} top 25 stories into ${jsonOutputPath}`);
}

processCSV();
