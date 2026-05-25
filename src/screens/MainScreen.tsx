import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTTS } from '../hooks/useTTS';
import { useSTT } from '../hooks/useSTT';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useTimer } from '../hooks/useTimer';
import { storage } from '../services/storage';

import {
  CasualTop, CasualBottom, CasualButton, CasualSheet,
  CIcons, SmallLink, SmallDot,
} from '../components/casual/CasualUI';

type SheetKind = null | 'sample' | 'kr' | 'topics' | 'transcript';

const SPEED_MIN = 0.5;
const SPEED_MAX = 1.5;
const SPEED_STEP = 0.05;

function fmtRate(rate: number) {
  return `${rate.toFixed(2).replace(/\.?0+$/, '')}×`;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${String(m).padStart(2, '0')}:${ss}`;
}

export function MainScreen() {
  const { state, dispatch } = useAppContext();
  const test = state.generatedTest;

  const topicIdx = state.currentTopicIdx;
  const qIdx = state.currentQuestionIdx;

  const { speak, stop: stopTTS, speaking } = useTTS();
  const { start: startSTT, stop: stopSTT, reset: resetSTT, transcript, supported: sttSupported } = useSTT();
  const { startRecording, stopRecording, isRecording, error: recorderError } = useAudioRecorder();

  const [sheet, setSheet] = useState<SheetKind>(null);
  const [textMode, setTextMode] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPlayback = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (!recordedUrl) return;
    let a = audioRef.current;
    if (!a) {
      a = new Audio(recordedUrl);
      audioRef.current = a;
      a.onended = () => setIsPlaying(false);
      a.onpause = () => setIsPlaying(false);
    }
    if (isPlaying) {
      a.pause();
      a.currentTime = 0;
      setIsPlaying(false);
    } else {
      a.currentTime = 0;
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [recordedUrl, isPlaying]);

  const isCompleted = !!test && topicIdx >= test.topics.length;
  const topic = !isCompleted && test ? test.topics[topicIdx] : null;
  const q = topic ? topic.questions[qIdx] : null;
  const category = topic && test
    ? test.categories.find((c: any) => c.topics.some((t: any) => t.title === topic.title))
    : null;

  const totalQuestions = test ? test.topics.reduce((sum: number, t: any) => sum + t.questions.length, 0) : 0;
  const overallIdx = test && !isCompleted
    ? test.topics.slice(0, topicIdx).reduce((sum: number, t: any) => sum + t.questions.length, 0) + qIdx
    : totalQuestions;

  const { elapsed, reset: resetTimer } = useTimer(isRecording);

  const handleStopRecording = useCallback(async () => {
    stopSTT();
    const blob = await stopRecording();
    if (blob) {
      setHasRecording(true);
      const url = URL.createObjectURL(blob);
      setRecordedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      if (topic) {
        await storage.saveAudioRecording(blob, `${topic.title}_${qIdx}`);
      }
      const currentStats = state.stats;
      dispatch({
        type: 'UPDATE_STATS',
        payload: {
          ...currentStats,
          totalPractice: currentStats.totalPractice + 1,
          totalTimeSeconds: currentStats.totalTimeSeconds + elapsed,
          lastPracticeDate: new Date().toISOString(),
        },
      });
    }
  }, [dispatch, elapsed, qIdx, state.stats, stopRecording, stopSTT, topic]);

  useEffect(() => {
    stopTTS();
    if (isRecording) handleStopRecording();
    setSheet(null);
    setTextMode(false);
    setHasRecording(false);
    stopPlayback();
    setRecordedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    audioRef.current = null;
    resetSTT();
    resetTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicIdx, qIdx]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!test) return null;
  if (isCompleted) {
    return <CompletionView totalTopics={test.topics.length} />;
  }
  if (!topic || !q) return null;

  const handleStartRecording = async () => {
    resetTimer();
    resetSTT();
    setHasRecording(false);
    stopPlayback();
    setRecordedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    audioRef.current = null;
    stopTTS();
    await startRecording();
    if (sttSupported) startSTT();
  };

  const navQ = (delta: number) => dispatch({ type: 'NAV_QUESTION', payload: { delta } });
  const isLast = topicIdx === test.topics.length - 1 && qIdx === topic.questions.length - 1;

  return (
    <>
      <CasualTop
        step={overallIdx + 1}
        total={totalQuestions}
        onBack={overallIdx === 0 ? null : () => navQ(-1)}
        rightSlot={
          <button className="casual-top-icon-btn" onClick={() => setSheet('topics')} aria-label="주제 목록">
            {CIcons.list(18)}
          </button>
        }
      />

      <div className="casual-page" style={{ paddingTop: 4, display: 'flex', flexDirection: 'column' }}>
        <div className="casual-topic-label">
          <span className="dot" />
          <span className="text">{category?.name || '기타'} · {topic.title_kr}</span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="casual-question">{q.q}</div>
          <div className="casual-quick-row">
            <button className="casual-kr-button" onClick={() => setSheet('kr')}>
              <span className="badge">한</span>
              한국어 보기
            </button>
            <button
              className={`casual-kr-button ${speaking ? 'speaking' : ''}`}
              onClick={() => {
                if (speaking) stopTTS();
                else speak(q.q, state.ttsRate);
              }}
            >
              <span className="badge speaker">
                {speaking ? CIcons.stop(10) : CIcons.speaker(10)}
              </span>
              {speaking ? '듣기 중지' : '질문 듣기'}
            </button>
            <div className="casual-rate-wrap">
              <button
                className={`casual-rate-chip ${speedOpen ? 'open' : ''}`}
                onClick={() => setSpeedOpen((o) => !o)}
                aria-label={`재생 속도 ${fmtRate(state.ttsRate)}`}
                aria-expanded={speedOpen}
              >
                <span className="label">속도</span>
                {fmtRate(state.ttsRate)}
              </button>
              {speedOpen && (
                <>
                  <div className="casual-rate-backdrop" onClick={() => setSpeedOpen(false)} />
                  <div className="casual-rate-popover" role="dialog" aria-label="재생 속도 조절">
                    <div className="casual-rate-popover-head">
                      <span>재생 속도</span>
                      <b>{fmtRate(state.ttsRate)}</b>
                    </div>
                    <input
                      type="range"
                      min={SPEED_MIN}
                      max={SPEED_MAX}
                      step={SPEED_STEP}
                      value={state.ttsRate}
                      onChange={(e) =>
                        dispatch({ type: 'SET_TTS_RATE', payload: Number(e.target.value) })
                      }
                      className="casual-rate-slider"
                      aria-label="재생 속도 슬라이더"
                    />
                    <div className="casual-rate-ticks">
                      <span>{SPEED_MIN}×</span>
                      <span>1×</span>
                      <span>{SPEED_MAX}×</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="casual-actions">
          <SmallLink icon={CIcons.spark(13)} onClick={() => setSheet('sample')}>모범답안</SmallLink>
          <SmallDot />
          <SmallLink onClick={async () => {
            const next = !textMode;
            if (next && isRecording) {
              await handleStopRecording();
            }
            if (next) stopTTS();
            setTextMode(next);
            dispatch({ type: 'SET_MODE', payload: next ? 'text' : 'voice' });
          }}>
            {textMode ? '음성으로' : '글로 답하기'}
          </SmallLink>
          <SmallDot />
          <SmallLink icon={CIcons.book(13)} onClick={() => dispatch({ type: 'TOGGLE_SHEET', payload: 'knowledge' })}>관련 질문</SmallLink>
        </div>

        {!textMode ? (
          <div className="casual-mic-area">
            <div className={`casual-mic-bg ${isRecording ? 'rec' : ''}`}>
              <button
                className={`casual-mic ${isRecording ? 'rec' : ''}`}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                aria-label={isRecording ? '녹음 멈추기' : (hasRecording ? '다시 녹음' : '녹음 시작')}
              >
                {isRecording ? CIcons.stop(30) : CIcons.mic(36)}
              </button>
            </div>

            <div className="casual-timer">
              {isRecording ? (
                <>
                  <div className="rec-label">● 녹음 중</div>
                  <div className="big">{fmtTime(elapsed)}</div>
                </>
              ) : hasRecording ? (
                <>
                  <div className="done-label">✓ 녹음 완료</div>
                  <div className="big">{fmtTime(elapsed)}</div>
                  <div className="idle-sub">마이크를 다시 누르면 새로 녹음할 수 있어요</div>
                </>
              ) : (
                <>
                  <div className="idle-title">준비됐어요?</div>
                  <div className="idle-sub">
                    마이크를 누르고 영어로 답해보세요 · 권장 {topic.timer}초
                  </div>
                </>
              )}
            </div>

            {(isRecording || hasRecording) && (transcript || hasRecording) && (
              <div className="casual-transcript-block">
                <div className="head">
                  <div className="label">
                    {isRecording ? '지금 말한 내용' : '녹음된 내용 (텍스트)'}
                  </div>
                  {hasRecording && recordedUrl && (
                    <button
                      type="button"
                      className={`casual-play-btn ${isPlaying ? 'playing' : ''}`}
                      onClick={togglePlayback}
                      aria-label={isPlaying ? '재생 중지' : '녹음 재생'}
                    >
                      {isPlaying ? CIcons.stop(13) : CIcons.play(13)}
                      {isPlaying ? '중지' : '재생'}
                    </button>
                  )}
                </div>
                <div className="body">
                  {transcript || (
                    <span style={{ color: 'var(--opic-ink-low)' }}>
                      {sttSupported
                        ? '아직 인식된 내용이 없어요'
                        : '이 브라우저는 실시간 전사를 지원하지 않아요. 녹음은 정상적으로 진행돼요.'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {recorderError && (
              <div className="casual-error" role="alert">
                {errorMessage(recorderError)}
              </div>
            )}
          </div>
        ) : (
          <div className="casual-textarea-wrap">
            <textarea
              className="casual-textarea"
              value={state.textAnswer}
              onChange={(e) => dispatch({ type: 'UPDATE_TEXT_ANSWER', payload: e.target.value })}
              placeholder="여기에 영어로 답을 적어요. 다 적으면 발음 듣기로 확인해볼 수 있어요."
            />
            <div className="casual-textarea-meta">
              <div>
                <b style={{ color: 'var(--opic-ink)' }}>
                  {state.textAnswer.split(/\s+/).filter(Boolean).length}
                </b> words
              </div>
              <button
                className="casual-sa-listen"
                onClick={() => state.textAnswer.trim() && speak(state.textAnswer, state.ttsRate)}
                disabled={!state.textAnswer.trim()}
                style={{
                  background: state.textAnswer.trim() ? 'var(--opic-ink)' : 'var(--opic-bg-deep)',
                  color: state.textAnswer.trim() ? 'var(--opic-bg)' : 'var(--opic-ink-low)',
                  border: 'none',
                }}
              >
                {CIcons.play(12)} 발음 듣기
              </button>
            </div>
          </div>
        )}

      </div>

      <CasualBottom>
        <CasualButton kind="primary" onClick={() => navQ(1)}>
          {isLast ? '시험 완료' : '다음 질문'} {CIcons.arrow(18)}
        </CasualButton>
      </CasualBottom>

      <CasualSheet open={sheet === 'kr'} onClose={() => setSheet(null)} title="한국어로 보기">
        <div style={{ padding: '10px 4px 24px' }}>
          <div style={{ fontSize: 13, color: 'var(--opic-ink-low)', marginBottom: 8 }}>질문</div>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5, marginBottom: 18 }}>{q.kr}</div>
          <div style={{ fontSize: 13, color: 'var(--opic-ink-low)', marginBottom: 8 }}>원문</div>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--opic-ink-mid)' }}>{q.q}</div>
        </div>
      </CasualSheet>

      <CasualSheet open={sheet === 'sample'} onClose={() => setSheet(null)} title="모범 답안">
        <div style={{ padding: '6px 2px 20px' }}>
          <div style={{
            background: 'var(--opic-sage-soft)', borderRadius: 16, padding: 16,
            fontSize: 15, lineHeight: 1.7, marginBottom: 14,
          }}>{q.sample}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              className="casual-sa-pick on"
              onClick={() => speak(q.sample, state.ttsRate)}
              style={{ flex: 'none' }}
            >{CIcons.play(12)} 듣기 (보통)</button>
            <button
              className="casual-sa-listen"
              onClick={() => speak(q.sample, Math.max(0.5, state.ttsRate - 0.2))}
            >{CIcons.play(12)} 천천히</button>
          </div>
          {q.tip && (
            <div style={{
              background: 'var(--opic-butter-soft)', borderRadius: 14, padding: 14,
              fontSize: 13, lineHeight: 1.6,
            }}>
              <b style={{ marginRight: 4 }}>💡 TIP</b> {q.tip}
            </div>
          )}
        </div>
      </CasualSheet>

      <CasualSheet open={sheet === 'topics'} onClose={() => setSheet(null)} title="주제 고르기">
        <div style={{ padding: '4px 2px 16px' }}>
          {test.topics.map((t: any, ti: number) => {
            const active = ti === topicIdx;
            const done = ti < topicIdx;
            return (
              <button
                key={ti}
                className={`casual-topic-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                onClick={() => {
                  dispatch({ type: 'JUMP_TO', payload: { topicIdx: ti, questionIdx: 0 } });
                  setSheet(null);
                }}
              >
                <span className="num">{done ? CIcons.check(13) : ti + 1}</span>
                <div style={{ flex: 1 }}>
                  <div className="cat">{(test.categories.find((c: any) => c.topics.some((x: any) => x.title === t.title)) || {}).name || '기타'}</div>
                  <div className="name">{t.title_kr}</div>
                </div>
                <div className="count">{t.questions.length}문항</div>
              </button>
            );
          })}
        </div>
      </CasualSheet>

      <CasualSheet open={sheet === 'transcript'} onClose={() => setSheet(null)} title="지금 말한 내용">
        <div style={{ padding: '4px 2px 20px' }}>
          <div style={{ fontSize: 15.5, lineHeight: 1.8 }}>
            {transcript || <span style={{ color: 'var(--opic-ink-low)' }}>
              {sttSupported ? '아직 녹음된 내용이 없어요' : '이 브라우저는 실시간 전사를 지원하지 않아요. 녹음은 정상적으로 진행돼요.'}
            </span>}
          </div>
        </div>
      </CasualSheet>
    </>
  );
}

