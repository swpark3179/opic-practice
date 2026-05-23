import React, { useState } from 'react';
import { Sheet } from '../components/ui/Sheet';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Icons } from '../components/ui/Icons';
import { KNOWLEDGE_BASE } from '../data/knowledge';

export function KnowledgeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [filter, setFilter] = useState('all');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Flatten knowledge base
  const allQuestions: any[] = [];
  Object.keys(KNOWLEDGE_BASE).forEach(cat => {
    (KNOWLEDGE_BASE as any)[cat].topics.forEach((t: any) => {
      t.questions.forEach((q: any) => {
        allQuestions.push({ cat, topic: t.title, ...q });
      });
    });
  });

  const filtered = filter === 'all' ? allQuestions : allQuestions.filter(q => q.cat === filter);
  const selected = selectedIdx !== null ? filtered[selectedIdx] : null;

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--opic-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>관련 질문 연습</div>
          <Button kind="ghost" size="sm" onClick={onClose}><Icons.close /></Button>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--opic-border)', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {['all', 'personal', 'leisure', 'hobby', 'sports', 'travel', 'surprise'].map(c => (
            <Chip key={c} checked={filter === c} onClick={() => { setFilter(c); setSelectedIdx(null); }}>
              {c === 'all' ? '전체' : c}
            </Chip>
          ))}
        </div>

        <div className="opic-main-layout" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="opic-scrollable" style={{ flex: 1, padding: '20px', display: selectedIdx !== null ? 'none' : 'block' }}>
            <div className="opic-col" style={{ gap: '12px' }}>
              {filtered.map((q, idx) => (
                <Card key={idx} style={{ cursor: 'pointer' }} className={selectedIdx === idx ? 'checked' : ''}>
                  <div onClick={() => setSelectedIdx(idx)}>
                    <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px' }}>{q.q}</div>
                    <div className="opic-sub">{q.kr}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {selectedIdx !== null && selected && (
            <div className="opic-scrollable" style={{ flex: 1, padding: '20px', background: 'var(--opic-bg-warm)' }}>
              <Button kind="text" onClick={() => setSelectedIdx(null)} style={{ marginBottom: '16px' }}>
                <Icons.arrowL /> 목록으로
              </Button>
              <Card style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{selected.q}</div>
                <div className="opic-sub">{selected.kr}</div>
              </Card>
              <Card style={{ background: 'var(--opic-sage-soft)', borderColor: 'var(--opic-sage-border)' }}>
                <div style={{ color: 'var(--opic-sage)', fontWeight: 700, marginBottom: '12px' }}>모범 답변</div>
                <div style={{ fontSize: '14px', lineHeight: 1.6 }}>{selected.sample}</div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
