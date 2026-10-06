import React, { useEffect } from 'react';
import { sound } from '../utils/soundManager';

export const SoundInteractionListener: React.FC = () => {
  useEffect(() => {
    let lastInteractiveEl: Element | null = null;
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();

    const handlePointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, [role="button"], .cursor-pointer, [data-cursor], input, textarea'
      );

      if (interactive) {
        if (interactive !== lastInteractiveEl) {
          lastInteractiveEl = interactive;
          sound.playHover();
        }
      } else {
        lastInteractiveEl = null;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, [role="button"], .cursor-pointer, [data-cursor]'
      );

      if (interactive) {
        sound.playClick();
      }
    };

    // Scroll whoosh listener tracking scroll velocity
    const handleScroll = () => {
      const currentY = window.scrollY;
      const now = Date.now();
      const dt = Math.max(1, now - lastScrollTime);
      const distance = Math.abs(currentY - lastScrollY);
      const velocity = distance / dt;

      // Trigger whoosh on natural scroll momentum
      if (velocity > 0.32) {
        sound.playScrollWhoosh(velocity * 1.2);
      }

      lastScrollY = currentY;
      lastScrollTime = now;
    };

    // Wheel flick whoosh listener for trackpads & mice
    const handleWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY);
      if (delta > 28) {
        sound.playScrollWhoosh(delta / 45);
      }
    };

    document.addEventListener('mouseover', handlePointerOver, { passive: true, capture: true });
    document.addEventListener('pointerdown', handlePointerDown, { passive: true, capture: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      document.removeEventListener('mouseover', handlePointerOver, { capture: true });
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return null;
};
