import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

interface AvatarMagnetProps {
  children: React.ReactNode;
  className?: string;
  maxMovementX?: number; // 18px
  maxMovementY?: number; // 12px
  maxRotateX?: number;   // 5deg
  maxRotateY?: number;   // 7deg
}

export const AvatarMagnet: React.FC<AvatarMagnetProps> = ({
  children,
  className = '',
  maxMovementX = 18,
  maxMovementY = 12,
  maxRotateX = 5,
  maxRotateY = 7,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Smooth spring physics for natural tactile momentum and spring-like return
  const springConfig = { damping: 24, stiffness: 220, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  useEffect(() => {
    // Disable if user prefers reduced motion
    if (shouldReduceMotion) return;

    // Disable on touch devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const activationDistance = 550;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (dist < activationDistance) {
        const normX = deltaX / (rect.width / 2 + 80);
        const normY = deltaY / (rect.height / 2 + 80);

        const targetX = Math.max(-maxMovementX, Math.min(maxMovementX, normX * maxMovementX));
        const targetY = Math.max(-maxMovementY, Math.min(maxMovementY, normY * maxMovementY));

        x.set(targetX);
        y.set(targetY);

        // Subtle 3D tilt tracking pointer
        rotateY.set(Math.max(-maxRotateY, Math.min(maxRotateY, (targetX / maxMovementX) * maxRotateY)));
        rotateX.set(Math.max(-maxRotateX, Math.min(maxRotateX, -(targetY / maxMovementY) * maxRotateX)));
      } else {
        // Smooth return to resting center
        x.set(0);
        y.set(0);
        rotateX.set(0);
        rotateY.set(0);
      }
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
      rotateX.set(0);
      rotateY.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [shouldReduceMotion, maxMovementX, maxMovementY, maxRotateX, maxRotateY, x, y, rotateX, rotateY]);

  return (
    <div
      ref={containerRef}
      style={{ perspective: 1000 }}
      className={`relative ${className}`}
    >
      <motion.div
        style={{
          x: shouldReduceMotion ? 0 : smoothX,
          y: shouldReduceMotion ? 0 : smoothY,
          rotateX: shouldReduceMotion ? 0 : smoothRotateX,
          rotateY: shouldReduceMotion ? 0 : smoothRotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        className="w-full h-full flex items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
};
