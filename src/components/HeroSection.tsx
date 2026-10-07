import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { Magnet } from './Magnet';
import { ContactButton } from './ContactButton';
import { HeroParticles } from './HeroParticles';
import { useSmoothScroll } from './SmoothScroll';
import aadiAvatarPng from '../assets/images/aadi_transparent_avatar.png';
import aadiAvatarWebp from '../assets/images/aadi_transparent_avatar.webp';
import aadiAvatarAvif from '../assets/images/aadi_transparent_avatar.avif';

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

      {/* Clean, confident navbar */}
      <FadeIn delay={0} y={-20} className="w-full z-30">
        <nav aria-label="Primary navigation">
          <ul className="flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8 text-[#D7E2EA] font-medium uppercase tracking-[0.16em] text-sm md:text-base lg:text-[1.2rem]">
            <li>
              <button
                onClick={() => scrollTo('about')}
                className="inline-flex min-h-11 -my-3.5 items-center hover:opacity-70 transition-opacity duration-200 cursor-pointer uppercase font-mono text-xs sm:text-sm tracking-[0.2em]"
              >
                ABOUT
              </button>
            </li>
            <li>
              <button
                onClick={onContactClick || (() => scrollTo('contact'))}
                className="inline-flex min-h-11 -my-3.5 items-center hover:opacity-70 transition-opacity duration-200 cursor-pointer uppercase font-mono text-xs sm:text-sm tracking-[0.2em]"
              >
                CONTACT
              </button>
            </li>
          </ul>
        </nav>
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
            className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap text-center select-none text-[15.2vw] sm:text-[14.8vw] md:text-[16vw] lg:text-[17vw] xl:text-[17.1vw] py-2 -translate-y-5 md:translate-y-0"
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
                        ease: [0.22, 1, 0.36, 1],
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

        {/* Floating Avatar overlay with cursor-driven depth and ambient shadow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto w-[clamp(260px,72vw,330px)] sm:w-[clamp(240px,32vw,300px)] md:w-[clamp(280px,34vw,460px)] max-h-[60vh] flex items-center justify-center">
          <FadeIn delay={0.4} y={20}>
            <Magnet
              padding={100}
              strength={16}
              maxDistance={14}
              activeTransition="transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)"
              inactiveTransition="transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)"
              className="w-full flex items-center justify-center relative"
            >
              {/* Subtle ambient shadow behind avatar */}
              <div
                aria-hidden="true"
                className="absolute inset-0 scale-90 rounded-full bg-black/60 blur-2xl pointer-events-none -z-10"
              />
              <picture className="w-full flex items-center justify-center">
                <source srcSet={aadiAvatarAvif} type="image/avif" />
                <source srcSet={aadiAvatarWebp} type="image/webp" />
                <img
                  src={aadiAvatarPng}
                  alt="Aadi, web designer and developer"
                  className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] filter"
                  loading="eager"
                  fetchPriority="high"
                  width={1254}
                  height={1254}
                />
              </picture>
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
          <ContactButton
            onClick={onContactClick}
            className="min-h-11 whitespace-nowrap max-[340px]:px-4"
          />
        </FadeIn>
      </div>
    </section>
  );
};
