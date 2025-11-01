import React, { useMemo } from 'react';
import { Point2D } from '../../types/conic';
import * as THREE from 'three';

interface ConicViewProps {
  points: Point2D[];
}

export const ConicView: React.FC<ConicViewProps> = ({ points }) => {
  const geometry = useMemo(() => {
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

  if (points.length === 0) {
    return null;
  }

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.15}
        color="#3b82f6"
        sizeAttenuation={true}
      />
    </points>
  );
};
