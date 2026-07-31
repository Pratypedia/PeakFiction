import React, { useState } from 'react';
import initialStories from './data/stories.json';
import CardView from './components/CardView';
import MountainView from './components/MountainView';

export default function App() {
  const [stories, setStories] = useState(initialStories);
  const [currentView, setCurrentView] = useState('mountain'); // 'mountain' or 'cards'

  return (
    <>
      {currentView === 'mountain' ? (
        <MountainView 
          stories={stories} 
          onViewChange={setCurrentView} 
        />
      ) : (
        <CardView 
          stories={stories} 
          setStories={setStories} 
          onViewChange={setCurrentView} 
        />
      )}
    </>
  );
}
