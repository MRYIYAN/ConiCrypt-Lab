import { useEffect, useRef } from 'react';
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
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>; // Añadido del canvasRef
  onResult: (result: HandTrackingResult) => void;
}

export function HandTracking({
  enable,
  videoRef,
  canvasRef, // Añadido a las props
  onResult,
}: HandTrackingProps) {


  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    // Si no esta activo, limpiamos
    if (!enable || !videoRef.current) {
      cameraRef.current?.stop();
      handsRef.current?.close();
      cameraRef.current = null;
      handsRef.current = null;
      return;
    }

    // Obtener el contexto del canvas y ajustar tamaño
    const video = videoRef.current;
    const canvas = canvasRef?.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    //  Evitar inicializar dos veces
    if (handsRef.current) return;

    //  Crear MediaPipe Hands
    const hands = new Hands({
      locateFile: (file: string) =>
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
        return;
      }

      // 1. limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const landmarks = results.multiHandLandmarks[0];

      // 2. dibujar puntos (landmarks)
      landmarks.forEach(lm => {
        const x = lm.x * canvas.width;
        const y = lm.y * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#8b5cf6'; // morado 
        ctx.fill();
      });

      const puntos = landmarks.map((lm: { x: number; y: number; z: number }) => [
        lm.x,
        lm.y,
        lm.z,
      ]);

      const wrist = puntos[0];
      const fingerIdx = [4, 8, 12, 16, 20];

      // dibujar vectores muñeca  dedos
      fingerIdx.forEach(idx => {
        const tip = landmarks[idx];

        ctx.beginPath();
        ctx.moveTo(wrist[0] * canvas.width, wrist[1] * canvas.height);
        ctx.lineTo(tip.x * canvas.width, tip.y * canvas.height);
        ctx.strokeStyle = '#6366f1'; // azul 
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // 4. calcular datos
      const vectors = fingerIdx.map(i => {
        const p = puntos[i];
        return [
          p[0] - wrist[0],
          p[1] - wrist[1],
          p[2] - wrist[2],
        ];
      });

      // 5. onResult(...)
      onResult({
        vectors,
        timeStamp: new Date().toISOString(),
        feature: 'Vectores mano',
        status: 'Conseguido',
      });
    });

    handsRef.current = hands;


    const camera = new Camera(video, {
      onFrame: async () => {
        if (!handsRef.current || !video) return;

        // Ajustar tamaño del canvas en cada frame 
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        await handsRef.current.send({ image: video });
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