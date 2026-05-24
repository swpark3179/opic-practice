import { useEffect } from 'react';
import { PracticeStats, useAppContext } from './context/AppContext';
import { storage } from './services/storage';

import { BGSScreen } from './screens/BGSScreen';
import { SAScreen } from './screens/SAScreen';
import { MainScreen } from './screens/MainScreen';

import { KnowledgeSheet } from './sheets/KnowledgeSheet';
import { TopicsSheet } from './sheets/TopicsSheet';
import { StatsSheet } from './sheets/StatsSheet';

const STATS_KEY = 'opic_stats';

function AppContent() {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    storage.get<PracticeStats | null>(STATS_KEY, null).then(saved => {
      if (saved) dispatch({ type: 'UPDATE_STATS', payload: saved });
    });
  }, [dispatch]);

  useEffect(() => {
    storage.set(STATS_KEY, state.stats);
  }, [state.stats]);

  return (
    <div className="casual-app">
      {state.phase === 1 && <BGSScreen />}
      {state.phase === 2 && <SAScreen />}
      {state.phase === 3 && <MainScreen />}

      <KnowledgeSheet open={state.showKnowledge} onClose={() => dispatch({ type: 'CLOSE_ALL_SHEETS' })} />
      <TopicsSheet open={state.showTopics} onClose={() => dispatch({ type: 'CLOSE_ALL_SHEETS' })} />
      <StatsSheet open={state.showStats} onClose={() => dispatch({ type: 'CLOSE_ALL_SHEETS' })} />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
