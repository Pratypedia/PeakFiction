import React from 'react';
import '../about.css';
import '../mountain.css';

export default function AboutView({ onViewChange }) {
  const stats = [
    { medium: 'Comic Chapters', count: '7,796', icon: '📖' },
    { medium: 'Novel Chapters', count: '8,709', icon: '📜' },
    { medium: 'Show Episodes', count: '1,783', icon: '📺' },
    { medium: 'Movies', count: '78', icon: '🎬' },
    { medium: 'Books', count: '43', icon: '📚' }
  ];

  return (
    <div className="about-scene">
      {/* Fixed Background Elements */}
      <div className="about-background">
        <div className="about-sky-overlay"></div>
        <div className="mountain-layer mountain-bg-left"></div>
        <div className="mountain-layer mountain-bg-right"></div>
        <div className="mountain-layer mountain-bg-main"></div>
        <div className="mountain-layer mountain-mid-1"></div>
        <div className="mountain-layer mountain-mid-2"></div>
        
        <div className="clouds-overlay" style={{ zIndex: 5, top: '5%' }}>
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
        </div>

        <div className="mountain-layer mountain-front-1"></div>
        <div className="mountain-layer mountain-front-2"></div>
        <div className="about-trees-back"></div>
        <div className="about-trees-front"></div>
      </div>

      <div className="about-content-layer">
        {/* Left 2/3 - Wooden Sign */}
        <div className="sign-container">
          <div className="wooden-pole"></div>
          <div className="planks-wrapper">
            
            <div className="wooden-plank">
              <h1>About Peak Fiction</h1>
              <p>
                Hi, my name is <strong>Pratyush</strong>, and I have consumed an <em>obscene</em> amount of fiction. 
                Let's try to figure out how much this really looks like:
              </p>
              
              <div className="about-stats-grid">
                {stats.map((item) => (
                  <div key={item.medium} className="about-stat-item">
                    <span className="stat-icon" style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <div className="stat-info">
                      <span className="stat-medium" style={{ display: 'block', fontSize: '0.9rem', color: '#ccc' }}>{item.medium}</span>
                      <span className="stat-count" style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="wooden-plank">
              <p style={{ fontStyle: 'italic', color: '#ddd' }}>
                I have probably missed some, and I have intentionally left out a lot. For example, I don't know how many Disney movies I have watched... So instead, I'm low-balling these figures and sticking only to the numbers I can defend.
              </p>
              <p>
                Estimating that it takes me 5 minutes per novel or comic chapter, 20 minutes per show episode, 2 hours per movie, and 10 hours per book, this amounts to <strong style={{ color: '#ffb703', fontSize: '1.4rem' }}>2,555.75 hours</strong>.
              </p>
              <p>
                Or almost <strong>64 40-hour work weeks</strong> &rarr; over a year's worth of employment just consuming fiction!
              </p>
            </div>

            <div className="wooden-plank">
              <p>
                So then I thought, why not make a database to actually keep track of how much fiction I have consumed? And then why not make it a website? And why not bring Kanav (my younger brother) along for the ride?
              </p>
              <p>
                So here's <strong>V1</strong> of all the fiction we think we've consumed, our top-25 peak fiction recommendations, and our takes on every story.
              </p>
            </div>

            <div className="wooden-plank">
              <p>
                While I keep updating this with stories I remembered late or new stories I consume, I would love to talk about anything you found interesting on this website.
              </p>
              <ul style={{ paddingLeft: '25px', marginBottom: '20px', lineHeight: '1.6' }}>
                <li>Where did you agree or disagree with my ratings?</li>
                <li>What story do you think I should read/watch next?</li>
                <li>Is there any story on here you haven't found anyone to talk to about?</li>
              </ul>
              <p>
                Find me on Instagram <a href="https://instagram.com/pratypedia" target="_blank" rel="noopener noreferrer" className="about-link">@pratypedia</a><br/>
                or email <a href="mailto:sharmapratyush.2005@gmail.com" className="about-link">sharmapratyush.2005@gmail.com</a>
              </p>
            </div>

          </div>
        </div>

        {/* Right 1/3 - Navigational Arrows */}
        <div className="arrows-container">
          
          {/* Climb the Mountain -> Peak View (NorthEast) */}
          <button className="nav-arrow-btn nav-arrow-peak" onClick={() => onViewChange('mountain')}>
            <div className="nav-arrow-text">Climb the Mountain</div>
            <svg className="nav-arrow-svg" viewBox="0 0 100 80">
              <path d="M80 40 Q 50 40 20 40" fill="none" stroke="#ff3b5c" strokeWidth="8" strokeLinecap="round" />
              <polygon points="30,25 10,40 30,55" fill="#ff3b5c" />
            </svg>
          </button>

          {/* Take the Elevator -> All Stories (East) */}
          <button className="nav-arrow-btn nav-arrow-cards" onClick={() => onViewChange('cards')}>
            <div className="nav-arrow-text">Take the Elevator</div>
            <svg className="nav-arrow-svg" viewBox="0 0 100 80">
              <line x1="10" y1="40" x2="80" y2="40" stroke="#06b6d4" strokeWidth="8" strokeLinecap="round" />
              <polygon points="75,25 95,40 75,55" fill="#06b6d4" />
            </svg>
          </button>

          {/* Detective -> Charts (Curved/Twisting) */}
          <button className="nav-arrow-btn nav-arrow-charts" onClick={() => onViewChange('charts')}>
            <div className="nav-arrow-text">Look at what the<br/>Detective found</div>
            <svg className="nav-arrow-svg" viewBox="0 0 100 80">
              <path d="M10 20 C 40 -10, 60 70, 80 40" fill="none" stroke="#a855f7" strokeWidth="8" strokeLinecap="round" />
              <polygon points="70,30 90,35 85,55" fill="#a855f7" />
            </svg>
          </button>

        </div>
      </div>
    </div>
  );
}
