import React from 'react';

type TagProps = {
  tone?: 'neutral' | 'primary' | 'sage' | 'rec' | 'amber' | 'ink';
  className?: string;
  children: React.ReactNode;
};

export function Tag({ tone = 'neutral', className = '', children }: TagProps) {
  return (
    <div className={`opic-tag opic-tag-${tone} ${className}`}>
      {children}
    </div>
  );
}
