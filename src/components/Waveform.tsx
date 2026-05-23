import React, { useEffect, useRef, useState } from 'react';

type WaveformProps = {
  recording: boolean;
  /** Optional callback returning current input level [0..1]. If omitted, a passive idle bar is shown. */
  getLevel?: () => number;
};

const BARS = 48;

export function Waveform({ recording, getLevel }: WaveformProps) {
  const [, forceRender] = useState(0);
  const history = useRef<number[]>(Array.from({ length: BARS }).map(() => 0));
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!recording || !getLevel) {
      history.current = history.current.map(() => 0);
      forceRender(t => t + 1);
      return;
    }

    const tick = () => {
      const level = getLevel();
      history.current = [...history.current.slice(1), level];
      forceRender(t => t + 1);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [recording, getLevel]);

  return (
    <div className="opic-waveform" aria-hidden={!recording}>
      {history.current.map((level, i) => {
        const minH = 3;
        const maxH = 56;
        const h = recording ? minH + level * (maxH - minH) : minH;
        return (
          <div
            key={i}
            className={`opic-waveform-bar ${recording ? 'recording' : ''}`}
            style={{ height: `${h}px` }}
          />
        );
      })}
    </div>
  );
}
