import React from 'react';
import { Sheet } from '../components/ui/Sheet';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';

export function TopicsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useAppContext();
  const test = state.generatedTest;

  if (!test) return <Sheet open={open} onClose={onClose}><div/></Sheet>;

  const topicIdx = state.currentTopicIdx;
  const qIdx = state.currentQuestionIdx;
  const totalQuestions: number = test.topics.reduce((sum: number, t: any) => sum + t.questions.length, 0);
  const overallIdx = test.topics.slice(0, topicIdx).reduce((sum: number, t: any) => sum + t.questions.length, 0) + qIdx;

  const jump = (tIdx: number, qIndex: number) => {
    dispatch({ type: 'JUMP_TO', payload: { topicIdx: tIdx, questionIdx: qIndex } });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--opic-border)' }}>
        <div className="opic-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>전체 문제</div>
          <Button kind="ghost" size="sm" onClick={onClose}><Icons.close /></Button>
        </div>
        <div className="opic-row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="opic-sub" style={{ marginTop: 0 }}>현재 진행도</span>
          <span className="opic-mono" style={{ fontWeight: 700, fontSize: '13px' }}>{overallIdx + 1} / {totalQuestions}</span>
        </div>
        <div style={{ background: 'var(--opic-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${totalQuestions > 0 ? ((overallIdx + 1) / totalQuestions) * 100 : 0}%`,
            height: '100%',
            background: 'var(--opic-primary)',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>
      <div className="opic-scrollable" style={{ padding: '20px', flex: 1 }}>
        <div className="opic-col" style={{ gap: '20px' }}>
          {test.topics.map((t: any, idx: number) => {
            const isActiveTopic = idx === topicIdx;
            const isDoneTopic = idx < topicIdx;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  className="opic-row"
                  style={{ gap: '12px', cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  onClick={() => jump(idx, 0)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') jump(idx, 0); }}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: isActiveTopic ? 'var(--opic-primary)' : isDoneTopic ? 'var(--opic-ink)' : 'var(--opic-border)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0,
                  }}>
                    {isDoneTopic ? <Icons.check /> : idx + 1}
                  </div>
                  <div style={{
                    fontWeight: isActiveTopic ? 700 : 600,
                    color: isActiveTopic ? 'var(--opic-ink)' : 'var(--opic-ink-mid)',
                    fontSize: '15px',
                  }}>
                    {t.title_kr}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '36px' }}>
                  {t.questions.map((_: any, i: number) => {
                    const isCurrent = idx === topicIdx && i === qIdx;
                    const isPast = idx < topicIdx || (idx === topicIdx && i < qIdx);
                    return (
                      <button
                        key={i}
                        onClick={() => jump(idx, i)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '6px',
                          border: isCurrent ? '2px solid var(--opic-primary)' : '1px solid var(--opic-border)',
                          background: isCurrent ? 'var(--opic-primary-soft)' : isPast ? 'var(--opic-bg-warm)' : 'var(--opic-surface)',
                          color: isCurrent ? 'var(--opic-primary)' : isPast ? 'var(--opic-ink-mid)' : 'var(--opic-ink)',
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                        }}
                        aria-label={`주제 ${idx + 1} 의 ${i + 1}번 문제로 이동`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
