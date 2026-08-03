import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseAllStoriesCSV, parseTopStoriesCSV, SHEET_ALL_CSV_URL, SHEET_TOP_CSV_URL } from '../src/lib/sheetsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sync() {
  console.log('Fetching latest Google Sheets data...');
  const [allRes, topRes] = await Promise.all([
    fetch(SHEET_ALL_CSV_URL),
    fetch(SHEET_TOP_CSV_URL)
  ]);

  if (allRes.ok) {
    const allText = await allRes.text();
    const stories = parseAllStoriesCSV(allText);
    const storiesPath = path.join(__dirname, '..', 'src', 'data', 'stories.json');
    fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2), 'utf8');
    console.log(`Updated ${stories.length} stories in src/data/stories.json`);
  } else {
    console.error('Failed to fetch All Stories CSV:', allRes.statusText);
  }

  if (topRes.ok) {
    const topText = await topRes.text();
    const topStories = parseTopStoriesCSV(topText);
    const topPath = path.join(__dirname, '..', 'src', 'data', 'top25.json');
    fs.writeFileSync(topPath, JSON.stringify(topStories, null, 2), 'utf8');
    console.log(`Updated ${topStories.length} top stories in src/data/top25.json`);
  } else {
    console.error('Failed to fetch Top Stories CSV:', topRes.statusText);
  }
}

sync();
