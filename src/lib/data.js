// The story database: CSV files in /data, bundled at build time.
// Edit data/stories.csv or data/top25.csv (Excel, Numbers, any editor) and the site picks it up.
import storiesCsv from '../../data/stories.csv?raw';
import top25Csv from '../../data/top25.csv?raw';
import { parseAllStoriesCSV, parseTopStoriesCSV } from './storyCsv';
import { normalizeStories } from './stories';

export const stories = normalizeStories(parseAllStoriesCSV(storiesCsv));
export const topStories = normalizeStories(parseTopStoriesCSV(top25Csv));
