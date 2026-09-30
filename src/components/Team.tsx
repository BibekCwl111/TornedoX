import React from 'react';
import bibekPhoto from '../assets/bibek-barman.jpg';
import sohamPhoto from '../assets/soham-adhikary.jpg';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  photoUrl?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 'bibek',
    name: 'Bibek Barman',
    role: 'Co-Founder & CEO',
    initials: 'BB',
    photoUrl: bibekPhoto,
  },
  {
    id: 'soham',
    name: 'Soham Adhikary',
    role: 'Co-founder & CTO',
    initials: 'SA',
    photoUrl: sohamPhoto,
  },
];

export const Team: React.FC = () => {
  return (
    <section id="team" className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200/70">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#DF9920] mb-2">
            Our Team
          </h2>
          <p className="text-sm text-[#64748B]">
            The builders behind TornedoX technology and solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-amber-300 transition-colors"
            >
              {/* Permanent Round Profile Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-semibold text-lg flex items-center justify-center shrink-0 border-2 border-amber-400/80 shadow-xs overflow-hidden relative">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-[center_25%]"
                  />
                ) : (
                  <span>{member.initials}</span>
                )}
              </div>

              {/* Member Details - 100% Static & Read-Only */}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-[#DF9920] truncate">
                  {member.name}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-blue-600 mt-0.5">
                  {member.role}
                </p>
                <span className="inline-block text-[11px] font-medium text-slate-500 mt-1">
                  TornedoX Leadership
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
