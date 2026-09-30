import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import biometricPhoto from '../assets/biometric-product.png';
import qrProductPhoto from '../assets/qr-product.png';

interface ProductsProps {
  onContactClick: (productName?: string) => void;
}

export const Products: React.FC<ProductsProps> = ({ onContactClick }) => {
  return (
    <section id="products" className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200/70">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#DF9920] mb-2">
            Our Products
          </h2>
          <p className="text-sm text-[#64748B]">
            Ready-to-deploy hardware and digital products built by TornedoX.
          </p>
        </div>

        <div className="space-y-6">
          {/* Product 1: Biometric Attendance System */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all overflow-hidden group">
            <div className="p-4 sm:p-5">
              {/* Product Visual Photo */}
              <div className="w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-slate-900 relative mb-4 border border-slate-200/90 shadow-inner flex items-center justify-center">
                <img
                  src={biometricPhoto}
                  alt="Biometric Attendance System"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-900/85 text-cyan-400 border border-cyan-500/40 backdrop-blur-xs">
                    Hardware & IoT
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-[#DF9920]">
                    Biometric Attendance System
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ready to Deploy
                  </span>
                </div>

                <p className="text-sm text-[#64748B] mb-3 leading-relaxed">
                  A smart biometric attendance machine designed for businesses, schools, and institutions with real-time cloud sync, fingerprint recognition, and automated reporting.
                </p>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-[#DF9920] shrink-0" />
                    <span>Fingerprint & Biometric sensor verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-[#DF9920] shrink-0" />
                    <span>Real-time online attendance log</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-[#DF9920] shrink-0" />
                    <span>Instant exportable reports & sheets</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-[#DF9920] shrink-0" />
                    <span>Simple plug-and-play setup</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Custom hardware & firmware configuration
                  </span>
                  <button
                    onClick={() => onContactClick('Biometric Attendance System')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#DF9920] text-white hover:bg-[#c98415] active:bg-[#b0720f] shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Contact for Details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product 2: QR Menu & Ordering System */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all overflow-hidden group">
            <div className="p-4 sm:p-5">
              {/* Product Visual Photo */}
              <div className="w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-slate-900 relative mb-4 border border-slate-200/90 shadow-inner flex items-center justify-center">
                <img
                  src={qrProductPhoto}
                  alt="QR Menu & Ordering System"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-900/85 text-blue-400 border border-blue-500/40 backdrop-blur-xs">
                    Smart Dining & Retail
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-[#DF9920]">
                    QR Menu & Ordering System
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Live Solution
                  </span>
                </div>

                <p className="text-sm text-[#64748B] mb-3 leading-relaxed">
                  Touchless digital QR menu and tableside ordering system for restaurants, cafes, and retail. Enable customers to scan, view live menus, place orders, and pay effortlessly.
                </p>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    <span>Instant scan — no app download required</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    <span>Real-time menu & price updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    <span>Direct kitchen order management</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    <span>Seamless UPI & online payment support</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Branded QR standees & digital dashboard
                  </span>
                  <button
                    onClick={() => onContactClick('QR Menu & Ordering System')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Get QR Solution</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* More Products Coming Soon */}
          <div className="bg-slate-100/80 rounded-xl border border-dashed border-slate-300 p-4 sm:p-5 text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-[#DF9920] mb-2">
              <Sparkles size={16} />
            </div>
            <h4 className="text-sm font-semibold text-[#DF9920] mb-1">
              More Products Coming Soon
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              We are continuously developing new products and technology solutions. More hardware and digital products will be added here as they launch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
