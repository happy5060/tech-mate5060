import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  variant?: 'glass' | 'solid' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false,
  variant = 'glass',
}) => {
  const variantStyles = {
    glass: 'glass-card',
    solid: 'bg-white border border-slate-200 shadow-card',
    subtle: 'bg-slate-50/70 border border-slate-200/60 backdrop-blur-sm',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${variantStyles[variant]} ${
        hoverEffect ? 'glass-card-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
