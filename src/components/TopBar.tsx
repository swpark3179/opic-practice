import React from 'react';
import { Icons } from './ui/Icons';
import { Tag } from './ui/Tag';
import { Button } from './ui/Button';

type TopBarProps = {
  phase: number;
  onJump: (p: number) => void;
  onOpenStats?: () => void;
};

export function TopBar({ phase, onJump, onOpenStats }: TopBarProps) {
  const steps = [
    { id: 1, label: '배경 설문' },
    { id: 2, label: '난이도 설정' },
    { id: 3, label: '본시험' }
  ];

  return (
    <header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: 'var(--opic-bg)',
      borderBottom: '1px solid var(--opic-border)'
    }}>
      <div className="opic-row" style={{ gap: '12px' }}>
        <div style={{
          width: '28px', height: '28px',
          background: 'var(--opic-ink)', color: 'white',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '18px'
        }}>O</div>
        <div className="opic-desktop-only" style={{ fontWeight: 700, fontSize: '14px' }}>OPIC Practice</div>
      </div>

      <div className="opic-steps opic-row" style={{ gap: '8px' }}>
        {steps.map((s, i) => {
          const isActive = phase === s.id;
          const isDone = phase > s.id;
          return (
            <React.Fragment key={s.id}>
              <div 
                className="opic-row" 
                style={{ 
                  gap: '6px', 
                  cursor: 'pointer',
                  opacity: isActive || isDone ? 1 : 0.4
                }}
                onClick={() => onJump(s.id)}
              >
                <div style={{
                  width: '20px', height: '20px',
                  borderRadius: '50%',
                  background: isActive || isDone ? 'var(--opic-ink)' : 'transparent',
                  border: `1px solid var(--opic-ink)`,
                  color: isActive || isDone ? 'white' : 'var(--opic-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 600
                }}>
                  {isDone ? <Icons.check /> : s.id}
                </div>
                <div className="opic-desktop-only" style={{ fontSize: '13px', fontWeight: 600 }}>{s.label}</div>
              </div>
              {i < steps.length - 1 && <div style={{ width: '16px', height: '1px', background: 'var(--opic-border-strong)' }} />}
            </React.Fragment>
          );
        })}
      </div>

      <div>
        <Button kind="ghost" size="sm" onClick={onOpenStats}>
          <Icons.book /> <span className="opic-desktop-only">학습기록</span>
        </Button>
      </div>
    </header>
  );
}
