import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import type { ReactNode } from 'react';

interface SceneCanvasProps {
  children: ReactNode;
}

export function SceneCanvas({ children }: SceneCanvasProps) {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <Grid args={[20, 20]} />
        {children}
      </Canvas>
    </div>
  );
}
