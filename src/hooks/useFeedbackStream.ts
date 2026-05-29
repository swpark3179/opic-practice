import { useCallback, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { startFeedback } from '../services/feedback/client';
import { parseDelta } from '../services/feedback/parser';
import { storage } from '../services/storage';
import type {
  FeedbackHandle,
  FeedbackRequest,
  FeedbackHistoryEntry,
} from '../services/feedback/types';

export interface StartArgs {
  question: string;
  transcript: string;
  topicTitle: string;
}

export function useFeedbackStream() {
  const { state, dispatch } = useAppContext();
  const handleRef = useRef<FeedbackHandle | null>(null);
  const lastStartArgsRef = useRef<StartArgs | null>(null);

  const cancel = useCallback(async () => {
    const h = handleRef.current;
    handleRef.current = null;
    if (h) {
      try { await h.cancel(); } catch { /* ignore */ }
    }
    dispatch({ type: 'FEEDBACK_CANCEL' });
  }, [dispatch]);

  const start = useCallback(async (args: StartArgs) => {
    if (state.feedback.status === 'starting' || state.feedback.status === 'streaming') {
      return;
    }
    if (!args.transcript.trim()) {
      dispatch({
        type: 'FEEDBACK_ERROR',
        payload: { code: 'bad_request', message: '먼저 답변을 녹음하거나 입력해주세요.' },
      });
      dispatch({ type: 'TOGGLE_FEEDBACK_SHEET', payload: true });
      return;
    }
    const cfg = await storage.getApiConfig();
    if (!cfg || !cfg.baseUrl || !cfg.bearer) {
      dispatch({
        type: 'FEEDBACK_ERROR',
        payload: { code: 'no_config', message: '설정에서 API 주소와 인증 토큰을 먼저 등록해주세요.' },
      });
      dispatch({ type: 'TOGGLE_FEEDBACK_SHEET', payload: true });
      return;
    }

    lastStartArgsRef.current = args;

    const req: FeedbackRequest = {
      question: args.question,
      transcript: args.transcript,
      level: state.saLevel,
      criteria: ['grammar', 'vocabulary', 'fluency_structure', 'overall'],
    };

    // Optimistic open — id arrives from Rust shortly.
    dispatch({ type: 'FEEDBACK_RESET' });
    dispatch({ type: 'TOGGLE_FEEDBACK_SHEET', payload: true });

    let accumulated: Partial<FeedbackHistoryEntry['result']> = {};
    try {
      const handle = await startFeedback(req, {
        onDelta: (raw) => {
          const partial = parseDelta(raw);
          if (partial) {
            accumulated = { ...accumulated, ...partial };
            dispatch({ type: 'FEEDBACK_DELTA', payload: { partial } });
          }
        },
        onDone: () => {
          dispatch({ type: 'FEEDBACK_DONE' });
          handleRef.current = null;
          // Persist on completion.
          const entry: FeedbackHistoryEntry = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            topicTitle: args.topicTitle,
            questionText: args.question,
            transcript: args.transcript,
            result: accumulated,
          };
          void storage.appendFeedbackHistory(entry);
        },
        onError: (err) => {
          dispatch({ type: 'FEEDBACK_ERROR', payload: err });
          handleRef.current = null;
        },
      });
      handleRef.current = handle;
      dispatch({ type: 'FEEDBACK_START', payload: { id: handle.id } });
    } catch (e: any) {
      dispatch({
        type: 'FEEDBACK_ERROR',
        payload: { code: 'internal', message: e?.message || '요청을 시작하지 못했어요.' },
      });
    }
  }, [dispatch, state.feedback.status, state.saLevel]);

  const retry = useCallback(async () => {
    const args = lastStartArgsRef.current;
    if (args) await start(args);
  }, [start]);

  // Auto-cancel when the question changes mid-stream.
  useEffect(() => {
    return () => {
      const h = handleRef.current;
      if (h) {
        void h.cancel();
        handleRef.current = null;
      }
    };
  }, [state.currentTopicIdx, state.currentQuestionIdx]);

  return { state: state.feedback, start, cancel, retry };
}
