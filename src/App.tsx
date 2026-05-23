import React, { useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import { storage } from './services/storage';

import { TopBar } from './components/TopBar';
import { BGSScreen } from './screens/BGSScreen';
import { SAScreen } from './screens/SAScreen';
import { MainScreen } from './screens/MainScreen';

import { KnowledgeSheet } from './sheets/KnowledgeSheet';
import { TopicsSheet } from './sheets/TopicsSheet';
import { StatsSheet } from './sheets/StatsSheet';

function AppContent() {
  const { state, dispatch } = useAppContext();

  // Load persistent stats on mount
  useEffect(() => {
    storage.get('opic_stats', null).then(saved => {
      if (saved) {
        dispatch({ type: 'UPDATE_STATS', payload: saved as any });
      }
    });
  }, []);

  // Save stats when they change
  useEffect(() => {
    storage.set('opic_stats', state.stats);
  }, [state.stats]);

  return (
    <>
      <TopBar 
        phase={state.phase} 
        onJump={(p) => dispatch({ type: 'SET_PHASE', payload: p })} 
        onOpenStats={() => dispatch({ type: 'TOGGLE_SHEET', payload: 'stats' })}
      />
      
      <main style={{ height: 'calc(100% - 61px)', overflow: 'hidden' }}>
        {state.phase === 1 && <BGSScreen />}
        {state.phase === 2 && <SAScreen />}
        {state.phase === 3 && <MainScreen />}
      </main>

      {/* Sheets */}
      <KnowledgeSheet open={state.showKnowledge} onClose={() => dispatch({ type: 'CLOSE_ALL_SHEETS' })} />
      <TopicsSheet open={state.showTopics} onClose={() => dispatch({ type: 'CLOSE_ALL_SHEETS' })} />
      <StatsSheet open={state.showStats} onClose={() => dispatch({ type: 'CLOSE_ALL_SHEETS' })} />
    </>
  );
}

export default function App() {
  return <AppContent />;
}
