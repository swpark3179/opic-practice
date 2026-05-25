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
    stt.start((text, _isFinal) => {
      setTranscript(text);
    }, () => setListening(false));
    setListening(true);
  };

  const stop = () => {
    stt.stop();
    setListening(false);
  };

  const reset = () => {
    setTranscript('');
  };

  return { start, stop, reset, transcript, listening, supported: stt.isSupported() };
}
