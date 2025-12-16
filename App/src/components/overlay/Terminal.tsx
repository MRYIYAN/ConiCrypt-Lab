import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Minimize2, Maximize2, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const terminalLogs = [
  { type: 'success', text: 'WebSocket connected to localhost:8080' },
  { type: 'info', text: 'C Core initialized successfully' },
  { type: 'success', text: 'Python plotter module loaded' },
  { type: 'info', text: 'Initializing conic curve engine...' },
  { type: 'success', text: 'Elliptic curve parameters validated' },
  { type: 'info', text: 'Loading cryptographic modules...' },
  { type: 'success', text: 'AES-256 encryption ready' },
  { type: 'success', text: 'RSA key generator online' },
  { type: 'info', text: 'Connecting to quantum-safe algorithms...' },
  { type: 'success', text: 'Lattice-based crypto initialized' },
  { type: 'info', text: 'GPU acceleration detected: NVIDIA RTX 4090' },
  { type: 'success', text: 'CUDA cores ready for parallel processing' },
  { type: 'info', text: 'Memory allocated: 8GB VRAM' },
  { type: 'success', text: 'Neural network analyzer loaded' },
  { type: 'info', text: 'Starting vulnerability scanner...' },
  { type: 'success', text: 'Security protocol v3.7 active' },
];

