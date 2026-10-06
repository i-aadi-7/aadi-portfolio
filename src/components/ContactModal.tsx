import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';

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
];

const TIMELINE_OPTIONS = [
  'ASAP',
  '2–4 WEEKS',
  '1–2 MONTHS',
  'FLEXIBLE',
];

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
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Lock page background scroll and stop Lenis
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const globalLenis = (window as any).lenis;
    if (globalLenis && typeof globalLenis.stop === 'function') {
      globalLenis.stop();
    }

    // ESC key listener
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
    setStatus('idle');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const trimmedName = name.trim();
    const trimmedContact = contact.trim();
    const trimmedProject = projectScope.trim();

    if (trimmedName.length < 2) {
      setValidationError('Please enter a valid name (at least 2 characters).');
      return;
    }

    if (trimmedContact.length < 5) {
      setValidationError('Please enter a valid email or WhatsApp contact.');
      return;
    }

    if (trimmedProject.length < 10) {
      setValidationError('Please provide a brief project description (at least 10 characters).');
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          data-lenis-prevent="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            data-lenis-prevent="true"
            style={{ maxHeight: 'calc(100dvh - 32px)' }}
            className="relative w-full max-w-2xl bg-[#0C0C0C] border border-neutral-800 rounded-[28px] sm:rounded-[36px] shadow-2xl z-10 my-auto text-[#D7E2EA] flex flex-col overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-[#D7E2EA]/70 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
              aria-label="Close project modal"
            >
              <X size={20} className="sm:w-5 sm:h-5" />
            </button>

            {/* Scrollable Content */}
            <div
              ref={scrollContainerRef}
              data-lenis-prevent="true"
              tabIndex={0}
              style={{
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
              }}
              className="w-full overflow-y-auto overflow-x-hidden p-6 sm:p-8 md:p-10 focus:outline-none"
            >
              {/* SUCCESS STATE */}
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center mb-1">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                    PROJECT RECEIVED
                  </h3>
                  <div className="text-sm sm:text-base text-[#D7E2EA]/80 font-light max-w-md mx-auto leading-relaxed space-y-1">
                    <p>Thanks — I’ve received your project details.</p>
                    <p>I’ll get back to you soon.</p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-8 py-3 rounded-full bg-neutral-900 border border-[#D7E2EA]/30 hover:border-white text-white text-xs sm:text-sm uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:bg-neutral-800"
                    >
                      CLOSE
                    </button>
                  </div>
                </motion.div>
              ) : status === 'error' ? (
                /* FAILURE / ERROR STATE */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-1">
                    <AlertCircle size={28} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                    COULDN&apos;T SEND PROJECT
                  </h3>
                  <p className="text-sm sm:text-base text-[#D7E2EA]/80 font-light max-w-md mx-auto leading-relaxed">
                    Something went wrong. Please try again.
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="px-6 py-2.5 rounded-full bg-neutral-900 border border-[#D7E2EA]/30 hover:border-white text-white text-xs sm:text-sm uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:bg-neutral-800"
                    >
                      TRY AGAIN
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2.5 rounded-full border border-neutral-800 text-[#D7E2EA]/70 hover:text-white hover:bg-white/5 text-xs sm:text-sm uppercase tracking-wider font-medium transition-colors cursor-pointer text-center"
                    >
                      CLOSE
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* PRIMARY CONTACT FORM */
                <div>
                  {/* Header */}
                  <div className="mb-6 pr-8">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 font-medium block mb-1">
                      Project Inquiry
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-[#D7E2EA]">
                      {headingText}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#D7E2EA]/70 mt-1.5 font-light leading-relaxed">
                      {supportingText}
                    </p>
                  </div>

                  {validationError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-300 text-xs font-mono">
                      {validationError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot field for anti-spam */}
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

                    {/* 1. NAME */}
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#D7E2EA]/70 mb-1.5 font-medium"
                      >
                        1. Name <span className="text-purple-400">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        maxLength={100}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name or team name"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7E2EA]/50 focus:ring-1 focus:ring-purple-500/30 text-sm transition-colors"
                      />
                    </div>

                    {/* 2. EMAIL OR WHATSAPP */}
                    <div>
                      <label
                        htmlFor="contact-method"
                        className="block text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#D7E2EA]/70 mb-1.5 font-medium"
                      >
                        2. Email or WhatsApp <span className="text-purple-400">*</span>
                      </label>
                      <input
                        id="contact-method"
                        type="text"
                        required
                        maxLength={150}
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="you@company.com or +91..."
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7E2EA]/50 focus:ring-1 focus:ring-purple-500/30 text-sm transition-colors"
                      />
                    </div>

                    {/* 3. WHAT DO YOU WANT TO BUILD? */}
                    <div>
                      <label
                        htmlFor="contact-scope"
                        className="block text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#D7E2EA]/70 mb-1.5 font-medium"
                      >
                        3. What do you want to build? <span className="text-purple-400">*</span>
                      </label>
                      <textarea
                        id="contact-scope"
                        rows={3}
                        required
                        maxLength={3000}
                        value={projectScope}
                        onChange={(e) => setProjectScope(e.target.value)}
                        placeholder="Website, redesign, landing page, interactive experience..."
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7E2EA]/50 focus:ring-1 focus:ring-purple-500/30 text-sm resize-none transition-colors"
                      />
                    </div>

                    {/* 4. BUDGET RANGE */}
                    <div>
                      <label className="block text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#D7E2EA]/70 mb-2 font-medium">
                        4. Budget Range <span className="text-[#D7E2EA]/40 font-normal">(Optional)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {BUDGET_OPTIONS.map((opt) => {
                          const isSelected = budget === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setBudget(isSelected ? '' : opt)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-950/60 border border-purple-500/70 text-white shadow-[0_0_12px_rgba(182,0,168,0.25)]'
                                  : 'bg-neutral-900/80 border border-neutral-800 text-[#D7E2EA]/70 hover:border-neutral-700 hover:text-white'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 5. TIMELINE */}
                    <div>
                      <label className="block text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#D7E2EA]/70 mb-2 font-medium">
                        5. Timeline <span className="text-[#D7E2EA]/40 font-normal">(Optional)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TIMELINE_OPTIONS.map((opt) => {
                          const isSelected = timeline === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setTimeline(isSelected ? '' : opt)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-950/60 border border-purple-500/70 text-white shadow-[0_0_12px_rgba(182,0,168,0.25)]'
                                  : 'bg-neutral-900/80 border border-neutral-800 text-[#D7E2EA]/70 hover:border-neutral-700 hover:text-white'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-neutral-800/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-full border border-neutral-800 text-[#D7E2EA]/70 hover:text-white hover:bg-white/5 text-xs sm:text-sm uppercase tracking-wider font-medium transition-colors cursor-pointer text-center"
                      >
                        CLOSE
                      </button>

                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 border border-[#D7E2EA]/30 hover:border-white text-white text-xs sm:text-sm uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>{status === 'submitting' ? 'SENDING...' : 'SEND PROJECT DETAILS'}</span>
                        <Send size={15} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


