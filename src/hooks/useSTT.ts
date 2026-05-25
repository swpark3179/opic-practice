import { useState, useEffect, useRef } from 'react';
import { stt } from '../services/stt';

export function useSTT() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const finalsRef = useRef('');

  useEffect(() => {
    return () => {
      stt.stop();
    };
  }, []);

  const start = () => {
    finalsRef.current = '';
    setTranscript('');
    stt.start((text, isFinal) => {
      if (isFinal) {
        finalsRef.current = (finalsRef.current ? finalsRef.current + ' ' : '') + text.trim();
        setTranscript(finalsRef.current);
      } else {
        const combined = finalsRef.current
          ? finalsRef.current + ' ' + text.trim()
          : text.trim();
        setTranscript(combined);
      }
    }, () => setListening(false));
    setListening(true);
  };

  const stop = () => {
    stt.stop();
    setListening(false);
  };

  const reset = () => {
    finalsRef.current = '';
    setTranscript('');
  };

  return { start, stop, reset, transcript, listening, supported: stt.isSupported() };
}