function errorMessage(code: string) {
  switch (code) {
    case 'permission_denied':
      return '마이크 권한이 거부되었어요. 기기 설정에서 마이크 접근을 허용하고 다시 시도해주세요.';
    case 'insecure_context':
      return 'https:// 주소로 접속해야 마이크를 쓸 수 있어요.';
    case 'no_device':
      return '연결된 마이크를 찾을 수 없어요.';
    case 'unsupported':
      return '이 브라우저는 마이크 녹음을 지원하지 않아요.';
    default:
      return '녹음을 시작할 수 없어요. 잠시 후 다시 시도해주세요.';
  }
}

function CompletionView({ totalTopics }: { totalTopics: number }) {
  const { dispatch } = useAppContext();
  return (
    <>
      <CasualTop />
      <div className="casual-completion">
        <div className="badge">✓</div>
        <div className="casual-h1" style={{ marginTop: 0 }}>모든 질문을 완료했어요</div>
        <div className="casual-sub" style={{ marginTop: 8 }}>
          총 {totalTopics}개 주제를 모두 학습했어요. 학습 기록에서 통계를 확인해보세요.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 32, width: '100%', maxWidth: 320 }}>
          <CasualButton kind="primary" onClick={() => dispatch({ type: 'TOGGLE_SHEET', payload: 'stats' })}>
            학습 기록 보기
          </CasualButton>
          <CasualButton kind="soft" onClick={() => dispatch({ type: 'JUMP_TO', payload: { topicIdx: 0, questionIdx: 0 } })}>
            처음부터 다시 풀기
          </CasualButton>
          <CasualButton kind="ghost" onClick={() => dispatch({ type: 'SET_PHASE', payload: 1 })}>
            새 시험 만들기
          </CasualButton>
        </div>
      </div>
    </>
  );
}
