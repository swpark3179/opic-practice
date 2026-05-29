export type OpicLevel = 'IL' | 'IM' | 'IH' | 'AL';

export interface GrammarItem {
  original: string;
  corrected: string;
  explanation_ko: string;
}

export interface VocabularyItem {
  original: string;
  upgraded: string;
  reason_ko: string;
}

export interface FluencyBlock {
  score_0_10: number;
  comments_ko: string[];
}

export interface FeedbackResult {
  overall_level?: OpicLevel;
  overall_summary?: string;
  grammar?: GrammarItem[];
  vocabulary?: VocabularyItem[];
  fluency_structure?: FluencyBlock;
}

export type FeedbackCriterion =
  | 'grammar'
  | 'vocabulary'
  | 'fluency_structure'
  | 'overall';

export interface FeedbackRequest {
  question: string;
  transcript: string;
  level: 'IL' | 'IH' | 'AL';
  criteria: FeedbackCriterion[];
}

export interface ApiConfig {
  baseUrl: string;
  bearer: string;
  modelHint?: string;
}

export type FeedbackStatus =
  | 'idle'
  | 'starting'
  | 'streaming'
  | 'done'
  | 'error'
  | 'cancelled';

export type FeedbackErrorCode =
  | 'no_config'
  | 'network'
  | 'unauthenticated'
  | 'rate_limited'
  | 'bad_request'
  | 'upstream_failure'
  | 'internal'
  | 'parse';

export interface FeedbackError {
  code: FeedbackErrorCode;
  message: string;
  retry_after_ms?: number;
}

export interface FeedbackHandle {
  id: string;
  cancel: () => Promise<void>;
}

export interface FeedbackHandlers {
  onDelta: (raw: string) => void;
  onDone: () => void;
  onError: (err: FeedbackError) => void;
}

export interface FeedbackHistoryEntry {
  id: string;
  createdAt: string;
  topicTitle: string;
  questionText: string;
  transcript: string;
  result: FeedbackResult;
}