export function Terminal() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [logs, setLogs] = useState<typeof terminalLogs>([]);
  const [showCursor, setShowCursor] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const terminalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate terminal logs appearing
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < terminalLogs.length) {
        setLogs((prev) => [...prev, terminalLogs[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full z-50"
        style={{
          background: 'linear-gradient(135deg, rgba(77, 255, 143, 0.2), rgba(59, 75, 255, 0.2))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(77, 255, 143, 0.4)',
          boxShadow: '0 0 30px rgba(77, 255, 143, 0.4), 0 0 60px rgba(59, 75, 255, 0.3)',
        }}
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 0 40px rgba(77, 255, 143, 0.6), 0 0 80px rgba(59, 75, 255, 0.5)',
        }}
        whileTap={{ scale: 0.9 }}
      >
        <TerminalIcon size={24} style={{ color: '#4DFF8F', filter: 'drop-shadow(0 0 8px #4DFF8F)' }} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        opacity: 1,
        width: isMaximized ? '80vw' : '420px',
        height: isMaximized ? '70vh' : '220px',
        x: position.x,
        y: position.y,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-6 left-6 z-50 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.95), rgba(20, 20, 30, 0.95))',
        backdropFilter: 'blur(30px) saturate(180%)',
        border: '1px solid rgba(77, 255, 143, 0.2)',
        boxShadow: `
          0 0 0 1px rgba(59, 75, 255, 0.1),
          0 8px 32px rgba(0, 0, 0, 0.6),
          0 0 60px rgba(77, 255, 143, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Animated gradient overlay for crystal effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(59, 75, 255, 0.15), transparent 50%)',
        }}
        animate={{
          background: [
            'radial-gradient(circle at 30% 20%, rgba(59, 75, 255, 0.15), transparent 50%)',
            'radial-gradient(circle at 70% 80%, rgba(77, 255, 143, 0.1), transparent 50%)',
            'radial-gradient(circle at 30% 20%, rgba(59, 75, 255, 0.15), transparent 50%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Header */}
      <div 
        ref={headerRef}
        className="relative flex items-center justify-between px-4 py-2.5 cursor-grab active:cursor-grabbing"
        style={{
          background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.9), rgba(14, 14, 20, 0.8))',
          borderBottom: '1px solid rgba(77, 255, 143, 0.15)',
          boxShadow: '0 1px 20px rgba(77, 255, 143, 0.1)',
        }}
      >
        <div className="flex items-center gap-2">
          {/* Traffic lights with glow */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="w-3 h-3 rounded-full transition-all"
            style={{ 
              backgroundColor: '#FF5F57',
              boxShadow: '0 0 8px rgba(255, 95, 87, 0.6)',
            }}
            whileHover={{ 
              boxShadow: '0 0 16px rgba(255, 95, 87, 0.9)',
              scale: 1.1,
            }}
          />
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            className="w-3 h-3 rounded-full transition-all"
            style={{ 
              backgroundColor: '#FEBC2E',
              boxShadow: '0 0 8px rgba(254, 188, 46, 0.6)',
            }}
            whileHover={{ 
              boxShadow: '0 0 16px rgba(254, 188, 46, 0.9)',
              scale: 1.1,
            }}
          />
          <motion.button
            className="w-3 h-3 rounded-full transition-all"
            style={{ 
              backgroundColor: '#28C840',
              boxShadow: '0 0 8px rgba(40, 200, 64, 0.6)',
            }}
            whileHover={{ 
              boxShadow: '0 0 16px rgba(40, 200, 64, 0.9)',
              scale: 1.1,
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <TerminalIcon 
            size={14} 
            style={{ 
              color: '#4DFF8F',
              filter: 'drop-shadow(0 0 4px rgba(77, 255, 143, 0.6))',
            }} 
          />
          <span 
            style={{ 
              fontSize: '12px', 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #4DFF8F, #00E4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 8px rgba(77, 255, 143, 0.3))',
            }}
          >
            CONiCRYPT Terminal
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
            style={{
              border: '1px solid rgba(77, 255, 143, 0.2)',
            }}
          >
            {isMaximized ? (
              <Minimize2 size={12} style={{ color: '#4DFF8F' }} />
            ) : (
              <Maximize2 size={12} style={{ color: '#4DFF8F' }} />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
            style={{
              border: '1px solid rgba(255, 77, 109, 0.2)',
            }}
          >
            <X size={12} style={{ color: '#FF4D6D' }} />
          </button>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="relative p-4 font-mono overflow-y-auto"
        style={{
          height: 'calc(100% - 44px)',
          fontSize: '12px',
          lineHeight: '1.6',
        }}
      >
        {logs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="mb-1 flex items-start gap-3"
          >
            <span 
              style={{ 
                color: '#5A5A6C', 
                fontSize: '11px',
                minWidth: '32px',
                textAlign: 'right',
                userSelect: 'none',
                opacity: 0.5,
              }}
            >
              {String(index + 1).padStart(3, '0')}
            </span>
            <div className="flex items-center gap-3 flex-1">
              <motion.span 
                animate={{
                  textShadow: log?.type === 'success' 
                    ? [
                        '0 0 10px rgba(77, 255, 143, 0.6)',
                        '0 0 20px rgba(77, 255, 143, 0.8)',
                        '0 0 10px rgba(77, 255, 143, 0.6)',
                      ]
                    : [
                        '0 0 10px rgba(0, 228, 255, 0.6)',
                        '0 0 20px rgba(0, 228, 255, 0.8)',
                        '0 0 10px rgba(0, 228, 255, 0.6)',
                      ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ 
                  color: log?.type === 'success' ? '#4DFF8F' : '#00E4FF',
                  fontWeight: 700,
                  minWidth: '56px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: log?.type === 'success' 
                    ? 'rgba(77, 255, 143, 0.1)' 
                    : 'rgba(0, 228, 255, 0.1)',
                  border: `1px solid ${log?.type === 'success' ? 'rgba(77, 255, 143, 0.3)' : 'rgba(0, 228, 255, 0.3)'}`,
                  boxShadow: log?.type === 'success' 
                    ? '0 0 10px rgba(77, 255, 143, 0.2)' 
                    : '0 0 10px rgba(0, 228, 255, 0.2)',
                }}
              >
                {log?.type === 'success' ? 'OK' : 'INFO'}
              </motion.span>
              <span 
                style={{ 
                  color: '#E4E4EC',
                  textShadow: '0 0 10px rgba(228, 228, 236, 0.1)',
                }}
              >
                {log?.text || ''}
              </span>
            </div>
          </motion.div>
        ))}
        <div className="flex items-start gap-3 mt-2">
          <span 
            style={{ 
              color: '#5A5A6C', 
              fontSize: '11px',
              minWidth: '32px',
              textAlign: 'right',
              opacity: 0.5,
            }}
          >
            {String(logs.length + 1).padStart(3, '0')}
          </span>
          <div className="flex items-center gap-1">
            <motion.span 
              animate={{
                textShadow: [
                  '0 0 10px rgba(77, 255, 143, 0.8)',
                  '0 0 20px rgba(77, 255, 143, 1)',
                  '0 0 10px rgba(77, 255, 143, 0.8)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ 
                color: '#4DFF8F',
                fontWeight: 700,
              }}
            >
              {'>'}
            </motion.span>
            <motion.span
              animate={{ 
                opacity: showCursor ? 1 : 0,
                boxShadow: showCursor 
                  ? '0 0 15px rgba(77, 255, 143, 0.8)' 
                  : '0 0 0px rgba(77, 255, 143, 0)',
              }}
              className="inline-block w-2 h-4 ml-1 rounded-sm"
              style={{ 
                backgroundColor: '#4DFF8F',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}