import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface FlowButtonProps {
  text?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
}

// Minimal animated transmission rail for loading state
const LoadingRail: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1 h-3 px-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2.5 h-[2px] bg-current rounded-full"
          animate={{
            opacity: [0.3, 1, 0.3],
            scaleX: [0.75, 1, 0.75],
          }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export const FlowButton: React.FC<FlowButtonProps> = ({
  text = 'SEND PROJECT DETAILS',
  disabled = false,
  loading = false,
  type = 'submit',
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const isInteractive = !disabled && !loading;

  return (
    <motion.button
      type={type}
      disabled={!isInteractive}
      onClick={onClick}
      onMouseEnter={() => isInteractive && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={isInteractive && !shouldReduceMotion ? { scale: 0.985 } : {}}
      className={`group relative inline-flex items-center justify-center min-h-[46px] px-7 py-3 text-xs font-semibold uppercase tracking-wider rounded-full overflow-hidden cursor-pointer select-none transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 bg-[#151515] text-[#D7E2EA] border border-[#D7E2EA]/20 shadow-[0_6px_24px_rgba(0,0,0,0.22)] disabled:opacity-45 disabled:cursor-not-allowed ${className}`}
      aria-busy={loading}
    >
      {/* Expanding inner light cool grey fill on hover - shape remains strictly rounded-full */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 bg-[#E7E9EC] rounded-full -z-0 pointer-events-none"
          initial={false}
          animate={{
            clipPath:
              isHovered && isInteractive
                ? 'circle(150% at 85% 50%)'
                : 'circle(0% at 85% 50%)',
          }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Button Content Container */}
      <div className="relative z-10 flex items-center justify-center gap-2.5">
        {/* Left Arrow: slides into view on hover */}
        {!loading && !shouldReduceMotion && (
          <div className="w-0 overflow-hidden group-hover:w-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-start">
            <ArrowRight
              size={14}
              className={`transform -translate-x-3 group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isHovered && isInteractive ? 'text-[#111111]' : 'text-[#D7E2EA]'
              }`}
            />
          </div>
        )}

        {/* Text label with color morph */}
        <motion.span
          className="inline-block transition-colors duration-500"
          animate={{
            color:
              isHovered && isInteractive && !shouldReduceMotion
                ? '#111111'
                : '#D7E2EA',
          }}
          transition={{ duration: 0.35 }}
        >
          {loading ? 'SENDING' : text}
        </motion.span>

        {/* Right Arrow / Loading Progress */}
        {loading ? (
          <span className="inline-flex items-center text-[#D7E2EA]">
            <LoadingRail />
          </span>
        ) : (
          <div
            className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              !shouldReduceMotion ? 'group-hover:w-0 group-hover:opacity-0 overflow-hidden' : ''
            }`}
          >
            <ArrowRight
              size={14}
              className={`transform transition-transform duration-300 group-hover:translate-x-2 ${
                isHovered && isInteractive && !shouldReduceMotion ? 'text-[#111111]' : 'text-[#D7E2EA]'
              }`}
            />
          </div>
        )}
      </div>
    </motion.button>
  );
};
