import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { LiveProjectButton } from './LiveProjectButton';
import { LayoutDashboard, Users, GitBranch, ArrowUpRight, Sparkles, Clock } from 'lucide-react';

export interface ProjectData {
  number: string;
  name: string;
  category: string;
  label?: string;
  tagline?: string;
  description?: string;
  tags?: string[];
  status?: string;
  type?: string;
  focus?: string;
  liveUrl?: string;
}

interface ProjectCardProps {
  project: ProjectData;
  onLiveProjectClick: (project: ProjectData) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onLiveProjectClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Mouse tilt tracking (max ±1.5deg)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateY = useTransform(smoothMouseX, [-300, 300], [-1.5, 1.5]);
  const rotateX = useTransform(smoothMouseY, [-300, 300], [1.5, -1.5]);

  // Subtle multi-plane parallax depth for UI frames
  const frame1X = useTransform(smoothMouseX, [-300, 300], [-3, 3]);
  const frame1Y = useTransform(smoothMouseY, [-300, 300], [-2, 2]);

  const frame2X = useTransform(smoothMouseX, [-300, 300], [3, -3]);
  const frame2Y = useTransform(smoothMouseY, [-300, 300], [2, -2]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = cardRef.current?.getBoundingClientRect();
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

  // Parallax subtle scale & y-shift on scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const cardScale = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.97, 1, 1, 0.98]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setIsInView(true);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full flex items-start justify-center pt-2 sm:pt-4 [perspective:1200px]"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 40 }}
        animate={
          isInView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 40 }
        }
        transition={{
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          scale: cardScale,
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformOrigin: 'center center',
          transformStyle: 'preserve-3d',
        }}
        className="w-full max-w-6xl mx-auto rounded-[36px] sm:rounded-[48px] md:rounded-[60px] border-2 border-[#D7E2EA]/35 hover:border-[#D7E2EA] transition-colors duration-500 bg-[#0C0C0C] p-5 sm:p-7 md:p-10 flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.95)] will-change-transform"
      >
        {/* Top Area: Header with Number, Category/Label, Name and CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-[#D7E2EA]/20">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-wrap">
            {/* Number */}
            <span
              className="font-black text-[#D7E2EA] leading-none select-none tracking-tight tabular-nums"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}
            >
              {project.number}
            </span>

            {/* Label and Name */}
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-widest text-[#D7E2EA]/70 uppercase">
                {project.label || project.category}
              </span>
              <h3 className="font-black uppercase text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#D7E2EA] tracking-wide mt-0.5">
                {project.name}
              </h3>
            </div>
          </div>

          {/* Right-side CTA */}
          <LiveProjectButton
            onClick={() => onLiveProjectClick(project)}
            label="VIEW BUILD"
          />
        </div>

        {/* Short Description */}
        {project.description && (
          <div className="pt-6 sm:pt-8 pb-4">
            <p className="font-normal uppercase text-[#D7E2EA]/90 tracking-wide max-w-4xl text-xs sm:text-sm md:text-base leading-relaxed">
              {project.description}
            </p>
          </div>
        )}

        {/* Capability Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-2.5 pb-6 sm:pb-8">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] md:text-xs font-medium tracking-wider uppercase bg-white/5 border border-[#D7E2EA]/20 text-[#D7E2EA]/80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Main Visual Area: 3 Intentional Dark UI Wireframe / Mockup Frames with Depth */}
        <div className="grid grid-cols-12 gap-4 sm:gap-5 md:gap-6 my-2">
          {/* Frame 1: Large Desktop Dashboard Frame */}
          <motion.div
            data-cursor="view"
            style={{
              x: prefersReducedMotion ? 0 : frame1X,
              y: prefersReducedMotion ? 0 : frame1Y,
            }}
            onClick={() => onLiveProjectClick(project)}
            className="col-span-12 lg:col-span-7 rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden bg-neutral-950 border border-neutral-800 p-4 sm:p-6 flex flex-col justify-between group relative cursor-pointer min-h-[300px] sm:min-h-[360px] md:min-h-[420px] transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/60"
          >
            {/* Window titlebar mockup */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                <span className="text-[10px] sm:text-xs tracking-wider text-neutral-400 font-mono ml-2 uppercase">
                  agency-os.local / main
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-800/80 text-[10px] text-neutral-300 font-mono uppercase tracking-wider">
                <LayoutDashboard size={11} className="text-purple-400" />
                <span>DASHBOARD PREVIEW</span>
              </div>
            </div>

            {/* Wireframe Dashboard Content */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 my-3 sm:my-4">
              <div className="rounded-xl bg-neutral-900/90 border border-neutral-800/80 p-2.5 sm:p-3">
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 block mb-1">Pipeline Tracking</span>
                <span className="text-sm sm:text-base font-bold text-white font-mono uppercase">Multi-Stage</span>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-500 h-full w-[65%]" />
                </div>
              </div>
              <div className="rounded-xl bg-neutral-900/90 border border-neutral-800/80 p-2.5 sm:p-3">
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 block mb-1">Outreach Status</span>
                <span className="text-sm sm:text-base font-bold text-white font-mono uppercase">Automated</span>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-400 h-full w-[80%]" />
                </div>
              </div>
              <div className="rounded-xl bg-neutral-900/90 border border-neutral-800/80 p-2.5 sm:p-3">
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 block mb-1">Sync Cadence</span>
                <span className="text-sm sm:text-base font-bold text-white font-mono uppercase">Scheduled</span>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[45%]" />
                </div>
              </div>
            </div>

            {/* Wireframe Lead Stages Mockup */}
            <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800/80 p-3 sm:p-3.5 space-y-2 flex-1 flex flex-col justify-around">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400 border-b border-neutral-800/60 pb-1.5 font-mono">
                <span className="uppercase tracking-wider">Workspace Channel</span>
                <span className="uppercase tracking-wider">Pipeline State</span>
                <span className="uppercase tracking-wider hidden sm:inline">Priority</span>
              </div>
              {[
                { name: 'Lead Qualification & Scoring', stage: 'In Queue', status: 'Priority', color: 'bg-amber-400/20 text-amber-300' },
                { name: 'Personalized Outreach Batch', stage: 'Active Dispatch', status: 'Automated', color: 'bg-purple-400/20 text-purple-300' },
                { name: 'Follow-Up & Scheduling Matrix', stage: 'Cadence Set', status: 'Syncing', color: 'bg-neutral-800 text-neutral-300' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 text-xs text-neutral-300">
                  <span className="font-medium text-white/90 truncate max-w-[150px] sm:max-w-[220px]">{item.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono uppercase ${item.color}`}>
                    {item.stage}
                  </span>
                  <span className="text-[10px] text-neutral-500 hidden sm:inline">{item.status}</span>
                </div>
              ))}
            </div>

            {/* Wireframe subtle watermark footer */}
            <div className="flex items-center justify-between pt-3 text-[10px] font-mono text-neutral-600 border-t border-neutral-800/60 mt-3">
              <span>AGENCY OS ENGINE v1.2</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM ONLINE
              </span>
            </div>
          </motion.div>

          {/* Right Column: 2 Mockup Panels */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 sm:gap-5 md:gap-6">
            {/* Frame 2: Smaller Narrow Panel / Lead Workspace */}
            <motion.div
              data-cursor="view"
              style={{
                x: prefersReducedMotion ? 0 : frame2X,
                y: prefersReducedMotion ? 0 : frame2Y,
              }}
              onClick={() => onLiveProjectClick(project)}
              className="rounded-[24px] sm:rounded-[32px] md:rounded-[40px] bg-neutral-950 border border-neutral-800 p-4 sm:p-5 flex flex-col justify-between group relative cursor-pointer min-h-[190px] sm:min-h-[210px] transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/60"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800/80 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                  <Users size={12} className="text-blue-400" />
                  <span>LEAD WORKSPACE</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                  AI ASSISTED
                </span>
              </div>

              <div className="my-2.5 space-y-2">
                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Outreach Personalization</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Dynamic hooks generated from tech stack data</div>
                  </div>
                  <Sparkles size={14} className="text-purple-400 shrink-0 ml-2" />
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Smart Follow-up Timing</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Automated cadence triggered on open events</div>
                  </div>
                  <Clock size={14} className="text-blue-400 shrink-0 ml-2" />
                </div>
              </div>

              <div className="text-[10px] font-mono text-neutral-500 flex items-center justify-between pt-1">
                <span>STAGE: ENGAGED</span>
                <span>AUTO-SYNC ACTIVE</span>
              </div>
            </motion.div>

            {/* Frame 3: Small UI Detail Frame / Pipeline Detail */}
            <motion.div
              data-cursor="view"
              onClick={() => onLiveProjectClick(project)}
              className="rounded-[24px] sm:rounded-[32px] md:rounded-[40px] bg-neutral-950 border border-neutral-800 p-4 sm:p-5 flex flex-col justify-between group relative cursor-pointer min-h-[160px] sm:min-h-[180px] transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/60"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                  <GitBranch size={12} className="text-emerald-400" />
                  <span>PIPELINE DETAIL</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  5 ACTIVE COLUMNS
                </span>
              </div>

              {/* Visual Pipeline Bar Sequence */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2">
                {[
                  { label: 'DISCOVERY', state: 'STEP 01', active: false },
                  { label: 'QUALIFIED', state: 'STEP 02', active: false },
                  { label: 'DISPATCH', state: 'STEP 03', active: true },
                  { label: 'ENGAGED', state: 'STEP 04', active: true },
                ].map((col, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-2 text-center border ${
                      col.active
                        ? 'bg-neutral-900 border-purple-500/40 text-purple-300'
                        : 'bg-neutral-900/40 border-neutral-800/80 text-neutral-400'
                    }`}
                  >
                    <span className="text-[9px] font-mono block text-neutral-500 truncate">{col.label}</span>
                    <span className="text-[11px] sm:text-xs font-semibold font-mono text-white block mt-0.5">{col.state}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
                <span>METRICS REFRESH: REALTIME</span>
                <span className="text-white/60 group-hover:text-white flex items-center gap-1 transition-colors">
                  EXPAND <ArrowUpRight size={11} />
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Area: Compact Metadata */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#D7E2EA]/20 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#D7E2EA]/50 uppercase tracking-wider text-[11px] sm:text-xs">STATUS —</span>
            <span className="font-semibold text-white uppercase tracking-wider text-[11px] sm:text-xs">
              {project.status || 'IN DEVELOPMENT'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[#D7E2EA]/50 uppercase tracking-wider text-[11px] sm:text-xs">TYPE —</span>
            <span className="font-semibold text-white uppercase tracking-wider text-[11px] sm:text-xs">
              {project.type || 'INTERNAL TOOL'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[#D7E2EA]/50 uppercase tracking-wider text-[11px] sm:text-xs">FOCUS —</span>
            <span className="font-semibold text-white uppercase tracking-wider text-[11px] sm:text-xs">
              {project.focus || 'LEADS / OUTREACH / PIPELINE'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
