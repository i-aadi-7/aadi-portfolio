import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { Magnet } from './Magnet';
import { ContactButton } from './ContactButton';
import { HeroParticles } from './HeroParticles';
import { useSmoothScroll } from './SmoothScroll';
import aadiAvatar from '../assets/images/aadi_transparent_avatar.png';

interface HeroSectionProps {
  onContactClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onContactClick }) => {
  const { scrollTo: smoothScrollTo } = useSmoothScroll();

  const scrollTo = (id: string) => {
    smoothScrollTo(`#${id}`);
  };

  return (
    <section
      id="hero"
      className="relative h-screen min-h-[580px] flex flex-col justify-between overflow-x-clip bg-[#0C0C0C] select-none"
      style={{ overflowX: 'clip' }}
    >
      {/* Interactive particle canvas background */}
      <HeroParticles />

      {/* Navbar with only ABOUT and CONTACT */}
      <FadeIn delay={0} y={-20} as="nav" className="w-full z-30">
        <ul className="flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8 text-[#D7E2EA] font-medium uppercase tracking-[0.16em] text-sm md:text-base lg:text-[1.2rem]">
          <li>
            <button
              onClick={() => scrollTo('about')}
              className="hover:opacity-70 transition-opacity duration-200 cursor-pointer uppercase"
            >
              ABOUT
            </button>
          </li>
          <li>
            <button
              onClick={onContactClick || (() => scrollTo('contact'))}
              className="hover:opacity-70 transition-opacity duration-200 cursor-pointer uppercase"
            >
              CONTACT
            </button>
          </li>
        </ul>
      </FadeIn>

      {/* Center Stage: Heading with overlapping centered avatar */}
      <div className="relative flex-1 flex items-center justify-center w-full px-3 sm:px-6 md:px-8">
        {/* Hero Heading: HI, I'M AADI with subtle staggered reveal */}
        <div className="w-full overflow-visible z-10 flex items-center justify-center pointer-events-none">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.15,
                },
              },
            }}
            className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap text-center select-none text-[13vw] sm:text-[14.8vw] md:text-[16vw] lg:text-[17vw] xl:text-[17.1vw] py-2"
          >
            {['HI,', "I'M", 'AADI'].map((word, i) => (
              <React.Fragment key={word}>
                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 35 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.75,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      },
                    },
                  }}
                  className="inline-block hero-heading"
                >
                  {word}
                </motion.span>
                {i < 2 && ' '}
              </React.Fragment>
            ))}
          </motion.h1>
        </div>

        {/* Floating Avatar overlay with Magnet effect */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto w-[clamp(160px,42vw,220px)] sm:w-[clamp(220px,30vw,280px)] md:w-[clamp(280px,34vw,460px)] max-h-[60vh] flex items-center justify-center">
          <FadeIn delay={0.4} y={20}>
            <Magnet
              padding={120}
              strength={18}
              maxDistance={18}
              activeTransition="transform 0.3s ease-out"
              inactiveTransition="transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
              className="w-full flex items-center justify-center"
            >
              <img
                src={aadiAvatar}
                alt="Aadi Avatar"
                className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)] filter"
                loading="eager"
              />
            </Magnet>
          </FadeIn>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-30 flex justify-between items-end px-6 md:px-10 pb-7 sm:pb-8 md:pb-10 w-full">
        {/* Left tagline */}
        <FadeIn delay={0.35} y={20} className="max-w-[210px] sm:max-w-[260px] md:max-w-[320px]">
          <p className="text-[#D7E2EA] font-light uppercase tracking-wider leading-snug text-[0.68rem] xs:text-[0.74rem] sm:text-xs md:text-sm lg:text-[0.95rem]">
            <span className="block whitespace-nowrap">WEB DESIGNER &amp; DEVELOPER</span>
            <span className="block whitespace-nowrap">CRAFTING MODERN, INTERACTIVE</span>
            <span className="block whitespace-nowrap">DIGITAL EXPERIENCES</span>
          </p>
        </FadeIn>

        {/* Right Contact Button */}
        <FadeIn delay={0.5} y={20}>
          <ContactButton onClick={onContactClick} />
        </FadeIn>
      </div>
    </section>
  );
};
