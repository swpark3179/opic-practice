import React, { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTTS } from '../hooks/useTTS';
import { useSTT } from '../hooks/useSTT';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useTimer } from '../hooks/useTimer';
import { storage } from '../services/storage';

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { Icons } from '../components/ui/Icons';
import { ModeSelector } from '../components/ModeSelector';
import { Waveform } from '../components/Waveform';
import { MicButton } from '../components/MicButton';

export function MainScreen() {
  const { state, dispatch } = useAppContext();
  const test = state.generatedTest;

  const topicIdx = state.currentTopicIdx;
  const qIdx = state.currentQuestionIdx;

  const { mode, textAnswer } = state;
  const { speak, stop: stopTTS, speaking } = useTTS();
  const { start: startSTT, stop: stopSTT, transcript, supported: sttSupported } = useSTT();
  const { startRecording, stopRecording, isRecording, error: recorderError, getLevel } = useAudioRecorder();

  const [showSample, setShowSample] = useState(false);
  const [questionRate, setQuestionRate] = useState(0.85);

  const isCompleted = !!test && topicIdx >= test.topics.length;
  const topic = !isCompleted && test ? test.topics[topicIdx] : null;
  const q = topic ? topic.questions[qIdx] : null;
  const category = topic && test ? test.categories.find(c => c.topics.some(t => t.title === topic.title)) : null;

  const totalQuestions = test ? test.topics.reduce((sum: number, t: any) => sum + t.questions.length, 0) : 0;
  const overallIdx = test && !isCompleted
    ? test.topics.slice(0, topicIdx).reduce((sum: number, t: any) => sum + t.questions.length, 0) + qIdx
    : totalQuestions;

  const { elapsed, reset: resetTimer } = useTimer(isRecording);
  const remaining = topic ? Math.max(0, topic.timer - elapsed) : 0;

  const handleStopRecording = useCallback(async () => {
    stopSTT();
    const blob = await stopRecording();
    if (blob) {
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
    if (isRecording && remaining <= 0) {
      handleStopRecording();
    }
  }, [remaining, isRecording, handleStopRecording]);

  useEffect(() => {
    stopTTS();
    if (isRecording) handleStopRecording();
    setShowSample(false);
    resetTimer();
    // resetTimer/handleStopRecording intentionally omitted to fire on navigation only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicIdx, qIdx]);

  if (!test) return null;

  if (isCompleted) {
    return <CompletionView totalTopics={test.topics.length} />;
  }

  if (!topic || !q) return null;

  const handleStartRecording = async () => {
    if (!sttSupported) {
      // STT 미지원 환경이어도 녹음 자체는 진행 (transcript만 표시 안 됨)
    }
    resetTimer();
    stopTTS();
    await startRecording();
    if (sttSupported) startSTT();
  };

  const navQ = (delta: number) => {
    dispatch({ type: 'NAV_QUESTION', payload: { delta } });
  };

  const jumpToTopic = (idx: number) => {
    dispatch({ type: 'JUMP_TO', payload: { topicIdx: idx } });
  };

  return (
    <div className="opic-main-layout">
      <div className="opic-sidebar">
        <div style={{ fontWeight: 700, marginBottom: '20px' }}>전체 주제 ({test.topics.length})</div>
        <div className="opic-col" style={{ gap: '16px' }}>
          {test.topics.map((t, idx) => {
            const isActive = idx === topicIdx;
            const isDone = idx < topicIdx;
            return (
              <div
                key={idx}
                className="opic-row"
                style={{ gap: '12px', cursor: 'pointer' }}
                onClick={() => jumpToTopic(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') jumpToTopic(idx); }}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: isActive ? 'var(--opic-primary)' : isDone ? 'var(--opic-ink)' : 'var(--opic-border)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isDone && <Icons.check />}
                </div>
                <div style={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--opic-ink)' : 'var(--opic-ink-mid)',
                  fontSize: '14px',
                }}>
                  {t.title_kr}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="opic-grow opic-col" style={{ height: '100%', minWidth: 0, minHeight: 0 }}>
        <div className="opic-page">
          <div className="opic-page-inner">
            <div className="opic-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div className="opic-row" style={{ gap: '8px' }}>
                <Tag>{category?.name || '기타'}</Tag>
                <div style={{ fontWeight: 700 }}>{topic.title_kr}</div>
              </div>
              <div className="opic-row" style={{ gap: '8px' }}>
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: 'TOGGLE_SHEET', payload: 'topics' })}
                >
                  <Icons.menu /> 문제 {overallIdx + 1} / {totalQuestions}
                </Button>
              </div>
            </div>

            <div style={{ background: 'var(--opic-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${totalQuestions > 0 ? ((overallIdx + 1) / totalQuestions) * 100 : 0}%`,
                height: '100%',
                background: 'var(--opic-primary)',
                transition: 'width 0.3s',
              }} />
            </div>

            <div className="opic-row" style={{ gap: '4px', justifyContent: 'flex-end' }}>
              {topic.questions.map((_, i) => (
                <div
                  key={i}
                  onClick={() => dispatch({ type: 'JUMP_TO', payload: { topicIdx, questionIdx: i } })}
                  style={{
                    width: '14px', height: '14px', borderRadius: '50%', cursor: 'pointer',
                    background: i === qIdx ? 'var(--opic-primary)' : i < qIdx ? 'var(--opic-ink)' : 'var(--opic-border-strong)',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`주제 내 ${i + 1}번 질문으로 이동`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dispatch({ type: 'JUMP_TO', payload: { topicIdx, questionIdx: i } }); }}
                />
              ))}
            </div>

            <Card>
              <div className="opic-row" style={{ gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div className="opic-grow" style={{ minWidth: '200px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.4, marginBottom: '8px' }}>
                    {q.q}
                  </div>
                  <div className="opic-sub">{q.kr}</div>
                </div>
                <div className="opic-col" style={{ gap: '8px', alignItems: 'stretch', minWidth: '220px' }}>
                  <Button kind="secondary" size="sm" onClick={() => {
                    if (speaking) stopTTS();
                    else speak(q.q, questionRate);
                  }}>
                    <Icons.speaker /> {speaking ? '듣기 중지' : '질문 듣기'}
                  </Button>
                  <div style={{ background: 'var(--opic-bg-warm)', padding: '10px 12px', borderRadius: '8px' }}>
                    <div className="opic-row" style={{ justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="opic-sub" style={{ marginTop: 0 }}>속도</span>
                      <span className="opic-mono" style={{ fontWeight: 700, fontSize: '13px' }}>{questionRate.toFixed(2)}x</span>
                    </div>
                    <div className="opic-row" style={{ gap: '6px' }}>
                      <button
                        aria-label="속도 낮추기"
                        onClick={() => setQuestionRate(r => Math.max(0.3, Math.round((r - 0.05) * 100) / 100))}
                        style={{
                          background: 'var(--opic-surface)', border: '1px solid var(--opic-border)',
                          borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer',
                          fontSize: '14px', fontWeight: 700, lineHeight: 1,
                        }}
                      >−</button>
                      <input
                        type="range"
                        min={0.3}
                        max={2}
                        step={0.05}
                        value={questionRate}
                        onChange={(e) => setQuestionRate(parseFloat(e.target.value))}
                        style={{ flex: 1 }}
                      />
                      <button
                        aria-label="속도 올리기"
                        onClick={() => setQuestionRate(r => Math.min(2, Math.round((r + 0.05) * 100) / 100))}
                        style={{
                          background: 'var(--opic-surface)', border: '1px solid var(--opic-border)',
                          borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer',
                          fontSize: '14px', fontWeight: 700, lineHeight: 1,
                        }}
                      >+</button>
                    </div>
                    <div className="opic-row" style={{ gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {[0.5, 0.75, 1.0, 1.25, 1.5].map(r => (
                        <button key={r} onClick={() => setQuestionRate(r)} style={{
                          background: Math.abs(questionRate - r) < 0.001 ? 'var(--opic-ink)' : 'var(--opic-surface)',
                          color: Math.abs(questionRate - r) < 0.001 ? 'var(--opic-surface)' : 'var(--opic-ink)',
                          border: '1px solid var(--opic-border)', borderRadius: '4px',
                          padding: '3px 7px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                        }}>{r}x</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <ModeSelector mode={mode} onChange={(m) => dispatch({ type: 'SET_MODE', payload: m })} />

            {mode === 'voice' ? (
              <div className="opic-row" style={{ gap: '16px', alignItems: 'stretch' }}>
                <Card className="opic-grow opic-col" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
                  <div className="opic-row" style={{ width: '100%', justifyContent: 'space-between', marginBottom: 'auto' }}>
                    <Tag tone={isRecording ? 'rec' : 'neutral'}>{isRecording ? '녹음 중' : '대기 중'}</Tag>
                    <div className="opic-mono" style={{ fontSize: '22px', fontWeight: 700, color: remaining <= 5 ? 'var(--opic-rec)' : 'var(--opic-ink)' }}>
                      00:{remaining.toString().padStart(2, '0')}
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {isRecording
                      ? <Waveform recording={true} getLevel={getLevel} />
                      : <div className="opic-sub">녹음 버튼을 눌러 답변을 시작하세요</div>}
                  </div>

                  {recorderError && (
                    <div role="alert" style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '13px',
                      background: 'var(--opic-rec-soft)', color: 'var(--opic-rec)', marginBottom: '12px',
                    }}>
                      {recorderError === 'permission_denied'
                        ? '마이크 권한이 거부되었습니다. iOS 설정 → 앱 권한(또는 Safari → 마이크)에서 접근을 허용한 뒤 다시 시도해주세요.'
                        : recorderError === 'insecure_context'
                        ? '보안 연결(HTTPS)이 필요합니다. https:// 주소로 접속해 다시 시도해주세요.'
                        : recorderError === 'no_device'
                        ? '사용 가능한 마이크를 찾을 수 없습니다. 기기에 마이크가 연결되어 있는지 확인해주세요.'
                        : recorderError === 'unsupported'
                        ? '현재 브라우저는 마이크 녹음을 지원하지 않습니다. 최신 Safari/Chrome에서 다시 시도해주세요.'
                        : '녹음을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.'}
                    </div>
                  )}

                  <MicButton recording={isRecording} onClick={isRecording ? handleStopRecording : handleStartRecording} />
                </Card>

                <Card className="opic-desktop-only" style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>
                  <div className="opic-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontWeight: 600 }}>실시간 전사</span>
                    <span className="opic-mono opic-sub">{transcript.split(' ').filter(Boolean).length} words</span>
                  </div>
                  <div className="opic-grow opic-scrollable" style={{ fontSize: '14px', lineHeight: 1.5, color: transcript ? 'var(--opic-ink)' : 'var(--opic-ink-low)' }}>
                    {!sttSupported
                      ? '현재 브라우저는 실시간 전사를 지원하지 않습니다. (Chrome/Edge 권장) 녹음은 정상적으로 진행됩니다.'
                      : transcript || '마이크를 통해 말하면 여기에 텍스트가 표시됩니다.'}
                  </div>
                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--opic-amber-soft)', color: 'var(--opic-amber)', borderRadius: '8px', fontSize: '12px', display: 'flex', gap: '8px' }}>
                    <Icons.book /> 영어로 답변하다 막히면 한국어를 섞어 말해보세요. 나중에 AI 피드백을 통해 영어 표현을 교정받을 수 있습니다.
                  </div>
                </Card>
              </div>
            ) : (
              <Card>
                <textarea
                  className="opic-textarea"
                  value={textAnswer}
                  onChange={(e) => dispatch({ type: 'UPDATE_TEXT_ANSWER', payload: e.target.value })}
                  placeholder="여기에 답변을 입력하세요..."
                />
                <div className="opic-row" style={{ justifyContent: 'space-between', marginTop: '12px' }}>
                  <div className="opic-sub">{textAnswer.split(/\s+/).filter(Boolean).length} words</div>
                  <Button kind="secondary" size="sm" onClick={() => speak(textAnswer, state.ttsRate)}>
                    <Icons.play /> 들어보기
                  </Button>
                </div>
              </Card>
            )}

            {showSample ? (
              <Card style={{ background: 'var(--opic-sage-soft)', borderColor: 'var(--opic-sage-border)' }}>
                <div className="opic-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="opic-row" style={{ gap: '8px' }}>
                    <span style={{ color: 'var(--opic-sage)', fontWeight: 700 }}>모범 답변</span>
                    <Tag tone="sage">{state.saLevel}</Tag>
                  </div>
                  <Button kind="ghost" size="sm" onClick={() => setShowSample(false)}>닫기</Button>
                </div>
                <div style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>{q.sample}</div>
                {q.tip && (
                  <div style={{ padding: '12px', background: 'white', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '8px' }}>
                    <span>💡</span> {q.tip}
                  </div>
                )}
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <Button kind="secondary" size="sm" onClick={() => speak(q.sample, state.ttsRate)}>
                    <Icons.speaker /> 답변 듣기
                  </Button>
                </div>
              </Card>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Button kind="text" onClick={() => setShowSample(true)}>모범 답변 보기</Button>
              </div>
            )}

            <div className="opic-desktop-only opic-row" style={{ justifyContent: 'space-between', marginTop: 'auto', paddingTop: '24px' }}>
              <Button kind="secondary" size="lg" onClick={() => navQ(-1)} disabled={topicIdx === 0 && qIdx === 0}>
                <Icons.arrowL /> 이전
              </Button>
              <div className="opic-row" style={{ gap: '12px' }}>
                <Button kind="secondary" size="lg" onClick={() => dispatch({ type: 'TOGGLE_SHEET', payload: 'knowledge' })}>
                  <Icons.book /> 관련 질문 연습
                </Button>
                <Button size="lg" onClick={() => navQ(1)}>
                  {topicIdx === test.topics.length - 1 && qIdx === topic.questions.length - 1
                    ? '시험 완료' : '다음 질문'} <Icons.arrowR />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="opic-mobile-bar">
          <div className="opic-row" style={{ width: '100%', gap: '8px' }}>
            <Button kind="secondary" size="lg" onClick={() => navQ(-1)} disabled={topicIdx === 0 && qIdx === 0}>
              <Icons.arrowL />
            </Button>
            <Button
              kind="secondary"
              size="lg"
              onClick={() => dispatch({ type: 'TOGGLE_SHEET', payload: 'topics' })}
              aria-label="전체 문제 목록 열기"
            >
              <Icons.menu />
            </Button>
            <Button size="lg" style={{ flex: 1 }} onClick={() => navQ(1)}>
              {topicIdx === test.topics.length - 1 && qIdx === topic.questions.length - 1
                ? '시험 완료' : '다음 질문'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletionView({ totalTopics }: { totalTopics: number }) {
  const { dispatch } = useAppContext();
  return (
    <div className="opic-page">
      <div className="opic-page-inner" style={{ alignItems: 'center', textAlign: 'center', paddingTop: '60px' }}>
        <div style={{
          width: '88px', height: '88px', borderRadius: '50%',
          background: 'var(--opic-sage-soft)', color: 'var(--opic-sage)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '40px', fontWeight: 800, marginBottom: '24px',
        }}>
          ✓
        </div>
        <div className="opic-h1">모든 질문을 완료했습니다</div>
        <div className="opic-sub" style={{ marginTop: '8px' }}>
          총 {totalTopics}개 주제를 모두 학습했어요. 학습 기록에서 통계를 확인해보세요.
        </div>
        <div className="opic-row" style={{ gap: '12px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button size="lg" onClick={() => dispatch({ type: 'TOGGLE_SHEET', payload: 'stats' })}>
            <Icons.book /> 학습 기록 보기
          </Button>
          <Button kind="secondary" size="lg" onClick={() => dispatch({ type: 'JUMP_TO', payload: { topicIdx: 0, questionIdx: 0 } })}>
            처음부터 다시 풀기
          </Button>
          <Button kind="ghost" size="lg" onClick={() => dispatch({ type: 'SET_PHASE', payload: 1 })}>
            새 시험 만들기
          </Button>
        </div>
      </div>
    </div>
  );
}
