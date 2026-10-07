import React, { useCallback, useEffect, useRef } from 'react';

interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const supportsMagnetRef = useRef(false);

  const resetPosition = useCallback(() => {
    const target = targetRef.current;
    if (!target) return;

    activeRef.current = false;
    target.style.transition = inactiveTransition;
    target.style.transform = 'translate3d(0px, 0px, 0)';
  }, [inactiveTransition]);

  const updatePosition = useCallback(() => {
    frameRef.current = null;

    const container = containerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;

    const rect = container.getBoundingClientRect();

    const mouseX = pointerRef.current.x;
    const mouseY = pointerRef.current.y;
    const isInside =
      mouseX >= rect.left - padding &&
      mouseX <= rect.right + padding &&
      mouseY >= rect.top - padding &&
      mouseY <= rect.bottom + padding;

    if (!isInside) {
      if (activeRef.current) resetPosition();
      return;
    }

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (mouseX - centerX) / strength;
    const deltaY = (mouseY - centerY) / strength;

    activeRef.current = true;
    target.style.transition = activeTransition;
    target.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
  }, [activeTransition, padding, resetPosition, strength]);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!supportsMagnetRef.current) return;

      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updatePosition);
      }
    },
    [updatePosition]
  );

  const handleMouseLeave = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    resetPosition();
  }, [resetPosition]);

  useEffect(() => {
    const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleInputPreferenceChange = () => {
      supportsMagnetRef.current = hoverMedia.matches && !reducedMotionMedia.matches;
      if (!supportsMagnetRef.current) handleMouseLeave();
    };
    handleInputPreferenceChange();

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('blur', handleMouseLeave);
    hoverMedia.addEventListener('change', handleInputPreferenceChange);
    reducedMotionMedia.addEventListener('change', handleInputPreferenceChange);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('blur', handleMouseLeave);
      hoverMedia.removeEventListener('change', handleInputPreferenceChange);
      reducedMotionMedia.removeEventListener('change', handleInputPreferenceChange);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [handleMouseLeave, handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
    >
      <div
        ref={targetRef}
        className="relative flex w-full items-center justify-center"
        style={{
          transform: 'translate3d(0px, 0px, 0)',
          transition: inactiveTransition,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};
