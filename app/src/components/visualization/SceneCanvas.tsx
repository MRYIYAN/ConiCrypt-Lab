import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

interface SceneCanvasProps {
  children?: React.ReactNode;
}

export const SceneCanvas: React.FC<SceneCanvasProps> = ({ children }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 30]} />
        <OrbitControls enablePan enableZoom enableRotate />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        {children}
      </Canvas>
    </div>
  );
};
