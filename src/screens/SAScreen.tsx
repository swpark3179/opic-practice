import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { SELF_ASSESSMENT } from '../data/selfAssessment';
import { useTTS } from '../hooks/useTTS';
import { generateMainTest } from '../services/testGenerator';
import { CasualTop, CasualProgress, CasualBottom, CasualButton, CIcons } from '../components/casual/CasualUI';

type FlatLevel = {
  difficulty: number;
  id: string;
  level: 'IL' | 'IH' | 'AL';
  level_kr: string;
  description: string;
  sample_en: string;
  tts_rate: number;
};

function buildFlatLevels(): FlatLevel[] {
  const out: FlatLevel[] = [];
  let n = 1;
  for (const fmt of SELF_ASSESSMENT) {
    for (const opt of fmt.options) {
      out.push({
        difficulty: n++,
        id: opt.id,
        level: fmt.level as 'IL' | 'IH' | 'AL',
        level_kr: fmt.level_kr,
        description: opt.description,
        sample_en: opt.sample_en,
        tts_rate: fmt.tts_rate,
      });
    }
  }
  return out;
}

const MIN_RATE = 0.5;
const MAX_RATE = 1.2;
const RATE_STEP = 0.05;

export function SAScreen() {
  const { state, dispatch } = useAppContext();
  const { speak, stop: stopTTS, speaking } = useTTS();

  const flatLevels = useMemo(buildFlatLevels, []);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [rate, setRate] = useState<number>(state.ttsRate);

  const selectOption = (lvl: FlatLevel) => {
    dispatch({ type: 'SET_SA_LEVEL', payload: lvl.level });
    dispatch({ type: 'SET_SA_OPTION', payload: lvl.id });
    dispatch({ type: 'SET_TTS_RATE', payload: rate });
  };

  const handlePlay = (lvl: FlatLevel) => {
    if (playingId === lvl.id && speaking) {
      stopTTS();
      setPlayingId(null);
      return;
    }
    stopTTS();
    setPlayingId(lvl.id);
    speak(lvl.sample_en, rate);
  };

  const handleStart = () => {
    if (!state.saOption) return;
    stopTTS();
    dispatch({ type: 'SET_TTS_RATE', payload: rate });
    const difficulty = state.saDifficulty || 'similar';
    const test = generateMainTest(state.bgsAnswers, state.saLevel, difficulty);
    dispatch({ type: 'GENERATE_TEST', payload: test });
    dispatch({ type: 'SET_PHASE', payload: 3 });
  };

  const adjustRate = (delta: number) => {
    const next = Math.round((rate + delta) * 100) / 100;
    if (next < MIN_RATE || next > MAX_RATE) return;
    setRate(next);
    dispatch({ type: 'SET_TTS_RATE', payload: next });
  };

  return (
    <>
      <CasualTop
        step={2}
        total={2}
        onBack={() => {
          stopTTS();
          dispatch({ type: 'SET_PHASE', payload: 1 });
        }}
      />
      <CasualProgress value={75} />

      <div className="casual-page">
        <h1 className="casual-h1">지금 영어 <em>어느 정도</em>?</h1>
        <p className="casual-sub">샘플을 들어보고 비슷하게 말할 수 있는 난이도를 골라요.</p>

        <div className="sa-speed-control" role="group" aria-label="재생 속도 조절">
          <span className="sa-speed-label">샘플 재생 속도</span>
          <div className="sa-speed-spinner">
            <button
              className="sa-speed-step"
              onClick={() => adjustRate(-RATE_STEP)}
              disabled={rate <= MIN_RATE + 0.001}
              aria-label="속도 줄이기"
            >
              −
            </button>
            <span className="sa-speed-value">{rate.toFixed(2)}×</span>
            <button
              className="sa-speed-step"
              onClick={() => adjustRate(RATE_STEP)}
              disabled={rate >= MAX_RATE - 0.001}
              aria-label="속도 늘리기"
            >
              +
            </button>
          </div>
        </div>

        <div className="sa-difficulty-list">
          {flatLevels.map((lvl) => {
            const on = state.saOption === lvl.id;
            const playing = playingId === lvl.id && speaking;
            return (
              <div key={lvl.id} className={`sa-difficulty-card ${on ? 'on' : ''}`}>
                <button
                  className="sa-difficulty-body"
                  onClick={() => selectOption(lvl)}
                  aria-pressed={on}
                >
                  <div className="sa-difficulty-head">
                    <span className="sa-difficulty-num">{lvl.difficulty}</span>
                    <span className="sa-difficulty-grade">최고등급 {lvl.level}</span>
                    {on && (
                      <span className="sa-difficulty-pick">
                        {CIcons.check(13)} 선택됨
                      </span>
                    )}
                  </div>
                  <div className="sa-difficulty-desc">{lvl.description}</div>
                </button>
                <div className="sa-difficulty-actions">
                  <button
                    className={`sa-listen-btn ${playing ? 'playing' : ''}`}
                    onClick={() => handlePlay(lvl)}
                    aria-label={playing ? '재생 정지' : '샘플 듣기'}
                  >
                    {playing ? CIcons.stop(13) : CIcons.play(13)}
                    {playing ? '정지' : '들어보기'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CasualBottom split>
        <CasualButton
          kind="soft"
          size="sm"
          onClick={() => {
            stopTTS();
            dispatch({ type: 'SET_PHASE', payload: 1 });
          }}
        >
          {CIcons.back(16)} 이전
        </CasualButton>
        <CasualButton kind="primary" size="sm" onClick={handleStart} disabled={!state.saOption}>
          시작하기 {CIcons.arrow(16)}
        </CasualButton>
      </CasualBottom>
    </>
  );
}
