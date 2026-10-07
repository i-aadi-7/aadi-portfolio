import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSmoothScroll } from './SmoothScroll';

const SECTIONS = [
  { id: 'hero', label: 'Intro' },
  { id: 'marquee', label: 'Preview' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'projects', label: 'Projects' },
];

interface CachedSection {
  id: string;
  offsetTop: number;
}

export const SectionTracker: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);
  const { scrollTo: smoothScrollTo } = useSmoothScroll();

  const activeSectionRef = useRef(activeSection);
  const isVisibleRef = useRef(isVisible);
  const cachedOffsetsRef = useRef<CachedSection[]>([]);

  useEffect(() => {
    // Only run tracking on desktop (md breakpoint: >= 768px)
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const calculateOffsets = () => {
      const cached: CachedSection[] = [];
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          cached.push({
            id: sec.id,
            offsetTop: rect.top + window.scrollY,
          });
        }
      }
      cachedOffsetsRef.current = cached;
    };

    const updateActiveSection = () => {
      const scrollY = window.scrollY;
      const newVisible = scrollY > 200;

      if (newVisible !== isVisibleRef.current) {
        isVisibleRef.current = newVisible;
        setIsVisible(newVisible);
      }

      if (!newVisible && scrollY <= 200) {
        if (activeSectionRef.current !== 'hero') {
          activeSectionRef.current = 'hero';
          setActiveSection('hero');
        }
        return;
      }

      const scrollPosition = scrollY + window.innerHeight / 3;
      const cached = cachedOffsetsRef.current;

      for (let i = cached.length - 1; i >= 0; i--) {
        if (cached[i].offsetTop <= scrollPosition) {
          const id = cached[i].id;
          if (id !== activeSectionRef.current) {
            activeSectionRef.current = id;
            setActiveSection(id);
          }
          break;
        }
      }
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateActiveSection();
      });
    };

    const handleResize = () => {
      calculateOffsets();
      updateActiveSection();
    };

    let cleanupListeners: (() => void) | null = null;

    const setupTracking = () => {
      calculateOffsets();
      updateActiveSection();

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });

      // Observe body for layout changes (e.g., dynamic content, image load)
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          calculateOffsets();
          updateActiveSection();
        });
        resizeObserver.observe(document.body);
      }

      // Recalculate once fonts load to account for layout shifts
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          calculateOffsets();
          updateActiveSection();
        });
      }

      cleanupListeners = () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver = null;
        }
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };
    };

    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        if (!cleanupListeners) {
          setupTracking();
        }
      } else {
        if (cleanupListeners) {
          cleanupListeners();
          cleanupListeners = null;
        }
        if (isVisibleRef.current) {
          isVisibleRef.current = false;
          setIsVisible(false);
        }
      }
    };

    if (mediaQuery.matches) {
      setupTracking();
    }

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      if (cleanupListeners) {
        cleanupListeners();
      }
    };
  }, []);

  const scrollTo = (id: string) => {
    smoothScrollTo(`#${id}`);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3 py-3 px-2 rounded-full bg-neutral-900/60 backdrop-blur-md border border-white/10 shadow-2xl"
    >
      {SECTIONS.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => scrollTo(sec.id)}
            className="group relative flex items-center justify-end p-1.5 focus:outline-none cursor-pointer"
            aria-label={`Jump to ${sec.label} section`}
          >
            {/* Tooltip on hover */}
            <span className="absolute right-7 px-2.5 py-1 rounded-md bg-neutral-900/90 border border-white/10 text-[11px] uppercase tracking-wider text-[#D7E2EA] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap">
              {sec.label}
            </span>

            {/* Indicator Dot/Pill */}
            <div
              className={`transition-all duration-300 rounded-full ${
                isActive
                  ? 'w-2 h-6 bg-gradient-to-b from-[#BBCCD7] to-[#B600A8] shadow-[0_0_8px_rgba(182,0,168,0.6)]'
                  : 'w-2 h-2 bg-[#D7E2EA]/30 group-hover:bg-[#D7E2EA]/70'
              }`}
            />
          </button>
        );
      })}
    </motion.div>
  );
};
