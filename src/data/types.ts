export interface BGSOption {
  id: string;
  text: string;
  text_en?: string;
  is_excluded?: boolean;
}

export interface BGSQuestion {
  id: string;
  q: string;
  en: string;
  min_select?: number;
  single?: boolean;
  count_target?: boolean;
  options: BGSOption[];
}

export interface SAOption {
  id: string;
  description: string;
  sample_en: string;
  sample_kr: string;
}

export interface SALevel {
  format: number;
  level: 'IL' | 'IH' | 'AL';
  level_kr: string;
  tts_rate: number;
  options: SAOption[];
}

export interface SADifficulty {
  id: string;
  text: string;
  text_en: string;
  description: string;
}

export interface Question {
  q: string;
  kr: string;
  sample: string;
  tip: string;
  is_roleplay?: boolean;
}

export interface Topic {
  title: string;
  title_kr: string;
  timer: number;
  questions: Question[];
}

export interface TestCategory {
  key: string;
  name: string;
  icon: string;
  topics: Topic[];
}

export interface GeneratedTest {
  categories: TestCategory[];
  topics: Topic[]; // flat array of all topics
  totalQuestions: number;
  saLevel: 'IL' | 'IH' | 'AL';
  saDifficulty: string;
}

export interface KnowledgeTopic {
  cat: string;
  src: string;
  q: string;
  kr: string;
}
