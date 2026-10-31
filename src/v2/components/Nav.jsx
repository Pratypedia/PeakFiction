import React, { useEffect, useState } from 'react';
import { href } from '../lib/router';

const LINKS = [
  { page: 'peak', to: '/peak', label: 'The Peak' },
  { page: 'stories', to: '/stories', label: 'All stories' },
  { page: 'charts', to: '/charts', label: 'Charts' },
  { page: 'about', to: '/about', label: 'About' },
];

export default function Nav({ page }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const current = page === 'story' ? 'stories' : page;
  return (
    <nav className={`v2-nav ${scrolled ? 'v2-nav--scrolled' : ''}`} aria-label="Main">
      <div className="v2-nav__inner v2-container">
        <a className="v2-nav__brand" href={href('/about')}>
          Peak <span className="v2-italic">Fiction</span>
        </a>
        <ul className="v2-nav__links">
          {LINKS.map(link => (
            <li key={link.page}>
              <a href={href(link.to)} className="v2-nav__link"
                aria-current={current === link.page ? 'page' : undefined}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
