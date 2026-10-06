import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

interface CharProps {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Character: React.FC<CharProps> = ({ char, progress, range }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <span className="relative inline-block whitespace-pre">
      <span className="invisible">{char}</span>
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 select-none"
      >
        {char}
      </motion.span>
    </span>
  );
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = '', style }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const words = text.split(' ');
  const totalChars = text.length;

  // Track global index of each character to compute range
  let globalCharIndex = 0;

  return (
    <p ref={containerRef} className={className} style={style}>
      {words.map((word, wordIndex) => {
        const wordChars = word.split('');
        const wordElement = (
          <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap">
            {wordChars.map((char) => {
              const start = globalCharIndex / totalChars;
              const step = 1 / totalChars;
              const end = Math.min(1, start + step * 2);
              globalCharIndex++;

              return (
                <Character
                  key={`char-${globalCharIndex}`}
                  char={char}
                  progress={scrollYProgress}
                  range={[start, end]}
                />
              );
            })}
          </span>
        );

        // Append space after word unless it's the last word
        let spaceElement = null;
        if (wordIndex < words.length - 1) {
          const spaceStart = globalCharIndex / totalChars;
          const step = 1 / totalChars;
          const spaceEnd = Math.min(1, spaceStart + step * 2);
          globalCharIndex++;

          spaceElement = (
            <Character
              key={`space-${globalCharIndex}`}
              char=" "
              progress={scrollYProgress}
              range={[spaceStart, spaceEnd]}
            />
          );
        }

        return (
          <React.Fragment key={`fragment-${wordIndex}`}>
            {wordElement}
            {spaceElement}
          </React.Fragment>
        );
      })}
    </p>
  );
};
