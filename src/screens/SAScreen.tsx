import React from 'react';
import { useAppContext } from '../context/AppContext';
import { SELF_ASSESSMENT, DIFFICULTY_OPTIONS } from '../data/selfAssessment';
import { SALevel, SADifficulty } from '../data/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTTS } from '../hooks/useTTS';
import { Icons } from '../components/ui/Icons';
import { generateMainTest } from '../services/testGenerator';

export function SAScreen() {
  const { state, dispatch } = useAppContext();
  const { speak, stop, speaking } = useTTS();
  const sa = {
    level: state.saLevel,
    option: state.saOption,
    difficulty: state.saDifficulty,
    rate: state.ttsRate
  };

  const levelData = SELF_ASSESSMENT.find(l => l.level === sa.level) as any as SALevel;

  const handleStart = () => {
    if (sa.option && sa.difficulty) {
      const test = generateMainTest(state.bgsAnswers, sa.level, sa.difficulty);
      dispatch({ type: 'GENERATE_TEST', payload: test });
      dispatch({ type: 'SET_PHASE', payload: 3 });
    }
  };

  return (
    <div className="opic-page">
      <div className="opic-page-inner">
        <div>
          <div className="opic-h1">난이도 설정</div>
          <div className="opic-sub">자신의 수준과 비슷한 난이도를 선택하세요.</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {SELF_ASSESSMENT.map(lvl => (
            <Card 
              key={lvl.level}
              className={sa.level === lvl.level ? 'checked' : ''}
              style={{ 
                cursor: 'pointer', 
                border: sa.level === lvl.level ? '2px solid var(--opic-ink)' : undefined 
              }}
            >
              <div onClick={() => {
                dispatch({ type: 'SET_SA_LEVEL', payload: lvl.level as 'IL'|'IH'|'AL' });
                dispatch({ type: 'SET_TTS_RATE', payload: lvl.tts_rate });
              }}>
                <div className="opic-row" style={{ justifyContent: 'space-between' }}>
                  <span className="opic-mono" style={{ fontWeight: 800, fontSize: '20px' }}>{lvl.level}</span>
                  <span className="opic-sub">{lvl.tts_rate}x 배속</span>
                </div>
                <div style={{ fontWeight: 700, marginTop: '12px' }}>{lvl.level_kr}</div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div style={{ fontWeight: 700, marginBottom: '16px' }}>오디오 속도 조절 ({sa.rate}x)</div>
          <input 
            type="range" 
            min="0.5" max="1.5" step="0.05" 
            value={sa.rate}
            onChange={(e) => dispatch({ type: 'SET_TTS_RATE', payload: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </Card>

        <div style={{ fontWeight: 700, fontSize: '18px', marginTop: '16px' }}>샘플 답변 들어보기</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {levelData.options.map(opt => (
            <Card 
              key={opt.id}
              style={{
                cursor: 'pointer',
                border: sa.option === opt.id ? '2px solid var(--opic-ink)' : undefined
              }}
            >
              <div onClick={() => dispatch({ type: 'SET_SA_OPTION', payload: opt.id })}>
                <div className="opic-row" style={{ gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '24px', height: '24px', background: 'var(--opic-ink)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                    {opt.id.split('_')[1]}
                  </div>
                  <div style={{ fontWeight: 600 }}>{opt.description}</div>
                  <div className="opic-grow" />
                  <Button 
                    kind="secondary" size="sm" 
                    onClick={(((e: any) => {
                      e.stopPropagation();
                      if (speaking) stop();
                      else speak(opt.sample_en, sa.rate);
                    }) as any)}
                  >
                    <Icons.speaker /> 듣기
                  </Button>
                </div>
                <div style={{ background: 'var(--opic-bg-warm)', padding: '16px', borderRadius: '8px', fontSize: '14px', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{opt.sample_en}"
                </div>
              </div>
            </Card>
          ))}
        </div>

        {sa.option && (
          <>
            <div style={{ fontWeight: 700, fontSize: '18px', marginTop: '16px' }}>비슷한 난이도 선택</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {DIFFICULTY_OPTIONS.map(diff => (
                <Card 
                  key={diff.id}
                  style={{
                    cursor: 'pointer', textAlign: 'center',
                    border: sa.difficulty === diff.id ? '2px solid var(--opic-ink)' : undefined
                  }}
                >
                  <div onClick={() => dispatch({ type: 'SET_SA_DIFFICULTY', payload: diff.id as any })}>
                    <div style={{ fontWeight: 700 }}>{diff.text}</div>
                    <div className="opic-sub">{diff.text_en}</div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        <div className="opic-desktop-only" style={{ textAlign: 'right', marginTop: '24px' }}>
          <Button size="lg" onClick={handleStart} disabled={!(sa.option && sa.difficulty)}>
            본시험 시작하기
          </Button>
        </div>
      </div>

      <div className="opic-mobile-bar">
        <div className="opic-row" style={{ gap: '12px', width: '100%' }}>
          <Button kind="secondary" size="lg" onClick={() => dispatch({ type: 'SET_PHASE', payload: 1 })}>이전</Button>
          <Button size="lg" style={{ flex: 1 }} onClick={handleStart} disabled={!(sa.option && sa.difficulty)}>
            본시험 시작
          </Button>
        </div>
      </div>
    </div>
  );
}
