import React from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

interface NotFoundPageProps {
  onBackHome: () => void;
  onContactClick?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onBackHome,
  onContactClick,
}) => {
  return (
    <div
      className="min-h-screen w-full bg-[#0C0C0C] text-[#D7E2EA] flex flex-col justify-between select-none"
      style={{ fontFamily: "'Kanit', sans-serif" }}
    >
      {/* Top Bar */}
      <header className="w-full flex items-center justify-between px-6 sm:px-8 md:px-12 py-6 sm:py-8 z-10">
        <button
          type="button"
          onClick={onBackHome}
          className="font-black uppercase tracking-[0.18em] text-[#F3F4F6] text-base sm:text-lg hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9D72FF] rounded px-1 cursor-pointer"
          aria-label="Return to Aadi Portfolio Home"
        >
          AADI
        </button>
        <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#D7E2EA]/40">
          ERROR / 404
        </span>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-16 text-center max-w-3xl mx-auto w-full my-auto z-10">
        {/* Large Editorial 404 with restrained violet accent dot */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 leading-none">
          <span
            aria-hidden="true"
            className="font-black leading-none tracking-tight text-[#D7E2EA]/20 select-none text-[clamp(6.5rem,20vw,14rem)]"
          >
            404
          </span>
          <span
            aria-hidden="true"
            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#9D72FF] self-center -mt-3 sm:-mt-6 shrink-0"
          />
        </div>

        {/* Headline */}
        <h1 className="font-black uppercase tracking-tight text-[#F3F4F6] text-2xl sm:text-3xl md:text-4xl text-center mt-2 sm:mt-4 leading-tight">
          PAGE NOT FOUND
        </h1>

        {/* Supporting Copy */}
        <p className="font-mono text-xs sm:text-sm tracking-[0.14em] uppercase text-[#D7E2EA]/60 max-w-md text-center mt-4 sm:mt-5 leading-relaxed">
          THE PAGE YOU&apos;RE LOOKING FOR DOESN&apos;T EXIST OR HAS MOVED.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
          <button
            type="button"
            onClick={onBackHome}
            className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-[#D7E2EA]/35 bg-white/5 hover:bg-white/10 hover:border-[#D7E2EA] px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#F3F4F6] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9D72FF] cursor-pointer"
          >
            <ArrowLeft
              size={14}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            <span>BACK HOME</span>
          </button>

          {onContactClick && (
            <button
              type="button"
              onClick={onContactClick}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 hover:border-[#D7E2EA]/40 hover:bg-white/5 px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#D7E2EA]/75 hover:text-[#F3F4F6] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9D72FF] cursor-pointer"
            >
              <span>CONTACT</span>
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          )}
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-8 md:px-12 py-6 sm:py-8 text-[10px] font-mono uppercase tracking-[0.16em] text-[#D7E2EA]/30 z-10">
        <span>DESIGNED &amp; BUILT BY AADI</span>
        <span>&copy; 2026</span>
      </footer>
    </div>
  );
};
