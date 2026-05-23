import { useState, useEffect } from 'react';

export function useTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const reset = () => setElapsed(0);

  return { elapsed, reset };
}
