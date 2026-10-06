import React, { useEffect, useRef, useState, ElementType } from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  as?: ElementType;
  style?: React.CSSProperties;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 0.8,
  y = 36,
  x = 0,
  scale = 0.98,
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  className = '',
  as = 'div',
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Use native browser IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Unobserve once triggered
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const Component = (motion as any)[as as string] || (motion as any).div;

  return (
    <Component
      ref={ref}
      initial={{ opacity: 0, y, x, scale }}
      animate={
        isVisible
          ? { opacity: 1, y: 0, x: 0, scale: 1 }
          : { opacity: 0, y, x, scale }
      }
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Apple/Awwwards cinematic smooth deceleration
      }}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
};
