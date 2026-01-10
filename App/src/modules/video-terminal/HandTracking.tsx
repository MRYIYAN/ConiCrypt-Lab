import { useEffect, useRef } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

// Definir IDs de los puntos clave de los dedos
const TIP_IDS = [4, 8, 12, 16, 20];
const PIP_IDS = [3, 6, 10, 14, 18];

export interface HandTrackingResult {
  vectors: number[][];
  timeStamp: string;
  feature: string;
  fingers: number;    
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

      const handedness = results.multiHandedness?.[0]?.label; // "Left" | "Right"
      const isRight = handedness === 'Right';

      // 1. limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const landmarks = results.multiHandLandmarks[0];

      // 2. dibujar puntos (landmarks)
      landmarks.forEach(lm => {
        const x = (1 - lm.x) * canvas.width; //  X invertida
        const y = lm.y * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#8b5cf6';
        ctx.fill();
      });

      // Corregir espejo TAMBIÉN en la lógica
      const puntos = landmarks.map((lm: { x: number; y: number; z: number }) => [
        1 - lm.x,  
        lm.y,
        lm.z,
      ]);

      const wrist = puntos[0];

      // dibujar vectores muñeca  dedos
      TIP_IDS.forEach(idx => {
        const tip = landmarks[idx];

        ctx.beginPath();
        ctx.moveTo(
          (1 - wrist[0]) * canvas.width, //  X invertida
          wrist[1] * canvas.height
        );
        ctx.lineTo(
          (1 - tip.x) * canvas.width,    //  X invertida
          tip.y * canvas.height
        );
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Calcular cuántos dedos están levantados
      let fingersUp = 0;
      // Pulgar
      if (isRight) {
        if (puntos[TIP_IDS[0]][0] > puntos[PIP_IDS[0]][0]) fingersUp++;
      } else {
        if (puntos[TIP_IDS[0]][0] < puntos[PIP_IDS[0]][0]) fingersUp++;
      }
      // Otros dedos con umbral para evitar jitter
      const THRESHOLD = 0.03;
      for (let i = 1; i < 5; i++) {
        if ((puntos[PIP_IDS[i]][1] - puntos[TIP_IDS[i]][1]) > THRESHOLD) {
          fingersUp++;
        }
      }

      //  DIBUJAR TEXTO DE CONTEO 
      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;

      // Posición: encima de la muñeca
      const textX = (1 - wrist[0]) * canvas.width + 10;
      const textY = wrist[1] * canvas.height - 20;

      ctx.strokeText(`DEDOS: ${fingersUp}`, textX, textY);
      ctx.fillText(`DEDOS: ${fingersUp}`, textX, textY);

      // 4. calcular datos normalizados por referencia ósea (índice)
      const scale = Math.hypot(
        puntos[8][0] - puntos[0][0],
        puntos[8][1] - puntos[0][1]
      );

      const vectors = TIP_IDS.map(i => {
        const p = puntos[i];
        return [
          (p[0] - wrist[0]) / scale,
          (p[1] - wrist[1]) / scale,
          (p[2] - wrist[2]) / scale,
        ];
      });


      onResult({
        vectors,
        fingers: fingersUp,
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
  }, [enable, videoRef,]); 

  return null;
}