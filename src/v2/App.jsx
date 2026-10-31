import React, { Suspense, lazy, useEffect, useRef } from 'react';
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

// The hash is our router, so the skip link must move focus without changing it.
function skipToContent(e) {
  e.preventDefault();
  const main = document.getElementById('main');
  main?.focus({ preventScroll: true });
  main?.scrollIntoView();
}

const SCROLL_KEY = 'pf-v2-scroll-stories';

export default function App() {
  const { page, param } = useRoute();
  const prevPage = useRef(page);

  // Remember how far down All stories the reader was, so Back from a story returns there.
  useEffect(() => {
    if (page !== 'stories') return;
    const save = () => sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [page]);

  // New pages start at the top (pages may override, e.g. the Peak scrolls to its base),
  // except returning from a story to the shelf.
  useEffect(() => {
    const saved = Number(sessionStorage.getItem(SCROLL_KEY));
    const returning = page === 'stories' && prevPage.current === 'story' && saved > 0;
    prevPage.current = page;
    window.scrollTo({ top: returning ? saved : 0, behavior: 'instant' });
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
      content = <StoryPage key={param} stories={stories} topStories={topStories} slug={param} />;
      break;
    default:
      content = <AboutPage stories={stories} topStories={topStories} />;
  }

  return (
    <>
      <a className="v2-skip-link" href="#main" onClick={skipToContent}>Skip to content</a>
      <Nav page={page} />
      <main id="main" tabIndex={-1} className={`v2-main v2-main--${page}`}>
        <Suspense fallback={<div className="v2-loading" aria-busy="true" />}>
          {content}
        </Suspense>
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
