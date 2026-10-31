import React from 'react';

// Handwritten annotation in Caveat. `who` tints it in a brother's colour.
export default function MarginNote({ children, who, rotate = -1.5, as: Tag = 'p', className = '' }) {
  return (
    <Tag className={`v2-margin-note ${who ? `v2-margin-note--${who}` : ''} ${className}`}
      style={{ '--note-rotate': `${rotate}deg` }}>
      {children}
    </Tag>
  );
}
