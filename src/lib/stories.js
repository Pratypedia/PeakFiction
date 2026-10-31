// Normalisation for story records coming from the sheet or the local JSON fallback.
import posterManifest from '../data/posters.json';

const MEDIUM_LABELS = {
  anime: 'Anime',
  manga: 'Manga',
  manhwa: 'Manhwa',
  comic: 'Comic',
  comics: 'Comic',
  webtoon: 'Manhwa',
  novel: 'Novel',
  'web novel': 'Novel',
  book: 'Book',
  books: 'Book',
  show: 'Show',
  tv: 'Show',
  movie: 'Movie',
  film: 'Movie',
  game: 'Game',
  other: 'Other',
};

const MEDIUM_GROUPS = {
  Novel: 'Books + Novels',
  Book: 'Books + Novels',
  Show: 'Shows',
  Anime: 'Shows',
  Manga: 'Comics',
  Manhwa: 'Comics',
  Comic: 'Comics',
  Movie: 'Movies',
  Game: 'Games',
};

export function slugify(name) {
  return String(name)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeMedium(raw) {
  const clean = String(raw).trim();
  if (!clean) return null;
  return MEDIUM_LABELS[clean.toLowerCase()] ?? clean.charAt(0).toUpperCase() + clean.slice(1);
}

/** Broad medium bucket used by the charts ("Comics", "Shows", ...). */
export function consolidateMedium(medium) {
  return MEDIUM_GROUPS[normalizeMedium(medium)] ?? 'Other';
}

export function parseHours(raw) {
  if (raw == null || raw === '') return null;
  const match = String(raw).replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

const splitList = (value) =>
  (Array.isArray(value) ? value : String(value ?? '').split(','))
    .map(v => String(v).trim())
    .filter(Boolean);

const cleanRank = (value) => {
  const v = String(value ?? '').trim();
  return v === '-' || v.toLowerCase() === 'unseen' ? '' : v;
};

export function normalizeStory(raw, index = 0) {
  const name = String(raw.name ?? '').trim();
  const slug = slugify(name);
  return {
    ...raw,
    id: raw.id || `story-${index + 1}`,
    slug,
    name,
    medium: [...new Set(splitList(raw.medium).map(normalizeMedium).filter(Boolean))],
    genre: [...new Set(splitList(raw.genre))],
    length: String(raw.length ?? '').trim(),
    hours: String(raw.hours ?? '').trim(),
    hoursNum: parseHours(raw.hours),
    rankingPratyush: cleanRank(raw.rankingPratyush),
    rankingKanav: cleanRank(raw.rankingKanav),
    commentsPratyush: String(raw.commentsPratyush ?? '').trim(),
    commentsKanav: String(raw.commentsKanav ?? '').trim(),
    favoriteCharacters: String(raw.favoriteCharacters ?? '').trim(),
    imageUrl: String(raw.imageUrl ?? '').trim(),
    poster: posterManifest[slug] || String(raw.imageUrl ?? '').trim(),
  };
}

/** Normalise a list, dropping blank rows and duplicate titles (first one wins). */
export function normalizeStories(list) {
  const seen = new Set();
  const result = [];
  list.forEach((raw, i) => {
    const story = normalizeStory(raw, i);
    if (!story.slug || seen.has(story.slug)) return;
    seen.add(story.slug);
    result.push(story);
  });
  return result;
}
