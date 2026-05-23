import React from 'react';
import { Sheet } from '../components/ui/Sheet';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { Card } from '../components/ui/Card';

export function StatsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useAppContext();
  const stats = state.stats;

  const totalMin = Math.floor(stats.totalTimeSeconds / 60);

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--opic-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '18px' }}>학습 기록</div>
        <Button kind="ghost" size="sm" onClick={onClose}><Icons.close /></Button>
      </div>
      <div className="opic-scrollable" style={{ padding: '20px', flex: 1, background: 'var(--opic-bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <Card>
            <div className="opic-sub">총 연습 횟수</div>
            <div className="opic-mono" style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>{stats.totalPractice}</div>
          </Card>
          <Card>
            <div className="opic-sub">총 연습 시간</div>
            <div className="opic-mono" style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>{totalMin}m</div>
          </Card>
        </div>
        
        <Card>
          <div style={{ fontWeight: 700, marginBottom: '16px' }}>최근 연습 기록</div>
          {stats.totalPractice === 0 ? (
            <div className="opic-sub" style={{ textAlign: 'center', padding: '20px' }}>아직 연습 기록이 없습니다.</div>
          ) : (
            <div className="opic-row" style={{ gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--opic-primary-soft)', color: 'var(--opic-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.mic />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>최근 답변 완료</div>
                <div className="opic-sub">{stats.lastPracticeDate ? new Date(stats.lastPracticeDate).toLocaleString() : ''}</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Sheet>
  );
}
