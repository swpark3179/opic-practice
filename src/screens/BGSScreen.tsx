import React, { useState, ReactNode } from 'react';
import { useAppContext } from '../context/AppContext';
import { BGS_QUESTIONS } from '../data/questions';
import { CasualTop, CasualProgress, CasualBottom, CasualButton, CIcons } from '../components/casual/CasualUI';

const SINGLE_QIDS = new Set(['occupation', 'student', 'living']);

type Copy = { title: ReactNode; sub: ReactNode };
const BGS_COPY: Record<string, Copy> = {
  occupation: {
    title: <>지금 어떤 <em>일</em> 하고 있어요?</>,
    sub: '직장·학교·일 경험 — 시험에서 자주 묻는 첫 질문이에요.',
  },
  student: {
    title: <>혹시 <em>학생</em>인가요?</>,
    sub: '학교 다니는지에 따라 출제 주제가 달라져요.',
  },
  living: {
    title: <>요즘 누구랑 <em>살아요</em>?</>,
    sub: '집·룸메이트 묘사 질문에 쓰여요.',
  },
  study_purpose: {
    title: <>예전에 어떤 <em>수업</em> 들었어요?</>,
    sub: '최근 5년 안에 들은 수업만 골라주세요.',
  },
  leisure: {
    title: <>쉴 때 보통 <em>뭐 해요</em>?</>,
    sub: <>편한 활동 위주로 <b>2개 이상</b> 골라주세요.</>,
  },
  hobby: {
    title: <>취미가 <em>뭐예요</em>?</>,
    sub: <>좋아하는 걸로 <b>1개 이상</b> 골라주세요.</>,
  },
  sports: {
    title: <>운동은 어떤 거 <em>해요</em>?</>,
    sub: '운동 안 하면 다음으로 넘어가도 돼요.',
  },
  travel: {
    title: <>여행 자주 <em>가요</em>?</>,
    sub: '최근에 다녀온 종류 위주로 골라주세요.',
  },
};

export function BGSScreen() {
  const { state, dispatch } = useAppContext();
  const answers = state.bgsAnswers;
  const [stepIdx, setStepIdx] = useState(0);

  const total = BGS_QUESTIONS.length;
  const q = (BGS_QUESTIONS as any[])[stepIdx];
  const isSingle = SINGLE_QIDS.has(q.id);
  const copy = BGS_COPY[q.id] || { title: q.q, sub: '' };
  const cur: string[] = answers[q.id] || [];
  const minSelect: number = q.min_select || 0;

  const setAnswerFor = (qid: string, next: string[]) => {
    dispatch({ type: 'UPDATE_BGS', payload: { questionId: qid, optionIds: next } });
  };

  const goNext = () => {
    if (stepIdx < total - 1) setStepIdx(stepIdx + 1);
    else dispatch({ type: 'SET_PHASE', payload: 2 });
  };
  const goPrev = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const toggle = (oid: string) => {
    let next: string[];
    if (isSingle) {
      next = cur[0] === oid ? [] : [oid];
    } else if (cur.includes(oid)) {
      next = cur.filter((x) => x !== oid);
    } else {
      next = [...cur, oid];
    }
    setAnswerFor(q.id, next);

    if (isSingle && next.length === 1) {
      setTimeout(() => {
        if (stepIdx < total - 1) setStepIdx((i) => i + 1);
        else dispatch({ type: 'SET_PHASE', payload: 2 });
      }, 320);
    }
  };

  const canNext = isSingle ? cur.length === 1 : cur.length >= minSelect;
  const progressValue = ((stepIdx + 1) / total) * 100;

  return (
    <>
      <CasualTop step={stepIdx + 1} total={total} onBack={stepIdx > 0 ? goPrev : null} />
      <CasualProgress value={progressValue} />

      <div className={`casual-page ${isSingle ? 'no-cta' : ''}`}>
        <h1 className="casual-h1">{copy.title}</h1>
        <p className="casual-sub">{copy.sub}</p>

        {isSingle ? (
          <div>
            {q.options.map((opt: any) => {
              const on = cur.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  className={`casual-option ${on ? 'on' : ''}`}
                  onClick={() => toggle(opt.id)}
                >
                  <div className="casual-option-icon">
                    <OptionDot id={opt.id} excluded={opt.is_excluded} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="casual-option-label">{opt.text}</div>
                    {opt.is_excluded && (
                      <div className="casual-option-hint">시험 풀에서 제외돼요</div>
                    )}
                  </div>
                  <div className="casual-option-check">
                    {on ? CIcons.check(14) : null}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {q.options
                .filter((o: any) => !o.is_excluded)
                .map((opt: any) => {
                  const on = cur.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      className={`casual-chip ${on ? 'on' : ''}`}
                      onClick={() => toggle(opt.id)}
                    >
                      {on && CIcons.check(13)}
                      {opt.text}
                    </button>
                  );
                })}
            </div>

            {q.options.some((o: any) => o.is_excluded) && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12.5, color: 'var(--opic-ink-low)', marginBottom: 8, fontWeight: 600 }}>
                  자주 안 하는 활동 (시험에서 제외)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {q.options
                    .filter((o: any) => o.is_excluded)
                    .map((opt: any) => {
                      const on = cur.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          className={`casual-chip muted ${on ? 'on' : ''}`}
                          onClick={() => toggle(opt.id)}
                        >
                          {on && CIcons.check(13)}
                          {opt.text}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="casual-multi-counter">
              <div>
                지금 <b style={{ color: 'var(--opic-ink)' }}>{cur.length}개</b> 선택했어요
                {minSelect ? (
                  <span style={{ color: 'var(--opic-ink-low)' }}> · 최소 {minSelect}개</span>
                ) : null}
              </div>
              {cur.length >= minSelect && (
                <div className="ok-dot">{CIcons.check(13)}</div>
              )}
            </div>
          </>
        )}
      </div>

      {!isSingle && (
        <CasualBottom>
          {stepIdx > 0 && (
            <CasualButton kind="ghost" onClick={goPrev}>이전</CasualButton>
          )}
          <CasualButton kind="primary" onClick={goNext} disabled={!canNext}>
            {stepIdx === total - 1 ? '다 골랐어요' : '다음'} {CIcons.arrow(18)}
          </CasualButton>
        </CasualBottom>
      )}
    </>
  );
}

function OptionDot({ id, excluded }: { id: string; excluded?: boolean }) {
  if (excluded) {
    return (
      <span style={{
        width: 16, height: 16, borderRadius: '50%',
        background: 'var(--opic-bg-deep)',
        border: '2px dashed var(--opic-border-strong)',
        display: 'inline-block',
      }} />
    );
  }
  const hue = (id.charCodeAt(0) * 13) % 360;
  return (
    <span style={{
      width: 16, height: 16, borderRadius: '50%',
      background: `oklch(0.78 0.08 ${hue})`,
      boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.08)',
      display: 'inline-block',
    }} />
  );
}
