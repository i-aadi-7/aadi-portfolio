import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Sparkles, Layers, Box, Cpu } from 'lucide-react';
import { ProjectData } from './ProjectCard';
import { LiveProjectButton } from './LiveProjectButton';

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
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-4xl bg-[#0C0C0C] border-2 border-[#D7E2EA]/40 rounded-[32px] sm:rounded-[48px] p-5 sm:p-8 md:p-10 shadow-2xl z-10 my-auto text-[#D7E2EA] max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 sm:top-7 sm:right-7 p-2 rounded-full text-[#D7E2EA]/70 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
            aria-label="Close project modal"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <div className="flex flex-wrap items-baseline gap-3 sm:gap-5 mb-6">
            <span className="font-black text-3xl sm:text-5xl text-[#D7E2EA] select-none">
              {project.number}
            </span>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D7E2EA]/60 font-medium">
                {project.category} Project Showcase
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#D7E2EA]">
                {project.name}
              </h2>
            </div>
          </div>

          {/* Project Details Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs mb-6">
            <div>
              <div className="text-[#D7E2EA]/50 uppercase tracking-wider mb-0.5">Role</div>
              <div className="font-semibold text-white">Lead 3D & Motion</div>
            </div>
            <div>
              <div className="text-[#D7E2EA]/50 uppercase tracking-wider mb-0.5">Tools</div>
              <div className="font-semibold text-white">Blender, Octane, C4D</div>
            </div>
            <div>
              <div className="text-[#D7E2EA]/50 uppercase tracking-wider mb-0.5">Year</div>
              <div className="font-semibold text-white">2026</div>
            </div>
            <div>
              <div className="text-[#D7E2EA]/50 uppercase tracking-wider mb-0.5">Deliverables</div>
              <div className="font-semibold text-white">3D Models, Renders, Web</div>
            </div>
          </div>

          {/* Image Showcase Grid */}
          <div className="space-y-4 mb-6">
            <div className="w-full rounded-[24px] sm:rounded-[36px] overflow-hidden border border-neutral-800 bg-neutral-950">
              <img
                src={project.col2Img}
                alt={`${project.name} main showcase`}
                className="w-full h-auto max-h-[460px] object-cover"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[24px] sm:rounded-[36px] overflow-hidden border border-neutral-800 bg-neutral-950">
                <img
                  src={project.col1Img1}
                  alt={`${project.name} detail view 1`}
                  className="w-full h-[240px] object-cover"
                />
              </div>
              <div className="rounded-[24px] sm:rounded-[36px] overflow-hidden border border-neutral-800 bg-neutral-950">
                <img
                  src={project.col1Img2}
                  alt={`${project.name} detail view 2`}
                  className="w-full h-[240px] object-cover"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base font-light text-[#D7E2EA]/80 leading-relaxed mb-6">
            Crafted for high visual impact, combining cutting-edge ray-traced materials with precision topology and cinematic camera choreography. Every element was sculpted and shaded to deliver an unforgettable brand visual identity.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-800">
            <button
              onClick={() => {
                onClose();
                onContactClick();
              }}
              className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Inquire about similar work</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-[#D7E2EA]/50 text-white text-xs sm:text-sm uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
