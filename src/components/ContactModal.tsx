import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useMotionTemplate,
} from 'framer-motion';
import { X } from 'lucide-react';
import { FlowButton } from './ui/flow-button';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'default' | 'project';
}

const BUDGET_OPTIONS = [
  'UNDER ₹15K',
  '₹15K–₹30K',
  '₹30K–₹60K',
  '₹60K+',
  'NOT SURE YET',
] as const;

const TIMELINE_OPTIONS = [
  'ASAP',
  '2–4 WEEKS',
  '1–2 MONTHS',
  'FLEXIBLE',
] as const;

const AVAILABLE_SERVICES = [
  'Web Design & Architecture',
  'Interactive 3D Experiences',
  'Full-Stack Web Products',
] as const;

// Stable Typewriter Heading Component
const TypewriterHeading: React.FC<{
  text: string;
  delayMs?: number;
  charSpeedMs?: number;
  shouldReduceMotion?: boolean | null;
}> = ({ text, delayMs = 220, charSpeedMs = 40, shouldReduceMotion }) => {
  const [revealedChars, setRevealedChars] = useState(() => (shouldReduceMotion ? text.length : 0));
  const isStartedRef = useRef(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setRevealedChars(text.length);
      return;
    }

    if (isStartedRef.current) return;
    isStartedRef.current = true;

    let charIndex = 0;
    let charInterval: NodeJS.Timeout;

    const startTimer = setTimeout(() => {
      charInterval = setInterval(() => {
        charIndex += 1;
        setRevealedChars(charIndex);
        if (charIndex >= text.length) {
          clearInterval(charInterval);
        }
      }, charSpeedMs);
    }, delayMs);

    return () => {
      clearTimeout(startTimer);
      clearInterval(charInterval);
    };
  }, [text, delayMs, charSpeedMs, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <span>{text}</span>;
  }

  // Pre-split characters to reserve layout perfectly and avoid layout shift
  return (
    <span aria-label={text} className="inline-block">
      <span aria-hidden="true">
        {text.split('').map((char, index) => {
          const isRevealed = index < revealedChars;
          return (
            <span
              key={index}
              className={`transition-opacity duration-75 ${
                isRevealed ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {char}
            </span>
          );
        })}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
};

// Word-by-word reveal for supporting copy
const WordRevealText: React.FC<{
  text: string;
  delaySec?: number;
  shouldReduceMotion?: boolean | null;
}> = ({ text, delaySec = 0.65, shouldReduceMotion }) => {
  if (shouldReduceMotion) {
    return <span>{text}</span>;
  }

  const words = text.split(' ');

  return (
    <span aria-label={text} className="inline">
      <span aria-hidden="true">
        {words.map((word, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 5, filter: 'blur(2px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 0.3,
              delay: delaySec + index * 0.025,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block mr-[0.28em]"
          >
            {word}
          </motion.span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
};

// Stable Sequential Typewriter for AVAILABLE FOR card (Types once, no loop, no replay)
const TypewriterServiceList: React.FC<{
  items: readonly string[];
  startDelayMs?: number;
  charSpeedMs?: number;
  pauseBetweenLinesMs?: number;
  shouldReduceMotion?: boolean | null;
}> = ({
  items,
  startDelayMs = 950,
  charSpeedMs = 52,
  pauseBetweenLinesMs = 200,
  shouldReduceMotion,
}) => {
  const [typedCounts, setTypedCounts] = useState<number[]>(() =>
    shouldReduceMotion ? items.map((i) => i.length) : items.map(() => 0)
  );
  const [visibleLines, setVisibleLines] = useState<number>(() =>
    shouldReduceMotion ? items.length : 0
  );

  const animationStartedRef = useRef(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setTypedCounts(items.map((i) => i.length));
      setVisibleLines(items.length);
      return;
    }

    if (animationStartedRef.current) return;
    animationStartedRef.current = true;

    let isCancelled = false;
    const timeouts: NodeJS.Timeout[] = [];
    const intervals: NodeJS.Timeout[] = [];

    const mainTimer = setTimeout(() => {
      let currentLine = 0;

      const typeNextLine = () => {
        if (isCancelled || currentLine >= items.length) return;

        const lineToType = currentLine;
        setVisibleLines((prev) => Math.max(prev, lineToType + 1));
        const itemText = items[lineToType];
        let charIndex = 0;

        const charInterval = setInterval(() => {
          if (isCancelled) {
            clearInterval(charInterval);
            return;
          }
          charIndex++;
          setTypedCounts((prev) => {
            if (prev[lineToType] >= charIndex) return prev;
            const next = [...prev];
            next[lineToType] = charIndex;
            return next;
          });

          if (charIndex >= itemText.length) {
            clearInterval(charInterval);
            currentLine++;
            if (currentLine < items.length) {
              const pauseTimer = setTimeout(() => {
                typeNextLine();
              }, pauseBetweenLinesMs);
              timeouts.push(pauseTimer);
            }
          }
        }, charSpeedMs);

        intervals.push(charInterval);
      };

      typeNextLine();
    }, startDelayMs);

    timeouts.push(mainTimer);

    return () => {
      isCancelled = true;
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [items, startDelayMs, charSpeedMs, pauseBetweenLinesMs, shouldReduceMotion]);

  return (
    <ul className="text-xs font-mono text-[#D7E2EA]/80 space-y-1.5">
      {items.map((item, idx) => {
        const isLineStarted = visibleLines > idx;
        const currentCount = typedCounts[idx] || 0;
        const isComplete = currentCount >= item.length;

        return (
          <li key={idx} className="flex items-center gap-2 min-h-[18px]">
            <span
              className={`text-purple-400 text-[10px] transition-opacity duration-200 ${
                isLineStarted || shouldReduceMotion ? 'opacity-100' : 'opacity-0'
              }`}
            >
              —
            </span>
            <span aria-label={item} className="inline-block">
              <span aria-hidden="true">
                {shouldReduceMotion || isComplete
                  ? item
                  : item.slice(0, currentCount)}
              </span>
              <span className="sr-only">{item}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  context = 'default',
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [validationError, setValidationError] = useState('');
  const [invalidField, setInvalidField] = useState<'name' | 'contact' | 'project' | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Focus tracking for input indicator lines
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse sheen motion values for subtle modal border sheen (desktop only)
  const sheenX = useMotionValue(-1000);
  const sheenY = useMotionValue(-1000);
  const sheenBg = useMotionTemplate`radial-gradient(420px circle at ${sheenX}px ${sheenY}px, rgba(192, 132, 252, 0.06), rgba(215, 226, 234, 0.02) 40%, transparent 80%)`;

  const handleModalMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || !modalRef.current) return;
      const rect = modalRef.current.getBoundingClientRect();
      sheenX.set(e.clientX - rect.left);
      sheenY.set(e.clientY - rect.top);
    },
    [shouldReduceMotion, sheenX, sheenY]
  );

  const handleModalMouseLeave = useCallback(() => {
    sheenX.set(-1000);
    sheenY.set(-1000);
  }, [sheenX, sheenY]);

  // Lock background scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const globalLenis = (window as any).lenis;
    if (globalLenis && typeof globalLenis.stop === 'function') {
      globalLenis.stop();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      if (globalLenis && typeof globalLenis.start === 'function') {
        globalLenis.start();
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setName('');
    setContact('');
    setProjectScope('');
    setBudget('');
    setTimeline('');
    setHoneypot('');
    setValidationError('');
    setInvalidField(null);
    setStatus('idle');
    setFocusedField(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Live validity checks
  const isNameValid = name.trim().length >= 2;
  const isContactValid = contact.trim().length >= 5;
  const isProjectValid = projectScope.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setInvalidField(null);

    const trimmedName = name.trim();
    const trimmedContact = contact.trim();
    const trimmedProject = projectScope.trim();

    if (trimmedName.length < 2) {
      setValidationError('Please enter a valid name (at least 2 characters).');
      setInvalidField('name');
      return;
    }

    if (trimmedContact.length < 5) {
      setValidationError('Please enter a valid email or WhatsApp contact.');
      setInvalidField('contact');
      return;
    }

    if (trimmedProject.length < 10) {
      setValidationError('Please provide a brief project description (at least 10 characters).');
      setInvalidField('project');
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl) {
      console.error(
        '[ContactModal] Missing VITE_SUPABASE_URL environment variable. Inquiries cannot be delivered until configured.'
      );
      setStatus('error');
      return;
    }

    const functionEndpoint = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/send-project-inquiry`;

    setStatus('submitting');

    try {
      const response = await fetch(functionEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          contact: trimmedContact,
          project: trimmedProject,
          budget: budget ? budget.trim() : '',
          timeline: timeline ? timeline.trim() : '',
          _hp: honeypot,
          source: context === 'project' ? 'Aadi Portfolio (Project CTA)' : 'Aadi Portfolio (Direct)',
        }),
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const headingText =
    context === 'project' ? "LET'S BUILD YOUR PROJECT" : 'START A PROJECT';
  const supportingText =
    'Tell me what you want to build, what problem it should solve, and any timeline you have in mind.';

  // Precise physics/timing configuration
  const modalEase = [0.22, 1, 0.36, 1] as const;

  // Shake animation variant for invalid inputs
  const shakeVariants = {
    idle: { x: 0 },
    shake: {
      x: shouldReduceMotion ? 0 : [0, -3, 3, -2, 2, 0],
      transition: { duration: 0.32, ease: 'easeInOut' as const },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 select-none sm:select-text"
          data-lenis-prevent="true"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          aria-describedby="contact-modal-desc"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.15 : 0.3,
              ease: modalEase,
            }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-[6px]"
          />

          {/* Modal Shell */}
          <motion.div
            ref={modalRef}
            onMouseMove={handleModalMouseMove}
            onMouseLeave={handleModalMouseLeave}
            initial={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.985,
              y: shouldReduceMotion ? 0 : 20,
              filter: shouldReduceMotion ? 'none' : 'blur(6px)',
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.985,
              y: shouldReduceMotion ? 0 : 12,
              filter: shouldReduceMotion ? 'none' : 'blur(4px)',
            }}
            transition={{
              duration: shouldReduceMotion ? 0.15 : 0.42,
              ease: modalEase,
            }}
            data-lenis-prevent="true"
            style={{ maxHeight: 'calc(100dvh - 32px)' }}
            className="relative w-full max-w-4xl bg-[#0C0C0C] border border-neutral-800/90 rounded-[20px] sm:rounded-[26px] shadow-[0_24px_80px_rgba(0,0,0,0.92)] z-10 my-auto text-[#D7E2EA] flex flex-col overflow-hidden group/modal"
          >
            {/* Desktop Cursor Sheen Overlay */}
            {!shouldReduceMotion && (
              <motion.div
                className="pointer-events-none absolute inset-0 z-0 rounded-[20px] sm:rounded-[26px] transition-opacity duration-300"
                style={{ background: sheenBg }}
              />
            )}

            {/* Top Close Action (40x40 hit target, small icon, scale on hover) */}
            <motion.button
              type="button"
              onClick={handleClose}
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-10 h-10 rounded-xl text-[#D7E2EA]/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-neutral-800 transition-colors z-20 cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
              aria-label="Close project inquiry dialog"
            >
              <X size={17} />
            </motion.button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              data-lenis-prevent="true"
              tabIndex={0}
              style={{
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
              }}
              className="w-full overflow-y-auto overflow-x-hidden p-6 sm:p-8 md:p-10 focus:outline-none relative z-10 custom-scrollbar"
            >
              <AnimatePresence mode="wait">
                {/* 1. EDITORIAL SUCCESS / PROJECT RECEIPT STATE */}
                {status === 'success' ? (
                  <motion.div
                    key="success-receipt-view"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                    transition={{ duration: 0.38, ease: modalEase }}
                    className="py-5 sm:py-7 max-w-2xl mx-auto text-left"
                  >
                    {/* Top Meta Line */}
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.22em] text-[#D7E2EA]/50 mb-3 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block animate-pulse" />
                      <span>PROJECT INQUIRY / RECEIVED</span>
                    </motion.div>

                    {/* Masked text reveal heading */}
                    <div className="overflow-hidden mb-2">
                      <motion.h2
                        id="contact-modal-title"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: modalEase }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-none"
                      >
                        PROJECT RECEIVED
                      </motion.h2>
                    </div>

                    {/* Completely neutral silver/graphite divider line (~68% width, 1px height, no gradient, no glow) */}
                    <div className="relative w-[68%] max-w-sm sm:max-w-md h-[1px] my-3.5 overflow-hidden">
                      <motion.div
                        initial={{ scaleX: shouldReduceMotion ? 1 : 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.42, delay: 0.08, ease: modalEase }}
                        style={{ originX: 0 }}
                        className="w-full h-full bg-[rgba(215,226,234,0.18)]"
                      />
                    </div>

                    {/* Supporting Copy */}
                    <motion.div
                      id="contact-modal-desc"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.16, duration: 0.3 }}
                      className="text-xs sm:text-sm text-[#D7E2EA]/75 font-light leading-relaxed mb-5 space-y-0.5"
                    >
                      <p>Your brief is in.</p>
                      <p>I’ll review the details and get back to you soon.</p>
                    </motion.div>

                    {/* Submission Summary Grid / Receipt Box */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22, duration: 0.35, ease: modalEase }}
                      className="p-5 sm:p-6 rounded-2xl bg-[#0A0A0A] border border-neutral-800/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_1px_0_0_rgba(255,255,255,0.03)] mb-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                        {/* Name */}
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : 0.25, duration: 0.25 }}
                        >
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#D7E2EA]/35 block mb-1.5">
                            Name
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-[#F0F4F8] break-words [overflow-wrap:anywhere]">
                            {name || '—'}
                          </span>
                        </motion.div>

                        {/* Contact */}
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : 0.285, duration: 0.25 }}
                        >
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#D7E2EA]/35 block mb-1.5">
                            Contact
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-[#F0F4F8] break-words [overflow-wrap:anywhere]">
                            {contact || '—'}
                          </span>
                        </motion.div>

                        {/* Budget */}
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : 0.32, duration: 0.25 }}
                        >
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#D7E2EA]/35 block mb-1.5">
                            Budget
                          </span>
                          <span className="text-xs font-mono text-purple-300">
                            {budget || 'NOT SPECIFIED'}
                          </span>
                        </motion.div>

                        {/* Timeline */}
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : 0.355, duration: 0.25 }}
                        >
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#D7E2EA]/35 block mb-1.5">
                            Timeline
                          </span>
                          <span className="text-xs font-mono text-[#D7E2EA]/85">
                            {timeline || 'NOT SPECIFIED'}
                          </span>
                        </motion.div>

                        {/* Project Scope (Clamped to 2 lines with comfortable line-height) */}
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : 0.39, duration: 0.25 }}
                          className="sm:col-span-2"
                        >
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#D7E2EA]/35 block mb-1.5">
                            Project Brief
                          </span>
                          <p className="text-xs text-[#D7E2EA]/85 font-light leading-[1.6] line-clamp-2 break-words [overflow-wrap:anywhere] max-w-full overflow-hidden">
                            {projectScope || '—'}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Bottom Action Row */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: shouldReduceMotion ? 0 : 0.44, duration: 0.3, ease: modalEase }}
                      className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-neutral-800/80"
                    >
                      {/* Left: SEND ANOTHER PROJECT */}
                      <motion.button
                        type="button"
                        onClick={resetForm}
                        whileHover={shouldReduceMotion ? {} : { y: -1 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                        className="group/sec relative px-5 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-[#D7E2EA]/65 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer text-center overflow-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
                      >
                        <span className="relative z-10 inline-block transition-transform duration-150 group-hover/sec:translate-x-0.5">
                          SEND ANOTHER PROJECT
                        </span>
                        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white/40 scale-x-0 group-hover/sec:scale-x-100 transition-transform duration-200 origin-left" />
                      </motion.button>

                      {/* Right: CLOSE */}
                      <motion.button
                        type="button"
                        onClick={handleClose}
                        whileHover={shouldReduceMotion ? {} : { y: -1 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                        className="group relative px-8 py-2.5 rounded-xl bg-[#141414] hover:bg-[#1A1A1A] border border-neutral-700 hover:border-neutral-500 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 text-center"
                      >
                        <span className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-200 ease-out -z-0" />
                        <span className="relative z-10 inline-block transition-transform duration-150 group-hover:translate-x-0.5">
                          CLOSE
                        </span>
                      </motion.button>
                    </motion.div>
                  </motion.div>
                ) : status === 'error' ? (
                  /* 2. ERROR STATE */
                  <motion.div
                    key="error-view"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                    transition={{ duration: 0.35, ease: modalEase }}
                    className="py-8 max-w-xl mx-auto text-left"
                  >
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-red-400/80 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block animate-pulse" />
                      <span>TRANSMISSION / INTERRUPTED</span>
                    </div>

                    <h2
                      id="contact-modal-title"
                      className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2"
                    >
                      COULDN&apos;T SEND PROJECT
                    </h2>

                    <div className="relative w-full h-[1px] bg-neutral-800 my-3 overflow-hidden">
                      <div className="absolute inset-0 bg-red-900/60 w-1/3" />
                    </div>

                    <p
                      id="contact-modal-desc"
                      className="text-xs sm:text-sm text-[#D7E2EA]/75 font-light leading-relaxed mb-6"
                    >
                      Your details are still here. Try sending again.
                    </p>

                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-start gap-3 pt-4 border-t border-neutral-800/80">
                      <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="group relative px-6 py-2.5 rounded-xl bg-white text-black hover:bg-[#F0F2F5] text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                      >
                        <span className="relative z-10">TRY AGAIN</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="group/sec relative px-5 py-2.5 rounded-xl border border-neutral-800 text-[#D7E2EA]/60 hover:text-white hover:border-neutral-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer text-center overflow-hidden"
                      >
                        <span className="relative z-10">CLOSE</span>
                        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white/40 scale-x-0 group-hover/sec:scale-x-100 transition-transform duration-200 origin-left" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* 3. ASYMMETRIC TWO-COLUMN INQUIRY FORM */
                  <motion.div
                    key="form-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                    transition={{ duration: 0.25, ease: modalEase }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
                  >
                    {/* LEFT COLUMN: Editorial Context & Positioning */}
                    <motion.div
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.38, ease: modalEase }}
                      className="lg:col-span-4 lg:sticky lg:top-0 space-y-6"
                    >
                      <div>
                        {/* 1. TOP META LABEL (PROJECT INQUIRY) */}
                        <motion.div
                          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: shouldReduceMotion ? 0 : 0.15,
                            ease: modalEase,
                          }}
                          className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.22em] text-[#D7E2EA]/50 mb-2.5 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block animate-pulse" />
                          <span>PROJECT INQUIRY</span>
                        </motion.div>

                        {/* 2. START A PROJECT TYPEWRITER */}
                        <h2
                          id="contact-modal-title"
                          className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-[1.05]"
                        >
                          <TypewriterHeading
                            text={headingText}
                            delayMs={220}
                            charSpeedMs={38}
                            shouldReduceMotion={shouldReduceMotion}
                          />
                        </h2>

                        {/* 3. SUPPORTING SENTENCE WORD REVEAL */}
                        <p
                          id="contact-modal-desc"
                          className="text-xs sm:text-sm text-[#D7E2EA]/70 mt-3 font-light leading-relaxed"
                        >
                          <WordRevealText
                            text={supportingText}
                            delaySec={0.65}
                            shouldReduceMotion={shouldReduceMotion}
                          />
                        </p>
                      </div>

                      {/* 4. AVAILABLE FOR CARD TYPEWRITER */}
                      <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: shouldReduceMotion ? 0 : 0.85,
                          ease: modalEase,
                        }}
                        className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80 space-y-3"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#D7E2EA]/40 block">
                          Available For
                        </span>
                        <TypewriterServiceList
                          items={AVAILABLE_SERVICES}
                          startDelayMs={1000}
                          shouldReduceMotion={shouldReduceMotion}
                        />
                      </motion.div>
                    </motion.div>

                    {/* RIGHT COLUMN: Streamlined Form Grid */}
                    <motion.div
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.42, delay: 0.05, ease: modalEase }}
                      className="lg:col-span-8"
                    >
                      {/* Validation Banner */}
                      <AnimatePresence>
                        {validationError && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -6 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 text-red-300 text-xs font-mono flex items-center justify-between"
                          >
                            <span>{validationError}</span>
                            <button
                              type="button"
                              onClick={() => setValidationError('')}
                              className="text-red-400/60 hover:text-red-300 ml-2 cursor-pointer"
                              aria-label="Dismiss error"
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Anti-spam honeypot */}
                        <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                          <label htmlFor="contact-hp">Website</label>
                          <input
                            id="contact-hp"
                            type="text"
                            name="_hp"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            tabIndex={-1}
                            autoComplete="off"
                          />
                        </div>

                        {/* Row: Name & Contact Method */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* 1. NAME FIELD */}
                          <motion.div
                            variants={shakeVariants}
                            animate={invalidField === 'name' ? 'shake' : 'idle'}
                            className="relative group/field"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <label
                                htmlFor="contact-name"
                                className={`block font-mono text-[10.5px] uppercase tracking-wider transition-colors duration-200 ${
                                  focusedField === 'name' ? 'text-white' : 'text-[#D7E2EA]/60'
                                }`}
                              >
                                1. Name <span className="text-purple-400">*</span>
                              </label>
                              {isNameValid && (
                                <motion.span
                                  initial={{ scaleX: 0, opacity: 0 }}
                                  animate={{ scaleX: 1, opacity: 1 }}
                                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                  style={{ originX: 0 }}
                                  className="w-2.5 h-[2px] bg-purple-400 rounded-full inline-block"
                                  title="Field valid"
                                />
                              )}
                            </div>
                            <div className="relative">
                              <input
                                id="contact-name"
                                type="text"
                                required
                                maxLength={100}
                                value={name}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                                onChange={(e) => {
                                  setName(e.target.value);
                                  if (invalidField === 'name') setInvalidField(null);
                                }}
                                placeholder="Your name or team"
                                className={`w-full px-3.5 py-3 rounded-xl bg-neutral-900/90 border text-white placeholder-neutral-600 text-xs sm:text-sm transition-all duration-200 focus:outline-none ${
                                  invalidField === 'name'
                                    ? 'border-red-500/80 bg-red-950/10'
                                    : focusedField === 'name'
                                    ? 'border-neutral-500 bg-[#111111] -translate-y-[1px]'
                                    : 'border-neutral-800 hover:border-neutral-700'
                                }`}
                              />
                              <motion.div
                                className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-purple-400/90 rounded-full pointer-events-none"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: focusedField === 'name' ? 1 : 0 }}
                                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                style={{ originX: 0 }}
                              />
                            </div>
                          </motion.div>

                          {/* 2. EMAIL OR WHATSAPP FIELD */}
                          <motion.div
                            variants={shakeVariants}
                            animate={invalidField === 'contact' ? 'shake' : 'idle'}
                            className="relative group/field"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <label
                                htmlFor="contact-method"
                                className={`block font-mono text-[10.5px] uppercase tracking-wider transition-colors duration-200 ${
                                  focusedField === 'contact' ? 'text-white' : 'text-[#D7E2EA]/60'
                                }`}
                              >
                                2. Email or WhatsApp <span className="text-purple-400">*</span>
                              </label>
                              {isContactValid && (
                                <motion.span
                                  initial={{ scaleX: 0, opacity: 0 }}
                                  animate={{ scaleX: 1, opacity: 1 }}
                                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                  style={{ originX: 0 }}
                                  className="w-2.5 h-[2px] bg-purple-400 rounded-full inline-block"
                                  title="Field valid"
                                />
                              )}
                            </div>
                            <div className="relative">
                              <input
                                id="contact-method"
                                type="text"
                                required
                                maxLength={150}
                                value={contact}
                                onFocus={() => setFocusedField('contact')}
                                onBlur={() => setFocusedField(null)}
                                onChange={(e) => {
                                  setContact(e.target.value);
                                  if (invalidField === 'contact') setInvalidField(null);
                                }}
                                placeholder="name@company.com / +91..."
                                className={`w-full px-3.5 py-3 rounded-xl bg-neutral-900/90 border text-white placeholder-neutral-600 text-xs sm:text-sm transition-all duration-200 focus:outline-none ${
                                  invalidField === 'contact'
                                    ? 'border-red-500/80 bg-red-950/10'
                                    : focusedField === 'contact'
                                    ? 'border-neutral-500 bg-[#111111] -translate-y-[1px]'
                                    : 'border-neutral-800 hover:border-neutral-700'
                                }`}
                              />
                              <motion.div
                                className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-purple-400/90 rounded-full pointer-events-none"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: focusedField === 'contact' ? 1 : 0 }}
                                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                style={{ originX: 0 }}
                              />
                            </div>
                          </motion.div>
                        </div>

                        {/* 3. WHAT DO YOU WANT TO BUILD? */}
                        <motion.div
                          variants={shakeVariants}
                          animate={invalidField === 'project' ? 'shake' : 'idle'}
                          className="relative group/field"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <label
                              htmlFor="contact-scope"
                              className={`block font-mono text-[10.5px] uppercase tracking-wider transition-colors duration-200 ${
                                focusedField === 'project' ? 'text-white' : 'text-[#D7E2EA]/60'
                              }`}
                            >
                              3. What do you want to build? <span className="text-purple-400">*</span>
                            </label>
                            {isProjectValid && (
                              <motion.span
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                style={{ originX: 0 }}
                                className="w-2.5 h-[2px] bg-purple-400 rounded-full inline-block"
                                title="Minimum details reached"
                              />
                            )}
                          </div>
                          <div className="relative">
                            <textarea
                              id="contact-scope"
                              rows={4}
                              required
                              maxLength={3000}
                              value={projectScope}
                              onFocus={() => setFocusedField('project')}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => {
                                setProjectScope(e.target.value);
                                if (invalidField === 'project') setInvalidField(null);
                              }}
                              placeholder="Describe your vision, core features, or the problem you are solving..."
                              className={`w-full px-3.5 py-3 rounded-xl bg-neutral-900/90 border text-white placeholder-neutral-600 text-xs sm:text-sm resize-none transition-all duration-200 leading-relaxed focus:outline-none ${
                                invalidField === 'project'
                                  ? 'border-red-500/80 bg-red-950/10'
                                  : focusedField === 'project'
                                  ? 'border-neutral-500 bg-[#111111] -translate-y-[1px]'
                                  : 'border-neutral-800 hover:border-neutral-700'
                              }`}
                            />
                            <div className="absolute bottom-1.5 left-3 right-3 h-[1px] bg-neutral-800 rounded-full overflow-hidden pointer-events-none">
                              <motion.div
                                className="h-full bg-purple-400/70"
                                initial={{ width: '0%' }}
                                animate={{
                                  width: `${Math.min(100, (projectScope.trim().length / 10) * 100)}%`,
                                }}
                                transition={{ duration: 0.15 }}
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* 4. BUDGET RANGE */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block font-mono text-[10.5px] uppercase tracking-wider text-[#D7E2EA]/60">
                              4. Budget Range <span className="text-[#D7E2EA]/35">(Optional)</span>
                            </label>
                            {budget && (
                              <button
                                type="button"
                                onClick={() => setBudget('')}
                                className="text-[10px] font-mono text-[#D7E2EA]/40 hover:text-[#D7E2EA] transition-colors cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {BUDGET_OPTIONS.map((opt) => {
                              const isSelected = budget === opt;
                              return (
                                <motion.button
                                  key={opt}
                                  type="button"
                                  onClick={() => setBudget(isSelected ? '' : opt)}
                                  whileHover={shouldReduceMotion ? {} : { y: -1 }}
                                  whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                                  className={`relative px-3 py-2 rounded-lg text-[11px] font-mono tracking-tight uppercase text-center transition-all duration-150 cursor-pointer select-none border focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 ${
                                    isSelected
                                      ? 'border-neutral-500 text-white font-semibold'
                                      : 'bg-neutral-900/70 border-neutral-800/80 text-[#D7E2EA]/60 hover:border-neutral-700 hover:text-white'
                                  }`}
                                >
                                  {isSelected && (
                                    <motion.span
                                      layoutId="active-budget-indicator"
                                      transition={{
                                        duration: shouldReduceMotion ? 0 : 0.25,
                                        ease: [0.16, 1, 0.3, 1],
                                      }}
                                      className="absolute inset-0 bg-neutral-800 rounded-lg -z-0 border-b border-purple-400/40"
                                    />
                                  )}
                                  <span className="relative z-10">{opt}</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 5. TIMELINE */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block font-mono text-[10.5px] uppercase tracking-wider text-[#D7E2EA]/60">
                              5. Timeline <span className="text-[#D7E2EA]/35">(Optional)</span>
                            </label>
                            {timeline && (
                              <button
                                type="button"
                                onClick={() => setTimeline('')}
                                className="text-[10px] font-mono text-[#D7E2EA]/40 hover:text-[#D7E2EA] transition-colors cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {TIMELINE_OPTIONS.map((opt) => {
                              const isSelected = timeline === opt;
                              return (
                                <motion.button
                                  key={opt}
                                  type="button"
                                  onClick={() => setTimeline(isSelected ? '' : opt)}
                                  whileHover={shouldReduceMotion ? {} : { y: -1 }}
                                  whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                                  className={`relative px-3 py-2 rounded-lg text-[11px] font-mono tracking-tight uppercase text-center transition-all duration-150 cursor-pointer select-none border focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 ${
                                    isSelected
                                      ? 'border-neutral-500 text-white font-semibold'
                                      : 'bg-neutral-900/70 border-neutral-800/80 text-[#D7E2EA]/60 hover:border-neutral-700 hover:text-white'
                                  }`}
                                >
                                  {isSelected && (
                                    <motion.span
                                      layoutId="active-timeline-indicator"
                                      transition={{
                                        duration: shouldReduceMotion ? 0 : 0.25,
                                        ease: [0.16, 1, 0.3, 1],
                                      }}
                                      className="absolute inset-0 bg-neutral-800 rounded-lg -z-0 border-b border-purple-400/40"
                                    />
                                  )}
                                  <span className="relative z-10">{opt}</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="pt-4 border-t border-neutral-800/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                          {/* Bottom Close Action */}
                          <motion.button
                            type="button"
                            onClick={handleClose}
                            whileHover={shouldReduceMotion ? {} : { y: -1 }}
                            whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                            className="group/close relative px-5 py-2.5 rounded-xl border border-neutral-800 text-[#D7E2EA]/60 hover:text-white hover:border-neutral-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer text-center overflow-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
                          >
                            <span className="relative z-10 inline-block transition-transform duration-150 group-hover/close:translate-x-0.5">
                              CLOSE
                            </span>
                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white/40 scale-x-0 group-hover/close:scale-x-100 transition-transform duration-200 origin-left" />
                          </motion.button>

                          {/* Primary FlowButton CTA */}
                          <FlowButton
                            text="SEND PROJECT DETAILS"
                            type="submit"
                            loading={status === 'submitting'}
                            disabled={status === 'submitting'}
                          />
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
