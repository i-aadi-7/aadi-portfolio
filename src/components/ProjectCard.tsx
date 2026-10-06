import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LiveProjectButton } from './LiveProjectButton';

export interface ProjectData {
  number: string;
  name: string;
  category: string;
  col1Img1: string;
  col1Img2: string;
  col2Img: string;
  liveUrl?: string;
}

interface ProjectCardProps {
  project: ProjectData;
  index: number;
  totalCards: number;
  onLiveProjectClick: (project: ProjectData) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  totalCards,
  onLiveProjectClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Card stacking scale calculation (when sticky)
  const targetScale = 1 - (totalCards - 1 - index) * 0.03;

  const { scrollYProgress: stackProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const scale = useTransform(stackProgress, [0, 1], [1, targetScale]);

  // Multi-plane image parallax tracking viewport entry and traversal
  const { scrollYProgress: parallaxProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Different directional offsets create rich multi-plane optical depth
  const yParallax1 = useTransform(parallaxProgress, [0, 1], [-24, 24]);
  const yParallax2 = useTransform(parallaxProgress, [0, 1], [28, -28]);
  const yParallaxHero = useTransform(parallaxProgress, [0, 1], [-42, 42]);
  const scaleHero = useTransform(parallaxProgress, [0, 0.5, 1], [1.16, 1.08, 1.16]);

  // Native IntersectionObserver for subtle slide-up & fade-in reveal
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setIsInView(true);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[85vh] sm:h-[90vh] flex items-start justify-center sticky top-24 md:top-32"
      style={{
        top: `calc(clamp(5.5rem, 10vh, 8.5rem) + ${index * 28}px)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.96 }}
        animate={
          isInView
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 48, scale: 0.96 }
        }
        transition={{
          duration: 0.85,
          delay: index * 0.06,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
        style={{
          scale,
          transformOrigin: 'top center',
        }}
        className="w-full max-w-6xl mx-auto rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8 flex flex-col justify-between shadow-[0_25px_60px_rgba(0,0,0,0.9)] will-change-transform"
      >
        {/* Top row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 sm:pb-6 md:pb-8 border-b border-[#D7E2EA]/20">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-wrap">
            {/* Number */}
            <span
              className="font-black text-[#D7E2EA] leading-none select-none"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5rem)' }}
            >
              {project.number}
            </span>

            {/* Category and Name */}
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-widest text-[#D7E2EA]/60 uppercase">
                {project.category}
              </span>
              <h3 className="font-medium uppercase text-base sm:text-xl md:text-2xl lg:text-3xl text-[#D7E2EA] tracking-wide">
                {project.name}
              </h3>
            </div>
          </div>

          {/* Live Project Button */}
          <LiveProjectButton
            onClick={() => onLiveProjectClick(project)}
            label="Live Project"
          />
        </div>

        {/* Bottom row: Two-column image grid */}
        <div className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6 md:pt-8 flex-1">
          {/* Left column (40% width / 5 cols) */}
          <div className="col-span-12 sm:col-span-5 flex flex-col gap-3 sm:gap-4 md:gap-6 justify-between">
            {/* Left top image */}
            <div
              data-cursor="view"
              className="w-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px] overflow-hidden bg-neutral-900 border border-neutral-800 shadow-md group relative cursor-pointer"
              style={{ height: 'clamp(130px, 16vw, 230px)' }}
              onClick={() => onLiveProjectClick(project)}
            >
              <motion.img
                src={project.col1Img1}
                alt={`${project.name} asset 1`}
                loading="lazy"
                style={{
                  y: yParallax1,
                  scale: 1.15,
                }}
                className="w-full h-full object-cover will-change-transform transition-[filter] duration-500 group-hover:brightness-110"
              />
            </div>

            {/* Left bottom image */}
            <div
              data-cursor="view"
              className="w-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px] overflow-hidden bg-neutral-900 border border-neutral-800 shadow-md group relative cursor-pointer"
              style={{ height: 'clamp(160px, 22vw, 340px)' }}
              onClick={() => onLiveProjectClick(project)}
            >
              <motion.img
                src={project.col1Img2}
                alt={`${project.name} asset 2`}
                loading="lazy"
                style={{
                  y: yParallax2,
                  scale: 1.15,
                }}
                className="w-full h-full object-cover will-change-transform transition-[filter] duration-500 group-hover:brightness-110"
              />
            </div>
          </div>

          {/* Right column (60% width / 7 cols) - 1 tall image */}
          <div
            data-cursor="view"
            className="col-span-12 sm:col-span-7 rounded-[40px] sm:rounded-[50px] md:rounded-[60px] overflow-hidden bg-neutral-900 border border-neutral-800 shadow-md group relative min-h-[220px] sm:min-h-full cursor-pointer"
            onClick={() => onLiveProjectClick(project)}
          >
            <motion.img
              src={project.col2Img}
              alt={`${project.name} highlight showcase`}
              loading="lazy"
              style={{
                y: yParallaxHero,
                scale: scaleHero,
              }}
              className="w-full h-full object-cover will-change-transform transition-[filter] duration-500 group-hover:brightness-110"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
