import React from 'react';
import { useAppContext } from '../context/AppContext';
import { BGS_QUESTIONS } from '../data/questions';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Tag } from '../components/ui/Tag';
import { Button } from '../components/ui/Button';

export function BGSScreen() {
  const { state, dispatch } = useAppContext();
  const answers = state.bgsAnswers;

  const toggle = (qid: string, oid: string, single?: boolean) => {
    let current = answers[qid] || [];
    if (single) {
      current = [oid];
    } else {
      if (current.includes(oid)) {
        current = current.filter(id => id !== oid);
      } else {
        current = [...current, oid];
      }
    }
    dispatch({ type: 'UPDATE_BGS', payload: { questionId: qid, optionIds: current } });
  };

  const countTargets = ['leisure', 'hobby', 'sports', 'travel'];
  const totalCount = countTargets.reduce((sum, qid) => sum + (answers[qid]?.length || 0), 0);
  const isValid = totalCount >= 12;

  const handleNext = () => {
    if (isValid) {
      dispatch({ type: 'SET_PHASE', payload: 2 });
    }
  };

  return (
    <div className="opic-bgs-page">
      <div className="opic-bgs-header">
        <div className="opic-bgs-header-inner">
          <Card>
            <div className="opic-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div className="opic-h1">배경 설문</div>
                <div className="opic-sub">자신에게 맞는 항목을 선택하세요.</div>
              </div>
              <div className="opic-desktop-only">
                <Button onClick={handleNext} disabled={!isValid}>다음 단계로</Button>
              </div>
            </div>
            <div style={{ background: 'var(--opic-border)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, (totalCount / 12) * 100)}%`,
                height: '100%',
                background: isValid ? 'var(--opic-sage)' : 'var(--opic-primary)',
                transition: 'width 0.3s'
              }} />
            </div>
            <div className="opic-sub" style={{ marginTop: '8px', textAlign: 'right' }}>
              {totalCount} / 12 이상 선택
            </div>
          </Card>
        </div>
      </div>

      <div className="opic-bgs-body">
        <div className="opic-bgs-body-inner">
          {(BGS_QUESTIONS as any[]).map(q => {
            const selected = answers[q.id] || [];
            return (
              <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="opic-row" style={{ gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '18px' }}>{q.q}</span>
                  {q.count_target && (
                    <Tag tone={selected.length > 0 ? 'primary' : 'neutral'}>
                      {selected.length} 선택됨
                    </Tag>
                  )}
                  {q.single && <Tag tone="neutral">단일 선택</Tag>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {q.options.map(o => (
                    <Chip
                      key={o.id}
                      checked={selected.includes(o.id)}
                      excluded={o.is_excluded}
                      onClick={() => toggle(q.id, o.id, q.single)}
                    >
                      {o.text}
                    </Chip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="opic-mobile-bar">
        <Button size="lg" style={{ width: '100%' }} onClick={handleNext} disabled={!isValid}>
          다음 단계로
        </Button>
      </div>
    </div>
  );
}
