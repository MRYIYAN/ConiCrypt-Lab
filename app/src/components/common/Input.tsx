import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  style,
  ...props 
}) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--bg-tertiary)',
    border: `1px solid ${error ? 'var(--error)' : 'var(--border-color)'}`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && (
        <label style={{ 
          fontSize: '0.875rem', 
          fontWeight: 500, 
          color: 'var(--text-secondary)' 
        }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          ...inputStyle,
          ...style,
        }}
      />
      {error && (
        <span style={{ 
          fontSize: '0.75rem', 
          color: 'var(--error)' 
        }}>
          {error}
        </span>
      )}
    </div>
  );
};
