import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export interface PageTransitionProps {
  onComplete?: () => void;
  onLoadingComplete?: () => void;
}

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

export const PageTransition: React.FC<PageTransitionProps> = ({
  onComplete,
  onLoadingComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const progressRef = useRef(0);
  const isReadyRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion = useReducedMotion();

  const handleFinish = useCallback(() => {
    setIsDone(true);
    onComplete?.();
    onLoadingComplete?.();
  }, [onComplete, onLoadingComplete]);

  const scheduleFinish = useCallback((delay: number) => {
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    finishTimeoutRef.current = setTimeout(() => {
      finishTimeoutRef.current = null;
      handleFinish();
    }, delay);
  }, [handleFinish]);

  const handleSkip = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsExiting(true);
    scheduleFinish(300);
  }, [scheduleFinish]);

  useEffect(() => {
    return () => {
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    };
  }, []);

  // ESC key handler for skipping current loader run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDone) {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDone, handleSkip]);

  // Deterministic Loading Timeline: ~2200ms - 2450ms
  // 0-350ms: AADI entrance
  // 350-1850ms: Progress counts 000 → 100 (1500ms duration)
  // 1850-2100ms: READY holds (~250ms)
  // 2100-2450ms: Shutter exit transition
  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(100);
      progressRef.current = 100;
      setIsReady(true);
      isReadyRef.current = true;
      const timer = setTimeout(() => {
        setIsExiting(true);
        scheduleFinish(300);
      }, 600);
      return () => clearTimeout(timer);
    }

    const START_DELAY = 350; // ms before count starts
    const COUNT_DURATION = 1500; // ms to count from 0 to 100
    const READY_HOLD = 250; // ms to hold READY
    const TOTAL_BEFORE_EXIT = START_DELAY + COUNT_DURATION + READY_HOLD; // ~2100ms

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed < START_DELAY) {
        setProgress(0);
        progressRef.current = 0;
      } else if (elapsed < START_DELAY + COUNT_DURATION) {
        const countElapsed = elapsed - START_DELAY;
        const rawProgress = countElapsed / COUNT_DURATION;
        const currentPct = Math.min(100, Math.floor(rawProgress * 100));
        setProgress(currentPct);
        progressRef.current = currentPct;
      } else {
        setProgress(100);
        progressRef.current = 100;
        if (!isReadyRef.current) {
          setIsReady(true);
          isReadyRef.current = true;
        }
      }

      if (elapsed < TOTAL_BEFORE_EXIT) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setIsExiting(true);
        scheduleFinish(350);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [prefersReducedMotion, scheduleFinish]);

  // Track mouse coordinates for subtle local particle displacement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseRef.current = {
      x: e.clientX,
      y: e.clientY,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  // Canvas 2D Particle Displacement Field
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isMobile = width < 768;
    const particleCount = isMobile ? 32 : 72;

    const particles: Particle[] = [];
    const colors = [
      'rgba(215, 226, 234, ', // 88% Silver/Graphite
      'rgba(215, 226, 234, ',
      'rgba(215, 226, 234, ',
      'rgba(215, 226, 234, ',
      'rgba(215, 226, 234, ',
      'rgba(215, 226, 234, ',
      'rgba(215, 226, 234, ',
      'rgba(215, 226, 234, ',
      'rgba(157, 114, 255, ', // 6% Muted Violet
      'rgba(100, 210, 255, ', // 6% Muted Cyan
    ];

    // Distribute particles with clear immediate visibility
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
        size: Math.random() < 0.8 ? 1.3 : 2.2,
        color: colors[i % colors.length],
        alpha: 0.22 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      const currentProgress = progressRef.current;
      const readyState = isReadyRef.current;
      const cx = width / 2;
      const cy = height / 2;

      // Text displacement elliptical zone
      const textRadiusX = isMobile ? 120 : 170;
      const textRadiusY = isMobile ? 65 : 85;

      // Progressive displacement force
      let forceStrength = 0.45;
      if (currentProgress >= 30 && currentProgress < 75) {
        forceStrength = 0.45 + ((currentProgress - 30) / 45) * 0.6;
      } else if (currentProgress >= 75) {
        forceStrength = 1.05 - ((currentProgress - 75) / 25) * 0.35;
      }

      if (readyState) {
        forceStrength = 0.3;
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Ambient architectural drift
        const driftX = Math.cos(time + p.phase) * (0.45 + (currentProgress / 100) * 0.45);
        const driftY = Math.sin(time + p.phase) * (0.45 + (currentProgress / 100) * 0.45);

        let targetX = p.originX + driftX;
        let targetY = p.originY + driftY;

        // 2. Repulsion from Typography Box
        const dx = p.x - cx;
        const dy = p.y - cy;
        const normalizedDist = Math.sqrt(
          (dx * dx) / (textRadiusX * textRadiusX) + (dy * dy) / (textRadiusY * textRadiusY)
        );

        if (normalizedDist < 1.0) {
          const repelFactor = (1.0 - normalizedDist) * 58 * forceStrength;
          const angle = Math.atan2(dy, dx);
          targetX += Math.cos(angle) * repelFactor;
          targetY += Math.sin(angle) * repelFactor;
        }

        // 3. Subtle Mouse Interaction
        if (mouseRef.current.active) {
          const mdx = p.x - mouseRef.current.x;
          const mdy = p.y - mouseRef.current.y;
          const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
          const mouseRadius = 90;

          if (mouseDist < mouseRadius && mouseDist > 0) {
            const mouseRepel = (1 - mouseDist / mouseRadius) * 22;
            targetX += (mdx / mouseDist) * mouseRepel;
            targetY += (mdy / mouseDist) * mouseRepel;
          }
        }

        // Smooth spring dynamics
        const spring = 0.055;
        const damping = 0.88;
        p.vx = (p.vx + (targetX - p.x) * spring) * damping;
        p.vy = (p.vy + (targetY - p.y) * spring) * damping;
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }

      // Draw faint proximity lattice lines
      const maxConnectDist = isMobile ? 42 : 55;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const cdx = p1.x - p2.x;
          const cdy = p1.y - p2.y;
          const dist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(215, 226, 234, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {!isDone && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading portfolio"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="fixed inset-0 z-[999999] pointer-events-auto select-none overflow-hidden bg-[#0C0C0C]"
        >
          {/* Top & Bottom Shutter Panels for Cinematic Split Reveal */}
          <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
            <motion.div
              key="shutter-top"
              initial={{ y: '0%' }}
              animate={{ y: isExiting ? '-100%' : '0%' }}
              exit={{
                y: '-100%',
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex-1 w-full bg-[#0C0C0C] border-b border-white/[0.04]"
            />
            <motion.div
              key="shutter-bottom"
              initial={{ y: '0%' }}
              animate={{ y: isExiting ? '100%' : '0%' }}
              exit={{
                y: '100%',
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex-1 w-full bg-[#0C0C0C]"
            />
          </div>

          {/* Interactive Particle Displacement Canvas */}
          {!prefersReducedMotion && (
            <motion.canvas
              ref={canvasRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: isExiting ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 pointer-events-none z-10"
            />
          )}

          {/* Loader Foreground Content */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{
              opacity: isExiting ? 0 : 1,
              y: isExiting ? -8 : 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 md:p-12 z-20"
          >
            {/* Top Bar: Minimal Right-aligned SKIP [ESC] */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleSkip}
                className="text-[11px] font-mono tracking-widest text-[#D7E2EA]/40 hover:text-white transition-colors cursor-pointer bg-transparent border-0 outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded px-1.5 py-0.5"
                aria-label="Skip intro animation"
              >
                SKIP [ESC]
              </button>
            </div>

            {/* Center Editorial Branding & Progress */}
            <div className="flex flex-col items-center justify-center my-auto text-center px-4 max-w-xl mx-auto">
              {/* 1. Studio Monogram Name */}
              <div className="flex items-center justify-center gap-2">
                <motion.h1
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 0, filter: 'blur(8px)', y: 8 }
                  }
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="font-black text-4xl sm:text-5xl md:text-6xl uppercase tracking-[0.18em] text-[#F3F4F6] leading-none select-none pl-[0.18em]"
                >
                  Aadi
                </motion.h1>

                {/* 4px Muted Violet Accent Dot */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="w-1 h-1 rounded-full bg-[#9D72FF]/90 shrink-0 self-center"
                  aria-hidden="true"
                />
              </div>

              {/* 2. Supporting Identity Line */}
              <motion.p
                initial={
                  prefersReducedMotion
                    ? { opacity: 0.55 }
                    : { opacity: 0, letterSpacing: '0.28em' }
                }
                animate={{ opacity: 0.55, letterSpacing: '0.22em' }}
                transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
                className="text-[10px] sm:text-[11px] font-mono text-[#D7E2EA] uppercase tracking-[0.22em] mt-4 leading-relaxed max-w-md"
              >
                WEB DESIGN / DEVELOPMENT / INTERACTIVE EXPERIENCES
              </motion.p>

              {/* 3. Thin Progress Line & 3-Digit Tracker */}
              <div className="w-48 sm:w-60 mt-8 flex flex-col items-center gap-2">
                {/* Thin Progress Track */}
                <div className="w-full h-[1px] bg-white/[0.08] relative overflow-hidden">
                  <motion.div
                    className="h-full bg-[#D7E2EA] relative"
                    style={{
                      width: `${progress}%`,
                    }}
                  >
                    {/* Tiny violet endpoint accent */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#9D72FF]" />
                  </motion.div>
                </div>

                {/* 3-Digit Progress Number (000 → 100) */}
                <div className="font-mono text-[11px] text-[#D7E2EA]/60 tracking-wider tabular-nums">
                  {String(progress).padStart(3, '0')}
                </div>

                {/* Status Micro-label (INITIALIZING → READY) */}
                <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#D7E2EA]/40">
                  {isReady ? (
                    <span className="text-[#9D72FF] font-medium">READY</span>
                  ) : (
                    <span>INITIALIZING</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Bar: Left-aligned Metadata */}
            <div className="flex items-center justify-between text-[#D7E2EA]/30 text-[10px] font-mono tracking-widest uppercase">
              <span>PORTFOLIO / 2026</span>
              <span className="invisible pointer-events-none">SPACER</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
