import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Activity, X } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Header } from './../Header/Header';
import styles from './VideoTerminalPanel.module.css';
import { TypingText } from '../../components/ui/TypingText';
import{HandTracking, HandTrackingResult}from'../../modules/video-terminal/HandTracking';

interface BiometricResult {
  id: string;
  timestamp: string;
  feature: string;
  vectors: string;
  confidence: number;
  status: 'success' | 'processing' | 'error';
}

// Datos estáticos de ejemplo
const staticResults: BiometricResult[] = [
  {
    id: '1',
    timestamp: '14:23:15',
    feature: 'Contorno facial',
    vectors: '[0.8234, -0.4521, 0.6789, -0.2341, 0.9876, -0.1234]',
    confidence: 0.94,
    status: 'success'
  },
  {
    id: '2',
    timestamp: '14:23:17',
    feature: 'Distancia interpupilar',
    vectors: '[0.5621, 0.7834, -0.4567, 0.8912, -0.3245, 0.6723]',
    confidence: 0.89,
    status: 'success'
  },
  {
    id: '3',
    timestamp: '14:23:19',
    feature: 'Geometría nasal',
    vectors: '[-0.6734, 0.4521, 0.8234, -0.5678, 0.3421, -0.7654]',
    confidence: 0.92,
    status: 'success'
  },
  {
    id: '4',
    timestamp: '14:23:21',
    feature: 'Mandíbula',
    vectors: '[0.7821, -0.3456, 0.5234, 0.6789, -0.8912, 0.4356]',
    confidence: 0.87,
    status: 'success'
  },
  {
    id: '5',
    timestamp: '14:23:23',
    feature: 'Arco superciliar',
    vectors: '[-0.4523, 0.8765, -0.6234, 0.3421, 0.7834, -0.5612]',
    confidence: 0.91,
    status: 'success'
  },
  {
    id: '6',
    timestamp: '14:23:25',
    feature: 'Contorno facial',
    vectors: '[0.6234, -0.5789, 0.4321, -0.7654, 0.8123, -0.3456]',
    confidence: 0.88,
    status: 'processing'
  }
];

