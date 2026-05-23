import React from 'react';
import { Icons } from './ui/Icons';

export function MicButton({ recording, onClick }: { recording: boolean; onClick: () => void }) {
  return (
    <button 
      className={`opic-mic ${recording ? 'recording' : 'idle'}`}
      onClick={onClick}
    >
      {recording ? <Icons.stop /> : <Icons.mic />}
    </button>
  );
}
