import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { AnimatedText } from './AnimatedText';
import { ContactButton } from './ContactButton';
import browserFrameImg from '../assets/images/browser_frame_3d_1791225077236.jpg';
import codeCubeImg from '../assets/images/code_cube_3d_1791225090361.jpg';
import uiPanelsStackImg from '../assets/images/ui_panels_stack_3d_1791225526651.jpg';
import chromeCursorImg from '../assets/images/chrome_cursor_3d_1791225112999.jpg';

interface AboutSectionProps {
  onContactClick?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onContactClick }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Gentle mouse coordinate tracking for subtle multi-plane 3D object parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Discrete parallax depth multipliers for each corner object (max ±4px to ±6px)
  const obj1X = useTransform(smoothMouseX, [-500, 500], [-6, 6]);
  const obj1Y = useTransform(smoothMouseY, [-500, 500], [-5, 5]);

  const obj2X = useTransform(smoothMouseX, [-500, 500], [5, -5]);
  const obj2Y = useTransform(smoothMouseY, [-500, 500], [-4, 4]);

  const obj3X = useTransform(smoothMouseX, [-500, 500], [-4, 4]);
  const obj3Y = useTransform(smoothMouseY, [-500, 500], [6, -6]);

  const obj4X = useTransform(smoothMouseX, [-500, 500], [6, -6]);
  const obj4Y = useTransform(smoothMouseY, [-500, 500], [5, -5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-24 sm:py-28 md:py-36 overflow-hidden bg-[#0C0C0C]"
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
            alt="3D Floating Browser Window"
            style={{ filter: 'brightness(1.14) contrast(1.12)' }}
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
            alt="3D Layered UI Panels Stack"
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
            alt="3D Code Brackets Cube"
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
            alt="3D Liquid Chrome Cursor"
            className="w-[120px] sm:w-[160px] md:w-[200px] h-auto object-contain select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
            loading="lazy"
          />
        </FadeIn>
      </motion.div>

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
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
