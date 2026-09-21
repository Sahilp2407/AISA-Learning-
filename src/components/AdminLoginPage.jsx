import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  Building2, 
  Key, 
  AlertCircle,
  Eye,
  EyeOff,
  Sliders,
  FileCheck2,
  Award,
  Mail,
  ShieldAlert
} from 'lucide-react';
import AisaLogo from './AisaLogo';

// Authorized Admin Emails List
const AUTHORIZED_ADMIN_EMAILS = [
  'avyoma@itm.edu',
  'meetd@itm.edu',
  'admin@itm.edu'
];

export default function AdminLoginPage({ onAdminLoginSuccess, onBack }) {
  const [adminId, setAdminId] = useState('avyoma@itm.edu');
  const [password, setPassword] = useState('admin123');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Strict Admin Email Authorization Check
  const isAuthorizedAdmin = (emailOrId) => {
    if (!emailOrId) return false;
    const cleanInput = emailOrId.toLowerCase().trim();

    // Direct match against explicit admin email list
    if (AUTHORIZED_ADMIN_EMAILS.includes(cleanInput) || cleanInput === 'fac-8092') {
      return true;
    }

    // Check if domain is @itm.edu and not a personal consumer email
    if (cleanInput.includes('@')) {
      const domain = cleanInput.split('@')[1];
      const personalDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'rediffmail.com'];
      if (personalDomains.includes(domain)) {
        return false;
      }
      return domain === 'itm.edu';
    }

    return false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanInput = adminId.trim().toLowerCase();

    if (!cleanInput || !password.trim()) {
      setErrorMsg('Please enter a valid Admin Email and Password.');
      return;
    }

    // Verify Admin Authorization
    if (!isAuthorizedAdmin(cleanInput)) {
      setErrorMsg(`Access Denied (${cleanInput}): Personal emails (@gmail.com) and unauthorized accounts are restricted. Only official ITM admin emails (avyoma@itm.edu, meetd@itm.edu) have permission.`);
      return;
    }

    setIsLoading(true);

    const adminName = cleanInput.includes('avyoma') 
      ? 'Avyoma (Department Chair)' 
      : cleanInput.includes('meetd') 
      ? 'Meet D. (Faculty Administrator)' 
      : 'Dr. Rajesh Kumar';

    setTimeout(() => {
      setIsLoading(false);
      onAdminLoginSuccess({
        name: adminName,
        role: 'Department Chair & Senior Faculty Admin',
        facultyId: cleanInput,
        department: department,
        email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@itm.edu`,
        permissions: ['MANAGE_EXAM_LOCKS', 'AUDIT_RESPONSIBLE_AI', 'CURRICULUM_CONTROL']
      });
    }, 900);
  };

  const handleQuickFill = (email) => {
    setAdminId(email);
    setPassword('admin2026');
    setDepartment('Computer Science & Engineering');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFBFA] flex flex-col lg:flex-row font-sans selection:bg-[#ED7D31]/20 selection:text-charcoal">
      
      {/* ================= LEFT COLUMN: SLEEK FACULTY HERO BRANDING PANEL ================= */}
      <div className="lg:w-[46%] min-h-[460px] lg:min-h-screen bg-gradient-to-b from-[#0F141A] via-[#111720] to-[#0B0E13] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden lg:rounded-r-[40px] shadow-2xl border-r border-white/5">
        
        {/* Ambient Glows */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#ED7D31]/18 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-600/12 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Top Header Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/10 text-white/90 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#ED7D31] animate-pulse" />
            <span className="tracking-wider uppercase text-[10px] font-bold">Faculty Governance & Audit</span>
          </div>
        </div>

        {/* Main Headline & Statement */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-white leading-[1.12]">
            University Faculty & Admin{' '}
            <span className="relative inline-block text-white">
              Portal
              <svg 
                className="absolute -bottom-2 left-0 w-full h-3 text-[#ED7D31]" 
                viewBox="0 0 100 12" 
                fill="none" 
                preserveAspectRatio="none"
              >
                <path 
                  d="M2 9C28 2 72 2 98 9" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                />
              </svg>
            </span>
            <span className="text-[#ED7D31]">.</span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-gray-300 font-serif italic leading-relaxed">
            "Manage real-time exam lockout windows, audit student AI flags, and configure Gemini model parameters."
          </p>

          {/* 3 Core Faculty Control Pillars */}
          <div className="mt-8 space-y-3 pt-2 text-xs font-medium text-gray-300">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#ED7D31]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ED7D31]" />
              </div>
              <span>Scheduled exam lockout windows controller</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#ED7D31]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ED7D31]" />
              </div>
              <span>Responsible AI citation flag verification queue</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#ED7D31]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ED7D31]" />
              </div>
              <span>Gemini API model key & temperature control</span>
            </div>
          </div>

          {/* Institutional Badge Pill */}
          <div className="mt-8 inline-flex items-center gap-3.5 bg-white/[0.06] border border-white/10 backdrop-blur-md rounded-2xl p-3 max-w-md">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ED7D31] to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-tight">Authorized Admin Domain: @itm.edu</p>
              <p className="text-[11px] text-gray-400 leading-tight">avyoma@itm.edu · meetd@itm.edu</p>
            </div>
          </div>
        </div>

        {/* Bottom Trust Line */}
        <div className="relative z-10 pt-4 border-t border-white/10">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
            AISA Academic Governance Platform · Department Administration v2.4
          </p>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: CLEAN FLOATING ADMIN LOGIN CARD ================= */}
      <div className="lg:w-[54%] min-h-screen bg-[#FBFBFA] flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative">
        
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto pt-2 pb-4">
          <button 
            onClick={onBack}
            className="flex items-center group text-left cursor-pointer focus:outline-none"
          >
            <AisaLogo size="sm" isDark={false} />
          </button>

          <button
            onClick={onBack}
            className="text-xs font-semibold text-charcoal-muted hover:text-charcoal flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to homepage</span>
          </button>
        </div>

        {/* Floating Login Card */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl p-7 sm:p-9 border border-[#E9E6DC] shadow-xl shadow-stone-200/50 relative overflow-hidden space-y-6"
          >
            {/* Top Accent Gold Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ED7D31] via-amber-400 to-[#ED7D31]" />

            {/* Small Top Pill Bar Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-1 rounded-full bg-[#ED7D31]" />
                <span className="w-3 h-1 rounded-full bg-gray-200" />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#ED7D31] border border-amber-200">
                <Lock className="w-2.5 h-2.5" /> ITM Admin Portal
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="font-sans text-2xl font-extrabold text-charcoal tracking-tight">
                University Admin Login
              </h2>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Enter your authorized ITM administrator email to manage academic locks.
              </p>
            </div>

            {/* Fast-Pass Authorized Admin Email Fillers */}
            <div className="bg-stone-50 border border-borderLight/80 p-3 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-charcoal">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ED7D31]" />
                  <span>Authorized Admin Accounts:</span>
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">@itm.edu</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('avyoma@itm.edu')}
                  className="flex-1 py-1.5 px-2.5 bg-white hover:bg-amber-50 text-charcoal font-bold text-[11px] rounded-xl border border-borderLight hover:border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs truncate"
                >
                  <Mail className="w-3 h-3 text-[#ED7D31]" />
                  <span className="truncate">avyoma@itm.edu</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('meetd@itm.edu')}
                  className="flex-1 py-1.5 px-2.5 bg-white hover:bg-amber-50 text-charcoal font-bold text-[11px] rounded-xl border border-borderLight hover:border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs truncate"
                >
                  <Mail className="w-3 h-3 text-[#ED7D31]" />
                  <span className="truncate">meetd@itm.edu</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-alertSoft rounded-2xl text-xs flex items-start gap-2.5 leading-relaxed font-medium">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Admin Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Department Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal">
                  Academic Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50/80 border border-borderLight rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-[#ED7D31] transition-all"
                  >
                    <option>Computer Science & Engineering</option>
                    <option>Information Technology</option>
                    <option>Electronics & Communication</option>
                    <option>Data Science & AI Department</option>
                  </select>
                </div>
              </div>

              {/* Admin Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal">
                  Authorized Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="avyoma@itm.edu or meetd@itm.edu"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50/80 border border-borderLight rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-[#ED7D31] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal">
                  Admin Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-stone-50/80 border border-borderLight rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-[#ED7D31] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-charcoal cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="gold-button w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Verifying ITM Admin Access...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Login to ITM Admin Portal</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-gray-100 text-center">
              <p className="text-[11px] text-charcoal-muted">
                Restricted Access · Authorized ITM Administrator Email Required
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="w-full max-w-md mx-auto text-center pb-2">
          <p className="text-[11px] text-charcoal-muted">
            Personal emails (@gmail.com) are strictly restricted from Admin Portal.
          </p>
        </div>
      </div>
    </div>
  );
}
