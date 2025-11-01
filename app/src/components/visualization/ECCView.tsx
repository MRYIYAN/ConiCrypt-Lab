import React, { useMemo } from 'react';
import { ECPoint } from '../../types/ecc';
import * as THREE from 'three';

interface ECCViewProps {
  points: ECPoint[];
  basePoint?: ECPoint;
  resultPoint?: ECPoint;
  p: number;
}

export const ECCView: React.FC<ECCViewProps> = ({ points, basePoint, resultPoint, p }) => {
  const allPointsGeometry = useMemo(() => {
    const positions = new Float32Array(points.length * 3);
    
    points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = 0;
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    return geom;
  }, [points]);

  const scale = Math.max(1, 20 / p);

  return (
    <>
      {/* All points on curve */}
      {points.length > 0 && (
        <points geometry={allPointsGeometry}>
          <pointsMaterial
            size={0.3 * scale}
            color="#64748b"
            sizeAttenuation={true}
          />
        </points>
      )}
      
      {/* Base point P */}
      {basePoint && !basePoint.infinity && (
        <mesh position={[basePoint.x, basePoint.y, 0]}>
          <sphereGeometry args={[0.4 * scale, 16, 16]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      )}
      
      {/* Result point Q = k*P */}
      {resultPoint && !resultPoint.infinity && (
        <mesh position={[resultPoint.x, resultPoint.y, 0]}>
          <sphereGeometry args={[0.4 * scale, 16, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      )}
    </>
  );
};
