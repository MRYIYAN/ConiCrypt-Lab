import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  style,
  ...props 
}) => {
  const baseStyle: React.CSSProperties = {
    padding: size === 'sm' ? '0.5rem 1rem' : size === 'lg' ? '0.75rem 1.5rem' : '0.625rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    fontWeight: 500,
    transition: 'all 0.2s',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.5 : 1,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--accent-primary)',
      color: 'white',
    },
    secondary: {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
    },
    danger: {
      backgroundColor: 'var(--error)',
      color: 'white',
    },
  };

  return (
    <button
      {...props}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};
