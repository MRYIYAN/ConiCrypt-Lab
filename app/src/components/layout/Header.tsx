import React from 'react';

export const Header: React.FC = () => {
  return (
    <header style={{
      height: '60px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--spacing-lg)',
    }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
      }}>
        ConiCrypt Lab
      </h1>
      <div style={{
        marginLeft: 'auto',
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
      }}>
        Conic Sections & Elliptic Curve Cryptography
      </div>
    </header>
  );
};
