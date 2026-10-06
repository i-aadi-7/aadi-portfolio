import React, { ElementType, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  as?: ElementType;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.75,
  x = 0,
  y = 30,
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  className = '',
  as = 'div',
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setIsVisible(true);
    }
  }, [threshold, rootMargin]);

  const Component = (motion as any)[as as string] || (motion as any).div;

  return (
    <Component
      ref={ref}
      initial={{ opacity: 0, x, y }}
      animate={
        isVisible
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x, y }
      }
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Silky smooth deceleration curve
      }}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
};
