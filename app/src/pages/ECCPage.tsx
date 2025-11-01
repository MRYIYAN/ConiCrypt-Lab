import { useState } from 'react';
import { socketClient } from '../lib/socket';
import { SceneCanvas } from '../components/visualization/SceneCanvas';
import { ECCView } from '../components/visualization/ECCView';

export function ECCPage() {
  const [curve, setCurve] = useState({ a: -1, b: 1 });
  const [p1, setP1] = useState({ x: 0, y: 1 });
  const [p2, setP2] = useState({ x: 1, y: 0 });
  const [scalar, setScalar] = useState(5);
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await socketClient.send({
        mode: 'ecc',
        operation,
        curve,
        p1,
        p2,
        scalar,
      });

      if (response.status === 'success') {
        setResult(response.data);
      } else {
        setError(response.message || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Elliptic Curve Cryptography</h1>
      <p>Curve: y² = x³ + ax + b</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <h3>Curve Parameters</h3>
          <label>
            a:
            <input
              type="number"
              step="0.1"
              value={curve.a}
              onChange={(e) => setCurve({ ...curve, a: parseFloat(e.target.value) || 0 })}
              style={{ marginLeft: '5px', marginRight: '15px' }}
            />
          </label>
          <label>
            b:
            <input
              type="number"
              step="0.1"
              value={curve.b}
              onChange={(e) => setCurve({ ...curve, b: parseFloat(e.target.value) || 0 })}
              style={{ marginLeft: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h3>Operation</h3>
          <select value={operation} onChange={(e) => setOperation(e.target.value)}>
            <option value="add">Point Addition</option>
            <option value="double">Point Doubling</option>
            <option value="multiply">Scalar Multiplication</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h3>Point P1</h3>
          <label>
            x:
            <input
              type="number"
              step="0.1"
              value={p1.x}
              onChange={(e) => setP1({ ...p1, x: parseFloat(e.target.value) || 0 })}
              style={{ marginLeft: '5px', marginRight: '15px' }}
            />
          </label>
          <label>
            y:
            <input
              type="number"
              step="0.1"
              value={p1.y}
              onChange={(e) => setP1({ ...p1, y: parseFloat(e.target.value) || 0 })}
              style={{ marginLeft: '5px' }}
            />
          </label>
        </div>

        {operation === 'add' && (
          <div style={{ marginBottom: '15px' }}>
            <h3>Point P2</h3>
            <label>
              x:
              <input
                type="number"
                step="0.1"
                value={p2.x}
                onChange={(e) => setP2({ ...p2, x: parseFloat(e.target.value) || 0 })}
                style={{ marginLeft: '5px', marginRight: '15px' }}
              />
            </label>
            <label>
              y:
              <input
                type="number"
                step="0.1"
                value={p2.y}
                onChange={(e) => setP2({ ...p2, y: parseFloat(e.target.value) || 0 })}
                style={{ marginLeft: '5px' }}
              />
            </label>
          </div>
        )}

        {operation === 'multiply' && (
          <div style={{ marginBottom: '15px' }}>
            <h3>Scalar</h3>
            <input
              type="number"
              value={scalar}
              onChange={(e) => setScalar(parseInt(e.target.value) || 0)}
            />
          </div>
        )}

        <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'Processing...' : 'Execute Operation'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>}

      {result && (
        <div>
          <h2>Results</h2>
          <p><strong>Operation:</strong> {result.operation}</p>
          {result.result === 'infinity' ? (
            <p><strong>Result:</strong> Point at infinity</p>
          ) : (
            <p>
              <strong>Result:</strong> ({result.result.x.toFixed(6)}, {result.result.y.toFixed(6)})
            </p>
          )}
          
          <h3>Visualization</h3>
          <SceneCanvas>
            <ECCView
              curve={curve}
              points={[p1, p2]}
              result={result.result !== 'infinity' ? result.result : undefined}
            />
          </SceneCanvas>
        </div>
      )}
    </div>
  );
}
