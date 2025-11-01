import { Line } from '@react-three/drei';
import { useMemo } from 'react';

interface ECCViewProps {
  curve: {
    a: number;
    b: number;
  };
  points?: Array<{ x: number; y: number; is_infinity?: boolean }>;
  result?: { x: number; y: number } | string;
}

export function ECCView({ curve, points, result }: ECCViewProps) {
  const curvePoints = useMemo(() => {
    // Generate points for elliptic curve: y^2 = x^3 + ax + b
    const pts: [number, number, number][] = [];
    const step = 0.1;
    
    for (let x = -3; x <= 3; x += step) {
      const y2 = x * x * x + curve.a * x + curve.b;
      if (y2 >= 0) {
        const y = Math.sqrt(y2);
        pts.push([x, y, 0]);
      }
    }
    
    // Add negative y values
    const negativePts: [number, number, number][] = [];
    for (let x = 3; x >= -3; x -= step) {
      const y2 = x * x * x + curve.a * x + curve.b;
      if (y2 >= 0) {
        const y = -Math.sqrt(y2);
        negativePts.push([x, y, 0]);
      }
    }
    
    return [...pts, ...negativePts];
  }, [curve]);

  return (
    <group>
      <Line
        points={curvePoints}
        color="green"
        lineWidth={2}
      />
      {points && points.map((point, index) => (
        !point.is_infinity && (
          <mesh key={index} position={[point.x, point.y, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="orange" />
          </mesh>
        )
      ))}
      {result && typeof result !== 'string' && (
        <mesh position={[result.x, result.y, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </group>
  );
}
