import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type {
  ApiConfig,
  FeedbackHandle,
  FeedbackHandlers,
  FeedbackRequest,
} from './types';

const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;

export async function startFeedback(
  req: FeedbackRequest,
  handlers: FeedbackHandlers,
): Promise<FeedbackHandle> {
  if (!isTauri) {
    throw new Error('Feedback streaming is only available inside the Tauri app.');
  }

  const id: string = await invoke('request_feedback', { payload: req });

  const unlisteners: UnlistenFn[] = [];
  const teardown = async () => {
    for (const u of unlisteners.splice(0)) {
      try { u(); } catch { /* ignore */ }
    }
  };

  unlisteners.push(
    await listen<{ raw: string }>(`feedback:delta:${id}`, (e) => {
      handlers.onDelta(e.payload.raw);
    }),
    await listen<Record<string, never>>(`feedback:done:${id}`, () => {
      handlers.onDone();
      void teardown();
    }),
    await listen<{ code: string; message: string; retry_after_ms?: number }>(
      `feedback:error:${id}`,
      (e) => {
        handlers.onError({
          code: e.payload.code as any,
          message: e.payload.message,
          retry_after_ms: e.payload.retry_after_ms,
        });
        void teardown();
      },
    ),
  );

  return {
    id,
    async cancel() {
      try {
        await invoke('cancel_feedback', { id });
      } finally {
        await teardown();
      }
    },
  };
}

export async function testApiConfig(cfg: ApiConfig): Promise<{ ok: boolean; status?: number; message?: string }> {
  if (!isTauri) {
    return { ok: false, message: 'Tauri 환경에서만 테스트할 수 있어요.' };
  }
  return invoke('test_api_config', { cfg });
}
