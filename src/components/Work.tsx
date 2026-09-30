import React from 'react';
import { Smartphone, Store, Dumbbell, Building2, ExternalLink } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  badgeColor: string;
  accentIcon: React.ElementType;
}

const projects: Project[] = [
  {
    id: 'work-1',
    name: 'Smart Biometric Attendance Console',
    category: 'Hardware & IoT',
    description: 'A compact standalone attendance logger with cloud syncing, designed for local offices, coaching centers and micro-enterprises.',
    badgeColor: 'from-blue-600 to-indigo-600',
    accentIcon: Smartphone,
  },
  {
    id: 'work-2',
    name: 'DineQuick QR Menu & Ordering System',
    category: 'Restaurant Tech',
    description: 'Contactless tabletop QR ordering system allowing patrons to browse real-time menus and place instant kitchen orders.',
    badgeColor: 'from-amber-500 to-orange-600',
    accentIcon: Store,
  },
  {
    id: 'work-3',
    name: 'Gym Member Access & Check-In Portal',
    category: 'Gym Management',
    description: 'Fast check-in kiosk and membership expiry management software developed for regional fitness centers.',
    badgeColor: 'from-cyan-500 to-blue-600',
    accentIcon: Dumbbell,
  },
  {
    id: 'work-4',
    name: 'Hostel & PG Mess Attendance Tracker',
    category: 'Institutional',
    description: 'Digital meal coupon and resident logbook platform that replaced manual registers and eliminated food waste.',
    badgeColor: 'from-emerald-500 to-teal-600',
    accentIcon: Building2,
  },
];

export const Work: React.FC = () => {
  return (
    <section id="work" className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200/70">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#DF9920] mb-2">
            Our Work
          </h2>
          <p className="text-sm text-[#64748B]">
            A showcase of recent implementations, prototypes and deployments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project) => {
            const Icon = project.accentIcon;
            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all overflow-hidden flex flex-col"
              >
                {/* Project Image Banner */}
                <div className={`h-28 w-full bg-gradient-to-br ${project.badgeColor} p-4 flex items-center justify-between text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <span className="text-[11px] font-medium text-white/85 tracking-wider uppercase">
                      {project.category}
                    </span>
                    <h4 className="text-sm sm:text-base font-semibold leading-snug mt-1 text-white line-clamp-1">
                      {project.name}
                    </h4>
                  </div>
                  <div className="relative z-10 w-10 h-10 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                    <Icon size={20} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
