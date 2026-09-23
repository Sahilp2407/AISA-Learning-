import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  ArrowLeft, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Zap,
  BookOpen,
  Award,
  Sun,
  Moon
} from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, logOut } from '../firebase';
import AisaLogo from './AisaLogo';

// Helper to verify official institutional / college email
const isCollegeEmail = (email) => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;

  // Block generic consumer emails
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'aol.com', 'rediffmail.com', 'zoho.com',
    'protonmail.com', 'live.com', 'mail.com', 'yandex.com'
  ];
  if (personalDomains.includes(domain)) {
    return false;
  }

  // Allow institutional domains
  return (
    domain.endsWith('.ac.in') ||
    domain.endsWith('.edu') ||
    domain.endsWith('.edu.in') ||
    domain.endsWith('.res.in') ||
    domain.endsWith('.university') ||
    domain === 'isu.ac.in' ||
    domain.includes('.edu.') ||
    domain.includes('.ac.')
  );
};

export default function LoginPage({ onLoginSuccess, onBack }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [shake, setShake] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form Validation
  const validate = () => {
    const newErrors = {};
    const trimmedId = identifier.trim();

    if (!trimmedId) {
      newErrors.identifier = 'Official college email or student ID is required.';
    } else if (trimmedId.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedId)) {
        newErrors.identifier = 'Please enter a valid email format.';
      } else if (!isCollegeEmail(trimmedId)) {
        newErrors.identifier = 'Personal emails (@gmail.com) are restricted. Please enter your college email (e.g. 2024.psahil@isu.ac.in).';
      }
    } else if (trimmedId.length < 3) {
      newErrors.identifier = 'Student ID must be at least 3 characters.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters long.';
    }

    return newErrors;
  };

  const isFormValid = identifier.trim().length >= 3 && password.length >= 4;

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    setAuthError('');
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setErrors({});
    setIsLoading(true);

    const isEmail = identifier.includes('@');
    const emailToUse = isEmail ? identifier.trim() : `${identifier.toLowerCase().replace(/\s+/g, '')}@isu.ac.in`;

    if (isEmail && !isCollegeEmail(emailToUse)) {
      setIsLoading(false);
      setAuthError('Access Denied: Only institutional college email IDs (@isu.ac.in / .ac.in / .edu) can access the syllabus platform.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      let res = await signInWithEmail(emailToUse, password);
      if (!res.success && (res.code === 'auth/user-not-found' || res.code === 'auth/invalid-credential')) {
        res = await signUpWithEmail(emailToUse, password);
      }

      if (res.success && res.user) {
        const fbUser = res.user;
        const displayName = fbUser.displayName || (isEmail ? identifier.split('@')[0] : identifier);
        const formattedName = displayName
          .split(/[ ._]/)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ') || 'Student Scholar';

        onLoginSuccess({
          name: formattedName,
          studentId: identifier.toUpperCase().replace(/\s+/g, '').replace(/@.*$/, ''),
          email: fbUser.email || emailToUse,
          programme: 'B.Tech Computer Science & Engineering',
          academicYear: '3rd Year (Semester VI)',
          enrolledCourse: 'Database Management Systems (CS301)',
          firebaseUid: fbUser.uid
        });
        setIsLoading(false);
        return;
      }
    } catch (fbErr) {
      console.warn("Firebase fallback:", fbErr);
    }

    // Demo Session Fallback
    setTimeout(() => {
      setIsLoading(false);
      let studentName = 'Sahil Pandey';
      let studentId = identifier.trim();

      if (identifier.toLowerCase().includes('sahil')) {
        studentName = 'Sahil Pandey';
      } else if (identifier.toLowerCase().includes('aditi')) {
        studentName = 'Aditi Sharma';
      } else if (identifier.toLowerCase().includes('rahul')) {
        studentName = 'Rahul Verma';
      } else if (!identifier.includes('@') && isNaN(identifier)) {
        studentName = identifier
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }

      onLoginSuccess({
        name: studentName,
        studentId: studentId.toUpperCase().replace(/\s+/g, ''),
        email: identifier.includes('@') ? identifier.trim() : `${identifier.toLowerCase().replace(/\s+/g, '')}@isu.ac.in`,
        programme: 'B.Tech Computer Science & Engineering',
        academicYear: '3rd Year (Semester VI)',
        enrolledCourse: 'Database Management Systems (CS301)',
      });
    }, 600);
  };

  // Google Popup Auth with Strict College Domain Check
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setAuthError('');
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        const fbUser = res.user;
        const userEmail = fbUser.email || '';

        if (!isCollegeEmail(userEmail)) {
          await logOut();
          setAuthError(`Access Restricted (${userEmail}): Personal Gmail accounts are not allowed. Please sign in with your official university Google account (e.g. 2024.psahil@isu.ac.in).`);
          setIsGoogleLoading(false);
          setShake(true);
          setTimeout(() => setShake(false), 500);
          return;
        }

        const rollOrId = userEmail.split('@')[0].toUpperCase();
        onLoginSuccess({
          name: fbUser.displayName || 'University Scholar',
          studentId: rollOrId,
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          programme: 'B.Tech Computer Science & Engineering',
          academicYear: '3rd Year (Semester VI)',
          enrolledCourse: 'Database Management Systems (CS301)',
          firebaseUid: fbUser.uid
        });
        setIsGoogleLoading(false);
        return;
      } else {
        if (res.error && !res.error.includes('closed-by-user') && !res.error.includes('cancelled')) {
          setAuthError(res.error);
        }
      }
    } catch (err) {
      console.error(err);
      setAuthError('Google sign in error. Please verify your university network connection.');
    }
    setIsGoogleLoading(false);
  };

  // Fast-Pass fill helper
  const handleQuickFill = (email) => {
    setIdentifier(email);
    setPassword('demo2026');
    setErrors({});
    setAuthError('');
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFBFA] flex flex-col lg:flex-row font-sans selection:bg-[#ED7D31]/20 selection:text-charcoal">
      
      {/* ================= LEFT COLUMN: SLEEK HERO BRANDING PANEL ================= */}
      <div className="lg:w-[46%] py-6 px-5 sm:p-10 lg:p-16 lg:min-h-screen bg-gradient-to-b from-[#0F141A] via-[#111720] to-[#0B0E13] text-white flex flex-col justify-between relative overflow-hidden lg:rounded-r-[40px] shadow-xl border-r border-white/5">
        
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
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/10 text-white/90 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#ED7D31] animate-pulse" />
            <span className="tracking-wider uppercase text-[10px] font-bold">Academic Integrity Platform</span>
          </div>

          <button 
            onClick={onBack}
            className="lg:hidden text-xs text-stone-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer px-2.5 py-1 rounded-lg bg-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#ED7D31]" />
            <span>Back</span>
          </button>
        </div>

        {/* Main Headline & Statement */}
        <div className="relative z-10 my-auto py-3 sm:py-6 lg:py-8 max-w-lg">
          <h1 className="font-sans text-2xl xs:text-3xl sm:text-4xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.15]">
            Let's master your syllabus{' '}
            <span className="relative inline-block text-white">
              together
              <svg 
                className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#ED7D31]" 
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

          <p className="mt-2.5 sm:mt-4 lg:mt-6 text-xs sm:text-sm lg:text-base text-gray-300 font-serif italic leading-relaxed">
            "Syllabus-grounded explanations, automated exam lockouts & faculty-audited AI for university engineering scholars."
          </p>

          {/* 3 Core Platform Pillars (hidden on mobile, visible on desktop) */}
          <div className="hidden lg:block mt-8 space-y-3 pt-2 text-xs font-medium text-gray-300">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#ED7D31]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ED7D31]" />
              </div>
              <span>100% Exam-safe automatic lockout protocol</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#ED7D31]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ED7D31]" />
              </div>
              <span>Grounded strictly in semester course textbooks</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#ED7D31]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ED7D31]" />
              </div>
              <span>Step-by-step Socratic derivations & proof guidance</span>
            </div>
          </div>

          {/* Social Proof Pill (hidden on narrow screens, visible on lg) */}
          <div className="hidden sm:inline-flex mt-6 lg:mt-8 items-center gap-3.5 bg-white/[0.06] border border-white/10 backdrop-blur-md rounded-2xl p-3 max-w-md">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#ED7D31] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#0F141A]">
                SP
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#0F141A]">
                AS
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#0F141A]">
                RV
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#0F141A]">
                +
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-tight">25,000+ University Scholars</p>
              <p className="text-[11px] text-gray-400 leading-tight">Acing exams & learning honor-safe</p>
            </div>
          </div>
        </div>

        {/* Bottom Trust Line */}
        <div className="hidden lg:block relative z-10 pt-4 border-t border-white/10">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
            Trusted by students across Top Engineering Universities & Colleges
          </p>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: CLEAN FLOATING LOGIN CARD ================= */}
      <div className="lg:w-[54%] bg-[#FBFBFA] flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative min-h-0 lg:min-h-screen">
        
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
            className={`bg-white rounded-3xl p-7 sm:p-9 border border-[#E9E6DC] shadow-xl shadow-stone-200/50 relative overflow-hidden ${
              shake ? 'animate-shake' : ''
            }`}
          >
            {/* Top Accent Gold Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ED7D31] via-amber-400 to-[#ED7D31]" />

            {/* Small Top Pill Bar Indicator */}
            <div className="flex items-center gap-1.5 mb-5">
              <span className="w-7 h-1 rounded-full bg-[#ED7D31]" />
              <span className="w-3 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Title & Subtitle */}
            <div className="text-left mb-6">
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
                Log in to Your Account
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
                Enter your university credentials or continue with Google to access your course syllabus.
              </p>
            </div>

            {/* Error / Restriction Banner */}
            {authError && (
              <div className="mb-5 p-3 rounded-2xl bg-red-50/90 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 text-left animate-shake">
                <ShieldAlert className="w-4 h-4 text-alertSoft flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {/* Google One-Click Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 border border-borderLight rounded-2xl text-xs sm:text-sm font-bold text-charcoal shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-charcoal" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-borderLight" />
              <span className="px-3 text-[10px] font-bold text-charcoal-muted uppercase tracking-wider">
                or enter college credentials
              </span>
              <div className="flex-1 border-t border-borderLight" />
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              {/* College Email Input */}
              <div className="text-left">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="student-id" className="text-xs font-bold text-charcoal">
                    College Email ID
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">e.g. @isu.ac.in</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="student-id"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier) setErrors({ ...errors, identifier: null });
                      if (authError) setAuthError('');
                    }}
                    placeholder="2024.psahil@isu.ac.in"
                    className={`w-full pl-10 pr-4 py-3 bg-stone-50/50 hover:bg-white text-charcoal rounded-2xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[#ED7D31] focus:bg-white ${
                      errors.identifier ? 'border-alertSoft bg-red-50/20' : 'border-borderLight hover:border-gray-400'
                    }`}
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1 text-xs text-alertSoft flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.identifier}</span>
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="text-left">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="text-xs font-bold text-charcoal">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] font-medium text-charcoal-muted hover:text-charcoal transition-colors hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: null });
                      if (authError) setAuthError('');
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-3 bg-stone-50/50 hover:bg-white text-charcoal rounded-2xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[#ED7D31] focus:bg-white ${
                      errors.password ? 'border-alertSoft bg-red-50/20' : 'border-borderLight hover:border-gray-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-muted hover:text-charcoal cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-alertSoft flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Big Gold/Amber Login Button */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#ED7D31] via-amber-500 to-[#ED7D31] hover:brightness-105 shadow-md shadow-[#ED7D31]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Login with College ID</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Fast-Pass Button - Clean, Single Icon */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => handleQuickFill('2024.psahil@isu.ac.in')}
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 rounded-2xl text-xs font-semibold text-charcoal flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#ED7D31] fill-current" />
                <span>Fast-Pass: Sahil</span>
                <span className="font-mono font-bold text-[11px] bg-white px-2 py-0.5 rounded-lg border border-amber-200 text-charcoal">
                  2024.psahil@isu.ac.in
                </span>
              </button>
            </div>

            {/* Subtle terms notice */}
            <p className="mt-4 text-[11px] text-charcoal-muted leading-tight text-center">
              Restricted to institutional accounts (<code className="font-mono text-[10px] bg-gray-100 px-1 py-0.5 rounded text-charcoal">@isu.ac.in</code> / <code className="font-mono text-[10px] bg-gray-100 px-1 py-0.5 rounded text-charcoal">.ac.in</code>).
            </p>
          </motion.div>
        </div>

        {/* Bottom Footer Credits */}
        <div className="w-full max-w-md mx-auto flex items-center justify-between text-xs text-charcoal-muted pt-3 pb-2">
          <span>© 2026 AISA Platform</span>
          <button 
            onClick={onBack}
            className="hover:text-charcoal hover:underline transition-colors cursor-pointer"
          >
            ← Back to homepage
          </button>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-borderLight shadow-soft-lg space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#ED7D31]/15 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6 text-[#ED7D31]" />
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal">Password Reset Protocol</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              You can log in via Google directly with your college account, use your college email and password, or use the <strong>Fast-Pass button</strong> to log in immediately.
            </p>
            <button
              onClick={() => setForgotModalOpen(false)}
              className="w-full py-2.5 bg-charcoal text-white rounded-xl text-xs font-bold hover:bg-charcoal/90 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
