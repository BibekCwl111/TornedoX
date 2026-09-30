import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Info, Briefcase, Box, Users, PhoneCall, Star, X } from 'lucide-react';
import { Logo } from './Logo.tsx';

interface HeaderProps {
  onNavigate?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleScrollTo = (sectionId: string) => {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const menuItems = [
    { label: 'About Us', id: 'about', icon: Info },
    { label: 'Services', id: 'services', icon: Briefcase },
    { label: 'Products', id: 'products', icon: Box },
    { label: 'Our Work', id: 'work', icon: Briefcase },
    { label: 'Our Team', id: 'team', icon: Users },
    { label: 'Contact', id: 'contact', icon: PhoneCall },
    { label: 'Reviews', id: 'reviews', icon: Star },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-shadow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: TornedoX Logo & Name */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md py-1"
        >
          <Logo size={32} />
          <div className="flex flex-col text-left">
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#DF9920] transition-colors leading-tight">
              TornedoX
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight -mt-0.5">
              Your Brand, Our Storm
            </span>
          </div>
        </a>

        {/* Right: Simple Three-Dot Menu (⋮) */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {menuOpen ? <X size={20} /> : <MoreVertical size={20} />}
          </button>

          {/* Small dropdown menu */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              role="menu"
            >
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleScrollTo(item.id)}
                    className="w-full text-left px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    role="menuitem"
                  >
                    <Icon size={16} className="text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
