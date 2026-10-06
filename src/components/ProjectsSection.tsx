import React from 'react';
import { FadeIn } from './FadeIn';
import { ProjectCard, ProjectData } from './ProjectCard';

const PROJECTS: ProjectData[] = [
  {
    number: '01',
    name: 'AGENCY OS / CRM',
    category: 'INTERNAL PRODUCT',
    label: 'INTERNAL PRODUCT',
    description:
      'A PRIVATE AI-ASSISTED WORKSPACE BUILT TO MANAGE LEADS, OUTREACH, FOLLOW-UPS, PIPELINE STAGES, AND CLIENT ACTIVITY FOR MY WEB STUDIO.',
    tags: [
      'LEAD MANAGEMENT',
      'PIPELINE',
      'AI OUTREACH',
      'FOLLOW-UPS',
      'CLIENT WORKSPACE',
    ],
    status: 'IN DEVELOPMENT',
    type: 'INTERNAL TOOL',
    focus: 'LEADS / OUTREACH / PIPELINE',
  },
];

interface ProjectsSectionProps {
  onLiveProjectClick: (project: ProjectData) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onLiveProjectClick }) => {
  return (
    <section
      id="projects"
      className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 relative px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-32 sm:pb-40"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Heading: Renamed to CURRENT BUILD */}
        <FadeIn delay={0} y={40} className="w-full text-center mb-12 sm:mb-16 md:mb-20">
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight text-center w-full"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 140px)' }}
          >
            CURRENT BUILD
          </h2>
        </FadeIn>

        {/* Single truthful internal product showcase card */}
        <div className="relative flex flex-col w-full">
          {PROJECTS.map((project) => (
            <ProjectCard
              key={project.number}
              project={project}
              onLiveProjectClick={onLiveProjectClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
