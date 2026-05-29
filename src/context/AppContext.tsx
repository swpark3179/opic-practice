import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { FeedbackError, FeedbackResult, FeedbackStatus } from '../services/feedback/types';

// Data types (to be fully defined later)
export interface BGSAnswers {
  [questionId: string]: string[];
}

export interface PracticeStats {
  totalPractice: number;
  totalTimeSeconds: number;
  lastPracticeDate: string | null;
}

export interface FeedbackSliceState {
  currentId: string | null;
  status: FeedbackStatus;
  partial: Partial<FeedbackResult>;
  error: FeedbackError | null;
  showSheet: boolean;
  showSettings: boolean;
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
  feedback: FeedbackSliceState;
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
  | { type: 'CLOSE_ALL_SHEETS' }
  | { type: 'FEEDBACK_START'; payload: { id: string } }
  | { type: 'FEEDBACK_DELTA'; payload: { partial: Partial<FeedbackResult> } }
  | { type: 'FEEDBACK_DONE' }
  | { type: 'FEEDBACK_ERROR'; payload: FeedbackError }
  | { type: 'FEEDBACK_CANCEL' }
  | { type: 'FEEDBACK_RESET' }
  | { type: 'TOGGLE_FEEDBACK_SHEET'; payload?: boolean }
  | { type: 'TOGGLE_SETTINGS_SHEET'; payload?: boolean };

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
  showStats: false,
  feedback: {
    currentId: null,
    status: 'idle',
    partial: {},
    error: null,
    showSheet: false,
    showSettings: false,
  },
};

const initialFeedback: FeedbackSliceState = initialState.feedback;

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
      return {
        ...state,
        showKnowledge: false,
        showTopics: false,
        showStats: false,
        feedback: { ...state.feedback, showSheet: false, showSettings: false },
      };
    case 'FEEDBACK_START':
      return {
        ...state,
        feedback: {
          ...initialFeedback,
          currentId: action.payload.id,
          status: 'starting',
          showSheet: true,
        },
      };
    case 'FEEDBACK_DELTA':
      return {
        ...state,
        feedback: {
          ...state.feedback,
          status: 'streaming',
          partial: { ...state.feedback.partial, ...action.payload.partial },
        },
      };
    case 'FEEDBACK_DONE':
      return { ...state, feedback: { ...state.feedback, status: 'done' } };
    case 'FEEDBACK_ERROR':
      return { ...state, feedback: { ...state.feedback, status: 'error', error: action.payload } };
    case 'FEEDBACK_CANCEL':
      return {
        ...state,
        feedback: { ...state.feedback, status: 'cancelled', currentId: null },
      };
    case 'FEEDBACK_RESET':
      return {
        ...state,
        feedback: { ...initialFeedback, showSettings: state.feedback.showSettings },
      };
    case 'TOGGLE_FEEDBACK_SHEET':
      return {
        ...state,
        feedback: {
          ...state.feedback,
          showSheet: action.payload ?? !state.feedback.showSheet,
        },
      };
    case 'TOGGLE_SETTINGS_SHEET':
      return {
        ...state,
        feedback: {
          ...state.feedback,
          showSettings: action.payload ?? !state.feedback.showSettings,
        },
      };
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
