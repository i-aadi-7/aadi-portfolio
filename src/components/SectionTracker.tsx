import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSmoothScroll } from './SmoothScroll';

const SECTIONS = [
  { id: 'hero', label: 'Intro' },
  { id: 'marquee', label: 'Preview' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'projects', label: 'Projects' },
];

export const SectionTracker: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);
  const { scrollTo: smoothScrollTo } = useSmoothScroll();

  useEffect(() => {
    const handleScroll = () => {
      // Show tracker once scrolled a bit past top
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
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
