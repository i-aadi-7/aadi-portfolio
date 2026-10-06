import React, { useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  wrap,
} from 'framer-motion';
import { cn } from '@/src/lib/utils';

export interface ScrollTextMarqueeProps {
  children: React.ReactNode;
  baseVelocity?: number;
  className?: string;
  scrollDependent?: boolean;
  delay?: number;
}

export function ScrollTextMarquee({
  children,
  baseVelocity = 5,
  className,
  scrollDependent = true,
}: ScrollTextMarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const prefersReducedMotion = useReducedMotion();

  /**
   * Wrap -45% to -20% across 4 repetitions ensures a continuous 25% modulus loop
   */
  const x = useTransform(baseX, (v) => `${wrap(-45, -20, v)}%`);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((t, delta) => {
    // If reduced motion is requested, use very slow constant crawl without velocity-driven bursts
    if (prefersReducedMotion) {
      const moveBy = baseVelocity * 0.15 * (delta / 1000);
      baseX.set(baseX.get() + moveBy);
      return;
    }

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (scrollDependent) {
      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap select-none w-full">
      <motion.div
        className={cn('flex whitespace-nowrap flex-nowrap will-change-transform', className)}
        style={{ x }}
      >
        <span className="block flex-shrink-0">{children}</span>
        <span className="block flex-shrink-0">{children}</span>
        <span className="block flex-shrink-0">{children}</span>
        <span className="block flex-shrink-0">{children}</span>
      </motion.div>
    </div>
  );
}
