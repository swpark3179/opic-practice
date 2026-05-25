import { useState, useRef, useCallback } from 'react';

export type RecorderError =
  | 'permission_denied'
  | 'insecure_context'
  | 'no_device'
  | 'unsupported'
  | 'unknown';

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/aac',
  'audio/ogg;codecs=opus',
  'audio/ogg',
];

function pickSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const mt of MIME_CANDIDATES) {
    try {
      if ((MediaRecorder as any).isTypeSupported?.(mt)) return mt;
    } catch {
      /* noop */
    }
  }
  return '';
}

function encodeWav(buffers: Float32Array[], sampleRate: number): Blob {
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;
  for (const b of buffers) {
    merged.set(b, offset);
    offset += b.length;
  }

  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = merged.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let pos = 44;
  for (let i = 0; i < merged.length; i++) {
    const s = Math.max(-1, Math.min(1, merged[i]));
    view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    pos += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<RecorderError | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const analyser = useRef<AnalyserNode | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recordedMime = useRef<string>('audio/webm');

  // Fallback (WAV) recorder state
  const wavBuffers = useRef<Float32Array[]>([]);
  const wavProcessor = useRef<ScriptProcessorNode | null>(null);
  const wavSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const usingFallback = useRef<boolean>(false);

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

    if (!navigator.mediaDevices?.getUserMedia) {
      // mediaDevices is gated behind a secure context. If the page is not
      // secure (e.g. accessed via plain http://lan-ip on iOS Safari), point
      // the user at the underlying cause instead of "unsupported browser".
      if (typeof window !== 'undefined' && window.isSecureContext === false) {
        setError('insecure_context');
      } else {
        setError('unsupported');
      }
      return;
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;

      const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      const ctx = new Ctor();
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch { /* noop */ }
      }
      const source = ctx.createMediaStreamSource(s);
      const node = ctx.createAnalyser();
      node.fftSize = 256;
      source.connect(node);
      audioContext.current = ctx;
      analyser.current = node;

      const mimeType = pickSupportedMimeType();
      const canUseMediaRecorder = typeof MediaRecorder !== 'undefined';

      if (canUseMediaRecorder) {
        try {
          mediaRecorder.current = mimeType
            ? new MediaRecorder(s, { mimeType })
            : new MediaRecorder(s);
          recordedMime.current = mimeType || mediaRecorder.current.mimeType || 'audio/webm';
          audioChunks.current = [];
          mediaRecorder.current.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.current.push(event.data);
          };
          // iOS Safari and some Android builds only emit `dataavailable` reliably
          // when a timeslice is set. Without it, `stop()` can resolve with no
          // chunks, producing an empty blob.
          mediaRecorder.current.start(1000);
          usingFallback.current = false;
          setIsRecording(true);
          return;
        } catch {
          /* fallthrough to WAV fallback */
        }
      }

      // WAV fallback using ScriptProcessorNode (works on older iOS Safari, etc.)
      wavBuffers.current = [];
      const bufferSize = 4096;
      const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
      processor.onaudioprocess = (ev) => {
        const input = ev.inputBuffer.getChannelData(0);
        wavBuffers.current.push(new Float32Array(input));
      };
      source.connect(processor);
      processor.connect(ctx.destination);
      wavProcessor.current = processor;
      wavSource.current = source;
      usingFallback.current = true;
      setIsRecording(true);
    } catch (e) {
      const err = e as DOMException;
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' || err?.name === 'SecurityError') {
        // On iOS, a missing NSMicrophoneUsageDescription or a denied prompt
        // both surface as NotAllowedError / SecurityError here.
        setError('permission_denied');
      } else if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
        setError('no_device');
      } else if (err?.name === 'NotSupportedError' || err?.name === 'TypeError') {
        setError('unsupported');
      } else {
        setError('unknown');
      }
    }
  };

  const cleanupStream = () => {
    stream.current?.getTracks().forEach(t => t.stop());
    stream.current = null;
    audioContext.current?.close().catch(() => { /* noop */ });
    audioContext.current = null;
    analyser.current = null;
  };

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise(resolve => {
      if (usingFallback.current) {
        const ctx = audioContext.current;
        if (!ctx) { setIsRecording(false); resolve(null); return; }
        const sampleRate = ctx.sampleRate;
        try {
          wavProcessor.current?.disconnect();
          wavSource.current?.disconnect();
        } catch { /* noop */ }
        const blob = encodeWav(wavBuffers.current, sampleRate);
        wavBuffers.current = [];
        wavProcessor.current = null;
        wavSource.current = null;
        cleanupStream();
        setIsRecording(false);
        resolve(blob);
        return;
      }

      if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') {
        cleanupStream();
        setIsRecording(false);
        resolve(null);
        return;
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: recordedMime.current });
        cleanupStream();
        setIsRecording(false);
        resolve(audioBlob);
      };

      mediaRecorder.current.stop();
    });
  };

  return { isRecording, error, startRecording, stopRecording, getLevel };
}
