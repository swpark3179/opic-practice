import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { SELF_ASSESSMENT, DIFFICULTY_OPTIONS } from '../data/selfAssessment';
import { SALevel } from '../data/types';
import { useTTS } from '../hooks/useTTS';
import { generateMainTest } from '../services/testGenerator';
import { CasualTop, CasualProgress, CasualBottom, CasualButton, CIcons } from '../components/casual/CasualUI';

const DIFF_COPY: Record<string, string> = {
  easy: '쉬운 질문으로 살살 풀어요',
  similar: '내 수준이랑 비슷하게',
  difficult: '도전적인 질문으로',
};

export function SAScreen() {
  const { state, dispatch } = useAppContext();
  const { speak } = useTTS();
  const [phase, setPhase] = useState<'level' | 'difficulty'>('level');

  const levelData = SELF_ASSESSMENT.find((l) => l.level === state.saLevel) as any as SALevel;

  const selectLevel = (code: 'IL' | 'IH' | 'AL') => {
    const lvl = SELF_ASSESSMENT.find((l) => l.level === code);
    if (!lvl) return;
    dispatch({ type: 'SET_SA_LEVEL', payload: code });
    dispatch({ type: 'SET_TTS_RATE', payload: lvl.tts_rate });
  };

  const handleStart = () => {
    if (!state.saOption || !state.saDifficulty) return;
    const test = generateMainTest(state.bgsAnswers, state.saLevel, state.saDifficulty);
    dispatch({ type: 'GENERATE_TEST', payload: test });
    dispatch({ type: 'SET_PHASE', payload: 3 });
  };

  if (phase === 'level') {
    return (
      <>
        <CasualTop
          step={2}
          total={3}
          onBack={() => dispatch({ type: 'SET_PHASE', payload: 1 })}
        />
        <CasualProgress value={66} />
        <div className="casual-page">
          <h1 className="casual-h1">지금 영어 <em>어느 정도</em>?</h1>
          <p className="casual-sub">샘플을 들어보고 비슷하게 말할 수 있는 걸 골라요.</p>

          <div className="casual-segment">
            {SELF_ASSESSMENT.map((l) => {
              const on = state.saLevel === l.level;
              return (
                <button
                  key={l.level}
                  className={on ? 'on' : ''}
                  onClick={() => selectLevel(l.level as any)}
                >
                  <div className="casual-segment-code">{l.level}</div>
                  <div className="casual-segment-desc">{l.level_kr}</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {levelData.options.map((o: any) => {
              const on = state.saOption === o.id;
              return (
                <div key={o.id} className={`casual-sa-option ${on ? 'on' : ''}`}>
                  <div className="desc">{o.description}</div>
                  <div className="sample-line">"{o.sample_en}"</div>
                  <div className="row">
                    <button
                      className="casual-sa-listen"
                      onClick={() => speak(o.sample_en, state.ttsRate)}
                    >
                      {CIcons.speaker(13)} 들어보기
                    </button>
                    <button
                      className={`casual-sa-pick ${on ? 'on' : ''}`}
                      onClick={() => dispatch({ type: 'SET_SA_OPTION', payload: o.id })}
                    >
                      {on ? <>{CIcons.check(14)} 이거예요</> : '이거 비슷해요'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <CasualBottom split>
          <CasualButton kind="soft" size="sm" onClick={() => dispatch({ type: 'SET_PHASE', payload: 1 })}>
            {CIcons.back(16)} 이전
          </CasualButton>
          <CasualButton kind="primary" size="sm" onClick={() => setPhase('difficulty')} disabled={!state.saOption}>
            다음 {CIcons.arrow(16)}
          </CasualButton>
        </CasualBottom>
      </>
    );
  }

  return (
    <>
      <CasualTop step={2} total={3} onBack={() => setPhase('level')} />
      <CasualProgress value={88} />
      <div className="casual-page">
        <h1 className="casual-h1">질문 <em>난이도</em>는?</h1>
        <p className="casual-sub">중간에 바꿀 수 있으니 부담 갖지 마요.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {DIFFICULTY_OPTIONS.map((d: any, idx: number) => {
            const on = state.saDifficulty === d.id;
            return (
              <button
                key={d.id}
                className={`casual-diff-card ${on ? 'on' : ''}`}
                onClick={() => dispatch({ type: 'SET_SA_DIFFICULTY', payload: d.id })}
              >
                <div className="casual-diff-icon">
                  <DotPattern n={idx + 1} on={on} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="casual-diff-title">{d.text}</div>
                  <div className="casual-diff-desc">{DIFF_COPY[d.id] || ''}</div>
                </div>
                {on && (
                  <div style={{ color: 'var(--opic-primary)' }}>{CIcons.check(20)}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <CasualBottom split>
        <CasualButton kind="soft" size="sm" onClick={() => setPhase('level')}>
          {CIcons.back(16)} 이전
        </CasualButton>
        <CasualButton kind="primary" size="sm" onClick={handleStart} disabled={!state.saDifficulty}>
          시작하기 {CIcons.arrow(16)}
        </CasualButton>
      </CasualBottom>
    </>
  );
}

function DotPattern({ n, on }: { n: number; on: boolean }) {
  const bg = on ? '#fff' : 'var(--opic-ink)';
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i < n ? bg : 'transparent',
            border: i < n ? 'none' : `1.5px solid ${on ? 'rgba(255,255,255,0.35)' : 'var(--opic-border-strong)'}`,
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}
