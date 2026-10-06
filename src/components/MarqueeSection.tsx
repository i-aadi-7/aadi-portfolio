import React from 'react';
import { ScrollTextMarquee } from './ui/scroll-text-marquee';
import { ContactButton } from './ContactButton';
import { ScrollReveal } from './ScrollReveal';
import { useSmoothScroll } from './SmoothScroll';

interface MarqueeSectionProps {
  onContactClick?: () => void;
}

export const MarqueeSection: React.FC<MarqueeSectionProps> = ({ onContactClick }) => {
  const { scrollTo: smoothScrollTo } = useSmoothScroll();

  const handleContact = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      smoothScrollTo('#contact');
    }
  };

  return (
    <section
      id="marquee"
      className="bg-[#0C0C0C] pt-24 sm:pt-32 md:pt-40 pb-24 sm:pb-32 overflow-hidden relative w-full select-none"
    >
      {/* Soft left/right gradient masks: text fades in/out progressively without hard clipping */}
      <div
        className="w-full flex flex-col gap-3 sm:gap-4 md:gap-5 relative"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
        }}
      >
        {/* ROW 1: baseVelocity = -2.5, metallic gradient typography reduced by ~10% for spacious breathing */}
        <ScrollTextMarquee
          baseVelocity={-2.5}
          scrollDependent={true}
          className="py-1"
        >
          <div className="flex items-center text-[7.8vw] sm:text-[6.8vw] md:text-[5.8vw] lg:text-[5.4vw] font-black uppercase tracking-tight leading-[0.88] whitespace-nowrap pr-16 sm:pr-24 md:pr-32">
            <span className="inline-block hero-heading">WEB DESIGN</span>
            <span className="text-[#BBCCD7]/30 font-light mx-8 sm:mx-12 md:mx-16">—</span>

            <span className="inline-block hero-heading">UI/UX</span>
            <span className="text-[#BBCCD7]/30 font-light mx-8 sm:mx-12 md:mx-16">—</span>

            <span className="inline-block hero-heading">INTERACTIVE WEB</span>
            <span className="text-[#BBCCD7]/30 font-light mx-8 sm:mx-12 md:mx-16">—</span>

            <span className="inline-block hero-heading">3D EXPERIENCES</span>
            <span className="text-[#BBCCD7]/30 font-light mx-8 sm:mx-12 md:mx-16">—</span>
          </div>
        </ScrollTextMarquee>

        {/* ROW 2: baseVelocity = 2.5, brighter 1.8px stroke with subtle edge glow & transparent fill */}
        <ScrollTextMarquee
          baseVelocity={2.5}
          scrollDependent={true}
          className="py-1"
        >
          <div className="flex items-center text-[7.8vw] sm:text-[6.8vw] md:text-[5.8vw] lg:text-[5.4vw] font-black uppercase tracking-tight leading-[0.88] whitespace-nowrap pr-16 sm:pr-24 md:pr-32">
            <span
              className="inline-block"
              style={{
                WebkitTextStroke: '1.8px rgba(235, 244, 252, 0.9)',
                color: 'transparent',
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.15))',
              }}
            >
              WEB DEVELOPMENT
            </span>
            <span className="text-[#BBCCD7]/30 font-light mx-8 sm:mx-12 md:mx-16">—</span>

            {/* Subtle Cyan Edge Accent */}
            <span
              className="inline-block"
              style={{
                WebkitTextStroke: '2px #00D4FF',
                color: 'transparent',
                filter: 'drop-shadow(0 0 12px rgba(0, 212, 255, 0.4))',
              }}
            >
              MOTION
            </span>
            <span className="text-[#BBCCD7]/30 font-light mx-8 sm:mx-12 md:mx-16">—</span>

            {/* Subtle Violet Edge Accent */}
            <span
              className="inline-block"
              style={{
                WebkitTextStroke: '2px #C511B6',
                color: 'transparent',
                filter: 'drop-shadow(0 0 12px rgba(197, 17, 182, 0.4))',
              }}
            >
              CREATIVE DEVELOPMENT
            </span>
            <span className="text-[#BBCCD7]/30 font-light mx-8 sm:mx-12 md:mx-16">—</span>

            <span
              className="inline-block"
              style={{
                WebkitTextStroke: '1.8px rgba(235, 244, 252, 0.9)',
                color: 'transparent',
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.15))',
              }}
            >
              RESPONSIVE DESIGN
            </span>
            <span className="text-[#BBCCD7]/30 font-light mx-8 sm:mx-12 md:mx-16">—</span>
          </div>
        </ScrollTextMarquee>
      </div>

      {/* Centered Transition CTA */}
      <div className="mt-20 sm:mt-28 md:mt-32 max-w-4xl mx-auto px-6 text-center flex flex-col items-center relative z-10">
        <ScrollReveal y={30} duration={0.8} threshold={0.15}>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-tight">
            Got an idea?
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BBCCD7] via-[#B600A8] to-[#BE4C00]">
              Let&apos;s build it.
            </span>
          </h2>

          <p className="mt-4 sm:mt-6 text-xs sm:text-sm md:text-base font-light uppercase tracking-widest text-[#D7E2EA]/60 max-w-xl mx-auto leading-relaxed">
            Turning ideas into fast, polished, interactive web experiences.
          </p>

          <div className="mt-8 sm:mt-10">
            <ContactButton onClick={handleContact} label="Contact Me" />
          </div>
        </ScrollReveal>
      </div>

      {/* Architectural subtle dark gradient transition into About section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-44 bg-gradient-to-b from-transparent via-[#0C0C0C]/80 to-[#0C0C0C] pointer-events-none" />
    </section>
  );
};
