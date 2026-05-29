import { useEffect, useState } from 'react';
import { CasualSheet, CasualButton } from '../components/casual/CasualUI';
import { storage } from '../services/storage';
import { testApiConfig } from '../services/feedback/client';
import type { ApiConfig } from '../services/feedback/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

type TestState =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'success'; status?: number }
  | { kind: 'failure'; message: string };

export function SettingsSheet({ open, onClose }: Props) {
  const [baseUrl, setBaseUrl] = useState('');
  const [bearer, setBearer] = useState('');
  const [modelHint, setModelHint] = useState('');
  const [reveal, setReveal] = useState(false);
  const [test, setTest] = useState<TestState>({ kind: 'idle' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTest({ kind: 'idle' });
    setSaved(false);
    storage.getApiConfig().then((cfg) => {
      if (cfg) {
        setBaseUrl(cfg.baseUrl || '');
        setBearer(cfg.bearer || '');
        setModelHint(cfg.modelHint || '');
      }
    });
  }, [open]);

  const isValid = baseUrl.trim().length > 0 && bearer.trim().length > 0;

  const buildConfig = (): ApiConfig => ({
    baseUrl: baseUrl.trim().replace(/\/+$/, ''),
    bearer: bearer.trim(),
    modelHint: modelHint.trim() || undefined,
  });

  const handleSave = async () => {
    if (!isValid) return;
    await storage.setApiConfig(buildConfig());
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const handleTest = async () => {
    if (!isValid) return;
    setTest({ kind: 'testing' });
    try {
      const result = await testApiConfig(buildConfig());
      if (result.ok) {
        setTest({ kind: 'success', status: result.status });
      } else {
        setTest({ kind: 'failure', message: result.message || '연결 실패' });
      }
    } catch (e: any) {
      setTest({ kind: 'failure', message: e?.message || '연결 실패' });
    }
  };

  return (
    <CasualSheet open={open} onClose={onClose} title="AI 피드백 설정">
      <div style={{ padding: '8px 4px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--opic-ink-mid)', margin: 0 }}>
          자체 백엔드의 주소와 인증 토큰을 입력하세요. 토큰은 이 기기에만 저장되고,
          서버 호출은 Tauri Rust 측에서 직접 수행하므로 렌더러에 노출되지 않습니다.
        </p>

        <label style={field}>
          <span style={label}>Base URL</span>
          <input
            type="url"
            inputMode="url"
            placeholder="https://my-opic-backend.example.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            style={input}
          />
        </label>

        <label style={field}>
          <span style={label}>Bearer Token</span>
          <div style={{ position: 'relative' }}>
            <input
              type={reveal ? 'text' : 'password'}
              placeholder="sk-... 또는 자체 토큰"
              value={bearer}
              onChange={(e) => setBearer(e.target.value)}
              style={{ ...input, paddingRight: 64 }}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              style={revealBtn}
            >
              {reveal ? '숨기기' : '보기'}
            </button>
          </div>
        </label>

        <label style={field}>
          <span style={label}>모델 힌트 (선택)</span>
          <input
            type="text"
            placeholder="예: claude-sonnet-4-6"
            value={modelHint}
            onChange={(e) => setModelHint(e.target.value)}
            style={input}
          />
          <span style={hint}>백엔드에 함께 전달됩니다. 백엔드가 무시할 수도 있어요.</span>
        </label>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <CasualButton kind="primary" size="sm" onClick={handleSave} disabled={!isValid}>
            저장
          </CasualButton>
          <CasualButton kind="soft" size="sm" onClick={handleTest} disabled={!isValid || test.kind === 'testing'}>
            {test.kind === 'testing' ? '연결 확인 중…' : '연결 테스트'}
          </CasualButton>
          {saved && <span style={{ ...status, color: 'var(--opic-sage)' }}>저장됨</span>}
          {test.kind === 'success' && (
            <span style={{ ...status, color: 'var(--opic-sage)' }}>
              연결 OK{test.status ? ` (${test.status})` : ''}
            </span>
          )}
          {test.kind === 'failure' && (
            <span style={{ ...status, color: 'var(--opic-rec)' }}>{test.message}</span>
          )}
        </div>

        <details style={{ marginTop: 4 }}>
          <summary style={{ fontSize: 13, color: 'var(--opic-ink-low)', cursor: 'pointer' }}>
            계약 사양 보기
          </summary>
          <div style={{ fontSize: 12, color: 'var(--opic-ink-mid)', lineHeight: 1.7, marginTop: 8 }}>
            POST <code>{`{baseUrl}/v1/feedback`}</code><br />
            Header: <code>Authorization: Bearer …</code>, <code>Accept: text/event-stream</code><br />
            Body: <code>{`{ question, transcript, level, criteria, language, client }`}</code><br />
            응답: SSE 스트림. <code>data:</code> JSON 델타 (모든 필드 옵셔널) 누적,
            종료 시 <code>data: [DONE]</code>.<br />
            자세한 사양은 레포의 <code>docs/feedback-api.md</code> 참고.
          </div>
        </details>
      </div>
    </CasualSheet>
  );
}

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--opic-ink)' };
const hint: React.CSSProperties = { fontSize: 12, color: 'var(--opic-ink-low)' };
const status: React.CSSProperties = { fontSize: 13, fontWeight: 600 };
const input: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  border: '1.5px solid var(--opic-border-strong)',
  background: 'var(--opic-surface)',
  fontSize: 14,
  color: 'var(--opic-ink)',
  outline: 'none',
  boxSizing: 'border-box',
};
const revealBtn: React.CSSProperties = {
  position: 'absolute',
  right: 6,
  top: '50%',
  transform: 'translateY(-50%)',
  border: 'none',
  background: 'var(--opic-bg-deep)',
  color: 'var(--opic-ink-mid)',
  padding: '6px 10px',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};
