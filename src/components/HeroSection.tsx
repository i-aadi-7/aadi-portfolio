import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { Magnet } from './Magnet';
import { ContactButton } from './ContactButton';
import { HeroParticles } from './HeroParticles';
import { useSmoothScroll } from './SmoothScroll';

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
      className="relative h-screen flex flex-col justify-between overflow-x-clip bg-[#0C0C0C] select-none"
      style={{ overflowX: 'clip' }}
    >
      {/* Interactive particle canvas background */}
      <HeroParticles />

      {/* Navbar with only ABOUT and CONTACT */}
      <FadeIn delay={0} y={-20} as="nav" className="w-full z-20">
        <ul className="flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8 text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem]">
          <li>
            <button
              onClick={() => scrollTo('about')}
              className="hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            >
              About
            </button>
          </li>
          <li>
            <button
              onClick={onContactClick || (() => scrollTo('contact'))}
              className="hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            >
              Contact
            </button>
          </li>
        </ul>
      </FadeIn>

      {/* Hero Heading: HI, I'M AADI with subtle staggered reveal */}
      <div className="w-full overflow-hidden mt-6 sm:mt-4 md:-mt-5 z-0">
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
          className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap w-full text-center text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]"
        >
          {['Hi,', "i'm", 'aadi'].map((word, i) => (
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
                {word === "i'm" ? <>i&apos;m</> : word}
              </motion.span>
              {i < 2 && ' '}
            </React.Fragment>
          ))}
        </motion.h1>
      </div>

      {/* Original Hero Portrait with Magnet effect */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10 w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0 pointer-events-auto">
        <FadeIn delay={0.6} y={30}>
          <Magnet
            padding={150}
            strength={3}
            activeTransition="transform 0.3s ease-out"
            inactiveTransition="transform 0.6s ease-in-out"
            className="w-full flex items-center justify-center"
          >
            <img
              src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png"
              alt="Hero Portrait"
              className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              loading="eager"
            />
          </Magnet>
        </FadeIn>
      </div>

      {/* Bottom bar */}
      <div className="relative z-20 flex justify-between items-end px-6 md:px-10 pb-7 sm:pb-8 md:pb-10 w-full">
        {/* Left tagline */}
        <FadeIn delay={0.35} y={20} className="max-w-[160px] sm:max-w-[220px] md:max-w-[260px]">
          <p
            className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            web designer &amp; developer
            <br />
            crafting modern, interactive
            <br />
            digital experiences
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
