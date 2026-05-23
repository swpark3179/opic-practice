import { useState, useEffect } from 'react';
import { stt } from '../services/stt';

export function useSTT() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);

  useEffect(() => {
    return () => {
      stt.stop();
    };
  }, []);

  const start = () => {
    setTranscript('');
    stt.start((text, isFinal) => {
      // In a real app we might handle interim vs final differently
      // For now just append everything or replace depending on how WebSpeech sends it
      setTranscript(text);
    }, () => setListening(false));
    setListening(true);
  };

  const stop = () => {
    stt.stop();
    setListening(false);
  };

  return { start, stop, transcript, listening, supported: stt.isSupported() };
}
