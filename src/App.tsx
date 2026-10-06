import React, { useState } from 'react';
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
import { ArrowUp, Instagram, Twitter } from 'lucide-react';

function PortfolioContent() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const { scrollTo: smoothScrollTo } = useSmoothScroll();

  const handleOpenContact = () => {
    setIsContactOpen(true);
  };

  const handleOpenProject = (project: ProjectData) => {
    setSelectedProject(project);
  };

  const scrollToTop = () => {
    smoothScrollTo(0);
  };

  return (
    <div
      className="bg-[#0C0C0C] text-[#D7E2EA] min-h-screen selection:bg-[#B600A8]/30 selection:text-white"
      style={{ overflowX: 'clip', fontFamily: "'Kanit', sans-serif" }}
    >
      {/* Intro Page Transition Curtain */}
      <PageTransition />

      {/* Floating Section Transition Tracker */}
      <SectionTracker />

      {/* Scroll reading progress bar */}
      <ScrollProgressBar />

      {/* Stylized reactive custom mouse cursor */}
      <CustomCursor />

      {/* 1. HERO SECTION */}
      <HeroSection onContactClick={handleOpenContact} />

      {/* 2. MARQUEE SECTION */}
      <MarqueeSection />

      {/* 3. ABOUT SECTION */}
      <AboutSection onContactClick={handleOpenContact} />

      {/* 4. SERVICES SECTION */}
      <ServicesSection />

      {/* 5. PROJECTS SECTION */}
      <ProjectsSection onLiveProjectClick={handleOpenProject} />

      {/* Footer */}
      <footer id="contact" className="bg-[#0C0C0C] border-t border-[#D7E2EA]/10 px-6 md:px-12 py-12 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Jack — 3D Creator
            </span>
            <span className="text-xs uppercase tracking-widest text-[#D7E2EA]/50 mt-1 font-light">
              Crafting striking &amp; unforgettable 3D projects
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm uppercase tracking-wider text-[#D7E2EA]/70">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Twitter / X
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://artstation.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              ArtStation
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D7E2EA]/30 text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll back to top"
          >
            <span>Top</span>
            <ArrowUp size={14} />
          </button>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-neutral-900 text-center text-xs text-[#D7E2EA]/40">
          &copy; {new Date().getFullYear()} Jack. All rights reserved. Kanit typography and custom 3D art direction.
        </div>
      </footer>

      {/* Interactive Modals */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onContactClick={() => setIsContactOpen(true)}
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
