import React from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();

  // Smooth spring for the scroll progress to give a silky response
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 35,
    restDelta: 0.001,
  });

  // Dynamic color interpolation matching the site's palette
  const glowColor = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [
      'rgba(187, 204, 215, 0.8)', // Silver blue
      'rgba(118, 33, 176, 0.85)', // Electric violet
      'rgba(182, 0, 168, 0.9)',  // Magenta
      'rgba(190, 76, 0, 0.9)',   // Burnt orange
      'rgba(215, 226, 234, 0.95)' // Crisp silver
    ]
  );

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] sm:h-[3px] z-[99990] pointer-events-none bg-neutral-900/40 backdrop-blur-xs"
    >
      <motion.div
        style={{
          scaleX,
          transformOrigin: '0%',
        }}
        className="h-full w-full relative"
      >
        {/* Main gradient track */}
        <div
          className="h-full w-full"
          style={{
            background:
              'linear-gradient(90deg, #646973 0%, #BBCCD7 20%, #7621B0 45%, #B600A8 70%, #BE4C00 100%)',
          }}
        />

        {/* Ambient leading edge glow */}
        <motion.div
          style={{
            backgroundColor: glowColor,
            boxShadow: '0 0 12px 2px currentColor',
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-90 blur-[1px]"
        />
      </motion.div>
    </div>
  );
};
