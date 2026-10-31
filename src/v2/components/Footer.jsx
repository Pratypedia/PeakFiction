import React from 'react';
import { CONTACT_EMAIL } from '../../lib/contact';

export default function Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-container v2-footer__inner">
        <p>
          <span className="v2-footer__brand">Peak <span className="v2-italic">Fiction</span></span>
          {' '}— kept by Pratyush &amp; Kanav.
        </p>
        <p className="v2-footer__links">
          <a href="https://instagram.com/pratypedia" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={`mailto:${CONTACT_EMAIL}`}>Email</a>
          <a href="?classic">Classic site</a>
        </p>
      </div>
    </footer>
  );
}
