import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTTS } from '../hooks/useTTS';
import { useSTT } from '../hooks/useSTT';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useTimer } from '../hooks/useTimer';
import { storage } from '../services/storage';

import { TopBar } from '../components/TopBar';
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
  
  if (!test || !test.topics[topicIdx]) return null;

  const topic = test.topics[topicIdx];
  const q = topic.questions[qIdx];
  const category = test.categories.find(c => c.topics.some(t => t.title === topic.title));

  const { mode, textAnswer } = state;
  const { speak, stop: stopTTS, speaking } = useTTS();
  const { start: startSTT, stop: stopSTT, transcript, listening: sttListening } = useSTT();
  const { startRecording, stopRecording, isRecording } = useAudioRecorder();
  
  const [showSample, setShowSample] = useState(false);
  const [questionRate, setQuestionRate] = useState(0.85);

  const { elapsed, reset: resetTimer } = useTimer(isRecording);
  const remaining = Math.max(0, topic.timer - elapsed);

  // Auto stop when timer hits 0
  useEffect(() => {
    if (isRecording && remaining <= 0) {
      handleStopRecording();
    }
  }, [remaining, isRecording]);

  // Reset state when question changes
  useEffect(() => {
    stopTTS();
    if (isRecording) handleStopRecording();
    setShowSample(false);
    resetTimer();
  }, [topicIdx, qIdx]);

  const handleStartRecording = async () => {
    resetTimer();
    stopTTS();
    await startRecording();
    startSTT();
  };

  const handleStopRecording = async () => {
    stopSTT();
    const blob = await stopRecording();
    if (blob) {
      const url = await storage.saveAudioRecording(blob, `${topic.title}_${qIdx}`);
      // Save stats
      const currentStats = state.stats;
      const updatedStats = {
        ...currentStats,
        totalPractice: currentStats.totalPractice + 1,
        totalTimeSeconds: currentStats.totalTimeSeconds + elapsed,
        lastPracticeDate: new Date().toISOString()
      };
      dispatch({ type: 'UPDATE_STATS', payload: updatedStats } as any); // we need to add UPDATE_STATS to AppContext if not added
    }
  };

  const navQ = (delta: number) => {
    dispatch({ type: 'NAV_QUESTION', payload: { delta } });
  };

  return (
    <div className="opic-main-layout">
      {/* Sidebar (Desktop) */}
      <div className="opic-sidebar">
        <div style={{ fontWeight: 700, marginBottom: '20px' }}>전체 주제 ({test.topics.length})</div>
        <div className="opic-col" style={{ gap: '16px' }}>
          {test.topics.map((t, idx) => {
            const isActive = idx === topicIdx;
            const isDone = idx < topicIdx;
            return (
              <div key={idx} className="opic-row" style={{ gap: '12px', cursor: 'pointer' }} onClick={() => {
                dispatch({ type: 'GENERATE_TEST', payload: { ...test } }); // reset
                // In a real app we'd dispatch a direct jump
              }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: isActive ? 'var(--opic-primary)' : isDone ? 'var(--opic-ink)' : 'var(--opic-border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDone && <Icons.check />}
                </div>
                <div style={{ fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--opic-ink)' : 'var(--opic-ink-mid)', fontSize: '14px' }}>
                  {t.title_kr}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="opic-grow opic-col" style={{ height: '100%' }}>
        <div className="opic-page">
          <div className="opic-page-inner">
            {/* Meta bar */}
            <div className="opic-row" style={{ justifyContent: 'space-between' }}>
              <div className="opic-row" style={{ gap: '8px' }}>
                <Tag>{category?.name || '기타'}</Tag>
                <div style={{ fontWeight: 700 }}>{topic.title_kr}</div>
              </div>
              <div className="opic-row" style={{ gap: '4px' }}>
                {topic.questions.map((_, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === qIdx ? 'var(--opic-primary)' : i < qIdx ? 'var(--opic-ink)' : 'var(--opic-border-strong)' }} />
                ))}
              </div>
            </div>

            {/* Question Card */}
            <Card>
              <div className="opic-row" style={{ gap: '16px', alignItems: 'flex-start' }}>
                <div className="opic-grow">
                  <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.4, marginBottom: '8px' }}>
                    {q.q}
                  </div>
                  <div className="opic-sub">{q.kr}</div>
                </div>
                <div className="opic-col" style={{ gap: '8px', alignItems: 'flex-end', minWidth: '120px' }}>
                  <Button kind="secondary" size="sm" onClick={() => {
                    if (speaking) stopTTS();
                    else speak(q.q, questionRate);
                  }}>
                    <Icons.speaker /> 질문 듣기
                  </Button>
                  <div className="opic-row" style={{ background: 'var(--opic-bg-warm)', padding: '2px', borderRadius: '6px', gap: '2px' }}>
                    {[0.5, 0.75, 1.0].map(r => (
                      <button key={r} onClick={() => setQuestionRate(r)} style={{
                        background: questionRate === r ? 'var(--opic-surface)' : 'transparent',
                        border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', fontWeight: 600,
                        boxShadow: questionRate === r ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer'
                      }}>{r}x</button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <ModeSelector mode={mode} onChange={(m) => dispatch({ type: 'SET_MODE', payload: m })} />

            {/* Answer Area */}
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
                    {isRecording ? <Waveform recording={true} level={0.8} /> : <div className="opic-sub">녹음 버튼을 눌러 답변을 시작하세요</div>}
                  </div>

                  <MicButton recording={isRecording} onClick={isRecording ? handleStopRecording : handleStartRecording} />
                </Card>

                <Card className="opic-desktop-only" style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>
                  <div className="opic-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontWeight: 600 }}>실시간 전사</span>
                    <span className="opic-mono opic-sub">{transcript.split(' ').length} words</span>
                  </div>
                  <div className="opic-grow opic-scrollable" style={{ fontSize: '14px', lineHeight: 1.5, color: transcript ? 'var(--opic-ink)' : 'var(--opic-ink-low)' }}>
                    {transcript || "마이크를 통해 말하면 여기에 텍스트가 표시됩니다."}
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

            {/* Sample Answer */}
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

            {/* Nav */}
            <div className="opic-desktop-only opic-row" style={{ justifyContent: 'space-between', marginTop: 'auto', paddingTop: '24px' }}>
              <Button kind="secondary" size="lg" onClick={() => navQ(-1)} disabled={topicIdx === 0 && qIdx === 0}>
                <Icons.arrowL /> 이전
              </Button>
              <div className="opic-row" style={{ gap: '12px' }}>
                <Button kind="secondary" size="lg" onClick={() => dispatch({ type: 'TOGGLE_SHEET', payload: 'knowledge' })}>
                  <Icons.book /> 관련 질문 연습
                </Button>
                <Button size="lg" onClick={() => navQ(1)}>
                  다음 질문 <Icons.arrowR />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bar */}
        <div className="opic-mobile-bar">
          <div className="opic-row" style={{ width: '100%', gap: '12px' }}>
            <Button kind="secondary" size="lg" onClick={() => navQ(-1)} disabled={topicIdx === 0 && qIdx === 0}>
              <Icons.arrowL />
            </Button>
            <Button size="lg" style={{ flex: 1 }} onClick={() => navQ(1)}>
              다음 질문
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