export function VideoTerminalPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // 1️⃣ Añadido ref del canvas
  const containerRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [parallaxReady, setParallaxReady] = useState(false);

  // Marcos (poco movimiento)
  const panelX = useTransform(mouseX, [-300, 300], [-1.2, 1.2]);
  const panelY = useTransform(mouseY, [-300, 300], [-0.8, 0.8]);

  // Contenido interno (más vivo)
  const innerX = useTransform(mouseX, [-300, 300], [-4, 4]);
  const innerY = useTransform(mouseY, [-300, 300], [-2.5, 2.5]);

  // Bordes: movimiento ultra sutil (menos que el panel)
  const borderX = useTransform(mouseX, [-300, 300], [-0.6, 0.6]);
  const borderY = useTransform(mouseY, [-300, 300], [-0.4, 0.4]);

  // Curvatura global tipo casco (LA CLAVE)
  const helmetRotateX = useTransform(
    [mouseX, mouseY],
    (values: number[]) => {
      const x = values[0] ?? 0;
      const y = values[1] ?? 0;

      const baseTilt = 1.2;
      const verticalInfluence = -y * 0.002;
      const lateralInfluence = Math.abs(x) * 0.001;

      return baseTilt + verticalInfluence + lateralInfluence;
    }
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);

      if (!parallaxReady) setParallaxReady(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, parallaxReady]);

  const startCamera = async () => {
    try {
      setStreamError(null);
      
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStreamError('Tu navegador no soporta acceso a la cámara.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error: any) {
      let errorMessage = 'No se pudo acceder a la cámara.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Permiso denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No se encontró ninguna cámara conectada al dispositivo.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'La cámara está siendo utilizada por otra aplicación.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'No se pudo iniciar la cámara con la configuración solicitada.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Acceso bloqueado por seguridad. Asegúrate de usar HTTPS.';
      }
      
      setStreamError(errorMessage);
      setIsStreaming(true); // Mostrar panel con mensaje de error
      console.error('Error al acceder a la cámara:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setStreamError(null);
  };
  
  // Eliminado handResult, no se usa
  const [results, setResults] = useState<BiometricResult[]>(staticResults);



  return (
    <>
      {/* Header fuera del contenedor parallax */}
      <Header moduleName="biometric-analysis" />

      <motion.div
        ref={containerRef}
        className="w-full h-full overflow-hidden flex flex-col"
        style={{
          rotateX: parallaxReady ? helmetRotateX : 0,
          transformStyle: 'preserve-3d',
          transformPerspective: 1000,
          willChange: 'transform',
        }}
        transition={{ type: 'spring', stiffness: 18, damping: 40 }}
      >
        {/* Video Section */}
        <div className="min-h-[50vh] max-h-[60vh] p-6 flex items-center justify-center bg-black/20">
          <AnimatePresence mode="wait">
            {!isStreaming ? (
              <motion.button
                key="start-button"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                onClick={startCamera}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="
                  relative z-30
                  flex flex-col items-center justify-center
                  px-20 py-16
                  min-w-90 min-h-65
                  rounded-3xl
                  bg-linear-to-br from-[#6366f1] to-[#8b5cf6]
                  shadow-[0_20px_60px_rgba(123,92,246,0.45)]
                  transition-all
                "
              >
                {/* Icono en círculo */}
                <div className="mb-7 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-white" />
                  </div>
                </div>

                <h2 className="text-white text-3xl font-semibold tracking-tight mb-3">
                  Iniciar Captura
                </h2>
                <p className="text-white/70 text-sm">
                  Click para activar la cámara
                </p>
              </motion.button>
            ) : (
              <motion.div
                key="video-panel"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  x: parallaxReady ? panelX : 0,
                  y: parallaxReady ? panelY : 0,
                }}
                className="w-full h-full rounded-xl 
                           border border-[#3B4BFF]/20
                           bg-[#0b0b14]/70
                           shadow-[0_0_40px_rgba(59,75,255,0.12)]
                           overflow-hidden flex flex-col"
              >
                {/* Video Header as REAL PANEL */}
                <motion.div
                  className="relative rounded-xl p-0.5"
                  style={{
                    x: parallaxReady ? panelX : 0,
                    y: parallaxReady ? panelY : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 18, damping: 40 }}
                >
                  {/* Glow around header */}
                  <motion.div
                    className={styles.glowBorder}
                    style={{
                      x: parallaxReady ? borderX : 0,
                      y: parallaxReady ? borderY : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 16, damping: 45 }}
                  />
                  {/* Real header panel */}
                  <motion.div className={`${styles.panel} ${styles.curvedPanel} rounded-xl overflow-hidden`}>
                    {/* Header bar with inner micro-parallax */}
                    <motion.div
                      className="flex items-center justify-between px-6 py-4 
                                 bg-black/40 backdrop-blur-[2px]
                                 border-b border-[#3B4BFF]/10"
                      style={{
                        x: parallaxReady ? innerX : 0,
                        y: parallaxReady ? innerY : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 30, damping: 40 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-linear-to-br from-[#6366f1] to-[#8b5cf6]">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <motion.h2
                            style={{
                              x: parallaxReady ? innerX : 0,
                              y: parallaxReady ? innerY : 0,
                            }}
                            transition={{ type: 'spring', stiffness: 30, damping: 40 }}
                            className="text-white"
                          >
                            <TypingText text="Captura de Video" speed={60} cursorDelay={2000} />
                          </motion.h2>
                          <p className="text-sm text-gray-400">Señal de cámara en tiempo real</p>
                        </div>
                      </div>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Detener
                      </button>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Video Display (inner parallax) */}
                <motion.div
                  className="flex-1 flex items-center justify-center p-6"
                  style={{
                    x: parallaxReady ? innerX : 0,
                    y: parallaxReady ? innerY : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 30, damping: 40 }}
                >
                  {streamError ? (
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                      <div className="p-6 rounded-full bg-[#1a1a2f] border border-[#2a2a3f]">
                        <CameraOff className="w-12 h-12" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-red-400">{streamError}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                    {/* Envolver video y añadir canvas */}
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />
                    </div>
                    <HandTracking
                      enable={isStreaming && !streamError}
                      videoRef={videoRef}
                      canvasRef={canvasRef}
                      onResult={(result: HandTrackingResult)=>{
                        const biometric: BiometricResult = {
                          id: crypto.randomUUID(),
                          timestamp: new Date(result.timeStamp).toLocaleTimeString(),
                          feature: result.feature,
                          vectors: JSON.stringify(result.vectors),
                          confidence: 0.9, 
                          status: result.status === 'Conseguido' ? 'success' : 'processing',
                        };
                        setResults(prev => [biometric, ...prev]); 
                        
                      }}
                    />
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spacer between video and results */}
        <div className="h-6 md:h-8 shrink-0" />

        {/* Results Section Wrapper */}
        <div className="w-full flex justify-center pb-20">
          <div className="w-full max-w-450 px-4 md:px-6">
            <motion.div
              className="relative rounded-2xl p-0.5"
              style={{
                x: parallaxReady ? panelX : 0,
                y: parallaxReady ? panelY : 0,
              }}
              transition={{ type: 'spring', stiffness: 18, damping: 42 }}
            >
              {/* Border Glow as sibling */}
              <motion.div
                className={styles.glowBorder}
                style={{
                  x: parallaxReady ? borderX : 0,
                  y: parallaxReady ? borderY : 0,
                }}
                transition={{ type: 'spring', stiffness: 16, damping: 45 }}
              />

              {/* Real Panel */}
              <motion.div
                className="
                  relative z-10 rounded-2xl bg-black/30
                  border border-[#3B4BFF]/20
                  py-2
                  flex flex-col
                  min-h-[26vh]
                  max-h-[40vh]
                  sm:max-h-[42vh]
                  md:max-h-[46vh]
                  lg:max_h-[52vh]
                  xl:max-h-[58vh]
                "
                style={{
                  x: parallaxReady ? panelX : 0,
                  y: parallaxReady ? panelY : 0,
                }}
                transition={{ type: 'spring', stiffness: 18, damping: 42 }}
              >
                <div className="pb-2">
                  {/* Table Header */}
                  <div
                    className="
                      flex items-center gap-3
                      px-6 py-4
                      bg-black/40
                      border-b border-[#3B4BFF]/15
                      backdrop-blur-[1px]
                    "
                  >
                    <div className="p-2 rounded-lg bg-[#6366f1]/20">
                      <Activity className="w-5 h-5 text-[#6366f1]" />
                    </div>
                    <h3 className="text-white font-medium tracking-wide">
                      <TypingText text="Resultados Vectoriales" cursorDelay={2000} />
                    </h3>
                  </div>
                </div>

                {/* Table Content (inner parallax) */}
                <motion.div
                  className="px-1"
                  style={{
                    x: parallaxReady ? innerX : 0,
                    y: parallaxReady ? innerY : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 30, damping: 40 }}
                >
                  <div className="flex-1 overflow-y-auto bg-transparent scrollbar-thin scrollbar-thumb-[#6366f1]/40 scrollbar-track-transparent">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-black/50 backdrop-blur-[1px]">
                        <tr>
                          {['Timestamp', 'Característica', 'Vectores', 'Confianza', 'Estado'].map((h) => (
                            <th
                              key={h}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-[#3B4BFF]/10 last:border-r-0"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result) => (
                          <tr
                            key={result.id}
                            className="
                              border-b border-[#3B4BFF]/5
                              hover:bg-white/5
                              transition-colors
                            "
                          >
                            <td className="px-6 py-3 text-gray-300 font-mono text-xs border-r border-[#3B4BFF]/5 last:border-r-0">{result.timestamp}</td>
                            <td className="px-6 py-3 text-gray-200 border-r border-[#3B4BFF]/5 last:border-r-0">{result.feature}</td>
                            <td className="px-6 py-3 text-[#6366f1] font-mono text-xs border-r border-[#3B4BFF]/5 last:border-r-0">{result.vectors}</td>
                            <td className="px-6 py-3 border-r border-[#3B4BFF]/5 last:border-r-0">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-[#1a1a2f] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-linear-to-r from-[#6366f1] to-[#8b5cf6]"
                                    style={{ width: `${result.confidence * 100}%` }}
                                  />
                                </div>
                                <span className="text-gray-300 text-xs">
                                  {(result.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3 border-r border-[#3B4BFF]/5 last:border-r-0">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  result.status === 'success'
                                    ? 'bg-green-500/20 text-green-400'
                                    : result.status === 'processing'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {result.status === 'success' ? 'Completo' : 'Procesando'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="pb-24" />
      </motion.div>
    </>
  );
}