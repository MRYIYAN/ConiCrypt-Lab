import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export function WireframeGeometryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animationRef = useRef<number | null>(null);


  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // === CONFIGURACIÓN (equivalente a tu SVG) ===
    const PARTICLE_COUNT = 40;
    const MAX_DIST = 140;
    const MOUSE_DIST = 180;

    // Crear partículas (ANTES useState)
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 0.5,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // === UPDATE ===
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= canvas.width) p.vx *= -1;
        if (p.y <= 0 || p.y >= canvas.height) p.vy *= -1;
      }

      // === CONEXIONES ENTRE PARTÍCULAS ===
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < MAX_DIST) {
            ctx.strokeStyle = `rgba(255,255,255,${
              0.2 * (1 - d / MAX_DIST)
            })`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // === CONEXIONES CON MOUSE ===
      for (const p of particles) {
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < MOUSE_DIST) {
          ctx.strokeStyle = `rgba(59,75,255,${
            0.4 * (1 - d / MOUSE_DIST)
          })`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.stroke();
        }
      }

      // === PARTÍCULAS (halo + núcleo) ===
      for (const p of particles) {
        // halo
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // núcleo
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // === MOUSE ===
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(animationRef.current!);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
