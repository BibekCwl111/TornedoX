import React from 'react';
import { ArrowDown, MessageCircle, Mail } from 'lucide-react';
import { Logo } from './Logo.tsx';

interface HeroProps {
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onContactClick }) => {
  return (
    <section className="pt-8 pb-10 sm:pt-12 sm:pb-14 px-4 sm:px-6 text-center">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* TornedoX Logo Prominently */}
        <div className="mb-5 sm:mb-6 transition-transform hover:scale-105 duration-200">
          <Logo size={76} />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#DF9920] mb-1">
          TornedoX
        </h1>

        {/* Tagline */}
        <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#DF9920] uppercase mb-2">
          Your Brand, Our Storm
        </p>

        {/* Subheading */}
        <p className="text-xs sm:text-sm font-medium text-slate-500 tracking-wide mb-3">
          Technology • Automation • Innovation
        </p>

        {/* Short Text */}
        <p className="text-base sm:text-lg text-[#64748B] max-w-lg mb-7 leading-relaxed">
          We build practical technology solutions for businesses, startups and real-world problems.
        </p>

        {/* One Simple Button: Contact Us */}
        <button
          onClick={onContactClick}
          className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-base px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <span>Contact Us</span>
          <ArrowDown size={18} />
        </button>
      </div>
    </section>
  );
};
