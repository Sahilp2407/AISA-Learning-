import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, LogIn, LogOut, ShieldCheck, Sun, Moon } from 'lucide-react';
import AisaLogo from './AisaLogo';

export default function Navbar({ currentScreen, onNavigate, user, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    if (currentScreen !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-ghost/92 backdrop-blur-md shadow-sm border-b border-borderLight/80 py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Modern Brand Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED7D31] rounded-xl p-1 cursor-pointer"
          >
            <AisaLogo size="md" isDark={false} />
          </button>

          {/* Navigation Items */}
          {currentScreen === 'landing' ? (
            <div className="flex items-center gap-3 sm:gap-6">
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-charcoal/80">
                <button
                  onClick={() => scrollToSection('features')}
                  className="hover:text-charcoal hover:underline decoration-gold decoration-2 underline-offset-8 transition-all cursor-pointer"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-charcoal hover:underline decoration-gold decoration-2 underline-offset-8 transition-all cursor-pointer"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="hover:text-charcoal hover:underline decoration-gold decoration-2 underline-offset-8 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#ED7D31]" />
                  Academic Integrity
                </button>
              </nav>

              <button
                id="navbar-admin-login-btn"
                onClick={() => onNavigate('admin_login')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-charcoal hover:text-[#ED7D31] bg-white hover:bg-amber-50 border border-borderLight transition-all focus:outline-none focus:ring-2 focus:ring-[#ED7D31] shadow-xs cursor-pointer"
                title="Faculty & Administrator Portal"
              >
                <ShieldCheck className="w-4 h-4 text-[#ED7D31]" />
                <span>Admin Login</span>
              </button>

              <button
                id="navbar-login-btn"
                onClick={() => onNavigate('login')}
                className="gold-button inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold border border-gold-600/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Student Login</span>
              </button>
            </div>
          ) : (currentScreen === 'login' || currentScreen === 'admin_login') ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('landing')}
                className="text-xs sm:text-sm font-semibold text-charcoal hover:text-charcoal px-3.5 py-2 rounded-xl border border-borderLight bg-ghost hover:bg-wheat-100 transition-colors shadow-sm cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
          ) : (
            /* Dashboard state header */
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden sm:flex items-center gap-3 pl-2.5 pr-4 py-1.5 rounded-full bg-wheat-100/90 border border-borderLight shadow-sm">
                <div className="w-7 h-7 rounded-full bg-[#ED7D31]/20 text-[#ED7D31] flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name.charAt(0) : 'A'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-charcoal leading-tight">{user?.name || 'Aditi Sharma'}</p>
                  <p className="text-[10px] text-charcoal-muted leading-tight font-mono">{user?.studentId || '22BCS10492'}</p>
                </div>
              </div>

              <button
                id="navbar-logout-btn"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-charcoal hover:text-alertSoft bg-ghost hover:bg-red-50 border border-borderLight hover:border-red-200 transition-all focus:outline-none focus:ring-2 focus:ring-gold shadow-sm cursor-pointer"
                title="Log out of student portal"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
