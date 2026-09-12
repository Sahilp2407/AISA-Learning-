import React from 'react';
import { GraduationCap, Sparkles, Shield, Heart, ExternalLink } from 'lucide-react';
import AisaLogo from './AisaLogo';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-ghost-100 border-t border-borderLight text-charcoal-muted pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4 text-left">
            <AisaLogo size="md" />
            <p className="text-sm text-charcoal-muted max-w-md leading-relaxed">
              Personalised Academic Assistant Platform engineered for university students. 
              Designed with strict academic integrity, context-aware AI tutoring, and responsible governance.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-charcoal-muted bg-wheat-100/70 px-3 py-1.5 rounded-lg border border-borderLight">
              <Shield className="w-3.5 h-3.5 text-[#ED7D31]" />
              <span>Complies with Higher Education AI Ethics Guidelines</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="text-left">
            <h4 className="font-serif font-bold text-sm text-charcoal uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-charcoal hover:underline decoration-gold underline-offset-4 transition-colors">
                  AI Academic Assistant
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-charcoal hover:underline decoration-gold underline-offset-4 transition-colors">
                  Exam-Aware Guardrails
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-charcoal hover:underline decoration-gold underline-offset-4 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('login')} 
                  className="hover:text-charcoal hover:underline decoration-gold underline-offset-4 text-left transition-colors font-semibold text-charcoal cursor-pointer"
                >
                  Student Portal Login →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Ethics */}
          <div className="text-left">
            <h4 className="font-serif font-bold text-sm text-charcoal uppercase tracking-wider mb-4">
              Academic Governance
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED7D31]"></span>
                <span>Honor Code Verification</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED7D31]"></span>
                <span>Proctored Exam Lockouts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED7D31]"></span>
                <span>Responsible AI Auditing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED7D31]"></span>
                <span>Faculty Review Feedback</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-borderLight/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-muted">
          <p>
            © {new Date().getFullYear()} AISA — AI-Powered Student Assistant Platform · Group 12 Prototype
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-charcoal transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-charcoal transition-colors cursor-pointer">Terms of Academic Use</span>
            <span>•</span>
            <span className="hover:text-charcoal transition-colors cursor-pointer">University Partner API</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
