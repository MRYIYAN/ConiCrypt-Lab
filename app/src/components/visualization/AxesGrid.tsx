import React from 'react';
import { Line } from '@react-three/drei';

export const AxesGrid: React.FC = () => {
  const gridSize = 20;
  const gridDivisions = 20;
  const step = gridSize / gridDivisions;

  const gridLines: [number, number, number][][] = [];

  // Grid lines parallel to X-axis
  for (let i = -gridDivisions; i <= gridDivisions; i++) {
    gridLines.push([
      [-gridSize, i * step, 0],
      [gridSize, i * step, 0],
    ]);
  }

  // Grid lines parallel to Y-axis
  for (let i = -gridDivisions; i <= gridDivisions; i++) {
    gridLines.push([
      [i * step, -gridSize, 0],
      [i * step, gridSize, 0],
    ]);
  }

  return (
    <>
      {/* Grid */}
      {gridLines.map((points, idx) => (
        <Line
          key={idx}
          points={points}
          color="#334155"
          lineWidth={0.5}
        />
      ))}
      
      {/* X-axis */}
      <Line
        points={[
          [-gridSize, 0, 0],
          [gridSize, 0, 0],
        ]}
        color="#ef4444"
        lineWidth={2}
      />
      
      {/* Y-axis */}
      <Line
        points={[
          [0, -gridSize, 0],
          [0, gridSize, 0],
        ]}
        color="#22c55e"
        lineWidth={2}
      />
    </>
  );
};
