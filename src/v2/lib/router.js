// Tiny hash router for the redesign.
import { useEffect, useState } from 'react';

function safeDecode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment; // malformed escape like "%E0"
  }
}

export function parseHash(hash = window.location.hash) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(safeDecode);
  const [page = '', param = null] = parts;
  // Old links: #/stories/<slug> → story page
  if (page === 'stories' && param) return { page: 'story', param };
  const known = ['peak', 'stories', 'charts', 'story', 'about'];
  return { page: known.includes(page) ? page : 'about', param };
}

export function href(to) {
  return `#${to.startsWith('/') ? to : `/${to}`}`;
}

export function storyHref(story) {
  return href(`/story/${encodeURIComponent(story.slug)}`);
}

export function navigate(to) {
  window.location.hash = href(to);
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash());
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
