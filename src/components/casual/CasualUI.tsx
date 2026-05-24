import React, { ReactNode } from 'react';

/* OPIC Casual — shared building blocks (mobile-first).
   기존 v2 컴포넌트와 토큰을 그대로 쓰면서 시각 언어만 다시 짠다.
   - per-screen top header (뒤로가기 + step pill + 우측 슬롯)
   - pill 버튼, bottom CTA 컨테이너, bottom sheet */

export const CIcons = {
  back: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  arrow: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
  check: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  mic: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
      <path d="M12 19v3" />
    </svg>
  ),
  stop: (s = 30) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
    </svg>
  ),
  play: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 3v10l9-5z" />
    </svg>
  ),
  speaker: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      <path d="M19 5a10 10 0 0 1 0 14M15.5 8.5a5 5 0 0 1 0 7" />
    </svg>
  ),
  close: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  spark: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
    </svg>
  ),
  list: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="4" cy="18" r="1.5" />
    </svg>
  ),
  book: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
};

type TopProps = {
  step?: number;
  total?: number;
  onBack?: (() => void) | null;
  rightSlot?: ReactNode;
};
export function CasualTop({ step, total, onBack, rightSlot }: TopProps) {
  return (
    <div className="casual-top">
      <button className="casual-top-back" onClick={onBack || undefined} disabled={!onBack}>
        {CIcons.back()}
      </button>
      {step != null && total != null ? (
        <div className="casual-step-pill">
          <span className="casual-step-dot" />
          <span>{step} / {total}</span>
        </div>
      ) : <div />}
      <div style={{ minWidth: 38, display: 'flex', justifyContent: 'flex-end' }}>
        {rightSlot}
      </div>
    </div>
  );
}

export function CasualProgress({ value }: { value: number }) {
  return (
    <div className="casual-progress">
      <div className="casual-progress-fill" style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
    </div>
  );
}

export function CasualBottom({ children, split = false }: { children: ReactNode; split?: boolean }) {
  return <div className={`casual-bottom${split ? ' casual-bottom-split' : ''}`}>{children}</div>;
}

type BtnProps = {
  kind?: 'primary' | 'soft' | 'ghost';
  size?: 'md' | 'sm';
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
};
export function CasualButton({ kind = 'primary', size = 'md', onClick, disabled, children, style }: BtnProps) {
  return (
    <button
      className={`casual-btn casual-btn-${kind} casual-btn-${size}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};
export function CasualSheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null;
  return (
    <div className="casual-sheet-backdrop" onClick={onClose}>
      <div className="casual-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="casual-sheet-handle" />
        {title && (
          <div className="casual-sheet-head">
            <div className="casual-sheet-title">{title}</div>
            <button className="casual-sheet-close" onClick={onClose}>{CIcons.close(15)}</button>
          </div>
        )}
        <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

export function SmallLink({ icon, onClick, children }: { icon?: ReactNode; onClick?: () => void; children: ReactNode }) {
  return (
    <button className="casual-small-link" onClick={onClick}>
      {icon}{children}
    </button>
  );
}
export function SmallDot() { return <span className="casual-small-dot" />; }
