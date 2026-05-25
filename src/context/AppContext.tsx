import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Data types (to be fully defined later)
export interface BGSAnswers {
  [questionId: string]: string[];
}

export interface PracticeStats {
  totalPractice: number;
  totalTimeSeconds: number;
  lastPracticeDate: string | null;
}

export interface AppState {
  phase: number;
  bgsAnswers: BGSAnswers;
  saLevel: 'IL' | 'IH' | 'AL';
  saOption: string | null;
  saDifficulty: 'easy' | 'similar' | 'difficult' | null;
  ttsRate: number;
  stats: PracticeStats;
  generatedTest: any | null; // GeneratedTest
  currentTopicIdx: number;
  currentQuestionIdx: number;
  mode: 'voice' | 'text';
  textAnswer: string;
  showKnowledge: boolean;
  showTopics: boolean;
  showStats: boolean;
}

type Action = 
  | { type: 'SET_PHASE'; payload: number }
  | { type: 'UPDATE_BGS'; payload: { questionId: string; optionIds: string[] } }
  | { type: 'SET_SA_LEVEL'; payload: 'IL' | 'IH' | 'AL' }
  | { type: 'SET_SA_OPTION'; payload: string }
  | { type: 'SET_SA_DIFFICULTY'; payload: 'easy' | 'similar' | 'difficult' }
  | { type: 'SET_TTS_RATE'; payload: number }
  | { type: 'GENERATE_TEST'; payload: any } // GeneratedTest
  | { type: 'NAV_QUESTION'; payload: { delta: number } }
  | { type: 'JUMP_TO'; payload: { topicIdx: number; questionIdx?: number } }
  | { type: 'SET_MODE'; payload: 'voice' | 'text' }
  | { type: 'UPDATE_TEXT_ANSWER'; payload: string }
  | { type: 'TOGGLE_SHEET'; payload: 'knowledge' | 'topics' | 'stats' }
  | { type: 'UPDATE_STATS'; payload: PracticeStats }
  | { type: 'CLOSE_ALL_SHEETS' };

const initialState: AppState = {
  phase: 1,
  bgsAnswers: {},
  saLevel: 'AL',
  saOption: null,
  saDifficulty: 'similar',
  ttsRate: 1.0,
  stats: {
    totalPractice: 0,
    totalTimeSeconds: 0,
    lastPracticeDate: null
  },
  generatedTest: null,
  currentTopicIdx: 0,
  currentQuestionIdx: 0,
  mode: 'voice',
  textAnswer: '',
  showKnowledge: false,
  showTopics: false,
  showStats: false
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'UPDATE_BGS':
      return { 
        ...state, 
        bgsAnswers: { ...state.bgsAnswers, [action.payload.questionId]: action.payload.optionIds } 
      };
    case 'SET_SA_LEVEL':
      return { ...state, saLevel: action.payload, saOption: null };
    case 'SET_SA_OPTION':
      return { ...state, saOption: action.payload };
    case 'SET_SA_DIFFICULTY':
      return { ...state, saDifficulty: action.payload };
    case 'SET_TTS_RATE':
      return { ...state, ttsRate: action.payload };
    case 'GENERATE_TEST':
      return { ...state, generatedTest: action.payload, currentTopicIdx: 0, currentQuestionIdx: 0, mode: 'voice', textAnswer: '' };
    case 'NAV_QUESTION': {
      if (!state.generatedTest) return state;
      let tIdx = state.currentTopicIdx;
      let qIdx = state.currentQuestionIdx + action.payload.delta;
      const topics = state.generatedTest.topics;
      if (qIdx < 0) {
        if (tIdx > 0) { tIdx--; qIdx = topics[tIdx].questions.length - 1; }
        else { qIdx = 0; }
      } else if (qIdx >= topics[tIdx].questions.length) {
        if (tIdx < topics.length - 1) { tIdx++; qIdx = 0; }
        else { tIdx = topics.length; qIdx = 0; }
      }
      return { ...state, currentTopicIdx: tIdx, currentQuestionIdx: qIdx, textAnswer: '' };
    }
    case 'JUMP_TO': {
      if (!state.generatedTest) return state;
      const topics = state.generatedTest.topics;
      const tIdx = Math.max(0, Math.min(action.payload.topicIdx, topics.length - 1));
      const maxQ = topics[tIdx].questions.length - 1;
      const qIdx = Math.max(0, Math.min(action.payload.questionIdx ?? 0, maxQ));
      return { ...state, currentTopicIdx: tIdx, currentQuestionIdx: qIdx, textAnswer: '' };
    }
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'UPDATE_TEXT_ANSWER':
      return { ...state, textAnswer: action.payload };
    case 'TOGGLE_SHEET':
      return {
        ...state,
        showKnowledge: action.payload === 'knowledge' ? !state.showKnowledge : false,
        showTopics: action.payload === 'topics' ? !state.showTopics : false,
        showStats: action.payload === 'stats' ? !state.showStats : false,
      };
    case 'UPDATE_STATS':
      return { ...state, stats: action.payload };
    case 'CLOSE_ALL_SHEETS':
      return { ...state, showKnowledge: false, showTopics: false, showStats: false };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
