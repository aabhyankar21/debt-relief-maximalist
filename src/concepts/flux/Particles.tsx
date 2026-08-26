import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

export const FLUX_PALETTES: Record<string, readonly string[]> = {
  'debt-amount': ['#d6ff3d', '#ffe14a', '#ff7a32', '#ffffff'],
  'debt-type': ['#ff3d9a', '#d6ff3d', '#3df0ff', '#ffb03d'],
  contact: ['#3df0ff', '#a78bfa', '#ff3d9a', '#ffffff'],
  'date-of-birth': ['#ffb03d', '#d6ff3d', '#3df0ff', '#ff7a32'],
  phone: ['#3df0ff', '#5b8cff', '#d6ff3d', '#ffffff'],
  income: ['#d6ff3d', '#3dffb0', '#ffe14a', '#ffffff'],
  address: ['#5b8cff', '#3df0ff', '#ff3d9a', '#d6ff3d'],
  result: ['#d6ff3d', '#ff3d9a', '#3df0ff', '#ffb03d'],
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: number;
}

export function ParticleField({
  palette,
  compact,
  className,
}: {
  palette: readonly string[];
  compact?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const count = compact ? 42 : 96;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0012,
      vy: (Math.random() - 0.5) * 0.0012,
      r: 1.1 + Math.random() * 2.6,
      c: Math.floor(Math.random() * 4),
    }));

    const mouse = { x: 0.5, y: 0.5, on: false };
    let raf = 0;
    let width = 0;
    let height = 0;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas);

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (event.clientX - rect.left) / Math.max(rect.width, 1);
      mouse.y = (event.clientY - rect.top) / Math.max(rect.height, 1);
      mouse.on = true;
    };

    window.addEventListener('pointermove', onMove);

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      const colors = paletteRef.current;

      for (const particle of particles) {
        if (!reduceMotion && mouse.on) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const dist = dx * dx + dy * dy + 0.0018;
          particle.vx += (dx / dist) * 0.000055;
          particle.vy += (dy / dist) * 0.000055;
        }

        if (!reduceMotion) {
          particle.vx *= 0.965;
          particle.vy *= 0.965;
          particle.x += particle.vx;
          particle.y += particle.vy;
        }

        if (particle.x < 0 || particle.x > 1) particle.vx *= -1;
        if (particle.y < 0 || particle.y > 1) particle.vy *= -1;
        particle.x = Math.min(1, Math.max(0, particle.x));
        particle.y = Math.min(1, Math.max(0, particle.y));

        ctx.beginPath();
        ctx.fillStyle = colors[particle.c % colors.length] ?? '#fff';
        ctx.globalAlpha = 0.72;
        ctx.arc(particle.x * width, particle.y * height, particle.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, [compact, reduceMotion]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
