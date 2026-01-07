import { ENV } from '../../env';
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Activity, RefreshCw, ZoomIn, ZoomOut, Maximize2, Sparkles, Trash2, Copy } from 'lucide-react';
import styles from './ConicAnalysis.module.css';
import { TypingText } from '../../components/ui/TypingText';
import { Canvas } from '@react-three/fiber';
import { Line, OrthographicCamera } from '@react-three/drei';
import { Header } from '../Header/Header';
import { MetaCard } from '../../components/ui/MetaCard';
import { InterpretationGrid } from '../../components/ui/InterpretationGrid';

function generateEquation(coeffs: {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}) {
  const { A, B, C, D, E, F } = coeffs;
  const terms: string[] = [];
  if (A !== 0) terms.push(`${A}x²`);
  if (B !== 0) terms.push(`${B}xy`);
  if (C !== 0) terms.push(`${C}y²`);
  if (D !== 0) terms.push(`${D}x`);
  if (E !== 0) terms.push(`${E}y`);
  if (F !== 0) terms.push(`${F}`);
  return terms.length ? `${terms.join(" + ")} = 0` : "0 = 0";
}

interface ConicCoefficients {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
}

type ConicResult = {
  ok: boolean;
  type: string;
  delta: number;
  center?: { exists: boolean; x: number; y: number };
  rotation?: { has_rotation: boolean; theta: number };
  canonical?: { exists: boolean; a: number; b: number };
  points: { x: number; y: number }[];
};

