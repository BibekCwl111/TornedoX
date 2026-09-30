import React from 'react';
import {
  UtensilsCrossed,
  Dumbbell,
  Building2,
  Store,
  Boxes,
  Globe,
  Smartphone,
  Cpu,
} from 'lucide-react';

const services = [
  {
    title: 'Restaurant',
    description: 'Restaurant software, QR-based systems, ordering and management solutions.',
    icon: UtensilsCrossed,
  },
  {
    title: 'Gym',
    description: 'Gym management, attendance and digital management solutions.',
    icon: Dumbbell,
  },
  {
    title: 'Hostel',
    description: 'Hostel/PG management, attendance and mess-related solutions.',
    icon: Building2,
  },
  {
    title: 'Mini Business',
    description: 'Simple digital solutions and automation for small and local businesses.',
    icon: Store,
  },
  {
    title: 'Prototype & Product Development',
    description: 'Build prototypes and convert ideas into working hardware/software products.',
    icon: Boxes,
  },
  {
    title: 'Web Development',
    description: 'Modern websites and business web applications.',
    icon: Globe,
  },
  {
    title: 'App Development',
    description: 'Mobile applications and custom app solutions.',
    icon: Smartphone,
  },
  {
    title: 'IoT & Automation',
    description: 'Smart devices, sensors, automation and connected systems.',
    icon: Cpu,
  },
];

export const Services: React.FC = () => {
  return (
    <section id="services" className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200/70">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#DF9920] mb-2">
            Our Services
          </h2>
          <p className="text-sm text-[#64748B]">
            Practical tech solutions tailored for specific business and operational needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#DF9920] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#DF9920] mb-1">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
