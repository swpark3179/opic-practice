import { useState, useRef, useCallback } from 'react';

export type RecorderError = 'permission_denied' | 'unsupported' | 'unknown';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<RecorderError | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const analyser = useRef<AnalyserNode | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  const getLevel = useCallback((): number => {
    if (!analyser.current) return 0;
    const data = new Uint8Array(analyser.current.fftSize);
    analyser.current.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    return Math.min(1, rms * 2.5);
  }, []);

  const startRecording = async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('unsupported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createAnalyser();
      node.fftSize = 256;
      source.connect(node);
      audioContext.current = ctx;
      analyser.current = node;

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (e) {
      const err = e as DOMException;
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('permission_denied');
      } else {
        setError('unknown');
      }
    }
  };

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise(resolve => {
      if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setIsRecording(false);
        audioContext.current?.close().catch(() => { /* noop */ });
        audioContext.current = null;
        analyser.current = null;
        resolve(audioBlob);
      };

      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    });
  };

  return { isRecording, error, startRecording, stopRecording, getLevel };
}
