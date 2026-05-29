import { useEffect, useState } from 'react';
import { CasualSheet, CasualButton } from '../components/casual/CasualUI';
import type {
  FeedbackError,
  FeedbackResult,
  FeedbackStatus,
  GrammarItem,
  OpicLevel,
  VocabularyItem,
  FluencyBlock,
} from '../services/feedback/types';

interface Props {
  open: boolean;
  onClose: () => void;
  status: FeedbackStatus;
  partial: Partial<FeedbackResult>;
  error: FeedbackError | null;
  onCancel: () => void;
  onRetry: () => void;
  onOpenSettings: () => void;
}

export function FeedbackSheet({
  open,
  onClose,
  status,
  partial,
  error,
  onCancel,
  onRetry,
  onOpenSettings,
}: Props) {
  const isStreaming = status === 'starting' || status === 'streaming';
  const isError = status === 'error' && error !== null;
  const hasAnyContent =
    !!partial.overall_level ||
    !!partial.overall_summary ||
    (partial.grammar?.length ?? 0) > 0 ||
    (partial.vocabulary?.length ?? 0) > 0 ||
    !!partial.fluency_structure;

  return (
    <CasualSheet open={open} onClose={onClose} title="AI 피드백">
      <div style={{ padding: '6px 4px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isError ? (
          <ErrorBlock
            error={error!}
            onRetry={onRetry}
            onOpenSettings={onOpenSettings}
          />
        ) : (
          <>
            {isStreaming && (
              <div style={streamingBanner}>
                <Pulse />
                <span style={{ flex: 1 }}>
                  {status === 'starting' ? '연결 중…' : '피드백 생성 중…'}
                </span>
                <button onClick={onCancel} style={cancelBtn}>취소</button>
              </div>
            )}

            <OverallBlock
              level={partial.overall_level}
              summary={partial.overall_summary}
              loading={isStreaming && !partial.overall_summary}
            />

            <FluencyBlockView
              block={partial.fluency_structure}
              loading={isStreaming && !partial.fluency_structure}
            />

            <GrammarBlockView
              items={partial.grammar}
              loading={isStreaming && !partial.grammar}
            />

            <VocabularyBlockView
              items={partial.vocabulary}
              loading={isStreaming && !partial.vocabulary}
            />

            {status === 'done' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <CasualButton kind="soft" size="sm" onClick={onRetry}>다시 평가</CasualButton>
              </div>
            )}
            {status === 'cancelled' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--opic-ink-low)' }}>취소되었어요.</span>
                {hasAnyContent && (
                  <CasualButton kind="soft" size="sm" onClick={onRetry}>이어서 다시 시도</CasualButton>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </CasualSheet>
  );
}

function OverallBlock({
  level,
  summary,
  loading,
}: { level?: OpicLevel; summary?: string; loading: boolean }) {
  return (
    <section style={card}>
      <header style={cardHead}>
        <span style={cardTitle}>종합 평가</span>
        {level && <LevelPill level={level} />}
      </header>
      {summary ? (
        <p style={cardBody}>{summary}</p>
      ) : loading ? (
        <SkeletonLines lines={2} />
      ) : (
        <p style={cardEmpty}>—</p>
      )}
    </section>
  );
}

function FluencyBlockView({ block, loading }: { block?: FluencyBlock; loading: boolean }) {
  return (
    <section style={card}>
      <header style={cardHead}>
        <span style={cardTitle}>유창성 · 구조</span>
        {block && <ScoreChip score={block.score_0_10} />}
      </header>
      {block ? (
        <ul style={bulletList}>
          {block.comments_ko.map((c, i) => (
            <li key={i} style={bulletItem}>{c}</li>
          ))}
        </ul>
      ) : loading ? (
        <SkeletonLines lines={2} />
      ) : (
        <p style={cardEmpty}>—</p>
      )}
    </section>
  );
}

function GrammarBlockView({ items, loading }: { items?: GrammarItem[]; loading: boolean }) {
  return (
    <section style={card}>
      <header style={cardHead}>
        <span style={cardTitle}>문법 교정</span>
        {items && <CountChip n={items.length} />}
      </header>
      {items && items.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, i) => (
            <article key={i} style={correctionItem}>
              <div style={original}>{it.original}</div>
              <div style={corrected}>{it.corrected}</div>
              <div style={explanation}>{it.explanation_ko}</div>
            </article>
          ))}
        </div>
      ) : items && items.length === 0 ? (
        <p style={cardEmpty}>큰 문법 오류는 없어요.</p>
      ) : loading ? (
        <SkeletonLines lines={3} />
      ) : (
        <p style={cardEmpty}>—</p>
      )}
    </section>
  );
}

function VocabularyBlockView({ items, loading }: { items?: VocabularyItem[]; loading: boolean }) {
  return (
    <section style={card}>
      <header style={cardHead}>
        <span style={cardTitle}>어휘 업그레이드</span>
        {items && <CountChip n={items.length} />}
      </header>
      {items && items.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, i) => (
            <article key={i} style={correctionItem}>
              <div style={original}>{it.original}</div>
              <div style={{ ...corrected, color: 'var(--opic-primary-deep)' }}>↑ {it.upgraded}</div>
              <div style={explanation}>{it.reason_ko}</div>
            </article>
          ))}
        </div>
      ) : items && items.length === 0 ? (
        <p style={cardEmpty}>어휘 수준이 이미 적절해요.</p>
      ) : loading ? (
        <SkeletonLines lines={3} />
      ) : (
        <p style={cardEmpty}>—</p>
      )}
    </section>
  );
}

