import React from 'react';
import { Logo } from './Logo.tsx';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-8 px-4 sm:px-6 border-t border-slate-900">
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
        {/* TornedoX Brand */}
        <div className="flex items-center gap-2 mb-1">
          <Logo size={28} />
          <span className="text-lg font-bold text-[#DF9920] tracking-tight">TornedoX</span>
        </div>

        <p className="text-[11px] font-semibold text-[#DF9920] tracking-wider uppercase mb-1">
          Your Brand, Our Storm
        </p>

        <p className="text-xs sm:text-sm font-medium text-slate-400 mb-3 tracking-wide">
          Technology • Automation • Innovation
        </p>

        {/* MSME Registration */}
        <div className="text-xs text-slate-400 mb-5 pb-4 border-b border-slate-800/80 w-full max-w-sm">
          <span>MSME Registration: </span>
          <span className="font-mono text-slate-300 font-medium">UDYAM-WB-04-0018921</span>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-6 mb-5">
          <a
            href="https://linkedin.com/company/tornedox"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            LinkedIn
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="https://www.instagram.com/tornedo.x"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Instagram
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="https://wa.me/916295372364"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            WhatsApp
          </a>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-slate-500">
          © 2026 TornedoX. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
