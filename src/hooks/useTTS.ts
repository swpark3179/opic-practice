import { useState, useEffect } from 'react';
import { tts } from '../services/tts';

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      setSpeaking(tts.isSpeaking());
    }, 100);
    return () => {
      clearInterval(checkInterval);
      tts.stop();
    };
  }, []);

  const speak = (text: string, rate?: number) => {
    tts.speak(text, rate, () => setSpeaking(false));
    setSpeaking(true);
  };

  const stop = () => {
    tts.stop();
    setSpeaking(false);
  };

  return { speak, stop, speaking };
}
