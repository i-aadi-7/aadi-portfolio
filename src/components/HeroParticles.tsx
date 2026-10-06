import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

const PALETTE = [
  'rgba(187, 204, 215, ', // Silver-blue
  'rgba(118, 33, 176, ',  // Electric purple
  'rgba(182, 0, 168, ',  // Magenta
  'rgba(100, 105, 115, ', // Slate metallic
];

export const HeroParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Mouse coordinates relative to hero canvas
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    let scrollY = window.scrollY;
    let isVisible = true;

    // Responsive particle density
    const particleCount = Math.min(65, Math.floor((width * height) / 18000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const colorBase = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.1, // subtle upward drift
        color: colorBase,
        alpha: Math.random() * 0.35 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      if (scrollY > height + 100) {
        isVisible = false;
      } else {
        isVisible = true;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    let tick = 0;

    const render = () => {
      if (isVisible) {
        tick++;
        ctx.clearRect(0, 0, width, height);

        // Smooth mouse interpolation
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        // Draw and update particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Scroll parallax reaction
          const scrollParallax = scrollY * 0.25;

          // Regular subtle motion
          p.x += p.vx;
          p.y += p.vy;

          // Mouse proximity reaction (gentle repulsion + magnetic trail)
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y + scrollParallax - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 180;

            if (dist < maxDist && dist > 0) {
              const force = (1 - dist / maxDist) * 1.5;
              p.x += (dx / dist) * force * 1.8;
              p.y += (dy / dist) * force * 1.8;
            }
          }

          // Screen wrap
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Render particle with pulsing luminescence
          const currentAlpha =
            p.alpha * (0.7 + 0.3 * Math.sin(tick * p.pulseSpeed + p.pulseOffset));

          ctx.fillStyle = `${p.color}${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y - (scrollY * 0.2) % height, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Connect nearby particles with subtle faint filaments
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const distSq = (p.x - p2.x) ** 2 + (p.y - p2.y) ** 2;
            const maxLinkDist = 95;

            if (distSq < maxLinkDist * maxLinkDist) {
              const linkDist = Math.sqrt(distSq);
              const linkAlpha = (1 - linkDist / maxLinkDist) * 0.09;
              ctx.strokeStyle = `rgba(215, 226, 234, ${linkAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y - (scrollY * 0.2) % height);
              ctx.lineTo(p2.x, p2.y - (scrollY * 0.2) % height);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
    />
  );
};
