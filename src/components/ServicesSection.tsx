import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { ArrowUpRight } from 'lucide-react';

interface ServiceItem {
  number: string;
  name: string;
  tag: string;
  description: string;
}

const SERVICES: ServiceItem[] = [
  {
    number: '01',
    name: 'WEBSITE DESIGN',
    tag: 'UI/UX & VISUAL SYSTEMS',
    description:
      'Modern, conversion-focused website design with strong hierarchy, typography, layout, and brand presentation.',
  },
  {
    number: '02',
    name: 'WEBSITE DEVELOPMENT',
    tag: 'REACT & MODERN STACK',
    description:
      'Responsive, fast, production-ready websites built with modern frontend technologies and clean architectures.',
  },
  {
    number: '03',
    name: 'UI/UX DESIGN',
    tag: 'INTERFACES & USER FLOWS',
    description:
      'Clear interfaces and user flows designed around usability, clarity, micro-interactions, and business goals.',
  },
  {
    number: '04',
    name: '3D & INTERACTIVE WEB',
    tag: 'MOTION & THREE.JS',
    description:
      'Immersive web experiences using 3D, motion, scroll interactions, and creative frontend techniques.',
  },
  {
    number: '05',
    name: 'WEBSITE REDESIGN',
    tag: 'AUDIT & OPTIMIZATION',
    description:
      'Modernizing weak or outdated websites with better visual design, UX, responsiveness, and performance.',
  },
];

export const ServicesSection: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="bg-[#FFFFFF] text-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-24 sm:py-28 md:py-36 relative z-0"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Heading */}
        <FadeIn delay={0} y={35} className="w-full text-center mb-16 sm:mb-20 md:mb-24">
          <h2
            className="text-[#0C0C0C] font-black uppercase tracking-tight leading-none text-center"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Services
          </h2>
        </FadeIn>

        {/* Interactive Services Editorial Rows */}
        <div className="flex flex-col w-full">
          {SERVICES.map((service, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <FadeIn
                key={service.number}
                delay={index * 0.08}
                y={25}
                className="w-full"
              >
                <div
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`group relative border-t border-[rgba(12,12,12,0.12)] ${
                    index === SERVICES.length - 1 ? 'border-b' : ''
                  } py-8 sm:py-10 md:py-12 flex flex-col md:flex-row md:items-start items-baseline justify-between gap-6 md:gap-12 transition-colors duration-300 cursor-default`}
                >
                  {/* Subtle hover background highlight */}
                  <motion.div
                    aria-hidden="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered && !prefersReducedMotion ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 bg-neutral-100/60 pointer-events-none -z-10 rounded-xl"
                  />

                  {/* Left Number */}
                  <motion.div
                    animate={
                      isHovered && !prefersReducedMotion
                        ? { scale: 1.02, color: '#0C0C0C' }
                        : { scale: 1, color: 'rgba(12, 12, 12, 0.85)' }
                    }
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="font-black leading-none shrink-0 w-24 sm:w-36 md:w-48 select-none tabular-nums"
                    style={{ fontSize: 'clamp(3rem, 9.5vw, 130px)' }}
                  >
                    {service.number}
                  </motion.div>

                  {/* Right: Name + Tag + Description */}
                  <motion.div
                    animate={
                      isHovered && !prefersReducedMotion
                        ? { x: 8 }
                        : { x: 0 }
                    }
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col justify-center flex-1 max-w-2xl"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2 sm:mb-3">
                      <h3
                        className="font-bold uppercase text-[#0C0C0C] tracking-tight leading-tight"
                        style={{ fontSize: 'clamp(1.15rem, 2.3vw, 2.2rem)' }}
                      >
                        {service.name}
                      </h3>

                      {/* Micro capability chip revealing on hover */}
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{
                          opacity: isHovered ? 1 : 0.4,
                          x: isHovered ? 0 : -4,
                        }}
                        transition={{ duration: 0.25 }}
                        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#0C0C0C]/5 text-[#0C0C0C]/70 border border-[#0C0C0C]/10 shrink-0"
                      >
                        <span>{service.tag}</span>
                        <ArrowUpRight size={11} className="text-[#9D72FF]" />
                      </motion.span>
                    </div>

                    <p
                      className="font-normal leading-relaxed text-[#0C0C0C]/70"
                      style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.15rem)' }}
                    >
                      {service.description}
                    </p>
                  </motion.div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};
