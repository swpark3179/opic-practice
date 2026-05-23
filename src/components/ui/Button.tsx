import React from 'react';

type BtnProps = {
  kind?: 'primary' | 'secondary' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({ kind = 'primary', size = 'md', disabled, className = '', style, children, onClick }: BtnProps) {
  const classes = ['opic-btn', `opic-btn-${kind}`];
  if (size !== 'md') classes.push(`opic-btn-${size}`);
  if (className) classes.push(className);
  
  return (
    <button 
      className={classes.join(' ')} 
      style={style} 
      disabled={disabled} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}
