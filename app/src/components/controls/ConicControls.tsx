import React from 'react';
import { useConicStore } from '../../state/useConicStore';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { wsClient } from '../../lib/socket';
import { validateConicParams } from '../../lib/conics';

export const ConicControls: React.FC = () => {
  const { params, setParams, setLoading, setError } = useConicStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateConicParams(params);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      wsClient.send({
        op: 'analyze_conic',
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
        Conic Equation: Ax² + Bxy + Cy² + Dx + Ey + F = 0
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
          <Input
            label="A"
            type="number"
            step="any"
            value={params.A}
            onChange={(e) => setParams({ A: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="B"
            type="number"
            step="any"
            value={params.B}
            onChange={(e) => setParams({ B: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="C"
            type="number"
            step="any"
            value={params.C}
            onChange={(e) => setParams({ C: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="D"
            type="number"
            step="any"
            value={params.D}
            onChange={(e) => setParams({ D: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="E"
            type="number"
            step="any"
            value={params.E}
            onChange={(e) => setParams({ E: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="F"
            type="number"
            step="any"
            value={params.F}
            onChange={(e) => setParams({ F: parseFloat(e.target.value) || 0 })}
          />
        </div>
        
        <Input
          label="Samples"
          type="number"
          min="10"
          max="10000"
          value={params.samples}
          onChange={(e) => setParams({ samples: parseInt(e.target.value) || 600 })}
        />
        
        <Button type="submit" variant="primary">
          Graficar
        </Button>
      </form>
    </div>
  );
};
