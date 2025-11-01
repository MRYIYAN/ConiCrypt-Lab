import React, { useEffect, useState } from 'react';
import { logger } from '../../lib/logger';

export const LogConsole: React.FC = () => {
  const [logs, setLogs] = useState<Array<{ level: string; message: string; timestamp: Date }>>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(logger.getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        style={{
          position: 'fixed',
          bottom: 'var(--spacing-md)',
          right: 'var(--spacing-md)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        📝 Show Logs ({logs.length})
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--spacing-md)',
      right: 'var(--spacing-md)',
      width: '400px',
      maxHeight: '300px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Console Logs</span>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            onClick={() => logger.clear()}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--spacing-sm)',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
      }}>
        {logs.slice().reverse().map((log, idx) => (
          <div
            key={idx}
            style={{
              padding: 'var(--spacing-xs)',
              marginBottom: 'var(--spacing-xs)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              color: log.level === 'error' ? 'var(--error)' : 
                     log.level === 'warn' ? 'var(--warning)' : 
                     'var(--text-secondary)',
            }}
          >
            <span style={{ opacity: 0.7 }}>
              [{log.timestamp.toLocaleTimeString()}]
            </span>{' '}
            <span style={{ fontWeight: 500 }}>
              [{log.level.toUpperCase()}]
            </span>{' '}
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};
