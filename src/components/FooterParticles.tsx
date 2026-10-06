import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  phase: number;
}

export const FooterParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const isVisibleRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isMobile = width < 768;
    const particleCount = isMobile ? 28 : 64;

    const particles: Particle[] = [];
    const colors = [
      'rgba(215, 226, 234, ', // Silver/Graphite (90%)
      'rgba(215, 226, 234, ',
      'rgba(215, 226, 234, ',
      'rgba(215, 226, 234, ',
      'rgba(215, 226, 234, ',
      'rgba(157, 114, 255, ', // Muted Violet (5%)
      'rgba(100, 210, 255, ', // Muted Cyan (5%)
    ];

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: 0,
        vy: 0,
        size: Math.random() < 0.75 ? 1.4 : 2.2,
        color: colors[i % colors.length],
        // Boosted base alpha by ~20% for intentional, crisp presence
        alpha: 0.18 + Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas || !container) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    // Pause when offscreen via IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      if (isVisibleRef.current) {
        ctx.clearRect(0, 0, width, height);
        time += 0.014;

        const cx = width / 2;
        const cy = height * 0.72; // Optical center of giant AADI typography
        const textRadiusX = isMobile ? width * 0.44 : width * 0.38;
        const textRadiusY = height * 0.36;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // 1. Ambient slow drift
          const driftX = Math.cos(time + p.phase) * 0.45;
          const driftY = Math.sin(time + p.phase) * 0.45;

          let targetX = p.originX + driftX;
          let targetY = p.originY + driftY;

          // 2. Soft elliptical repulsion around AADI letters
          const dx = p.x - cx;
          const dy = p.y - cy;
          const normalizedDist = Math.sqrt(
            (dx * dx) / (textRadiusX * textRadiusX) + (dy * dy) / (textRadiusY * textRadiusY)
          );

          if (normalizedDist < 1.0) {
            const repelFactor = (1.0 - normalizedDist) * 40;
            const angle = Math.atan2(dy, dx);
            targetX += Math.cos(angle) * repelFactor;
            targetY += Math.sin(angle) * repelFactor;
          }

          // 3. Gentle cursor displacement
          if (mouseRef.current.active) {
            const mdx = p.x - mouseRef.current.x;
            const mdy = p.y - mouseRef.current.y;
            const dist = Math.sqrt(mdx * mdx + mdy * mdy);
            const maxRadius = 110;

            if (dist < maxRadius && dist > 0) {
              const repel = (1 - dist / maxRadius) * 28;
              targetX += (mdx / dist) * repel;
              targetY += (mdy / dist) * repel;
            }
          }

          // Spring physics
          const spring = 0.048;
          const damping = 0.9;
          p.vx = (p.vx + (targetX - p.x) * spring) * damping;
          p.vy = (p.vy + (targetY - p.y) * spring) * damping;
          p.x += p.vx;
          p.y += p.vy;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.fill();
        }

        // Faint connection lines between close particles
        const maxDist = isMobile ? 40 : 54;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const cdx = p1.x - p2.x;
            const cdy = p1.y - p2.y;
            const dist = Math.sqrt(cdx * cdx + cdy * cdy);

            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * 0.08;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(215, 226, 234, ${alpha})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block opacity-90" />
    </div>
  );
};
