import React from 'react';
import {
  Code2,
  Globe,
  Smartphone,
  Cpu,
  Bot,
  Wrench,
  Layers,
  Sparkles,
  Cog
} from 'lucide-react';

const capabilities = [
  { name: 'Software', icon: Code2 },
  { name: 'Web Development', icon: Globe },
  { name: 'App Development', icon: Smartphone },
  { name: 'IoT', icon: Cpu },
  { name: 'Robotics', icon: Bot },
  { name: 'Automation', icon: Cog },
  { name: 'Embedded Systems', icon: Layers },
  { name: 'Prototyping', icon: Wrench },
  { name: 'Custom Solutions', icon: Sparkles },
];

export const About: React.FC = () => {
  return (
    <section id="about" className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200/70">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#DF9920] mb-3">
            About TornedoX
          </h2>
          <p className="text-base text-[#64748B] leading-relaxed mb-4">
            TornedoX is a technology and innovation company focused on building practical solutions for businesses, startups, and individuals. We combine software, hardware, IoT, automation, robotics, and AI to turn ideas and real-world problems into useful technology solutions.
          </p>
          <p className="text-base text-[#64748B] leading-relaxed mb-4">
            From business websites and applications to smart automation systems, custom prototypes, and technology products, we work to create solutions that are simple, reliable, and designed for real-world use.
          </p>
          <p className="text-sm text-slate-600 font-medium">
            We build and deliver solutions across:
          </p>
        </div>

        {/* Clean capability items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-800">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
