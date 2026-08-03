import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import initialStories from './data/stories.json';
import top25Stories from './data/top25.json';
import CardView from './components/CardView';
import MountainView from './components/MountainView';
import ChartsView from './components/ChartsView';
import AboutView from './components/AboutView';
import { Mountain, LayoutGrid, BarChart2, Info } from 'lucide-react';

export default function App() {
  const [stories, setStories] = useState(initialStories);
  const [currentView, setCurrentView] = useState('mountain'); // 'mountain' or 'cards'
  const [socialData, setSocialData] = useState({});
  const [targetStory, setTargetStory] = useState(null);

  const handleViewChange = (view, story = null) => {
    setCurrentView(view);
    if (story) setTargetStory(story);
  };

  useEffect(() => {
    if (supabase) {
      fetchGlobalSocialData();
    }
  }, []);

  const fetchGlobalSocialData = async () => {
    const { data: likes } = await supabase.from('likes').select('story_name');
    const { data: comments } = await supabase.from('comments').select('story_name');
    
    const aggregated = {};
    if (likes) {
      likes.forEach(like => {
        if (!aggregated[like.story_name]) aggregated[like.story_name] = { likes: 0, comments: 0 };
        aggregated[like.story_name].likes++;
      });
    }
    if (comments) {
      comments.forEach(comment => {
        if (!aggregated[comment.story_name]) aggregated[comment.story_name] = { likes: 0, comments: 0 };
        aggregated[comment.story_name].comments++;
      });
    }
    
    setSocialData(aggregated);
  };

  return (
    <>
      <div className="global-nav">
        <button 
          className={`global-nav-btn ${currentView === 'mountain' ? 'active' : ''}`}
          onClick={() => setCurrentView('mountain')}
        >
          <Mountain size={18} /> Peak
        </button>
        <button 
          className={`global-nav-btn ${currentView === 'cards' ? 'active' : ''}`}
          onClick={() => setCurrentView('cards')}
        >
          <LayoutGrid size={18} /> All Stories
        </button>
        <button 
          className={`global-nav-btn ${currentView === 'charts' ? 'active' : ''}`}
          onClick={() => setCurrentView('charts')}
        >
          <BarChart2 size={18} /> Charts
        </button>
        <button 
          className={`global-nav-btn ${currentView === 'about' ? 'active' : ''}`}
          onClick={() => setCurrentView('about')}
        >
          <Info size={18} /> About
        </button>
      </div>
      
      {currentView === 'mountain' ? (
        <MountainView 
          stories={top25Stories} 
          socialData={socialData}
          onViewChange={handleViewChange} 
        />
      ) : currentView === 'cards' ? (
        <CardView 
          stories={stories} 
          socialData={socialData}
          setStories={setStories} 
          onViewChange={handleViewChange} 
          targetStory={targetStory}
          clearTargetStory={() => setTargetStory(null)}
        />
      ) : currentView === 'charts' ? (
        <ChartsView 
          stories={stories}
        />
      ) : (
        <AboutView />
      )}
    </>
  );
}
