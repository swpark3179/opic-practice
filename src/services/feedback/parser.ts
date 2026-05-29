import type { FeedbackResult } from './types';

export function parseDelta(raw: string): Partial<FeedbackResult> | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '[DONE]') return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Partial<FeedbackResult>;
    }
    return null;
  } catch {
    return null;
  }
}

export function mergeFeedback(
  prev: Partial<FeedbackResult>,
  next: Partial<FeedbackResult>,
): Partial<FeedbackResult> {
  return { ...prev, ...next };
}
