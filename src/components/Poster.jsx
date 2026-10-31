import React, { useEffect, useState } from 'react';

// Poster with a fallback chain: cached local copy -> original URL -> title card.
export default function Poster({ story, className, style, alt }) {
  const sources = [...new Set([story?.poster, story?.imageUrl].filter(Boolean))];
  const [attempt, setAttempt] = useState(0);

  useEffect(() => setAttempt(0), [story?.slug]);

  if (!story) return null;

  if (attempt >= sources.length) {
    return (
      <div className={`poster-fallback ${className || ''}`} style={style} role="img" aria-label={alt || story.name}>
        <span>{story.name}</span>
      </div>
    );
  }

  return (
    <img
      src={sources[attempt]}
      alt={alt || story.name}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setAttempt(a => a + 1)}
    />
  );
}