function ErrorBlock({
  error,
  onRetry,
  onOpenSettings,
}: { error: FeedbackError; onRetry: () => void; onOpenSettings: () => void }) {
  const [remaining, setRemaining] = useState(error.retry_after_ms ?? 0);
  useEffect(() => {
    setRemaining(error.retry_after_ms ?? 0);
    if (!error.retry_after_ms) return;
    const t = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [error]);

  const title = errorTitle(error.code);
  const needsSettings = error.code === 'no_config' || error.code === 'unauthenticated';
  const canRetry = remaining === 0;

  return (
    <section style={{ ...card, borderColor: 'var(--opic-rec)', background: 'var(--opic-rec-soft)' }}>
      <header style={cardHead}>
        <span style={{ ...cardTitle, color: 'var(--opic-rec)' }}>{title}</span>
      </header>
      <p style={cardBody}>{error.message}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
        {needsSettings && (
          <CasualButton kind="primary" size="sm" onClick={onOpenSettings}>설정 열기</CasualButton>
        )}
        <CasualButton kind="soft" size="sm" onClick={onRetry} disabled={!canRetry}>
          {canRetry ? '다시 시도' : `${Math.ceil(remaining / 1000)}초 후 재시도`}
        </CasualButton>
      </div>
    </section>
  );
}

function errorTitle(code: FeedbackError['code']): string {
  switch (code) {
    case 'no_config': return 'API 설정이 필요해요';
    case 'unauthenticated': return '토큰이 만료되었거나 잘못됐어요';
    case 'rate_limited': return '요청이 너무 많아요';
    case 'bad_request': return '요청을 보낼 수 없어요';
    case 'upstream_failure': return 'LLM 응답을 받지 못했어요';
    case 'network': return '네트워크 오류';
    case 'parse': return '응답을 해석하지 못했어요';
    default: return '오류가 발생했어요';
  }
}

function LevelPill({ level }: { level: OpicLevel }) {
  const palette = LEVEL_COLORS[level];
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: palette.bg,
      color: palette.fg,
      border: `1px solid ${palette.border}`,
    }}>{level}</span>
  );
}

const LEVEL_COLORS: Record<OpicLevel, { bg: string; fg: string; border: string }> = {
  IL: { bg: 'var(--opic-bg-deep)', fg: 'var(--opic-ink-mid)', border: 'var(--opic-border-strong)' },
  IM: { bg: 'var(--opic-butter-soft)', fg: 'var(--opic-amber)', border: 'var(--opic-amber-border)' },
  IH: { bg: 'var(--opic-sage-soft)', fg: 'var(--opic-sage)', border: 'var(--opic-sage-border)' },
  AL: { bg: 'var(--opic-primary-soft)', fg: 'var(--opic-primary-deep)', border: 'var(--opic-primary-border)' },
};

function ScoreChip({ score }: { score: number }) {
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: 'var(--opic-bg-deep)',
      color: 'var(--opic-ink)',
    }}>{score} / 10</span>
  );
}

function CountChip({ n }: { n: number }) {
  return (
    <span style={{
      padding: '3px 8px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      background: 'var(--opic-bg-deep)',
      color: 'var(--opic-ink-mid)',
    }}>{n}건</span>
  );
}

function Pulse() {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: 999,
      background: 'var(--opic-primary)',
      animation: 'opic-feedback-pulse 1.1s ease-in-out infinite',
    }} />
  );
}

function SkeletonLines({ lines }: { lines: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: 12,
          width: `${100 - i * 13}%`,
          borderRadius: 6,
          background: 'linear-gradient(90deg, var(--opic-bg-deep) 25%, var(--opic-border) 50%, var(--opic-bg-deep) 75%)',
          backgroundSize: '200% 100%',
          animation: 'opic-feedback-shimmer 1.4s linear infinite',
        }} />
      ))}
    </div>
  );
}

const card: React.CSSProperties = {
  border: '1.5px solid var(--opic-border)',
  background: 'var(--opic-surface)',
  borderRadius: 16,
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};
const cardHead: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};
const cardTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: 'var(--opic-ink)' };
const cardBody: React.CSSProperties = { margin: 0, fontSize: 14.5, lineHeight: 1.65, color: 'var(--opic-ink)' };
const cardEmpty: React.CSSProperties = { margin: 0, fontSize: 13, color: 'var(--opic-ink-low)' };
const bulletList: React.CSSProperties = { margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 };
const bulletItem: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: 'var(--opic-ink)' };

const streamingBanner: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 12,
  background: 'var(--opic-primary-soft)',
  color: 'var(--opic-primary-deep)',
  fontSize: 13,
  fontWeight: 600,
};
const cancelBtn: React.CSSProperties = {
  border: 'none',
  background: 'var(--opic-primary)',
  color: 'white',
  padding: '6px 12px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

const correctionItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '10px 12px',
  background: 'var(--opic-bg-warm)',
  borderRadius: 10,
};
const original: React.CSSProperties = {
  fontSize: 13.5,
  color: 'var(--opic-ink-low)',
  textDecoration: 'line-through',
  textDecorationColor: 'var(--opic-rec)',
};
const corrected: React.CSSProperties = { fontSize: 14.5, fontWeight: 600, color: 'var(--opic-sage)' };
const explanation: React.CSSProperties = { fontSize: 12.5, color: 'var(--opic-ink-mid)', lineHeight: 1.5 };
