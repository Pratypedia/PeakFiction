import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, '..', 'Peak Fiction - Sheet1.csv');
const jsonFilePath = path.join(__dirname, '..', 'src', 'data', 'stories.json');

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

function syncCSVWithImageUrls() {
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  const stories = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

  // Map story name to imageUrl
  const imageMap = new Map();
  stories.forEach(s => {
    if (s.imageUrl) {
      imageMap.set(s.name.trim().toLowerCase(), s.imageUrl);
    }
  });

  const headers = parseCSVLine(lines[0]);
  let hasImageHeader = headers.some(h => h.toLowerCase().includes('image'));
  
  if (!hasImageHeader) {
    headers.push('Image_URL');
  }

  const newLines = [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',')];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 2) continue;

    const name = row[0] || '';
    const cleanName = name.trim().toLowerCase();
    const existingImageUrl = imageMap.get(cleanName) || '';

    // If row didn't have Image_URL column yet, append it
    if (!hasImageHeader) {
      row.push(existingImageUrl);
    } else {
      // Find index of image column
      const imgIdx = headers.findIndex(h => h.toLowerCase().includes('image'));
      if (imgIdx !== -1 && !row[imgIdx] && existingImageUrl) {
        row[imgIdx] = existingImageUrl;
      }
    }

    const formattedRow = row.map(val => `"${(val || '').replace(/"/g, '""')}"`);
    newLines.push(formattedRow.join(','));
  }

  fs.writeFileSync(csvFilePath, newLines.join('\n'), 'utf8');
  console.log(`Successfully updated ${csvFilePath} with Image_URL column!`);
}

syncCSVWithImageUrls();
