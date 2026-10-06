import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  onLoadingComplete?: () => void;
}

const PHASES = [
  'INITIALIZING SYSTEM CORE',
  'COMPILING WEBGL SHADERS',
  'STREAMING INTERACTIVE ASSETS',
  'CALIBRATING VIEWPORT PIPELINE',
  'STUDIO ENVIRONMENT READY',
];

export const PageTransition: React.FC<PageTransitionProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fast satisfying loading sequence
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1900; // ms

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      const pIndex = Math.min(
        PHASES.length - 1,
        Math.floor((pct / 100) * PHASES.length)
      );
      setPhaseIndex(pIndex);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          onLoadingComplete?.();
        }, 320);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  // Realtime 3D Wireframe Polyhedron Rotation in Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;

    // 3D Octahedron vertices [x, y, z]
    const size = 52;
    const vertices = [
      [0, -size * 1.25, 0],
      [0, size * 1.25, 0],
      [-size, 0, -size],
      [size, 0, -size],
      [size, 0, size],
      [-size, 0, size],
    ];

    // Edges connecting vertices
    const edges = [
      [0, 2], [0, 3], [0, 4], [0, 5], // Top pyramid
      [1, 2], [1, 3], [1, 4], [1, 5], // Bottom pyramid
      [2, 3], [3, 4], [4, 5], [5, 2], // Equatorial ring
    ];

    // Inner orbiting core cube
    const innerSize = 22;
    const innerVertices = [
      [-innerSize, -innerSize, -innerSize],
      [innerSize, -innerSize, -innerSize],
      [innerSize, innerSize, -innerSize],
      [-innerSize, innerSize, -innerSize],
      [-innerSize, -innerSize, innerSize],
      [innerSize, -innerSize, innerSize],
      [innerSize, innerSize, innerSize],
      [-innerSize, innerSize, innerSize],
    ];

    const innerEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      angleX += 0.018;
      angleY += 0.024;
      angleZ += 0.012;

      const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ), sinZ = Math.sin(angleZ);

      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        let x1 = x * cosY + z * sinY;
        let y1 = y;
        let z1 = -x * sinY + z * cosY;

        // Rotate X
        let x2 = x1;
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        // Rotate Z
        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        const fov = 260;
        const scale = fov / (fov + z3 + 180);
        return {
          px: cx + x3 * scale,
          py: cy + y3 * scale,
          scale,
        };
      };

      // 1. Draw outer rotating octahedron
      const projected = vertices.map((v) => project(v[0], v[1], v[2]));

      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(187, 204, 215, 0.45)';

      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i].px, projected[i].py);
        ctx.lineTo(projected[j].px, projected[j].py);
        ctx.stroke();
      });

      // Vertices nodes
      projected.forEach((p) => {
        ctx.fillStyle = '#B600A8';
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw counter-rotating inner core cube
      const innerCosX = Math.cos(-angleX * 1.4);
      const innerSinX = Math.sin(-angleX * 1.4);
      const innerCosY = Math.cos(-angleY * 1.4);
      const innerSinY = Math.sin(-angleY * 1.4);

      const projectInner = (x: number, y: number, z: number) => {
        let x1 = x * innerCosY + z * innerSinY;
        let y1 = y;
        let z1 = -x * innerSinY + z * innerCosY;
        let x2 = x1;
        let y2 = y1 * innerCosX - z1 * innerSinX;
        let z2 = y1 * innerSinX + z1 * innerCosX;
        const fov = 260;
        const scale = fov / (fov + z2 + 180);
        return {
          px: cx + x2 * scale,
          py: cy + y2 * scale,
        };
      };

      const innerProjected = innerVertices.map((v) =>
        projectInner(v[0], v[1], v[2])
      );

      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(182, 0, 168, 0.7)';
      innerEdges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(innerProjected[i].px, innerProjected[i].py);
        ctx.lineTo(innerProjected[j].px, innerProjected[j].py);
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSkip = () => {
    setIsDone(true);
    onLoadingComplete?.();
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <div className="fixed inset-0 z-[999999] pointer-events-auto select-none overflow-hidden">
          {/* 5 Staggered Architectural Shutter Panels for Cinematic Curtain Reveal */}
          <div className="absolute inset-0 flex flex-row pointer-events-none">
            {[0, 1, 2, 3, 4].map((colIndex) => (
              <motion.div
                key={`shutter-${colIndex}`}
                initial={{ y: '0%' }}
                exit={{
                  y: '-100%',
                  transition: {
                    duration: 0.8,
                    delay: colIndex * 0.05,
                    ease: [0.85, 0, 0.15, 1], // Architectural cubic bezier sweep
                  },
                }}
                className="flex-1 h-full bg-[#0C0C0C] border-r border-white/[0.04] last:border-r-0 relative"
              />
            ))}
          </div>

          {/* Loader Foreground Interface */}
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.25 },
            }}
            className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 md:p-14 z-10"
          >
            {/* Top Telemetry Header */}
            <div className="flex items-center justify-between text-[#D7E2EA]/60 text-xs uppercase tracking-widest font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">AADI STUDIO V1.0</span>
                <span className="hidden sm:inline text-white/30">|</span>
                <span className="hidden sm:inline text-white/40">
                  WEB DESIGN / DEVELOPMENT / INTERACTIVE EXPERIENCES
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-[#D7E2EA]/40 text-[11px]">
                  FPS 60 · OCTANE RENDER
                </span>
                <button
                  onClick={handleSkip}
                  className="px-3 py-1 rounded-full border border-white/20 text-[10px] text-white/70 hover:text-white hover:border-white transition-colors cursor-pointer"
                >
                  SKIP [ESC]
                </button>
              </div>
            </div>

            {/* Central 3D Polyhedron & Typography Core */}
            <div className="flex flex-col items-center justify-center my-auto relative">
              {/* Rotating Wireframe 3D Canvas */}
              <div className="relative mb-6">
                <canvas
                  ref={canvasRef}
                  width={220}
                  height={220}
                  className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]"
                />
                {/* Crosshair accents */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-[1px] bg-[#BBCCD7]/30" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-[1px] bg-[#BBCCD7]/30" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-[1px] bg-[#BBCCD7]/30" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-3 w-[1px] bg-[#BBCCD7]/30" />
              </div>

              {/* Monogram Name */}
              <h2 className="hero-heading font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight leading-none text-center">
                Aadi
              </h2>

              {/* Dynamic Status Phase */}
              <div className="h-6 flex items-center justify-center mt-3">
                <p className="text-[#D7E2EA]/70 text-[11px] sm:text-xs font-mono tracking-[0.25em] uppercase text-center transition-all duration-300">
                  {PHASES[phaseIndex]}
                </p>
              </div>

              {/* Giant Numerical Percentage Counter */}
              <div className="mt-4 font-mono font-light flex items-baseline">
                <span className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#BBCCD7] via-[#B600A8] to-[#BE4C00] tracking-tighter">
                  {String(progress).padStart(3, '0')}
                </span>
                <span className="text-[#D7E2EA]/40 font-normal text-xl sm:text-2xl ml-1">%</span>
              </div>

              {/* Precision Segmented Progress Bar */}
              <div className="w-56 sm:w-80 h-[2px] bg-neutral-900 rounded-full mt-5 overflow-hidden relative border border-white/5">
                <motion.div
                  className="h-full"
                  style={{
                    width: `${progress}%`,
                    background:
                      'linear-gradient(90deg, #646973 0%, #BBCCD7 25%, #7621B0 55%, #B600A8 85%, #BE4C00 100%)',
                    boxShadow: '0 0 14px rgba(182, 0, 168, 0.8)',
                  }}
                />
              </div>
            </div>

            {/* Bottom Viewport Metadata */}
            <div className="flex items-center justify-between text-[#D7E2EA]/40 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">
              <span>FOCAL: 50MM F/1.4</span>
              <span className="hidden sm:inline">COORDINATES: 37.7749° N, 122.4194° W</span>
              <span>RENDER BUFFER: 100% READY</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
