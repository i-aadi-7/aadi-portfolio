import React from 'react';
import { FadeIn } from './FadeIn';

interface ServiceItem {
  number: string;
  name: string;
  description: string;
}

const SERVICES: ServiceItem[] = [
  {
    number: '01',
    name: 'WEBSITE DESIGN',
    description:
      'Modern, conversion-focused website design with strong hierarchy, typography, layout, and brand presentation.',
  },
  {
    number: '02',
    name: 'WEBSITE DEVELOPMENT',
    description:
      'Responsive, fast, production-ready websites built with modern frontend technologies.',
  },
  {
    number: '03',
    name: 'UI/UX DESIGN',
    description:
      'Clear interfaces and user flows designed around usability, clarity, and business goals.',
  },
  {
    number: '04',
    name: '3D & INTERACTIVE WEB',
    description:
      'Immersive web experiences using 3D, motion, scroll interactions, and creative frontend techniques.',
  },
  {
    number: '05',
    name: 'WEBSITE REDESIGN',
    description:
      'Modernizing weak or outdated websites with better visual design, UX, responsiveness, and performance.',
  },
];

export const ServicesSection: React.FC = () => {
  return (
    <section
      id="services"
      className="bg-[#FFFFFF] text-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 relative z-0"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Heading */}
        <FadeIn delay={0} y={40} className="w-full text-center mb-16 sm:mb-20 md:mb-28">
          <h2
            className="text-[#0C0C0C] font-black uppercase tracking-tight leading-none text-center"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Services
          </h2>
        </FadeIn>

        {/* Services List */}
        <div className="flex flex-col w-full">
          {SERVICES.map((service, index) => (
            <FadeIn
              key={service.number}
              delay={index * 0.1}
              y={30}
              className={`border-t border-[rgba(12,12,12,0.15)] ${
                index === SERVICES.length - 1 ? 'border-b' : ''
              } py-8 sm:py-10 md:py-12 flex flex-col md:flex-row md:items-start items-baseline justify-between gap-6 md:gap-12 transition-colors duration-300 hover:bg-neutral-50/50`}
            >
              {/* Left Number */}
              <div
                className="font-black text-[#0C0C0C] leading-none shrink-0 w-24 sm:w-36 md:w-48 select-none"
                style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
              >
                {service.number}
              </div>

              {/* Right: Name + Description */}
              <div className="flex flex-col justify-center flex-1 max-w-2xl">
                <h3
                  className="font-medium uppercase text-[#0C0C0C] tracking-wide mb-2 sm:mb-3"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                >
                  {service.name}
                </h3>
                <p
                  className="font-light leading-relaxed text-[#0C0C0C] opacity-60"
                  style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)' }}
                >
                  {service.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
