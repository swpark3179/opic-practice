import React from 'react';
import { useAppContext } from '../context/AppContext';
import { SELF_ASSESSMENT } from '../data/selfAssessment';
import { SALevel } from '../data/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { useTTS } from '../hooks/useTTS';
import { Icons } from '../components/ui/Icons';
import { generateMainTest } from '../services/testGenerator';

export function SAScreen() {
  const { state, dispatch } = useAppContext();
  const { speak, stop, speaking } = useTTS();
  const sa = {
    level: state.saLevel,
    option: state.saOption,
    rate: state.ttsRate
  };

  const levelData = SELF_ASSESSMENT.find(l => l.level === sa.level) as any as SALevel;

  const handleStart = () => {
    if (sa.option) {
      const test = generateMainTest(state.bgsAnswers, sa.level, 'similar');
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

        <div className="opic-sa-levels">
          {SELF_ASSESSMENT.map(lvl => {
            const isSelected = sa.level === lvl.level;
            return (
              <Card
                key={lvl.level}
                className={`opic-sa-level ${isSelected ? 'selected' : ''}`}
              >
                <div onClick={() => {
                  dispatch({ type: 'SET_SA_LEVEL', payload: lvl.level as 'IL'|'IH'|'AL' });
                  dispatch({ type: 'SET_TTS_RATE', payload: lvl.tts_rate });
                }}>
                  <div className="opic-sa-level-head">
                    <span className="opic-mono opic-sa-level-code">{lvl.level}</span>
                    <Tag tone="neutral">{lvl.tts_rate}x</Tag>
                  </div>
                  <div className="opic-sa-level-name">{lvl.level_kr}</div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card>
          <div className="opic-row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontWeight: 700 }}>오디오 속도</div>
            <span className="opic-mono" style={{ fontWeight: 700, fontSize: '14px' }}>{sa.rate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5" max="1.5" step="0.05"
            value={sa.rate}
            onChange={(e) => dispatch({ type: 'SET_TTS_RATE', payload: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </Card>

        <div>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>샘플 답변 들어보기</div>
          <div className="opic-sub">자신의 수준과 가장 비슷한 답변을 선택하세요.</div>
        </div>
        <div className="opic-sa-options">
          {levelData.options.map(opt => {
            const isSelected = sa.option === opt.id;
            return (
              <Card
                key={opt.id}
                className={`opic-sa-option ${isSelected ? 'selected' : ''}`}
              >
                <div onClick={() => dispatch({ type: 'SET_SA_OPTION', payload: opt.id })}>
                  <div className="opic-sa-option-head">
                    <div className={`opic-sa-option-num ${isSelected ? 'selected' : ''}`}>
                      {opt.id.split('_')[1]}
                    </div>
                    <div className="opic-sa-option-desc">{opt.description}</div>
                  </div>
                  <div className="opic-sa-option-actions">
                    <Button
                      kind="secondary" size="sm"
                      onClick={(((e: any) => {
                        e.stopPropagation();
                        if (speaking) stop();
                        else speak(opt.sample_en, sa.rate);
                      }) as any)}
                    >
                      <Icons.speaker /> {speaking ? '듣기 중지' : '샘플 듣기'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="opic-desktop-only" style={{ textAlign: 'right', marginTop: '24px' }}>
          <Button size="lg" onClick={handleStart} disabled={!sa.option}>
            본시험 시작하기
          </Button>
        </div>
      </div>

      <div className="opic-mobile-bar">
        <div className="opic-row" style={{ gap: '12px', width: '100%' }}>
          <Button kind="secondary" size="lg" onClick={() => dispatch({ type: 'SET_PHASE', payload: 1 })}>이전</Button>
          <Button size="lg" style={{ flex: 1 }} onClick={handleStart} disabled={!sa.option}>
            본시험 시작
          </Button>
        </div>
      </div>
    </div>
  );
}
