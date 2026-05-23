import React, { useEffect, useState } from 'react';

export function Waveform({ recording, level = 0.5 }: { recording: boolean; level?: number }) {
  const [tick, setTick] = useState(0);
  const BARS = 48;

  useEffect(() => {
    if (!recording) return;
    const interval = setInterval(() => setTick(t => t + 1), 90);
    return () => clearInterval(interval);
  }, [recording]);

  const bars = Array.from({ length: BARS }).map((_, i) => {
    if (!recording) return 3; // idle height
    
    // Simple sine wave animation
    const offset = i * 0.4;
    const wave = Math.sin(tick * 0.5 + offset);
    // height between 4px and 40px based on wave and level
    const baseH = 8;
    const maxH = 40 * level;
    const h = baseH + Math.max(0, wave) * maxH;
    
    // Add some random noise
    const noise = Math.random() * 4;
    return Math.min(60, h + noise);
  });

  return (
    <div className="opic-waveform">
      {bars.map((h, i) => (
        <div 
          key={i} 
          className={`opic-waveform-bar ${recording ? 'recording' : ''}`}
          style={{ height: `${h}px` }} 
        />
      ))}
    </div>
  );
}
