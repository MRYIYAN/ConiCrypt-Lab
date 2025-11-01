import React from 'react';
import { useECCStore } from '../../state/useECCStore';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { wsClient } from '../../lib/socket';
import { validateECCParams } from '../../lib/ecc';

export const ECCControls: React.FC = () => {
  const { params, setParams, setLoading, setError } = useECCStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateECCParams(params);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      wsClient.send({
        op: 'simulate_ecc',
        payload: params,
      });
    } catch (error) {
      setError(`Failed to send request: ${error}`);
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: 'var(--spacing-lg)',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
    }}>
      <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.125rem', fontWeight: 600 }}>
        Elliptic Curve: y² = x³ + ax + b (mod p)
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
          <Input
            label="p (prime modulus)"
            type="number"
            min="2"
            value={params.p}
            onChange={(e) => setParams({ p: parseInt(e.target.value) || 17 })}
          />
          <Input
            label="a (curve parameter)"
            type="number"
            value={params.a}
            onChange={(e) => setParams({ a: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="b (curve parameter)"
            type="number"
            value={params.b}
            onChange={(e) => setParams({ b: parseInt(e.target.value) || 0 })}
          />
        </div>
        
        <h4 style={{ fontSize: '1rem', fontWeight: 500, marginTop: 'var(--spacing-sm)' }}>
          Base Point P
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
          <Input
            label="Px"
            type="number"
            min="0"
            value={params.Px}
            onChange={(e) => setParams({ Px: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Py"
            type="number"
            min="0"
            value={params.Py}
            onChange={(e) => setParams({ Py: parseInt(e.target.value) || 0 })}
          />
        </div>
        
        <Input
          label="k (scalar multiplier)"
          type="number"
          value={params.k}
          onChange={(e) => setParams({ k: parseInt(e.target.value) || 1 })}
        />
        
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          fontSize: '0.875rem',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={params.listPoints}
            onChange={(e) => setParams({ listPoints: e.target.checked })}
          />
          List all points on curve
        </label>
        
        <Button type="submit" variant="primary">
          Simulate
        </Button>
      </form>
    </div>
  );
};
