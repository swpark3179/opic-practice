import React from 'react';
import { Sheet } from '../components/ui/Sheet';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';

export function TopicsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useAppContext();
  const test = state.generatedTest;

  if (!test) return <Sheet open={open} onClose={onClose}><div/></Sheet>;

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--opic-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '18px' }}>전체 주제</div>
        <Button kind="ghost" size="sm" onClick={onClose}><Icons.close /></Button>
      </div>
      <div className="opic-scrollable" style={{ padding: '20px', flex: 1 }}>
        <div className="opic-col" style={{ gap: '16px' }}>
          {test.topics.map((t, idx) => {
            const isActive = idx === state.currentTopicIdx;
            const isDone = idx < state.currentTopicIdx;
            return (
              <div key={idx} className="opic-row" style={{ gap: '12px', cursor: 'pointer' }} onClick={() => {
                dispatch({ type: 'GENERATE_TEST', payload: { ...test } }); // Note: Simplified jump
                onClose();
              }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isActive ? 'var(--opic-primary)' : isDone ? 'var(--opic-ink)' : 'var(--opic-border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                  {isDone ? <Icons.check /> : idx + 1}
                </div>
                <div style={{ fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--opic-ink)' : 'var(--opic-ink-mid)', fontSize: '15px' }}>
                  {t.title_kr}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
