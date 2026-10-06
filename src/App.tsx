import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HeroSection } from './components/HeroSection';
import { MarqueeSection } from './components/MarqueeSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ContactModal } from './components/ContactModal';
import { ProjectModal } from './components/ProjectModal';
import { ProjectData } from './components/ProjectCard';
import { CustomCursor } from './components/CustomCursor';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { PageTransition } from './components/PageTransition';
import { SectionTracker } from './components/SectionTracker';
import { SmoothScroll, useSmoothScroll } from './components/SmoothScroll';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { FooterParticles } from './components/FooterParticles';
import { NotFoundPage } from './components/NotFoundPage';

const socialLinks = {
  github: 'https://github.com/i-aadi-7',
  linkedin: 'https://www.linkedin.com/in/aadi7/',
  instagram: 'https://www.instagram.com/i.aadi.7/',
};

const footerReveal = {
  hidden: { opacity: 0, y: 28, filter: 'blur(5px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const footerItemReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const isHomeRoute = (path: string) => path === '/' || path === '/index.html' || path === '';

function PortfolioContent() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleBackHome = useCallback(() => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  }, []);

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactContext, setContactContext] = useState<'default' | 'project'>('default');
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const { scrollTo: smoothScrollTo } = useSmoothScroll();
  const shouldReduceMotion = useReducedMotion();

  // App-level PageTransition loader state
  const [loaderKey, setLoaderKey] = useState(0);
  const [showLoader, setShowLoader] = useState(true);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check query param for preview mode (?previewLoader=1 or ?previewLoader=loop)
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const loaderPreview = params?.get('previewLoader') === '1' || params?.get('previewLoader') === 'loop';

  const replayLoader = useCallback(() => {
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    setShowLoader(false);

    // Double RAF guarantees React completely commits unmount before mounting fresh instance
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLoaderKey((prev) => prev + 1);
        setShowLoader(true);
      });
    });
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
    // Support ?previewLoader=loop in preview/dev mode
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      if (currentParams.get('previewLoader') === 'loop') {
        loopTimerRef.current = setTimeout(() => {
          replayLoader();
        }, 1200);
      }
    }
  }, [replayLoader]);

  // Keyboard shortcut: Shift + L (active in DEV or when previewLoader query param is present)
  useEffect(() => {
    if (!import.meta.env.DEV && !loaderPreview) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        replayLoader();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    };
  }, [loaderPreview, replayLoader]);

  const handleOpenContact = (context: 'default' | 'project' = 'default') => {
    setContactContext(context);
    setIsContactOpen(true);
  };

  const handleOpenProject = (project: ProjectData) => {
    setSelectedProject(project);
  };

  const scrollToTop = () => {
    smoothScrollTo(0);
  };

  if (!isHomeRoute(currentPath)) {
    return (
      <div
        className="bg-[#0C0C0C] text-[#D7E2EA] min-h-screen selection:bg-[#B600A8]/30 selection:text-white"
        style={{ fontFamily: "'Kanit', sans-serif" }}
      >
        <CustomCursor />
        <NotFoundPage
          onBackHome={handleBackHome}
          onContactClick={() => handleOpenContact('default')}
        />
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          context={contactContext}
        />
      </div>
    );
  }

  return (
    <div
      className="bg-[#0C0C0C] text-[#D7E2EA] min-h-screen selection:bg-[#B600A8]/30 selection:text-white"
      style={{ overflowX: 'clip', fontFamily: "'Kanit', sans-serif" }}
    >
      {/* Intro Page Transition Curtain */}
      {showLoader && (
        <PageTransition
          key={loaderKey}
          onComplete={handleLoaderComplete}
        />
      )}

      {/* Floating Section Transition Tracker */}
      <SectionTracker />

      {/* Scroll reading progress bar */}
      <ScrollProgressBar />

      {/* Stylized reactive custom mouse cursor */}
      <CustomCursor />

      {/* 1. HERO SECTION */}
      <HeroSection onContactClick={handleOpenContact} />

      {/* 2. MARQUEE SECTION */}
      <MarqueeSection onContactClick={handleOpenContact} />

      {/* 3. ABOUT SECTION */}
      <AboutSection onContactClick={handleOpenContact} />

      {/* 4. SERVICES SECTION */}
      <ServicesSection />

      {/* 5. PROJECTS SECTION */}
      <ProjectsSection onLiveProjectClick={handleOpenProject} />

      {/* Footer */}
      <footer
        id="contact"
        className="relative z-20 overflow-hidden border-t border-white/[0.07] bg-[#090909] px-5 pt-20 sm:px-8 sm:pt-28 md:px-12 lg:pt-36"
      >
        {/* Generative Typographic Particle Field behind giant AADI */}
        <FooterParticles />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[12%] top-0 h-[680px] w-[72%] opacity-40 z-0"
          style={{ background: 'radial-gradient(circle at 35% 30%, rgba(215,226,234,0.07), transparent 66%)' }}
        />

        <div className="relative mx-auto w-full max-w-screen-2xl z-10">
          <motion.h2
            variants={footerReveal}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.75rem,8vw,9.375rem)] font-black uppercase leading-[0.82] tracking-[-0.04em] text-[#F3F4F6]"
          >
            <span className="block">
              LET&apos;S BUILD <span className="block md:inline">SOMETHING</span>
            </span>
            <span className="mt-[0.08em] block">
              WORTH <span className="block text-[#D7E2EA]/72 sm:inline">REMEMBERING.</span>
            </span>
          </motion.h2>

          <div className="mt-14 grid gap-10 sm:mt-16 md:grid-cols-12 md:items-end md:gap-8 lg:mt-20">
            <motion.p
              variants={footerItemReveal}
              initial={shouldReduceMotion ? 'visible' : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: shouldReduceMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[460px] text-sm font-light leading-relaxed text-[#D7E2EA]/58 sm:text-base md:col-span-6"
            >
              Have an idea, redesign, interactive site, or custom web product in mind?
            </motion.p>

            <motion.div
              variants={footerItemReveal}
              initial={shouldReduceMotion ? 'visible' : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: shouldReduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-6 md:flex md:justify-end md:pr-16"
            >
              <motion.button
                type="button"
                onClick={() => handleOpenContact('default')}
                initial="rest"
                animate="rest"
                whileHover={shouldReduceMotion ? undefined : 'hover'}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                className="group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full border border-[#D7E2EA]/25 bg-[#151515] px-7 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#D7E2EA] shadow-[0_6px_24px_rgba(0,0,0,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D7E2EA]/60"
              >
                {!shouldReduceMotion && (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[#E7E9EC]"
                    variants={{
                      rest: { clipPath: 'circle(0% at 86% 50%)' },
                      hover: { clipPath: 'circle(150% at 86% 50%)' },
                    }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#111111]">
                  START A PROJECT
                </span>
                <ArrowUpRight
                  size={15}
                  className="relative z-10 transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#111111]"
                />
              </motion.button>
            </motion.div>
          </div>

          <motion.div
            initial={shouldReduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.55 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.055, delayChildren: shouldReduceMotion ? 0 : 0.12 } },
            }}
            className="mt-20 flex flex-col gap-8 border-t border-white/[0.07] pt-8 sm:mt-24 lg:mt-32 lg:flex-row lg:items-center lg:justify-between"
          >
            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 sm:gap-x-8">
                {[
                  { label: 'ABOUT', href: '#about' },
                  { label: 'SERVICES', href: '#services' },
                  { label: 'CURRENT BUILD', href: '#projects' },
                ].map((item) => (
                  <motion.li key={item.label} variants={footerItemReveal}>
                    <a
                      href={item.href}
                      className="group/link relative inline-flex min-h-11 items-center py-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[#D7E2EA]/62 transition-[color,opacity] duration-200 hover:text-[#F3F4F6] focus:outline-none focus-visible:text-white"
                    >
                      <span className="transition-transform duration-200 group-hover/link:translate-x-px">{item.label}</span>
                      <span className="absolute bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-[#D7E2EA]/55 transition-transform duration-300 group-hover/link:scale-x-100" />
                    </a>
                  </motion.li>
                ))}
                <motion.li variants={footerItemReveal}>
                  <button
                    type="button"
                    onClick={() => handleOpenContact('default')}
                    className="group/link relative inline-flex min-h-11 cursor-pointer items-center py-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[#D7E2EA]/62 transition-[color,opacity] duration-200 hover:text-[#F3F4F6] focus:outline-none focus-visible:text-white"
                  >
                    <span className="transition-transform duration-200 group-hover/link:translate-x-px">CONTACT</span>
                    <span className="absolute bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-[#D7E2EA]/55 transition-transform duration-300 group-hover/link:scale-x-100" />
                  </button>
                </motion.li>
              </ul>
            </nav>

            <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 sm:gap-x-8" aria-label="Social links">
              {[
                { label: 'GITHUB', url: socialLinks.github },
                { label: 'LINKEDIN', url: socialLinks.linkedin },
                { label: 'INSTAGRAM', url: socialLinks.instagram },
              ].map((item) => {
                const isEnabled = Boolean(item.url && item.url.trim().length > 0);

                return (
                  <motion.li key={item.label} variants={footerItemReveal}>
                    {isEnabled ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social inline-flex min-h-11 items-center gap-1.5 py-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[#D7E2EA]/62 transition-colors duration-200 hover:text-[#F3F4F6] focus:outline-none focus-visible:text-white"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight size={12} className="transition-transform duration-200 group-hover/social:translate-x-0.5 group-hover/social:-translate-y-0.5" />
                      </a>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="inline-flex min-h-11 cursor-default select-none items-center py-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[#D7E2EA]/28"
                      >
                        {item.label}
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          <motion.div
            variants={footerItemReveal}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14 flex flex-col gap-4 border-t border-white/[0.07] pt-6 text-[10px] font-mono uppercase tracking-[0.16em] text-[#D7E2EA]/42 sm:mt-16 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>DESIGNED &amp; BUILT BY AADI</span>
            <div className="flex items-center gap-5">
              <span>&copy; 2026</span>
              <button
                type="button"
                onClick={scrollToTop}
                className="group inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-[#D7E2EA]/52 transition-colors hover:text-white focus:outline-none focus-visible:text-white"
                aria-label="Scroll back to top"
              >
                <span>TOP</span>
                <ArrowUp size={12} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          aria-hidden="true"
          initial={shouldReduceMotion ? { opacity: 0.08 } : { opacity: 0.04, y: 30 }}
          whileInView={{ opacity: 0.08, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none -mb-[0.13em] mt-3 whitespace-nowrap text-center text-[clamp(6.875rem,20vw,22.5rem)] font-black leading-[0.78] tracking-[-0.04em] text-[#D7E2EA] select-none"
        >
          AADI
        </motion.div>
      </footer>

      {/* Interactive Modals */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        context={contactContext}
      />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onContactClick={() => handleOpenContact('project')}
      />
    </div>
  );
}

export default function App() {
  return (
    <SmoothScroll>
      <PortfolioContent />
    </SmoothScroll>
  );
}
