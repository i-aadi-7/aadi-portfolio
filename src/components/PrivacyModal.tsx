import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactClick?: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]):not([disabled]), [contenteditable]';

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return elements.filter((el) => {
    return (
      el.offsetWidth > 0 &&
      el.offsetHeight > 0 &&
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      window.getComputedStyle(el).visibility !== 'hidden' &&
      window.getComputedStyle(el).display !== 'none'
    );
  });
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onContactClick,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    openerRef.current = document.activeElement as HTMLElement | null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const globalLenis = (window as any).lenis;
    if (globalLenis && typeof globalLenis.stop === 'function') {
      globalLenis.stop();
    }

    let timerId: ReturnType<typeof setTimeout> | null = null;
    const focusInitial = () => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus({ preventScroll: true });
      }
    };

    const rafId = requestAnimationFrame(() => {
      focusInitial();
      timerId = setTimeout(focusInitial, 50);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements(modalRef.current);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (current === first || !modalRef.current?.contains(current)) {
            e.preventDefault();
            last.focus({ preventScroll: true });
          }
        } else {
          if (current === last || !modalRef.current?.contains(current)) {
            e.preventDefault();
            first.focus({ preventScroll: true });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
      document.body.style.overflow = originalOverflow;
      if (globalLenis && typeof globalLenis.start === 'function') {
        globalLenis.start();
      }
      window.removeEventListener('keydown', handleKeyDown);

      requestAnimationFrame(() => {
        if (
          openerRef.current &&
          document.contains(openerRef.current) &&
          typeof openerRef.current.focus === 'function'
        ) {
          openerRef.current.focus({ preventScroll: true });
        }
      });
    };
  }, [isOpen, handleClose]);

  const modalEase = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 max-[340px]:p-2 sm:p-5 md:p-8 select-none sm:select-text"
          data-lenis-prevent="true"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
          aria-describedby="privacy-modal-desc"
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
              duration: shouldReduceMotion ? 0.15 : 0.38,
              ease: modalEase,
            }}
            data-lenis-prevent="true"
            style={{ maxHeight: 'calc(100dvh - 32px)' }}
            className="relative w-full max-w-3xl bg-[#0C0C0C] border border-neutral-800/90 rounded-[20px] sm:rounded-[26px] shadow-[0_24px_80px_rgba(0,0,0,0.92)] z-10 my-auto text-[#D7E2EA] flex flex-col overflow-hidden"
          >
            {/* Top Close Button */}
            <motion.button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-10 h-10 rounded-xl text-[#D7E2EA]/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-neutral-800 transition-colors z-20 cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
              aria-label="Close Privacy Policy dialog"
            >
              <X size={17} />
            </motion.button>

            {/* Scrollable Content Container */}
            <div
              ref={scrollContainerRef}
              data-lenis-prevent="true"
              tabIndex={0}
              style={{
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
              }}
              className="w-full overflow-y-auto overflow-x-hidden p-6 sm:p-8 md:p-10 focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400/50 focus-visible:ring-inset relative z-10"
            >
              {/* Header Meta */}
              <div className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.22em] text-[#D7E2EA]/50 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                <span>LEGAL / PRIVACY</span>
              </div>

              {/* Title */}
              <h2
                id="privacy-modal-title"
                className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-none pr-10"
              >
                PRIVACY POLICY
              </h2>

              {/* Effective Date & Intro Desc */}
              <p
                id="privacy-modal-desc"
                className="font-mono text-[11px] sm:text-xs text-[#D7E2EA]/50 tracking-[0.14em] uppercase mt-2"
              >
                EFFECTIVE DATE: OCTOBER 7, 2026
              </p>

              {/* Divider */}
              <div className="w-full h-px bg-white/[0.08] my-6" />

              {/* Policy Body */}
              <div className="space-y-6 text-xs sm:text-sm font-light leading-relaxed text-[#D7E2EA]/80">
                {/* 1. Overview */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    1. Overview
                  </h3>
                  <p>
                    This website is a personal portfolio operated by Aadi. This Privacy Policy explains what information is collected when you visit this website and how that information is used.
                  </p>
                </section>

                {/* 2. Analytics */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    2. Analytics
                  </h3>
                  <p className="mb-2">
                    This website uses Google Analytics to understand how visitors interact with the site and to help improve user experience and website performance. Information collected through Google Analytics may include:
                  </p>
                  <ul className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Pages viewed and navigation paths</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Interactions and click events</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Approximate geographic location derived from IP address</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Device, browser, operating system, and screen information</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Referral source and entry pages</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Usage duration and engagement metrics</span>
                    </li>
                  </ul>
                  <p className="mt-2.5">
                    Google Analytics may use cookies or similar identifiers, including <code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/5 text-[#D7E2EA]">_ga</code> cookies, to distinguish sessions and unique visitors. Aadi does not receive visitors&apos; exact personal identities from Google Analytics.
                  </p>
                </section>

                {/* 3. Contact Form */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    3. Contact Form
                  </h3>
                  <p className="mb-2">
                    When you voluntarily submit an inquiry through the Contact form on this portfolio, the information collected may include:
                  </p>
                  <ul className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Your name</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Your email address or contact handle</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Project scope, budget, and timeline selections</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Project description and message details</span>
                    </li>
                  </ul>
                  <p className="mt-2.5">
                    This information is used solely to evaluate your inquiry, respond to your message, and communicate regarding requested work.
                  </p>
                </section>

                {/* 4. Infrastructure & Service Providers */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    4. Infrastructure / Service Providers
                  </h3>
                  <p className="mb-2">
                    This website relies on the following third-party service providers to support hosting, security, analytics, and inquiry delivery:
                  </p>
                  <ul className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span><strong className="text-white font-medium">Google Analytics</strong> — website traffic analytics and performance measurement</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span><strong className="text-white font-medium">Cloudflare Turnstile</strong> — spam, abuse, and automated bot prevention</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span><strong className="text-white font-medium">Supabase</strong> — backend database and edge function infrastructure for processing inquiries</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span><strong className="text-white font-medium">Resend</strong> — transactional email delivery for contact form submissions</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span><strong className="text-white font-medium">Vercel</strong> — website hosting, edge compute, and content delivery</span>
                    </li>
                  </ul>
                  <p className="mt-2.5">
                    These providers may process information as necessary to provide their respective services and are governed by their own privacy policies and terms.
                  </p>
                </section>

                {/* 5. Cookies & Similar Technologies */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    5. Cookies / Similar Technologies
                  </h3>
                  <p>
                    Google Analytics may store analytics cookies or identifiers on your device to understand site usage. Essential and security technologies (such as Cloudflare Turnstile verification) may also be used temporarily for site operation and abuse prevention.
                  </p>
                </section>

                {/* 6. Data Use */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    6. Data Use
                  </h3>
                  <p className="mb-2">
                    Information collected through this site is used exclusively for:
                  </p>
                  <ul className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Operating, maintaining, and protecting the website</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Understanding website usage and improving user experience</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Responding to inquiries and project requests</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">—</span>
                      <span>Preventing spam, fraud, and abusive activity</span>
                    </li>
                  </ul>
                </section>

                {/* 7. Data Sharing */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    7. Data Sharing
                  </h3>
                  <p>
                    Information may be processed by the service providers needed to operate the site, as described above. Personal information is not sold, rented, or traded by the site operator.
                  </p>
                </section>

                {/* 8. Data Retention */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    8. Data Retention
                  </h3>
                  <p>
                    Information is retained only as long as reasonably necessary for the purposes described in this policy, subject to operational, security, or legal requirements. Third-party service providers apply their own retention policies.
                  </p>
                </section>

                {/* 9. User Choices */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    9. User Choices
                  </h3>
                  <p>
                    Visitors can restrict or block cookies through their browser settings or privacy extensions, though this may affect analytics tracking. For contact information submitted voluntarily through the website, users can reach out to the site operator regarding their submitted details.
                  </p>
                </section>

                {/* 10. Changes to Policy */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    10. Changes
                  </h3>
                  <p>
                    This policy may be updated as the site, infrastructure, or services change. Any updates will be posted directly on this page with a revised effective date.
                  </p>
                </section>

                {/* 11. Contact */}
                <section>
                  <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white font-semibold mb-2">
                    11. Contact
                  </h3>
                  <p>
                    If you have questions regarding this Privacy Policy, you can reach out via the Contact option on this portfolio.
                  </p>
                </section>
              </div>

              {/* Footer / Close CTA */}
              <div className="pt-6 mt-8 border-t border-neutral-800/80 flex items-center justify-between gap-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#D7E2EA]/40">
                  &copy; 2026 AADI
                </span>
                <div className="flex items-center gap-3">
                  {onContactClick && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        onContactClick();
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#D7E2EA]/40 hover:bg-white/10 text-[#D7E2EA] text-xs uppercase tracking-wider font-mono transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
                    >
                      CONTACT
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-[#D7E2EA]/30 bg-[#151515] hover:bg-white hover:text-black hover:border-white text-white text-xs uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
