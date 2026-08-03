import React from 'react';

export default function AboutView() {
  const stats = [
    { medium: 'Comic Chapters', count: '7,796', icon: '📖' },
    { medium: 'Novel Chapters', count: '8,709', icon: '📜' },
    { medium: 'Show Episodes', count: '1,783', icon: '📺' },
    { medium: 'Movies', count: '78', icon: '🎬' },
    { medium: 'Books', count: '43', icon: '📚' }
  ];

  return (
    <div className="about-page-wrapper">
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', maxWidth: '850px' }}>
        
        {/* Main Header */}
        <div className="hero-section" style={{ paddingBottom: '2rem', textAlign: 'center' }}>
          <h2 className="hero-title gradient-text">About Peak Fiction</h2>
          <p className="hero-subtitle">
            Who we are, how much fiction we've consumed, and why this vault exists.
          </p>
        </div>

        {/* Intro Card */}
        <div className="controls-card about-card" style={{ marginBottom: '2rem' }}>
          <p className="about-intro-text">
            Hi, my name is <strong>Pratyush</strong>, and I have consumed an <em>obscene</em> amount of fiction.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
            Let's try to figure out how much this really looks like:
          </p>

          {/* Medium Counts Table / Grid */}
          <div className="about-stats-grid">
            {stats.map((item) => (
              <div key={item.medium} className="about-stat-item">
                <span className="stat-icon">{item.icon}</span>
                <div className="stat-info">
                  <span className="stat-medium">{item.medium}</span>
                  <span className="stat-count">{item.count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quote Box */}
          <div className="about-quote-box">
            <p>
              I have probably missed some, and I have intentionally left out a lot. For example, I don't know how many Disney movies I have watched, but adding them will definitely make movies cross a hundred. I also don't know how many episodes of kids' cartoons I've watched, or how many Geronimo Stilton books I've read. So instead, I'm low-balling these figures and sticking only to the numbers I can defend (fiction I've consumed high school onwards).
            </p>
          </div>

          {/* Calculation Highlights */}
          <div className="about-calc-box">
            <p style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Estimating that it takes me 5 minutes per novel or comic chapter, 20 minutes per show episode, 2 hours per movie, and 10 hours per book, this amounts to <strong className="highlight-text">2,555.75 hours</strong>.
            </p>
            <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-muted)' }}>
              Or almost <strong className="highlight-text-gold">64 40-hour work weeks</strong> &rarr; over a year's worth of employment just consuming fiction!
            </p>
          </div>

          <p className="about-paragraph">
            So then I thought, why not make a database to actually keep track of how much fiction I have consumed? And then why not make it a website? And why not bring Kanav (my younger brother) along for the ride?
          </p>

          <p className="about-paragraph">
            So here's <strong>V1</strong> of all the fiction we think we've consumed, our top-25 peak fiction recommendations, and our takes on every story.
          </p>
        </div>

        {/* Connect Section */}
        <div className="controls-card about-card">
          <h3 className="about-section-title gradient-text-gold">Let's Connect!</h3>
          <p className="about-paragraph" style={{ marginBottom: '1.5rem' }}>
            While I keep updating this with stories I remembered late or new stories I consume, I would love to talk about anything you found interesting on this website:
          </p>

          <ul className="about-bullet-list">
            <li>Where did you agree or disagree with my ratings & comments?</li>
            <li>What do you consider peak fiction?</li>
            <li>What story do you think I should read/watch next?</li>
            <li>Maybe I can recommend a story to you based on your interests?</li>
            <li>Is there any story on here you haven't found anyone to talk to about because it's too niche?</li>
          </ul>

          <p className="about-paragraph" style={{ marginTop: '1.5rem' }}>
            You can add a comment under any story, and I'll try to respond. Otherwise, you can find me on Instagram{' '}
            <a href="https://instagram.com/pratypedia" target="_blank" rel="noopener noreferrer" className="about-link">
              @pratypedia
            </a>{' '}
            or email me at{' '}
            <a href="mailto:sharmapratyush.2005@gmail.com" className="about-link">
              sharmapratyush.2005@gmail.com
            </a>.
          </p>

          <p style={{ marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center' }}>
            Have fun browsing! ✨
          </p>
        </div>

      </div>
    </div>
  );
}
