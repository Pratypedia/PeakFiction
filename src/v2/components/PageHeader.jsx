import React from 'react';
import MarginNote from './MarginNote';

export default function PageHeader({ eyebrow, title, lede, note, children }) {
  return (
    <header className="v2-page-header v2-container">
      {eyebrow && <p className="v2-eyebrow">{eyebrow}</p>}
      <h1 className="v2-page-header__title">{title}</h1>
      {lede && <p className="v2-page-header__lede v2-prose">{lede}</p>}
      {note && <MarginNote className="v2-page-header__note" rotate={-2}>{note}</MarginNote>}
      {children}
    </header>
  );
}
