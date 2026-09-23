import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, Sparkles, LogIn, LogOut, ShieldCheck, Menu, X, ArrowRight, BookOpen, Clock } from 'lucide-react';
import AisaLogo from './AisaLogo';

export default function Navbar({ currentScreen, onNavigate, user, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
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

  const handleMobileNav = (screen) => {
    setMobileMenuOpen(false);
    onNavigate(screen);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled || mobileMenuOpen
            ? 'bg-[#FDFCF7]/95 backdrop-blur-md shadow-sm border-b border-borderLight/80 py-2.5 sm:py-3'
            : 'bg-transparent py-3 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Modern Brand Logo */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (currentScreen === 'dashboard' || currentScreen === 'exam_hall') {
                  onNavigate('dashboard');
                } else if (currentScreen === 'admin_dashboard') {
                  onNavigate('admin_dashboard');
                } else {
                  onNavigate('landing');
                }
              }}
              className="flex items-center group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED7D31] rounded-xl p-1 cursor-pointer"
            >
              <AisaLogo size="sm" className="sm:hidden" isDark={false} />
              <AisaLogo size="md" className="hidden sm:inline-flex" isDark={false} />
            </button>

            {/* Navigation Items */}
            {currentScreen === 'landing' ? (
              <div className="flex items-center gap-2 sm:gap-6">
                {/* Desktop Nav Links */}
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

                {/* Desktop Login Buttons */}
                <div className="hidden sm:flex items-center gap-2.5">
                  <button
                    id="navbar-admin-login-btn"
                    onClick={() => onNavigate('admin_login')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-charcoal hover:text-[#ED7D31] bg-white hover:bg-amber-50 border border-borderLight transition-all focus:outline-none focus:ring-2 focus:ring-[#ED7D31] shadow-xs cursor-pointer"
                    title="Faculty & Administrator Portal"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ED7D31]" />
                    <span>Admin</span>
                  </button>

                  <button
                    id="navbar-login-btn"
                    onClick={() => onNavigate('login')}
                    className="gold-button inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold border border-gold-600/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Student Login</span>
                  </button>
                </div>

                {/* Mobile Quick Login button (on compact screens) */}
                <button
                  onClick={() => onNavigate('login')}
                  className="sm:hidden gold-button inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-gold-600/30 shadow-sm cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>

                {/* Mobile Hamburger Menu Toggle Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl text-charcoal hover:text-[#ED7D31] hover:bg-amber-50/80 border border-borderLight transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ED7D31]"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              <div className="flex items-center gap-2 sm:gap-5">
                <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-2.5 pr-3 sm:pr-4 py-1.5 rounded-full bg-wheat-100/90 border border-borderLight shadow-sm">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#ED7D31]/20 text-[#ED7D31] flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0) : 'A'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-charcoal leading-tight truncate max-w-[100px] sm:max-w-none">{user?.name || 'Aditi Sharma'}</p>
                    <p className="text-[10px] text-charcoal-muted leading-tight font-mono hidden xs:block">{user?.studentId || '22BCS10492'}</p>
                  </div>
                </div>

                <button
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-charcoal hover:text-alertSoft bg-ghost hover:bg-red-50 border border-borderLight hover:border-red-200 transition-all focus:outline-none focus:ring-2 focus:ring-gold shadow-sm cursor-pointer"
                  title="Log out of student portal"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer / Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && currentScreen === 'landing' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[57px] z-30 bg-[#FDFCF7]/98 backdrop-blur-xl border-b border-borderLight shadow-2xl p-5 md:hidden"
          >
            <div className="space-y-4">
              <nav className="flex flex-col space-y-1">
                <button
                  onClick={() => scrollToSection('features')}
                  className="flex items-center justify-between p-3 rounded-xl font-bold text-charcoal hover:bg-wheat-100/70 text-left transition-colors cursor-pointer text-sm"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#ED7D31]" />
                    Features & Curriculum
                  </span>
                  <ArrowRight className="w-4 h-4 text-charcoal-muted" />
                </button>

                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="flex items-center justify-between p-3 rounded-xl font-bold text-charcoal hover:bg-wheat-100/70 text-left transition-colors cursor-pointer text-sm"
                >
                  <span className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#ED7D31]" />
                    How It Works
                  </span>
                  <ArrowRight className="w-4 h-4 text-charcoal-muted" />
                </button>

                <button
                  onClick={() => scrollToSection('features')}
                  className="flex items-center justify-between p-3 rounded-xl font-bold text-charcoal hover:bg-wheat-100/70 text-left transition-colors cursor-pointer text-sm"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#ED7D31]" />
                    Academic Integrity & Lockouts
                  </span>
                  <ArrowRight className="w-4 h-4 text-charcoal-muted" />
                </button>
              </nav>

              <div className="pt-2 border-t border-borderLight flex flex-col gap-2.5">
                <button
                  onClick={() => handleMobileNav('login')}
                  className="gold-button w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold shadow-md cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Student Portal Login</span>
                </button>

                <button
                  onClick={() => handleMobileNav('admin_login')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-charcoal bg-white hover:bg-amber-50 border border-borderLight transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#ED7D31]" />
                  <span>Faculty & Admin Portal</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-charcoal-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Complies with Higher Education Honor Code Guidelines</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
