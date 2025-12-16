//===========================================================================//
//                         MÓDULO: CURVAS CÓNICAS                             //
//===========================================================================//
//  Editor de coeficientes y visualización básica de la cónica resultante.
//  Simula un análisis (delta y tipo) y muestra un gráfico placeholder.
//  Nota: Panel de metadatos eliminado según requerimiento.                  //
//===========================================================================//

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, ZoomIn, ZoomOut, Maximize2, Sparkles, Trash2, Copy, Wifi, Cpu, Code2, Database } from 'lucide-react';

interface ConicCoefficients {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}

interface AnalysisResult {
  type: string;
  delta: number;
  center?: [number, number];
  message?: string;
}

export function ConicAnalysis() {
  //---------------------------------------------------------------------------//
  // Estado de coeficientes, progreso de análisis y resultado                  //
  //---------------------------------------------------------------------------//
  const [coefficients, setCoefficients] = useState<ConicCoefficients>({
    A: 4,
    B: 0,
    C: -3,
    D: 2,
    E: -5,
    F: 1
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  //---------------------------------------------------------------------------//
  // Handlers: cambio de inputs, analizar (simulación) y limpiar               //
  //---------------------------------------------------------------------------//
  const handleInputChange = (field: keyof ConicCoefficients, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setCoefficients(prev => ({ ...prev, [field]: numValue }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);

    // Simulación de análisis
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Cálculo del discriminante
    const delta = coefficients.B ** 2 - 4 * coefficients.A * coefficients.C;
    
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
    setCoefficients({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 });
    setResult(null);
  };

  //---------------------------------------------------------------------------//
  // Utilidad: generar ecuación formateada para preview                        //
  //---------------------------------------------------------------------------//
  const generateEquation = () => {
    const { A, B, C, D, E, F } = coefficients;
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
    <div className="relative w-full h-full flex flex-col" style={{ zIndex: 20 }}>
      {/* HEADER SUPERIOR (indicadores y módulo activo) */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-12 px-6 flex items-center gap-6 bg-[#0A0A0F]/95 border-b border-[#3B4BFF]/20"
        style={{
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Indicadores de sistema */}
        <div className="flex items-center gap-4">
          {/* WS - WebSocket */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4DFF8F] animate-pulse" />
            <Wifi className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-mono">WS</span>
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-[#3B4BFF]/20" />

          {/* Core */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4DFF8F]" />
            <Cpu className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-mono">Core</span>
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-[#3B4BFF]/20" />

          {/* PyViz */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4DFF8F]" />
            <Code2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-mono">PyViz</span>
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-[#3B4BFF]/20" />

          {/* Database */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4DFF8F]" />
            <Database className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-mono">DB</span>
          </div>
        </div>

        {/* Espaciador */}
        <div className="flex-1" />

        {/* Información de módulo */}
        <div className="text-xs text-gray-500 font-mono">
          <span className="text-[#3B4BFF]">MODULE:</span> conic-analysis
        </div>
      </motion.div>

      {/* CONTENIDO PRINCIPAL */}
      {/* Grid: editor de la izquierda y visualización a la derecha */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full grid grid-rows-[1fr] gap-6">
          {/* FILA SUPERIOR - EDITOR Y VISUALIZACIÓN */}
          <div className="grid grid-cols-[420px_1fr] gap-6 overflow-hidden">
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
                  <div className="w-1 h-6 bg-gradient-to-b from-[#3B4BFF] to-[#7B2CFF] rounded-full" />
                  <h2 className="text-xl text-white tracking-tight">Editor de Fórmulas</h2>
                </div>
                <p className="text-xs text-gray-500 pl-6">Ingresa la ecuación de la cónica</p>
              </div>

              {/* Panel del Editor */}
              <div className="flex-1 bg-[#0A0A0F]/80 border border-[#3B4BFF]/20 rounded-xl overflow-hidden flex flex-col"
                style={{
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(59, 75, 255, 0.1)'
                }}
              >
                {/* Toolbar del editor */}
                <div className="h-10 px-4 flex items-center justify-between bg-[#12121F]/60 border-b border-[#3B4BFF]/10">
                  <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Ecuación General</span>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#3B4BFF] hover:text-[#7B2CFF] 
                    hover:bg-[#3B4BFF]/10 rounded transition-colors">
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
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#3B4BFF] font-mono font-bold pointer-events-none">
                            {key}
                          </div>
                          <input
                            type="number"
                            step="0.1"
                            value={coefficients[key]}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            className="w-full bg-[#000000]/40 border border-[#3B4BFF]/20 rounded-lg pl-7 pr-3 py-2.5 
                              text-white font-mono text-sm text-right
                              focus:outline-none focus:border-[#3B4BFF] focus:bg-[#000000]/60
                              hover:border-[#3B4BFF]/40
                              transition-all duration-200"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview de la ecuación tipo código */}
                  <div className="space-y-2.5">
                    <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Vista previa</label>
                    <div className="bg-[#000000]/60 border border-[#3B4BFF]/20 rounded-lg p-4">
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
                    className="flex-1 bg-gradient-to-r from-[#3B4BFF] to-[#7B2CFF] text-white py-3 rounded-lg
                      font-medium tracking-wide text-sm
                      hover:shadow-[0_0_30px_rgba(59,75,255,0.5)] 
                      transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed
                      relative overflow-hidden group"
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
                    className="px-4 bg-[#3B4BFF]/10 border border-[#3B4BFF]/20 text-gray-400 py-3 rounded-lg
                      hover:bg-[#3B4BFF]/20 hover:text-white hover:border-[#3B4BFF]/40
                      transition-all duration-300 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#3B4BFF] to-[#7B2CFF] rounded-full" />
                    <h2 className="text-xl text-white tracking-tight">Visualización</h2>
                  </div>
                  
                  {/* Controles flotantes */}
                  <div className="flex items-center gap-2">
                    {[
                      { icon: ZoomIn, label: 'Zoom +' },
                      { icon: ZoomOut, label: 'Zoom -' },
                      { icon: Maximize2, label: 'Auto-escala' },
                      { icon: RefreshCw, label: 'Reiniciar' }
                    ].map((control, idx) => (
                      <button
                        key={idx}
                        className="p-2 bg-[#0A0A0F]/60 border border-[#3B4BFF]/20 rounded-lg
                          hover:bg-[#3B4BFF]/20 hover:border-[#3B4BFF] 
                          transition-all duration-200 group"
                        title={control.label}
                      >
                        <control.icon className="w-4 h-4 text-gray-500 group-hover:text-[#3B4BFF]" />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 pl-6">Gráfico generado por Python</p>
              </div>

              {/* Canvas de Visualización - MÁS CUADRADO */}
              <div className="flex-1 bg-[#000000] border border-[#3B4BFF]/20 rounded-xl overflow-hidden relative flex items-center justify-center"
                style={{
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(59, 75, 255, 0.05)'
                }}
              >
                {/* Grid sutil */}
                <div 
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #3B4BFF 1px, transparent 1px),
                      linear-gradient(to bottom, #3B4BFF 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px'
                  }}
                />

                {/* Ejes cartesianos sutiles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#3B4BFF]/20 to-transparent" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#3B4BFF]/20 to-transparent" />
                </div>

                {/* Estado inicial - Esperando */}
                {!result && !isAnalyzing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.15, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="mb-6"
                      >
                        <Sparkles className="w-20 h-20 text-[#3B4BFF] mx-auto" strokeWidth={1.5} />
                      </motion.div>
                      <h4 className="text-xl text-gray-400 mb-2 tracking-tight">Esperando análisis...</h4>
                      <p className="text-sm text-gray-600">
                        Pulsa "Analizar" para generar el gráfico
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isAnalyzing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mb-6"
                      >
                        <Sparkles className="w-20 h-20 text-[#3B4BFF] mx-auto" strokeWidth={1.5} />
                      </motion.div>
                      <h4 className="text-xl text-white mb-2 tracking-tight">Procesando ecuación...</h4>
                      <p className="text-sm text-gray-400">Generando visualización</p>
                    </div>
                  </div>
                )}

                {/* Resultado - Gráfico de la cónica */}
                {result && !isAnalyzing && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
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
                          className="animate-pulse"
                          style={{ animationDuration: '3s' }}
                        />
                        {/* Centro */}
                        <circle cx="225" cy="225" r="4" fill="#4DFF8F" />
                        <circle cx="225" cy="225" r="8" fill="#4DFF8F" opacity="0.3" />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}