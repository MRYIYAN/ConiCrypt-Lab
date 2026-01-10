import { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface HandTrackingResult {
  vectors: number[][];
  timeStamp: string;
  feature: string;
  status: 'Conseguido' | 'Procesando' | 'Error';
}

interface HandTrackingProps {
  enable: boolean;
  videoRef: React.RefObject<HTMLVideoElement> | null;
  onResult: (result: HandTrackingResult) => void;
}

export function HandTracking({
  enable,
  videoRef,
  onResult,
}: HandTrackingProps) {
  const [status, setStatus] =
    useState<'Conseguido' | 'Procesando' | 'Error'>('Procesando');

  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    // Si no estÃ¡ activo, limpiamos
    if (!enable || !videoRef.current) {
      cameraRef.current?.stop();
      handsRef.current?.close();
      cameraRef.current = null;
      handsRef.current = null;
      setStatus('Procesando');
      return;
    }

    //  Evitar inicializar dos veces
    if (handsRef.current) return;

    //  Crear MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

   
    hands.onResults((results: Results) => {
      if (!results.multiHandLandmarks?.length) {
        setStatus('Procesando');
        return;
      }

      const landmarks = results.multiHandLandmarks[0];
      const puntos = landmarks.map(lm => [lm.x, lm.y, lm.z]);

      const wrist = puntos[0];
      const fingerIdx = [4, 8, 12, 16, 20];

      const vectors = fingerIdx.map(i => {
        const p = puntos[i];
        return [
          p[0] - wrist[0],
          p[1] - wrist[1],
          p[2] - wrist[2],
        ];
      });

      onResult({
        vectors,
        timeStamp: new Date().toISOString(),
        feature: 'Vectores mano',
        status: status,
      });

      setStatus('Conseguido');
    });

    handsRef.current = hands;


    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (!handsRef.current || !videoRef.current) return;
        await handsRef.current.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
    cameraRef.current = camera;

   
    return () => {
      camera.stop();
      hands.close();
    };
  }, [enable, videoRef, onResult]);

  return null;
}