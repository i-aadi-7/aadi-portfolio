import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { AnimatedText } from './AnimatedText';
import { ContactButton } from './ContactButton';
import browserFrameImg from '../assets/images/browser_frame_3d_1791225077236.png';
import codeCubeImg from '../assets/images/code_cube_3d_1791225090361.png';
import uiPanelsStackImg from '../assets/images/ui_panels_stack_3d_1791225526651.png';
import chromeCursorImg from '../assets/images/chrome_cursor_3d_1791225112999.png';

interface AboutSectionProps {
  onContactClick?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onContactClick }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const interactionBoundsRef = useRef<{
    section: DOMRect;
    content: DOMRect;
    scrollY: number;
  } | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Pointer coordinate tracking for multi-plane 3D object parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 165, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax depth multipliers for corner objects (max ±20px with varied depth planes)
  const obj1X = useTransform(smoothMouseX, [-500, 500], [-20, 20]);
  const obj1Y = useTransform(smoothMouseY, [-500, 500], [-16, 16]);

  const obj2X = useTransform(smoothMouseX, [-500, 500], [16, -16]);
  const obj2Y = useTransform(smoothMouseY, [-500, 500], [-15, 15]);

  const obj3X = useTransform(smoothMouseX, [-500, 500], [-15, 15]);
  const obj3Y = useTransform(smoothMouseY, [-500, 500], [20, -20]);

  const obj4X = useTransform(smoothMouseX, [-500, 500], [20, -20]);
  const obj4Y = useTransform(smoothMouseY, [-500, 500], [16, -16]);

  const captureInteractionBounds = () => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return null;

    const bounds = {
      section: section.getBoundingClientRect(),
      content: content.getBoundingClientRect(),
      scrollY: window.scrollY,
    };
    interactionBoundsRef.current = bounds;
    return bounds;
  };

  const updateInteraction = (clientX: number, clientY: number, isTouch: boolean) => {
    if (prefersReducedMotion) return;
    const bounds = interactionBoundsRef.current ?? captureInteractionBounds();
    if (!bounds) return;

    const scrollDelta = window.scrollY - bounds.scrollY;
    const sectionTop = bounds.section.top - scrollDelta;
    const contentTop = bounds.content.top - scrollDelta;
    const centerX = bounds.section.left + bounds.section.width / 2;
    const centerY = sectionTop + bounds.section.height / 2;

    if (isTouch) {
      const touchRange = 250;
      mouseX.set(((clientX - centerX) / Math.max(bounds.section.width / 2, 1)) * touchRange);
      mouseY.set(((clientY - centerY) / Math.max(bounds.section.height / 2, 1)) * touchRange);
    } else {
      mouseX.set(clientX - centerX);
      mouseY.set(clientY - centerY);
    }

    const content = contentRef.current;
    if (content) {
      content.style.setProperty('--cursor-x', `${clientX - bounds.content.left}px`);
      content.style.setProperty('--cursor-y', `${clientY - contentTop}px`);
      content.style.setProperty('--cursor-active', '1');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    updateInteraction(e.clientX, e.clientY, false);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    interactionBoundsRef.current = null;
    if (contentRef.current) {
      contentRef.current.style.setProperty('--cursor-active', '0');
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    captureInteractionBounds();
    const touch = e.touches[0];
    if (touch) updateInteraction(touch.clientX, touch.clientY, true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    if (touch) updateInteraction(touch.clientX, touch.clientY, true);
  };

  const handleTouchEnd = () => {
    handleMouseLeave();
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      onMouseEnter={captureInteractionBounds}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-24 sm:py-28 md:py-36 overflow-hidden bg-[#0C0C0C] touch-pan-y"
    >
      {/* Background Architectural Grid Fragment */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* 4 Creative-Tech Decorative 3D Corner Elements with Controlled Parallax */}

      {/* Top-left: 3D browser window / floating website frame */}
      <motion.div
        style={{ x: prefersReducedMotion ? 0 : obj1X, y: prefersReducedMotion ? 0 : obj1Y }}
        className="absolute top-[8%] left-[1%] sm:left-[2%] md:left-[4%] pointer-events-none z-0"
      >
        <FadeIn delay={0.1} x={-60} y={0} duration={0.85}>
          <img
            src={browserFrameImg}
            alt=""
            aria-hidden="true"
            className="w-[135px] sm:w-[180px] md:w-[235px] h-auto object-contain select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
            loading="lazy"
          />
        </FadeIn>
      </motion.div>

      {/* Bottom-left: Stack of floating mini website / UI panels */}
      <motion.div
        style={{ x: prefersReducedMotion ? 0 : obj2X, y: prefersReducedMotion ? 0 : obj2Y }}
        className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] pointer-events-none z-0"
      >
        <FadeIn delay={0.25} x={-60} y={0} duration={0.85}>
          <img
            src={uiPanelsStackImg}
            alt=""
            aria-hidden="true"
            className="w-[105px] sm:w-[145px] md:w-[185px] h-auto object-contain select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
            loading="lazy"
          />
        </FadeIn>
      </motion.div>

      {/* Top-right: 3D code brackets developer cube */}
      <motion.div
        style={{ x: prefersReducedMotion ? 0 : obj3X, y: prefersReducedMotion ? 0 : obj3Y }}
        className="absolute top-[8%] right-[1%] sm:right-[2%] md:right-[4%] pointer-events-none z-0"
      >
        <FadeIn delay={0.15} x={60} y={0} duration={0.85}>
          <img
            src={codeCubeImg}
            alt=""
            aria-hidden="true"
            className="w-[120px] sm:w-[160px] md:w-[210px] h-auto object-contain select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
            loading="lazy"
          />
        </FadeIn>
      </motion.div>

      {/* Bottom-right: Stylized 3D chrome cursor pointer */}
      <motion.div
        style={{ x: prefersReducedMotion ? 0 : obj4X, y: prefersReducedMotion ? 0 : obj4Y }}
        className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] pointer-events-none z-0"
      >
        <FadeIn delay={0.3} x={60} y={0} duration={0.85}>
          <img
            src={chromeCursorImg}
            alt=""
            aria-hidden="true"
            className="w-[120px] sm:w-[160px] md:w-[200px] h-auto object-contain select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
            loading="lazy"
          />
        </FadeIn>
      </motion.div>

      {/* Central Content */}
      <div
        ref={contentRef}
        style={{
          ['--cursor-x' as any]: '-999px',
          ['--cursor-y' as any]: '-999px',
          ['--cursor-active' as any]: '0',
        }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full"
      >
        {/* Heading */}
        <FadeIn delay={0} y={35} className="w-full">
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight text-center w-full"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            About me
          </h2>
        </FadeIn>

        {/* Gap between heading and text */}
        <div className="h-10 sm:h-14 md:h-16" />

        {/* Text Container with Pointer Magnetic Reveal Overlay */}
        <div className="relative w-full">
          {/* Animated paragraph 1 */}
          <AnimatedText
            text="I DESIGN AND BUILD MODERN DIGITAL EXPERIENCES THAT FEEL SHARP, FAST, AND DIFFERENT."
            className="text-[#D7E2EA] font-medium uppercase text-center leading-[1.85] max-w-[700px] sm:max-w-[720px] mx-auto select-none tracking-wide"
            style={{ fontSize: 'clamp(0.92rem, 1.5vw, 1.22rem)' } as any}
          />

          <div className="h-5 sm:h-7" />

          {/* Animated paragraph 2 */}
          <AnimatedText
            text="I MIX UI/UX, FRONTEND DEVELOPMENT, MOTION, AND INTERACTION TO TURN IDEAS INTO POLISHED WEBSITES PEOPLE REMEMBER."
            className="text-[#D7E2EA]/90 font-medium uppercase text-center leading-[1.85] max-w-[700px] sm:max-w-[740px] mx-auto select-none tracking-wide"
            style={{ fontSize: 'clamp(0.92rem, 1.5vw, 1.22rem)' } as any}
          />

          <div className="h-5 sm:h-7" />

          {/* Animated paragraph 3 */}
          <AnimatedText
            text="I'M ESPECIALLY INTERESTED IN INTERACTIVE WEB EXPERIENCES, STRONG VISUAL SYSTEMS, AND BUILDING PRODUCTS THAT FEEL AS GOOD TO USE AS THEY LOOK."
            className="text-[#D7E2EA]/90 font-medium uppercase text-center leading-[1.85] max-w-[700px] sm:max-w-[760px] mx-auto select-none tracking-wide"
            style={{ fontSize: 'clamp(0.92rem, 1.5vw, 1.22rem)' } as any}
          />

          <div className="h-5 sm:h-7" />

          {/* Animated paragraph 4 */}
          <AnimatedText
            text="RIGHT NOW, I'M ALSO BUILDING MY OWN AGENCY OS / CRM TO MANAGE LEADS, OUTREACH, FOLLOW-UPS, AND CLIENT WORK MORE EFFECTIVELY."
            className="text-[#D7E2EA]/80 font-medium uppercase text-center leading-[1.85] max-w-[700px] sm:max-w-[740px] mx-auto select-none tracking-wide"
            style={{ fontSize: 'clamp(0.92rem, 1.5vw, 1.22rem)' } as any}
          />

          {/* Pointer and touch magnetic reveal overlay with a wide, soft falloff */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 select-none"
            style={{
              opacity: 'var(--cursor-active, 0)',
              maskImage:
                'radial-gradient(circle clamp(260px, 36.6vw, 500px) at var(--cursor-x, -999px) var(--cursor-y, -999px), black 0%, rgba(0,0,0,0.78) 35%, rgba(0,0,0,0.48) 62%, rgba(0,0,0,0.18) 82%, transparent 100%)',
              WebkitMaskImage:
                'radial-gradient(circle clamp(260px, 36.6vw, 500px) at var(--cursor-x, -999px) var(--cursor-y, -999px), black 0%, rgba(0,0,0,0.78) 35%, rgba(0,0,0,0.48) 62%, rgba(0,0,0,0.18) 82%, transparent 100%)',
            }}
          >
            <p
              className="text-[#FFFFFF] font-medium uppercase text-center leading-[1.85] max-w-[700px] sm:max-w-[720px] mx-auto select-none tracking-wide drop-shadow-[0_0_12px_rgba(215,226,234,0.4)]"
              style={{ fontSize: 'clamp(0.92rem, 1.5vw, 1.22rem)' }}
            >
              I DESIGN AND BUILD MODERN DIGITAL EXPERIENCES THAT FEEL SHARP, FAST, AND DIFFERENT.
            </p>
            <div className="h-5 sm:h-7" />
            <p
              className="text-[#FFFFFF] font-medium uppercase text-center leading-[1.85] max-w-[700px] sm:max-w-[740px] mx-auto select-none tracking-wide drop-shadow-[0_0_12px_rgba(215,226,234,0.4)]"
              style={{ fontSize: 'clamp(0.92rem, 1.5vw, 1.22rem)' }}
            >
              I MIX UI/UX, FRONTEND DEVELOPMENT, MOTION, AND INTERACTION TO TURN IDEAS INTO POLISHED WEBSITES PEOPLE REMEMBER.
            </p>
            <div className="h-5 sm:h-7" />
            <p
              className="text-[#FFFFFF] font-medium uppercase text-center leading-[1.85] max-w-[700px] sm:max-w-[760px] mx-auto select-none tracking-wide drop-shadow-[0_0_12px_rgba(215,226,234,0.4)]"
              style={{ fontSize: 'clamp(0.92rem, 1.5vw, 1.22rem)' }}
            >
              I'M ESPECIALLY INTERESTED IN INTERACTIVE WEB EXPERIENCES, STRONG VISUAL SYSTEMS, AND BUILDING PRODUCTS THAT FEEL AS GOOD TO USE AS THEY LOOK.
            </p>
            <div className="h-5 sm:h-7" />
            <p
              className="text-[#FFFFFF] font-medium uppercase text-center leading-[1.85] max-w-[700px] sm:max-w-[740px] mx-auto select-none tracking-wide drop-shadow-[0_0_12px_rgba(215,226,234,0.4)]"
              style={{ fontSize: 'clamp(0.92rem, 1.5vw, 1.22rem)' }}
            >
              RIGHT NOW, I'M ALSO BUILDING MY OWN AGENCY OS / CRM TO MANAGE LEADS, OUTREACH, FOLLOW-UPS, AND CLIENT WORK MORE EFFECTIVELY.
            </p>
          </div>
        </div>

        {/* Gap between text block and button */}
        <div className="h-14 sm:h-18 md:h-22" />

        {/* Contact button: reduced ~6-7% in size */}
        <FadeIn delay={0.2} y={20}>
          <div className="transform scale-[0.93] origin-center">
            <ContactButton onClick={onContactClick} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
