import React, { useEffect } from 'react';
import { useECCStore } from '../state/useECCStore';
import { ECCControls } from '../components/controls/ECCControls';
import { SceneCanvas } from '../components/visualization/SceneCanvas';
import { AxesGrid } from '../components/visualization/AxesGrid';
import { ECCView } from '../components/visualization/ECCView';
import { wsClient } from '../lib/socket';
import { ECCResult } from '../types/ecc';

export const ECCPage: React.FC = () => {
  const { params, result, loading, error, setResult, setLoading } = useECCStore();

  useEffect(() => {
    const unsubscribe = wsClient.onMessage((data: any) => {
      if (data.valid !== undefined) {
        const eccResult = data as ECCResult;
        setResult(eccResult);
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
        <ECCControls />
        
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
            
            {result && !result.valid && result.error && (
              <div style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--error)',
                fontSize: '0.875rem',
              }}>
                {result.error}
              </div>
            )}
            
            {result && result.valid && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
                fontSize: '0.875rem',
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Base Point P:</span>{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    ({params.Px}, {params.Py})
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Scalar k:</span>{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {params.k}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Result Q = k×P:</span>{' '}
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {result.Q.infinity ? '(Point at Infinity)' : `(${result.Q.x}, ${result.Q.y})`}
                  </span>
                </div>
                {result.points && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Points on Curve:</span>{' '}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {result.points.length}
                    </span>
                  </div>
                )}
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
          {result && result.valid && result.points && (
            <ECCView
              points={result.points}
              basePoint={{ x: params.Px, y: params.Py }}
              resultPoint={result.Q}
              p={params.p}
            />
          )}
        </SceneCanvas>
      </div>
    </div>
  );
};
