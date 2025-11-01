import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      height: '40px',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      color: 'var(--text-muted)',
    }}>
      <span>ConiCrypt Lab v0.1.0 - Built with Tauri, React, and Three.js</span>
    </footer>
  );
};
