import React from 'react';
import { Icons } from './ui/Icons';

type ModeSelectorProps = {
  mode: 'voice' | 'text';
  onChange: (m: 'voice' | 'text') => void;
};

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div style={{ display: 'flex', background: 'var(--opic-bg-warm)', padding: '4px', borderRadius: '12px', gap: '4px', alignSelf: 'flex-start' }}>
      <button
        onClick={() => onChange('voice')}
        style={{
          background: mode === 'voice' ? 'var(--opic-surface)' : 'transparent',
          color: mode === 'voice' ? 'var(--opic-ink)' : 'var(--opic-ink-mid)',
          boxShadow: mode === 'voice' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'all 0.2s'
        }}
      >
        <Icons.mic /> 음성 답변
      </button>
      <button
        onClick={() => onChange('text')}
        style={{
          background: mode === 'text' ? 'var(--opic-surface)' : 'transparent',
          color: mode === 'text' ? 'var(--opic-ink)' : 'var(--opic-ink-mid)',
          boxShadow: mode === 'text' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'all 0.2s'
        }}
      >
        📝 텍스트 답변
      </button>
    </div>
  );
}
