import React from 'react';

type ChipProps = {
  checked?: boolean;
  excluded?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

export function Chip({ checked, excluded, onClick, children }: ChipProps) {
  const cls = ['opic-chip'];
  if (checked) cls.push('checked');
  if (excluded) cls.push('excluded');
  
  return (
    <div className={cls.join(' ')} onClick={onClick}>
      {children}
    </div>
  );
}
