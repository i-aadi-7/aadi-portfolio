import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, Users, GitBranch } from 'lucide-react';
import { ProjectData } from './ProjectCard';

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
  onContactClick: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onContactClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;

    // Lock page background scroll and stop Lenis smoothly
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const globalLenis = (window as any).lenis;
    if (globalLenis && typeof globalLenis.stop === 'function') {
      globalLenis.stop();
    }

    // Handle ESC key to close modal
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
  }, [project, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        data-lenis-prevent="true"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Outer Container with viewport-safe max height */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          data-lenis-prevent="true"
          style={{
            maxHeight: 'calc(100dvh - 32px)',
          }}
          className="relative w-full max-w-4xl bg-[#0C0C0C] border-2 border-[#D7E2EA]/40 rounded-[28px] sm:rounded-[40px] md:rounded-[48px] shadow-2xl z-10 my-auto text-[#D7E2EA] flex flex-col overflow-hidden sm:max-h-[calc(100dvh-48px)]"
        >
          {/* Close button - sticky/fixed relative to modal container */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-[#D7E2EA]/70 hover:text-white hover:bg-white/10 transition-colors z-30 cursor-pointer"
            aria-label="Close project modal"
          >
            <X size={22} className="sm:w-6 sm:h-6" />
          </button>

          {/* Inner Content Wrapper: isolates overflow-y auto so scrolling is buttery smooth and never blocked */}
          <div
            ref={scrollContainerRef}
            data-lenis-prevent="true"
            tabIndex={0}
            style={{
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            }}
            className="w-full h-full overflow-y-auto overflow-x-hidden p-5 sm:p-8 md:p-10 focus:outline-none"
          >
            {/* Header */}
            <div className="flex flex-wrap items-baseline gap-3 sm:gap-5 mb-5 sm:mb-6 pr-10">
              <span className="font-black text-3xl sm:text-5xl text-[#D7E2EA] select-none">
                {project.number || '01'}
              </span>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#D7E2EA]/70 font-semibold block">
                  {project.label || 'INTERNAL PRODUCT'}
                </span>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-[#D7E2EA] mt-0.5">
                  {project.name}
                </h2>
              </div>
            </div>

            {/* Project Details Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 sm:p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs mb-6">
              <div>
                <div className="text-[#D7E2EA]/50 uppercase tracking-wider mb-0.5 text-[10px] sm:text-xs">Status</div>
                <div className="font-semibold text-white uppercase">{project.status || 'IN DEVELOPMENT'}</div>
              </div>
              <div>
                <div className="text-[#D7E2EA]/50 uppercase tracking-wider mb-0.5 text-[10px] sm:text-xs">Type</div>
                <div className="font-semibold text-white uppercase">{project.type || 'INTERNAL TOOL'}</div>
              </div>
              <div>
                <div className="text-[#D7E2EA]/50 uppercase tracking-wider mb-0.5 text-[10px] sm:text-xs">Focus</div>
                <div className="font-semibold text-white uppercase">{project.focus || 'LEADS / OUTREACH / PIPELINE'}</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#D7E2EA]/60 mb-2">
                Overview
              </h4>
              <p className="text-sm sm:text-base font-light text-[#D7E2EA]/90 leading-relaxed">
                A private AI-assisted workspace built to manage leads, outreach, follow-ups, pipeline stages, and client activity for my web studio.
              </p>
            </div>

            {/* Capabilities */}
            <div className="mb-6">
              <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#D7E2EA]/60 mb-3">
                Capabilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {(project.tags || [
                  'LEAD MANAGEMENT',
                  'PIPELINE',
                  'AI OUTREACH',
                  'FOLLOW-UPS',
                  'CLIENT WORKSPACE',
                ]).map((cap) => (
                  <span
                    key={cap}
                    className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium tracking-wider uppercase bg-white/5 border border-[#D7E2EA]/20 text-[#D7E2EA]"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Wireframe Mockup Visuals in Modal */}
            <div className="space-y-4 mb-6">
              {/* Dashboard Frame */}
              <div className="w-full rounded-[20px] sm:rounded-[28px] overflow-hidden border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 text-xs mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                    <span className="text-neutral-400 font-mono ml-2 uppercase text-[10px] truncate max-w-[120px] sm:max-w-none">
                      agency-os.local / main
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider shrink-0">
                    DASHBOARD PREVIEW
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-3">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 block">Lead Pipeline</span>
                    <span className="text-xs sm:text-sm font-medium text-white/90 mt-1 block">Active Stage Management</span>
                  </div>
                  <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-3">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 block">Outreach Automation</span>
                    <span className="text-xs sm:text-sm font-medium text-white/90 mt-1 block">Dynamic Personalization</span>
                  </div>
                  <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-3">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 block">Client Workspace</span>
                    <span className="text-xs sm:text-sm font-medium text-white/90 mt-1 block">Centralized Activity</span>
                  </div>
                </div>
              </div>

              {/* Two Column Mobile Stackable Detail Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-[20px] sm:rounded-[28px] overflow-hidden border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
                  <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users size={12} />
                    <span>LEAD WORKSPACE</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-light">
                    Structured tracking of prospective studio clients, lead qualification, and automated follow-up sequences.
                  </p>
                </div>
                <div className="rounded-[20px] sm:rounded-[28px] overflow-hidden border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GitBranch size={12} />
                    <span>PIPELINE DETAIL</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-light">
                    Stage-by-stage progression from cold outreach and discovery conversations to active project kickoff.
                  </p>
                </div>
              </div>
            </div>

            {/* Project Inquiry CTA */}
            <div className="pt-6 mt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#D7E2EA]">
                  BUILD SOMETHING LIKE THIS
                </h3>
                <p className="text-xs sm:text-sm text-[#D7E2EA]/60 font-light mt-0.5">
                  Have an internal tool or custom web product in mind?
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => {
                    onClose();
                    onContactClick();
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 border border-[#D7E2EA]/30 hover:border-white text-white text-xs sm:text-sm uppercase tracking-wider font-medium transition-all duration-200 cursor-pointer shadow-sm hover:bg-neutral-800"
                >
                  <span>START A PROJECT</span>
                  <ArrowUpRight size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-[#D7E2EA]/20 text-[#D7E2EA]/70 hover:text-white hover:bg-white/10 text-xs sm:text-sm uppercase tracking-wider font-medium transition-colors cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
