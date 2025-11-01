import React, { useEffect } from 'react';
import { useConicStore } from '../state/useConicStore';
import { ConicControls } from '../components/controls/ConicControls';
import { SceneCanvas } from '../components/visualization/SceneCanvas';
import { AxesGrid } from '../components/visualization/AxesGrid';
import { ConicView } from '../components/visualization/ConicView';
import { wsClient } from '../lib/socket';
import { ConicResult } from '../types/conic';

export const ConicsPage: React.FC = () => {
  const { result, loading, error, setResult, setLoading } = useConicStore();

  useEffect(() => {
    const unsubscribe = wsClient.onMessage((data: any) => {
      if (data.delta !== undefined && data.type && data.points) {
        const conicResult = data as ConicResult;
        setResult(conicResult);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [setResult, setLoading]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '400px 1fr',
      gap: 'var(--spacing-lg)',
      height: '100%',
      padding: 'var(--spacing-lg)',
    }}>
      {/* Left Panel - Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
        overflowY: 'auto',
      }}>
        <ConicControls />
        
        {/* Results Panel */}
        {(result || loading || error) && (
          <div style={{
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
          }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.125rem', fontWeight: 600 }}>
              Results
            </h3>
            
            {loading && (
              <div style={{ color: 'var(--text-secondary)' }}>
                Computing...
              </div>
            )}
            
            {error && (
              <div style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--error)',
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}
            
            {result && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
                fontSize: '0.875rem',
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Discriminant (Δ):</span>{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {result.delta.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Type:</span>{' '}
                  <span style={{ 
                    color: 'var(--accent-primary)', 
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>
                    {result.type}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Points Generated:</span>{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {result.points.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Panel - Visualization */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        <SceneCanvas>
          <AxesGrid />
          {result && result.points.length > 0 && (
            <ConicView points={result.points} />
          )}
        </SceneCanvas>
      </div>
    </div>
  );
};
