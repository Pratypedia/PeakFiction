import React from 'react';
import { Instagram } from 'lucide-react';
import ContactForm from '../components/ContactForm';
import MarginNote from '../components/MarginNote';
import Hero from './about/Hero';
import Tally from './about/Tally';
import Doorways from './about/Doorways';
import './AboutPage.css';

const QUESTIONS = [
  'Where did you agree or disagree with my ratings?',
  'What story do you think I should read/watch next?',
  "Is there any story on here you haven't found anyone to talk to about?",
];

function Origin() {
  return (
    <section className="ap-origin v2-container" aria-labelledby="ap-origin-title">
      <header className="ap-section-head">
        <p className="v2-eyebrow">How this happened</p>
        <h2 id="ap-origin-title" className="ap-section-title ap-section-title--sm">
          So then I thought&hellip;
        </h2>
      </header>

      <div className="ap-origin__body">
        <ol className="ap-origin__steps">
          <li className="ap-origin__step">
            <span className="ap-origin__mark" aria-hidden="true">1</span>
            <p>Why not make a <strong>database</strong> to actually keep track of how much fiction I have consumed?</p>
          </li>
          <li className="ap-origin__step">
            <span className="ap-origin__mark" aria-hidden="true">2</span>
            <p>And then why not make it a <strong>website</strong>?</p>
          </li>
          <li className="ap-origin__step">
            <span className="ap-origin__mark" aria-hidden="true">3</span>
            <p>And why not bring <strong className="ap-kanav">Kanav</strong> (my younger brother) along for the ride?</p>
          </li>
        </ol>

        <div className="ap-origin__aside">
          <ul className="ap-people" aria-label="Who's rating">
            <li className="ap-person ap-person--pratyush">
              <span className="ap-person__initial" aria-hidden="true">P</span>
              <span className="ap-person__text">
                <span className="ap-person__name">Pratyush</span>
                <span className="ap-person__role">Started this. The one writing to you.</span>
              </span>
            </li>
            <li className="ap-person ap-person--kanav">
              <span className="ap-person__initial" aria-hidden="true">K</span>
              <span className="ap-person__text">
                <span className="ap-person__name">Kanav</span>
                <span className="ap-person__role">Younger brother. Along for the ride.</span>
              </span>
            </li>
          </ul>
          <p className="ap-origin__coda">
            So here's <strong>V1</strong> of all the fiction we think we've consumed, our top-25 peak
            fiction recommendations, and our takes on every story.
          </p>
          <MarginNote className="ap-origin__note" rotate={-2}>
            blue ink is me, orange is Kanav
          </MarginNote>
        </div>
      </div>
    </section>
  );
}

function Connect() {
  return (
    <section className="ap-connect v2-container" aria-labelledby="ap-connect-title">
      <div className="ap-connect__intro">
        <p className="v2-eyebrow">Say hi</p>
        <h2 id="ap-connect-title" className="ap-section-title ap-section-title--sm">Let's connect.</h2>
        <p className="ap-connect__lede">
          While I keep updating this with stories I remembered late or new stories I consume, I would
          love to talk about anything you found interesting on this website.
        </p>
        <ul className="ap-questions">
          {QUESTIONS.map(q => <li key={q}>{q}</li>)}
        </ul>
        <a className="ap-insta" href="https://instagram.com/pratypedia" target="_blank" rel="noopener noreferrer">
          <Instagram size={18} aria-hidden="true" />
          <span>Find me on Instagram <strong>@pratypedia</strong></span>
        </a>
      </div>
      <div className="ap-connect__form">
        <ContactForm prompt="Tell me what you think is peak fiction." />
      </div>
    </section>
  );
}

export default function AboutPage({ stories = [], topStories = [] }) {
  return (
    <div className="ap">
      <Hero topStories={topStories} />
      <Tally />
      <Origin />
      <Doorways stories={stories} topStories={topStories} />
      <Connect />
    </div>
  );
}