export function ConicAnalysis() {
  const containerRef = useRef<HTMLDivElement>(null);
  // motion values SOLO para el root motion.div
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const tilt = useMotionValue(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [parallaxReady, setParallaxReady] = useState(false);

  // Velocity gate refs
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(performance.now());
  // Suavizado (low-pass)
  const smoothPos = useRef({ x: 0, y: 0 });


  const containerRect = useRef<DOMRect | null>(null);

  // Internal content micro-movement: ±4px / ±2.5px
  const innerX = useTransform(mouseX, [-300, 300], [-4, 4]);
  const innerY = useTransform(mouseY, [-300, 300], [-2.5, 2.5]);

  // External frame micro-movement: ±1.2px / ±0.8px
  const panelX = useTransform(mouseX, [-300, 300], [-1.2, 1.2]);
  const panelY = useTransform(mouseY, [-300, 300], [-0.8, 0.8]);

  // Curvatura global tipo casco: calcula rotateX directamente desde mouseX/mouseY



  // Inicializa el mouse SOLO cuando hay movimiento real y el layout está listo
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRect.current;
      if (!rect) return;

      const now = performance.now();
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dt = now - lastTime.current;

      lastPos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = now;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const targetX = e.clientX - centerX;
      const targetY = e.clientY - centerY;

      const speed = Math.sqrt(dx * dx + dy * dy) / Math.max(dt, 1);
      const smoothing = speed > 1.2 ? 0.045 : 0.1;

      smoothPos.current.x += (targetX - smoothPos.current.x) * smoothing;
      smoothPos.current.y += (targetY - smoothPos.current.y) * smoothing;

      // motion values SOLO aquí
      px.set(smoothPos.current.x);
      py.set(smoothPos.current.y);
      tilt.set(1.2 - smoothPos.current.y * 0.002 + Math.abs(smoothPos.current.x) * 0.001);

      if (!parallaxReady) setParallaxReady(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [parallaxReady]);

  // 🧩 CAMBIO 2 — Nuevo useEffect (solo layout)
  useEffect(() => {
    if (!containerRef.current) return;

    const updateRect = () => {
      containerRect.current = containerRef.current!.getBoundingClientRect();
    };

    updateRect();

    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(containerRef.current);

    window.addEventListener('scroll', updateRect, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateRect);
    };
  }, []);

  const [coefficients, setCoefficients] = useState<ConicCoefficients>({
    A: '4',
    B: '0',
    C: '-3',
    D: '2',
    E: '-5',
    F: '1'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConicResult | null>(null);

  const handleInputChange = (field: keyof ConicCoefficients, value: string) => {
    setCoefficients(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    // Convertir a números y ejecutar análisis real vía backend
    const numeric = {
      A: parseFloat(coefficients.A) || 0,
      B: parseFloat(coefficients.B) || 0,
      C: parseFloat(coefficients.C) || 0,
      D: parseFloat(coefficients.D) || 0,
      E: parseFloat(coefficients.E) || 0,
      F: parseFloat(coefficients.F) || 0,
    };

    await runConicAnalysis(numeric);
  };

  function handleClear() {
    setResult(null);
    setCoefficients({
      A: '0',
      B: '0',
      C: '0',
      D: '0',
      E: '0',
      F: '0',
    });
  }

  // Ejecución real: POST al backend y setea el resultado completo
  async function runConicAnalysis(coeffs: {
    A: number; B: number; C: number; D: number; E: number; F: number
  }) {
    try {
      setLoading(true);
      setResult(null);

      const isTauri = typeof window !== 'undefined' && '__TAURI__' in (window as any);
      if (isTauri) {
        try {
          const { invoke } = await import('@tauri-apps/api/tauri');
          const json = await invoke<any>('analyze_conic', { coeffs });
          const mapped: ConicResult = {
            ok: json.ok,
            type: json.type,
            delta: json.delta,
            center: json.center,
            rotation: json.rotation,
            canonical: json.canonical,
            points: json.points || [],
          };
          setResult(mapped);
          return;
        } catch (tauriErr) {
          console.warn('Tauri ha fallado', tauriErr);
        }
      }
        const BASE_URL = ENV.PLOTTER_URL;
        console.log('ENV CHECK:', import.meta.env);
        console.log('USING PLOTTER_URL:', BASE_URL);
        if (!BASE_URL) {
          throw new Error('PLOTTER_URL no definido');
        }
        const res = await fetch(`${BASE_URL}/conic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coeffs),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Error backend');
        }

        const json = await res.json();

        console.group(" CONIC ANALYSIS RESULT");
        console.log("Tipo:", json.type);
        console.log("Delta (Δ):", json.delta);

        if (json.center?.exists) {
          console.log("Centro:", `(${json.center.x}, ${json.center.y})`);
        } else {
          console.log("Centro: No existe");
        }

        if (json.canonical?.exists) {
          console.log("Forma canónica:", `a=${json.canonical.a}, b=${json.canonical.b}`);
        } else {
          console.log("Forma canónica: No disponible");
        }

        if (json.rotation?.has_rotation) {
          console.log("Rotación θ:", json.rotation.theta);
        } else {
          console.log("Rotación: No");
        }

        console.log("Número de puntos:", json.points?.length ?? 0);
        console.groupEnd();
      const mapped: ConicResult = {
        ok: json.ok,
        type: json.type,
        delta: json.delta,
        center: json.center,
        rotation: json.rotation,
        canonical: json.canonical,
        points: json.points || [],
      };
      setResult(mapped);
    } catch (e) {
      console.error('conic analysis ha fallado', e);
    } finally {
      setLoading(false);
    }
  }

  // Genera puntos analíticos para círculo y elipse (canónica)
  function generateCanonicalPoints(
    type: string,
    center: { x: number; y: number },
    canonical: { a: number; b: number },
    steps = 256
  ): [number, number, number][] {
    const pts: [number, number, number][] = [];

    if (type === 'CIRCLE') {
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const x = center.x + canonical.a * Math.cos(t);
        const y = center.y + canonical.a * Math.sin(t);
        pts.push([x, y, 0]);
      }
    }

    if (type === 'ELLIPSE') {
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const x = center.x + canonical.a * Math.cos(t);
        const y = center.y + canonical.b * Math.sin(t);
        pts.push([x, y, 0]);
      }
    }

    return pts;
  }

  // Genera ramas analíticas para hipérbola canónica
  function generateHyperbolaPoints(
    center: { x: number; y: number },
    canonical: { a: number; b: number },
    range = 5,
    steps = 200
  ) {
    const left: [number, number, number][] = [];
    const right: [number, number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * range + 1e-3;

      const x = canonical.a * Math.cosh(t);
      const y = canonical.b * Math.sinh(t);

      right.push([center.x + x, center.y + y, 0]);
      left.push([center.x - x, center.y + y, 0]);
    }

    return { left, right };
  }

  // Separa ramas de hipérbola por pares (y1/y2) para evitar cruces y glitches
  function splitHyperbola(points: {x:number, y:number}[]) {
    const branch1: [number, number, number][] = [];
    const branch2: [number, number, number][] = [];

    for (let i = 0; i < points.length; i += 2) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (!p2) continue;
      branch1.push([p1.x, p1.y, 0]);
      branch2.push([p2.x, p2.y, 0]);
    }

    return { branch1, branch2 };
  }

  // Helper: solo renderiza Line si hay al menos 2 puntos
  function safeLine(
    points: [number, number, number][],
    color = "#00ff88"
  ) {
    if (!points || points.length < 2) return null;
    return <Line points={points} color={color} lineWidth={2} />;
  }

  // Calcula el centro visual para la cámara
  const visualCenter = result?.center?.exists
    ? [result.center.x, result.center.y, 100]
    : [0, 0, 100];

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#3B4BFF]/60 scrollbar-track-[#181830]/60"
      >
        {/* HEADER GLOBAL */}
        <Header moduleName="Conic Analysis" />
        {}
        <div className="p-6 overflow-visible relative">
          {/* Global wrapper (congelado hasta parallaxReady) */}
          <motion.div
          style={{
            '--px': px,
            '--py': py,
            rotateX: tilt,
          } as any}
          className="parallax-root grid grid-rows-[minmax(0,1fr)_auto] gap-6"
          transition={{ type: 'tween', duration: 0.08, ease: 'linear' }}
        >
            {/* FILA SUPERIOR - EDITOR Y VISUALIZACIÓN */}
            <div className={`${styles.topGrid} gap-6`}>
              {/* PANEL IZQUIERDO - EDITOR DE FÓRMULAS */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="flex flex-col"
              >
                {/* Header del Editor */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={styles.accentBar} />
                    <motion.h2
                      style={{
                        x: parallaxReady ? innerX : 0,
                        y: parallaxReady ? innerY : 0,
                      }}
                      transition={{ type: 'tween', duration: 0.08, ease: 'linear' }}
                      className="text-xl text-white tracking-tight"
                    >
                      <TypingText text="Editor de Fórmulas" cursorDelay={2000} />
                    </motion.h2>
                  </div>
                  <p className="text-xs text-gray-500 pl-6">Ingresa la ecuación de la cónica</p>
                </div>

                {/* Panel del Editor (x/y congelados hasta parallaxReady) */}
                <motion.div
                  style={{ x: parallaxReady ? panelX : 0, y: parallaxReady ? panelY : 0 }}
                  transition={{ type: 'tween', duration: 0.08, ease: 'linear' }}
                  className={`${styles.panel} ${styles.curvedPanel} flex-1 rounded-xl overflow-hidden`}
                >
                  {/* Contenido interno (x/y congelados hasta parallaxReady) */}
                  <motion.div
                    style={{ x: parallaxReady ? innerX : 0, y: parallaxReady ? innerY : 0, pointerEvents: 'auto' }}
                    transition={{ type: 'tween', duration: 0.08, ease: 'linear' }}
                    className="flex flex-col h-full pointer-events-auto"
                  >
                    {/* Toolbar del editor */}
                    <div className={styles.editorToolbar}>
                      <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Ecuación General</span>
                      <button className={styles.copyBtn}>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar
                      </button>
                    </div>

                    {/* Inputs en grid - Coeficientes */}
                    <div className="p-5 space-y-4">
                      <div className="space-y-2.5">
                        <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Coeficientes de la ecuación</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {(Object.keys(coefficients) as Array<keyof ConicCoefficients>).map((key) => (
                            <div key={key} className="relative">
                              <div className={styles.coeffLabel}>{key}</div>
                              <input
                                type="number"
                                step="0.1"
                                value={coefficients[key]}
                                onChange={(e) => handleInputChange(key, e.target.value)}
                                onBlur={(e) => {
                                  if (e.target.value === '') handleInputChange(key, '0');
                                }}
                                className={styles.coeffInput}
                                placeholder="0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preview de la ecuación tipo código */}
                      <div className="space-y-2.5">
                        <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Vista previa</label>
                        <div className={`${styles.preview} rounded-lg`}>
                          {/* Números de línea simulados */}
                          <div className="flex gap-4">
                            <div className="flex flex-col text-xs text-gray-600 font-mono select-none pt-0.5">
                              {[1, 2, 3].map(num => (
                                <div key={num} className="h-6 leading-6">{num}</div>
                              ))}
                            </div>
                            <div className="flex-1 text-sm font-mono text-white pt-0.5">
                              <div className="h-6 leading-6 text-[#4DFF8F]">
                                {generateEquation({
                                  A: parseFloat(coefficients.A) || 0,
                                  B: parseFloat(coefficients.B) || 0,
                                  C: parseFloat(coefficients.C) || 0,
                                  D: parseFloat(coefficients.D) || 0,
                                  E: parseFloat(coefficients.E) || 0,
                                  F: parseFloat(coefficients.F) || 0,
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-auto p-5 pt-0 flex gap-2.5">
                      <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className={`${styles.analyzeBtn} font-medium tracking-wide text-sm relative overflow-hidden`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Analizando...
                            </>
                          ) : (
                            <>
                              <Activity className="w-4 h-4" />
                              Analizar
                            </>
                          )}
                        </span>
                      </button>
                      <button
                        onClick={handleClear}
                        className={`${styles.clearBtn} flex items-center gap-2 text-sm`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  {/* Interpretación de coeficientes fuera del motion.div para hover correcto */}
                  <div className="px-6 pb-6 flex-1 relative" style={{ transformStyle: 'flat' }}>
                    <InterpretationGrid />
                  </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* PANEL DERECHO - VISUALIZACIÓN */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                className="flex flex-col"
              >
                {/* Header de Visualización */}
                <div className="mb-4">
                  <div className={`${styles.visualHeader} items-center`}>
                    <div className="flex items-center gap-3">
                      <div className={styles.accentBar} />
                      <motion.h2
                        style={{
                          x: parallaxReady ? innerX : 0,
                          y: parallaxReady ? innerY : 0,
                        }}
                        transition={{ type: 'tween', duration: 0.08, ease: 'linear' }}
                        className="text-xl text-white tracking-tight"
                      >
                        <TypingText text="Visualización" speed={60} cursorDelay={2000} />
                      </motion.h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        { icon: ZoomIn, label: 'Zoom +' },
                        { icon: ZoomOut, label: 'Zoom -' },
                        { icon: Maximize2, label: 'Auto-escala' },
                        { icon: RefreshCw, label: 'Reiniciar' }
                      ].map((control, idx) => (
                        <button key={idx} className={styles.iconBtn} title={control.label}>
                          <control.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 pl-6">Gráfico generado por Python</p>
                </div>

                {/* Canvas de Visualización (x/y congelados hasta parallaxReady) */}
                <motion.div
                  style={{ x: parallaxReady ? panelX : 0, y: parallaxReady ? panelY : 0 }}
                  transition={{ type: 'tween', duration: 0.08, ease: 'linear' }}
                  className={`${styles.visualization} h-full min-h-0 rounded-xl overflow-hidden ${styles.curvedPanel}`}
                >
                  <motion.div
                    style={{ x: parallaxReady ? innerX : 0, y: parallaxReady ? innerY : 0 }}
                    transition={{ type: 'tween', duration: 0.08, ease: 'linear' }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    {/* Grid sutil */}
                    <div className={styles.grid} />

                    {/* Ejes cartesianos sutiles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={styles.axisX} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={styles.axisY} />
                    </div>

                    {/* Estado inicial - Esperando (no rotate) */}
                    {!result && !loading && (
                      <div className={styles.centered}>
                        <div className="text-center">
                          <div className={styles.sparkleContainer}>
                            <Sparkles className={styles.sparkleWaiting} strokeWidth={1.5} />
                          </div>
                          <h4 className="text-xl text-gray-400 mb-2 tracking-tight">Esperando análisis...</h4>
                          <p className="text-sm text-gray-600">
                            Pulsa "Analizar" para generar el gráfico
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Loading state */}
                    {loading && (
                      <div className={`${styles.centered} ${styles.overlay}`}>
                        <div className="text-center">
                          {/* Espiral de carga centrada */}
                          <div className={styles.loadingSpinnerWrap}>
                            <div className={styles.loadingSpinner} />
                          </div>
                          <h4 className="text-xl text-white mb-2 tracking-tight">Procesando ecuación...</h4>
                          <p className="text-sm text-gray-400">Generando visualización</p>
                        </div>
                      </div>
                    )}

                    {/* Resultado - Gráfico de la cónica (no scale) */}
                    {result && !loading && (
                      <>
                        {result.type === 'DEGENERATE' ? (
                          <div className={styles.centered}>
                            <div className="text-center">
                              <div className={styles.sparkleContainer}>
                                <Sparkles className={styles.sparkleWaiting} strokeWidth={1.5} />
                              </div>
                              <h4 className="text-xl text-yellow-400 mb-2 tracking-tight">Cónica degenerada</h4>
                              <p className="text-sm text-gray-400">Par de rectas o caso límite.<br />No es una cónica genuina.</p>
                            </div>
                          </div>
                        ) : (
                          <Canvas orthographic style={{ width: '100%', height: '100%' }}>
                            <OrthographicCamera
                              makeDefault
                              position={visualCenter as [number, number, number]}
                              zoom={20}
                            />

                            {/* Círculo / Elipse canónica */}
                            {result.canonical?.exists && result.center?.exists &&
                              result.type !== 'HYPERBOLA' &&
                              safeLine(
                                generateCanonicalPoints(
                                  result.type,
                                  { x: result.center.x, y: result.center.y },
                                  result.canonical
                                )
                              )
                            }

                            {/* Hipérbola canónica */}
                            {result.type === 'HYPERBOLA' &&
                              result.canonical?.exists &&
                              result.center?.exists && (() => {
                                const { left, right } = generateHyperbolaPoints(
                                  result.center,
                                  result.canonical
                                );
                                return (
                                  <>
                                    <Line points={left} color="#00ff88" lineWidth={2} />
                                    <Line points={right} color="#00ff88" lineWidth={2} />
                                  </>
                                );
                              })()
                            }

                            {/* Hipérbola fallback (si no hay canónica) */}
                            {result.type === 'HYPERBOLA' &&
                              (!result.canonical?.exists || !result.center?.exists) &&
                              result.points?.length > 1 && (() => {
                                const { branch1, branch2 } = splitHyperbola(result.points);
                                return (
                                  <>
                                    {safeLine(branch1)}
                                    {safeLine(branch2)}
                                  </>
                                );
                              })()
                            }

                            {/* Fallback general */}
                            {!result.canonical?.exists && result.points?.length > 1 &&
                              safeLine(result.points.map(p => [p.x, p.y, 0]))
                            }
                          </Canvas>
                        )}
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{ x: parallaxReady ? panelX : 0, y: parallaxReady ? panelY : 0 }}
              transition={{ type: 'tween', duration: 0.08, ease: 'linear' }}
              className={`${styles.panel} ${styles.curvedPanel} min-h-50 rounded-xl overflow-hidden`}
            >
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className={styles.loadingSpinnerWrap}>
                      <div className={styles.loadingSpinner} />
                    </div>
                    <h4 className="text-xl text-white mb-2 tracking-tight">Procesando...</h4>
                  </div>
                </div>
              ) : (
                <motion.div
                  style={{ x: parallaxReady ? innerX : 0, y: parallaxReady ? innerY : 0 }}
                  transition={{ type: 'tween', duration: 0.08, ease: 'linear' }}
                  className="h-full"
                >
                  {/* Header del panel */}
                  <div className="h-10 px-5 flex items-center justify-between bg-[#12121F]/60 border-b border-[#3B4BFF]/10">
                    <div className="flex items-center gap-3">
                      <div className={styles.accentBarSmall} />
                      <span className="text-sm text-white font-mono tracking-tight">Metadatos y Resultados</span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {result ? 'Análisis completado' : 'Esperando análisis...'}
                    </div>
                  </div>

                  {/* Contenido del panel */}
                  <div className="p-5">
                    {result ? (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: {
                            transition: {
                              staggerChildren: 0.08,
                              delayChildren: 0.1,
                            },
                          },
                        }}
                        className="grid grid-cols-5 gap-4 h-full"
                      >
                        <MetaCard
                          label="Tipo"
                          value={result.type.toUpperCase()}
                          hint="Cónica detectada"
                          accent="green"
                        />
                        <MetaCard
                          label="Discriminante"
                          value={`Δ = ${result.delta.toFixed(2)}`}
                          hint={
                            result.delta < 0
                              ? 'Δ < 0'
                              : result.delta === 0
                              ? 'Δ = 0'
                              : 'Δ > 0'
                          }
                        />
                        <MetaCard
                          label="Centro"
                          value={
                            result.center?.exists
                              ? `(${result.center.x.toFixed(2)}, ${result.center.y.toFixed(2)})`
                              : 'No existe'
                          }
                          hint="Coordenadas"
                        />
                        <MetaCard
                          label="Forma canónica"
                          value={
                            result.canonical?.exists
                              ? `a=${result.canonical.a.toFixed(2)}, b=${result.canonical.b.toFixed(2)}`
                              : '—'
                          }
                          hint="Parámetros"
                          accent="purple"
                        />
                        <MetaCard
                          label="Estado"
                          value={
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#4DFF8F] animate-pulse" />
                              Completo
                            </span>
                          }
                          hint="Backend OK"
                          accent="green"
                        />
                      </motion.div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="flex justify-center mb-3">
                            <Sparkles className="w-10 h-10 text-[#3B4BFF]/40 animate-spin-slow" />
                          </div>
                          <p className="text-sm text-gray-500 font-mono">Los metadatos aparecerán después del análisis</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* HUD background layer */}
        <div className={`${styles.hudLayer} pointer-events-none`} />
      </div>
    </div>
  );
}