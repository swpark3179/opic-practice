import React from 'react';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Sheet({ open, onClose, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="opic-sheet-backdrop" onClick={onClose}>
      <div className="opic-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="opic-mobile-only" style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
          <div style={{ width: '36px', height: '4px', background: 'var(--opic-border-strong)', borderRadius: '2px' }} />
        </div>
        {children}
      </div>
    </div>
  );
}
