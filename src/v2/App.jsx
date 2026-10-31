import React, { Suspense, lazy, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { stories, topStories } from '../lib/data';
import { useRoute } from './lib/router';
import Nav from './components/Nav';
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import PeakPage from './pages/PeakPage';
import StoriesPage from './pages/StoriesPage';
import StoryPage from './pages/StoryPage';

// Recharts is heavy; only load it on the Charts page.
const ChartsPage = lazy(() => import('./pages/ChartsPage'));

const TITLES = {
  about: 'About',
  peak: 'The Peak',
  stories: 'All stories',
  charts: 'Charts',
};

export default function App() {
  const { page, param } = useRoute();

  // New pages start at the top (pages may override, e.g. the Peak scrolls to its base).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page, param]);

  useEffect(() => {
    const story = page === 'story' ? stories.find(s => s.slug === param) : null;
    const title = story ? story.name : TITLES[page];
    document.title = title ? `${title} · Peak Fiction` : 'Peak Fiction';
  }, [page, param]);

  let content;
  switch (page) {
    case 'peak':
      content = <PeakPage topStories={topStories} stories={stories} />;
      break;
    case 'stories':
      content = <StoriesPage stories={stories} />;
      break;
    case 'charts':
      content = <ChartsPage stories={stories} />;
      break;
    case 'story':
      content = <StoryPage stories={stories} topStories={topStories} slug={param} />;
      break;
    default:
      content = <AboutPage stories={stories} topStories={topStories} />;
  }

  return (
    <>
      <a className="v2-skip-link" href="#main">Skip to content</a>
      <Nav page={page} />
      <main id="main" className={`v2-main v2-main--${page}`}>
        <Suspense fallback={<div className="v2-loading" aria-busy="true" />}>
          {content}
        </Suspense>
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
