import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'neutral' | 'outline' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  className = ''
}) => {
  const variantStyles = {
    brand: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/70 shadow-sm backdrop-blur-xs',
    success: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/70 shadow-sm backdrop-blur-xs',
    warning: 'bg-amber-50/80 text-amber-900 border-amber-200/70 shadow-sm backdrop-blur-xs',
    neutral: 'bg-slate-100/80 text-slate-700 border-slate-200/70 shadow-sm backdrop-blur-xs',
    outline: 'bg-white/40 text-slate-600 border-slate-200 backdrop-blur-xs',
    purple: 'bg-purple-50/80 text-purple-700 border-purple-200/70 shadow-sm backdrop-blur-xs',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 font-medium tracking-tight',
    md: 'text-xs sm:text-[13px] px-3 py-1 font-medium tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
