import { useState } from 'react';
import { socketClient } from '../lib/socket';
import { SceneCanvas } from '../components/visualization/SceneCanvas';
import { ConicView } from '../components/visualization/ConicView';

export function ConicsPage() {
  const [coefficients, setCoefficients] = useState({
    A: 1,
    B: 0,
    C: 1,
    D: 0,
    E: 0,
    F: -1,
  });
  const [result, setResult] = useState<{
    type: string;
    discriminant: number;
    coefficients: typeof coefficients;
    points: Array<{ x: number; y: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await socketClient.send({
        mode: 'conic',
        ...coefficients,
      });

      if (response.status === 'success' && response.data) {
        setResult(response.data as {
          type: string;
          discriminant: number;
          coefficients: typeof coefficients;
          points: Array<{ x: number; y: number }>;
        });
      } else {
        setError((response.message as string) || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCoefficients(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Conic Sections</h1>
      <p>Equation: Ax² + Bxy + Cy² + Dx + Ey + F = 0</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '600px' }}>
          {Object.entries(coefficients).map(([key, value]) => (
            <div key={key}>
              <label>
                {key}:
                <input
                  type="number"
                  step="0.1"
                  value={value}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  style={{ width: '100%', marginLeft: '5px' }}
                />
              </label>
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '10px 20px' }}>
          {loading ? 'Processing...' : 'Classify Conic'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>}

      {result && (
        <div>
          <h2>Results</h2>
          <p><strong>Type:</strong> {result.type}</p>
          <p><strong>Discriminant (Δ):</strong> {result.discriminant.toFixed(6)}</p>
          
          <h3>Visualization</h3>
          <SceneCanvas>
            <ConicView
              type={result.type}
              coefficients={result.coefficients}
              points={result.points}
            />
          </SceneCanvas>
        </div>
      )}
    </div>
  );
}
