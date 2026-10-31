import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Analytics } from '@vercel/analytics/react';
import initialStories from './data/stories.json';
import initialTop25Stories from './data/top25.json';
import { fetchLiveSheetData } from './lib/sheetsService';
import { fetchSocialCounts } from './lib/social';
import { normalizeStories } from './lib/stories';
import CardView from './components/CardView';
import MountainView from './components/MountainView';
import AboutView from './components/AboutView';
import { Mountain, LayoutGrid, BarChart2, Info } from 'lucide-react';

// Recharts is heavy; only load it when someone opens the Charts page.
const ChartsView = lazy(() => import('./components/ChartsView'));

// Hash routes: #/about, #/peak, #/stories, #/stories/<slug>, #/charts
const VIEW_TO_PATH = { about: 'about', mountain: 'peak', cards: 'stories', charts: 'charts' };
const PATH_TO_VIEW = Object.fromEntries(Object.entries(VIEW_TO_PATH).map(([v, p]) => [p, v]));

function parseHash() {
  const [path = '', slug = ''] = window.location.hash.replace(/^#\/?/, '').split('/');
  return { view: PATH_TO_VIEW[path] || 'about', slug: decodeURIComponent(slug) || null };
}

function buildHash(view, slug) {
  return `#/${VIEW_TO_PATH[view]}${slug ? `/${encodeURIComponent(slug)}` : ''}`;
}

const NAV_ITEMS = [
  { view: 'about', label: 'About', Icon: Info },
  { view: 'mountain', label: 'Peak', Icon: Mountain },
  { view: 'cards', label: 'All Stories', Icon: LayoutGrid },
  { view: 'charts', label: 'Charts', Icon: BarChart2 },
];

export default function App() {
  const [rawStories, setRawStories] = useState(initialStories);
  const [rawTopStories, setRawTopStories] = useState(initialTop25Stories);
  const [route, setRoute] = useState(parseHash);
  const [social, setSocial] = useState({ available: false, counts: {} });

  const stories = useMemo(() => normalizeStories(rawStories), [rawStories]);
  const topStories = useMemo(() => normalizeStories(rawTopStories), [rawTopStories]);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Each page starts at the top (the mountain scrolls itself to its base).
  useEffect(() => {
    if (route.view !== 'mountain') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [route.view]);

  useEffect(() => {
    fetchSocialCounts().then(setSocial);
    fetchLiveSheetData().then(({ stories: liveStories, topStories: liveTopStories }) => {
      if (liveStories?.length) setRawStories(liveStories);
      if (liveTopStories?.length) setRawTopStories(liveTopStories);
    });
  }, []);

  const navigate = useCallback((view, story = null) => {
    window.location.hash = buildHash(view, story?.slug);
  }, []);

  const openStory = useCallback((story) => navigate('cards', story), [navigate]);
  const closeStory = useCallback(() => navigate('cards'), [navigate]);

  return (
    <>
      <nav className="global-nav">
        {NAV_ITEMS.map(({ view, label, Icon }) => (
          <a
            key={view}
            href={buildHash(view)}
            className={`global-nav-btn ${route.view === view ? 'active' : ''}`}
            aria-current={route.view === view ? 'page' : undefined}
          >
            <Icon size={18} /> {label}
          </a>
        ))}
      </nav>

      {route.view === 'mountain' ? (
        <MountainView
          stories={topStories}
          socialData={social.counts}
          onViewChange={navigate}
        />
      ) : route.view === 'cards' ? (
        <CardView
          stories={stories}
          socialData={social.counts}
          socialAvailable={social.available}
          openSlug={route.slug}
          onOpenStory={openStory}
          onCloseStory={closeStory}
        />
      ) : route.view === 'charts' ? (
        <Suspense fallback={<div className="charts-page-wrapper" style={{ minHeight: '100vh' }} />}>
          <ChartsView
            stories={stories}
            onViewChange={navigate}
          />
        </Suspense>
      ) : (
        <AboutView onViewChange={navigate} />
      )}
      <Analytics />
    </>
  );
}
