import React from 'react';

export function Card({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={`opic-card ${className}`} style={style}>
      {children}
    </div>
  );
}
