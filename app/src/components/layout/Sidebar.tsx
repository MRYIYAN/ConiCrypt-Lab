import React from 'react';
import { useAppStore } from '../../state/useAppStore';

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage } = useAppStore();

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'conics', label: 'Conic Sections', icon: '📊' },
    { id: 'ecc', label: 'ECC Simulation', icon: '🔐' },
  ] as const;

  return (
    <aside style={{
      width: '220px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: 'var(--spacing-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-sm)',
    }}>
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentPage(item.id)}
          style={{
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: currentPage === item.id ? 'var(--accent-primary)' : 'transparent',
            color: currentPage === item.id ? 'white' : 'var(--text-secondary)',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            if (currentPage !== item.id) {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== item.id) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </aside>
  );
};
