import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Activity, RefreshCw, ZoomIn, ZoomOut, Maximize2, Sparkles, Trash2, Copy } from 'lucide-react';
import { Header } from './../Header/Header';
import styles from './ConicAnalysis.module.css';
import { TypingText } from '../../components/ui/TypingText';

interface ConicCoefficients {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
}

interface AnalysisResult {
  type: string;
  delta: number;
  center?: [number, number];
  message?: string;
}

export function ConicAnalysis() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [parallaxReady, setParallaxReady] = useState(false);

  // Internal content micro-movement: ±4px / ±2.5px
  const innerX = useTransform(mouseX, [-300, 300], [-4, 4]);
  const innerY = useTransform(mouseY, [-300, 300], [-2.5, 2.5]);

  // External frame micro-movement: ±1.2px / ±0.8px
  const panelX = useTransform(mouseX, [-300, 300], [-1.2, 1.2]);
  const panelY = useTransform(mouseY, [-300, 300], [-0.8, 0.8]);

  // Curvatura global tipo casco: calcula rotateX directamente desde mouseX/mouseY
  const helmetRotateX = useTransform(
    [mouseX, mouseY],
    (values: number[]) => {
      const [x = 0, y = 0] = values;
      const baseTilt = 1.2;                 // inclinación constante hacia abajo
      const verticalInfluence = -y * 0.002; // micro variación vertical
      const lateralInfluence = Math.abs(x) * 0.001; // al ir a los lados, cae más
      return baseTilt + verticalInfluence + lateralInfluence;
    }
  );


  // Inicializa el mouse SOLO cuando hay movimiento real y el layout está listo
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

  const [coefficients, setCoefficients] = useState<ConicCoefficients>({
    A: '4',
    B: '0',
    C: '-3',
    D: '2',
    E: '-5',
    F: '1'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleInputChange = (field: keyof ConicCoefficients, value: string) => {
    setCoefficients(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);

    // Simulación de análisis
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Convertir a número solo cuando se necesita
    const numeric = {
      A: parseFloat(coefficients.A) || 0,
      B: parseFloat(coefficients.B) || 0,
      C: parseFloat(coefficients.C) || 0,
      D: parseFloat(coefficients.D) || 0,
      E: parseFloat(coefficients.E) || 0,
      F: parseFloat(coefficients.F) || 0,
    };

    // Cálculo del discriminante
    const delta = numeric.B ** 2 - 4 * numeric.A * numeric.C;

    let type = 'Degenerada';
    if (delta < 0) type = 'Elipse';
    else if (delta === 0) type = 'Parábola';
    else if (delta > 0) type = 'Hipérbola';

    setResult({
      type,
      delta,
      center: [0, 0],
      message: 'Análisis completado'
    });

    setIsAnalyzing(false);
  };

  const handleClear = () => {
    setCoefficients({ A: '0', B: '0', C: '0', D: '0', E: '0', F: '0' });
    setResult(null);
  };

  // Generar la ecuación formateada
  const generateEquation = () => {
    const A = parseFloat(coefficients.A) || 0;
    const B = parseFloat(coefficients.B) || 0;
    const C = parseFloat(coefficients.C) || 0;
    const D = parseFloat(coefficients.D) || 0;
    const E = parseFloat(coefficients.E) || 0;
    const F = parseFloat(coefficients.F) || 0;

    let equation = '';

    if (A !== 0) equation += `${A > 0 && equation ? '+ ' : ''}${A === 1 ? '' : A === -1 ? '-' : A}x²`;
    if (B !== 0) equation += ` ${B > 0 ? '+ ' : ''}${B === 1 ? '' : B === -1 ? '-' : B}xy`;
    if (C !== 0) equation += ` ${C > 0 ? '+ ' : ''}${C === 1 ? '' : C === -1 ? '-' : C}y²`;
    if (D !== 0) equation += ` ${D > 0 ? '+ ' : ''}${D}x`;
    if (E !== 0) equation += ` ${E > 0 ? '+ ' : ''}${E}y`;
    if (F !== 0) equation += ` ${F > 0 ? '+ ' : ''}${F}`;

    return equation.trim() || '0' + ' = 0';
  };

  return (
    <div className={`${styles.root} w-full h-full flex flex-col`}>
      <Header moduleName="conic-analysis" />
      <div ref={containerRef} className={`${styles.perspective} flex-1 relative`}>
        <div className="h-full p-6 overflow-hidden relative z-10">
          {/* Global wrapper applying subtle rotateX (congelado hasta parallaxReady) */}
          <motion.div
            className="h-full grid grid-rows-[1fr_auto] gap-6"
            style={{
              rotateX: parallaxReady ? helmetRotateX : 0,
              transformStyle: 'preserve-3d',
              transformPerspective: 1000,
              willChange: 'transform',
            }}
            transition={{ type: 'spring', stiffness: 18, damping: 40, delay: parallaxReady ? 0 : 0.15 }}
          >
            {/* FILA SUPERIOR - EDITOR Y VISUALIZACIÓN */}
            <div className={`${styles.topGrid} gap-6 overflow-hidden`}>
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
                      transition={{ type: 'spring', stiffness: 30, damping: 40 }}
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
                  transition={{ type: 'spring', stiffness: 20, damping: 40 }}
                  className={`${styles.panel} ${styles.curvedPanel} flex-1 rounded-xl overflow-hidden`}
                >
                  {/* Contenido interno (x/y congelados hasta parallaxReady) */}
                  <motion.div
                    style={{ x: parallaxReady ? innerX : 0, y: parallaxReady ? innerY : 0 }}
                    transition={{ type: 'spring', stiffness: 30, damping: 40 }}
                    className="flex flex-col h-full"
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
                                {generateEquation()}
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
                        disabled={isAnalyzing}
                        className={`${styles.analyzeBtn} font-medium tracking-wide text-sm relative overflow-hidden`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isAnalyzing ? (
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
                        transition={{ type: 'spring', stiffness: 30, damping: 40 }}
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
                  transition={{ type: 'spring', stiffness: 20, damping: 40 }}
                  className={`${styles.visualization} ${styles.curvedPanel} flex-1 rounded-xl overflow-hidden`}
                >
                  <motion.div
                    style={{ x: parallaxReady ? innerX : 0, y: parallaxReady ? innerY : 0 }}
                    transition={{ type: 'spring', stiffness: 30, damping: 40 }}
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
                    {!result && !isAnalyzing && (
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
                    {isAnalyzing && (
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
                    {result && !isAnalyzing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="relative"
                      >
                        {/* Elipse placeholder */}
                        <motion.div
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                        >
                          <svg width="450" height="450" viewBox="0 0 450 450" className="overflow-visible">
                            <defs>
                              <linearGradient id="conicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3B4BFF" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#7B2CFF" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#3B4BFF" stopOpacity="0.8" />
                              </linearGradient>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                            </defs>
                            <ellipse 
                              cx="225" 
                              cy="225" 
                              rx="160" 
                              ry="110" 
                              fill="none" 
                              stroke="url(#conicGradient)" 
                              strokeWidth="3"
                              filter="url(#glow)"
                              className={`${styles.ellipse} animate-pulse`}
                              style={{ animationDuration: '3s' }}
                            />
                            {/* Centro */}
                            <circle cx="225" cy="225" r="4" fill="#4DFF8F" />
                            <circle cx="225" cy="225" r="8" fill="#4DFF8F" opacity="0.3" />
                          </svg>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* FILA INFERIOR - METADATOS Y RESULTADOS */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 18, damping: 42 }}
              style={{ x: parallaxReady ? panelX : 0, y: parallaxReady ? panelY : 0 }}
              className={`${styles.panel} ${styles.curvedPanel} h-50 rounded-xl overflow-hidden`}
            >
              <motion.div
                style={{ x: parallaxReady ? innerX : 0, y: parallaxReady ? innerY : 0 }}
                transition={{ type: 'spring', stiffness: 28, damping: 40 }}
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
                    <div className="grid grid-cols-5 gap-4 h-full">
                      <div className={`${styles.resultCard} ${styles.curvedPanel}`}>
                        {/* Tipo de Cónica */}
                        <div className="bg-[#000000]/40 border border-[#3B4BFF]/20 rounded-lg p-4 
                          hover:border-[#3B4BFF]/40 transition-all duration-300">
                          <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-wider">Tipo</div>
                          <div className="text-xl text-[#4DFF8F] font-mono mb-1">
                            {result.type}
                          </div>
                          <div className="text-xs text-gray-600 font-mono">Cónica detectada</div>
                        </div>
                      </div>

                      <div className={`${styles.resultCard} ${styles.curvedPanel}`}>
                        {/* Discriminante */}
                        <div className="bg-[#000000]/40 border border-[#3B4BFF]/20 rounded-lg p-4
                          hover:border-[#3B4BFF]/40 transition-all duration-300">
                          <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-wider">Discriminante</div>
                          <div className="text-xl text-white font-mono mb-1">
                            Δ = {result.delta.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 font-mono">
                            {result.delta < 0 ? 'Δ < 0' : result.delta === 0 ? 'Δ = 0' : 'Δ > 0'}
                          </div>
                        </div>
                      </div>

                      <div className={`${styles.resultCard} ${styles.curvedPanel}`}>
                        {/* Centro */}
                        <div className="bg-[#000000]/40 border border-[#3B4BFF]/20 rounded-lg p-4
                          hover:border-[#3B4BFF]/40 transition-all duration-300">
                          <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-wider">Centro</div>
                          <div className="text-xl text-white font-mono mb-1">
                            ({result.center?.[0] ?? 0}, {result.center?.[1] ?? 0})
                          </div>
                          <div className="text-xs text-gray-600 font-mono">Coordenadas</div>
                        </div>
                      </div>

                      <div className={`${styles.resultCard} ${styles.curvedPanel}`}>
                        {/* Excentricidad */}
                        <div className="bg-[#000000]/40 border border-[#3B4BFF]/20 rounded-lg p-4
                          hover:border-[#3B4BFF]/40 transition-all duration-300">
                          <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-wider">Excentricidad</div>
                          <div className="text-xl text-white font-mono mb-1">
                            e = 0.75
                          </div>
                          <div className="text-xs text-gray-600 font-mono">Deformación</div>
                        </div>
                      </div>

                      <div className={`${styles.resultCard} ${styles.curvedPanel}`}>
                        {/* Estado del análisis */}
                        <div className="bg-[#000000]/40 border border-[#3B4BFF]/20 rounded-lg p-4
                          hover:border-[#3B4BFF]/40 transition-all duration-300">
                          <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-wider">Estado</div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-[#4DFF8F] animate-pulse" />
                            <span className="text-sm text-[#4DFF8F] font-mono">Completo</span>
                          </div>
                          <div className="text-xs text-gray-600 font-mono">Tiempo: 1.8s</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className={styles.metadataEmpty}>
                        <Sparkles className={styles.sparkleSmall} strokeWidth={1.5} />
                        <p className="text-sm text-gray-500 font-mono">
                          Los metadatos aparecerán después del análisis
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* HUD background layer: no rotate, no motion */}
        <div className={styles.hudLayer} />
      </div>
    </div>
  );
}