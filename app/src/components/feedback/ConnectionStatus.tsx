import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { wsClient } from '../../lib/socket';

export const ConnectionStatus: React.FC = () => {
  const { wsConnected, setWsConnected } = useAppStore();

  useEffect(() => {
    const unsubscribe = wsClient.onConnectionChange((connected) => {
      setWsConnected(connected);
    });

    wsClient.connect();

    return () => {
      unsubscribe();
    };
  }, [setWsConnected]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-sm)',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      backgroundColor: wsConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderRadius: 'var(--radius-md)',
      fontSize: '0.875rem',
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: wsConnected ? 'var(--success)' : 'var(--error)',
      }} />
      <span style={{ color: wsConnected ? 'var(--success)' : 'var(--error)' }}>
        {wsConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};
