import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, MapPin, Check, Copy, UserPlus } from 'lucide-react';

interface ContactProps {
  initialSubject?: string;
}

export const Contact: React.FC<ContactProps> = ({ initialSubject = '' }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const contactData = {
    email: 'bibekcwl04@gmail.com',
    phone: '+91-8741849945',
    whatsapp: '+91-6295372364',
    location: 'Raiganj, Uttar Dinajpur, West Bengal, 733143',
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const emailSubject = encodeURIComponent(
    initialSubject ? `Inquiry regarding ${initialSubject} - TornedoX` : 'Inquiry for TornedoX'
  );
  const emailBody = encodeURIComponent(
    'Hi TornedoX team,\n\nI scanned your visiting card and would like to discuss a requirement/project.\n\nThanks,'
  );
  const emailLink = `mailto:${contactData.email}?subject=${emailSubject}&body=${emailBody}`;

  const whatsappMessage = encodeURIComponent(
    initialSubject
      ? `Hello TornedoX, I am interested in your ${initialSubject}. Could you share more details?`
      : 'Hello TornedoX, I scanned your visiting card and would like to discuss a project.'
  );
  const whatsappLink = `https://wa.me/${contactData.whatsapp.replace(/\+/g, '')}?text=${whatsappMessage}`;

  // Generate downloadable vCard (.vcf)
  const downloadVCard = () => {
    const vcardContent = `BEGIN:VCARD
VERSION:3.0
FN:Bibek Barman - TornedoX
N:Barman;Bibek;;;
ORG:TornedoX
TITLE:Co-Founder & CEO
TEL;TYPE=CELL,VOICE:${contactData.phone}
TEL;TYPE=WORK,VOICE:${contactData.whatsapp}
EMAIL;TYPE=PREF,INTERNET:${contactData.email}
ADR;TYPE=WORK:;;${contactData.location};;;;
NOTE:Technology • Automation • Innovation
URL:https://tornedox.com
END:VCARD`;

    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bibek_Barman_TornedoX.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="contact" className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200/70">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#DF9920] mb-2">
            Let's Work Together
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            Have an idea, business requirement or project in mind? Get in touch with TornedoX.
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 mb-5 space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 block">Email</span>
                <a
                  href={emailLink}
                  className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                >
                  {contactData.email}
                </a>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(contactData.email, 'email')}
              title="Copy Email"
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              {copiedType === 'email' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 block">Phone</span>
                <a
                  href={`tel:${contactData.phone.replace(/\s+/g, '')}`}
                  className="text-sm font-semibold text-slate-900 hover:text-emerald-600 transition-colors truncate block"
                >
                  {contactData.phone}
                </a>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(contactData.phone, 'phone')}
              title="Copy Phone"
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              {copiedType === 'phone' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 block">WhatsApp</span>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-slate-900 hover:text-emerald-600 transition-colors truncate block"
                >
                  {contactData.whatsapp}
                </a>
              </div>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
            >
              Open
            </a>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Location</span>
              <span className="text-sm font-medium text-slate-800">
                {contactData.location}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Email Us & WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <a
            href={emailLink}
            className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm sm:text-base py-3 px-4 rounded-xl shadow-xs transition-colors text-center"
          >
            <Mail size={18} />
            <span>Email Us</span>
          </a>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#059669] hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm sm:text-base py-3 px-4 rounded-xl shadow-xs transition-colors text-center"
          >
            <MessageSquare size={18} />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Digital Visiting Card Extra: Save Contact to Phone (vCard) */}
        <button
          onClick={downloadVCard}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
        >
          <UserPlus size={16} className="text-blue-600" />
          <span>Save Contact to Phone (.vcf)</span>
        </button>
      </div>
    </section>
  );
};
