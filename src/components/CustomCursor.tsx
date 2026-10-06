import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'view' | 'text'>('default');
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Position motion values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for outer ring
  const springConfig = { damping: 25, stiffness: 300, mass: 0.4 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Detect touch / coarse pointer devices
    const hasTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (hasTouch) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (
        target.closest('[data-cursor="view"]') ||
        target.closest('.group') && target.closest('#projects')
      ) {
        setCursorType('view');
      } else if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer')
      ) {
        setCursorType('pointer');
      } else if (
        target.closest('input') ||
        target.closest('textarea')
      ) {
        setCursorType('text');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouchDevice) return null;

  // Variants for the outer morphing ring
  const ringVariants = {
    default: {
      width: 32,
      height: 32,
      backgroundColor: 'rgba(215, 226, 234, 0.03)',
      borderColor: 'rgba(215, 226, 234, 0.35)',
      borderWidth: 1.5,
      scale: isClicking ? 0.8 : 1,
    },
    pointer: {
      width: 52,
      height: 52,
      backgroundColor: 'rgba(182, 0, 168, 0.15)',
      borderColor: 'rgba(215, 226, 234, 0.8)',
      borderWidth: 1.5,
      scale: isClicking ? 0.9 : 1.15,
      boxShadow: '0 0 20px rgba(182, 0, 168, 0.4)',
    },
    view: {
      width: 76,
      height: 76,
      backgroundColor: 'rgba(12, 12, 12, 0.85)',
      borderColor: 'rgba(215, 226, 234, 0.9)',
      borderWidth: 1.5,
      scale: isClicking ? 0.95 : 1,
      boxShadow: '0 0 25px rgba(182, 0, 168, 0.35)',
    },
    text: {
      width: 4,
      height: 24,
      borderRadius: 2,
      backgroundColor: 'rgba(215, 226, 234, 0.8)',
      borderColor: 'transparent',
      borderWidth: 0,
      scale: 1,
    },
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {/* Outer morphing ring */}
      <motion.div
        animate={ringVariants[cursorType]}
        transition={{
          type: 'spring',
          damping: 24,
          stiffness: 320,
          mass: 0.3,
        }}
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        className="fixed top-0 left-0 rounded-full flex items-center justify-center backdrop-blur-[2px] transition-opacity duration-200"
      >
        {cursorType === 'view' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="text-[10px] font-bold tracking-widest text-[#D7E2EA] uppercase select-none font-['Kanit']"
          >
            View
          </motion.span>
        )}
      </motion.div>

      {/* Inner precise dot */}
      {cursorType !== 'text' && (
        <motion.div
          style={{
            x: mouseX,
            y: mouseY,
            translateX: '-50%',
            translateY: '-50%',
            opacity: isVisible ? 1 : 0,
          }}
          animate={{
            scale: isClicking ? 1.5 : cursorType === 'pointer' ? 0.6 : cursorType === 'view' ? 0 : 1,
            backgroundColor:
              cursorType === 'pointer'
                ? '#B600A8'
                : '#D7E2EA',
          }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(215,226,234,0.8)] transition-opacity duration-200"
        />
      )}
    </div>
  );
};
