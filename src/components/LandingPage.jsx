import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  Clock, 
  Flag, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  XCircle,
  ChevronDown, 
  Lock, 
  Zap, 
  GraduationCap, 
  MessageSquare, 
  Star,
  Layers,
  Award,
  Users,
  Check,
  ChevronRight,
  Database,
  Code2,
  Terminal,
  Calculator,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import ThreeHeroCanvas from './ThreeHeroCanvas';
import Footer from './Footer';
import studentsTrioImg from '../assets/students-trio.jpg';

// Scroll Reveal Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function LandingPage({ onNavigate }) {
  const [openFaq, setOpenFaq] = useState(0);
  const videoRef = useRef(null);
  const heroVideoAnchorRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [, setIsVideoAvailable] = useState(true);

  // Mobile Floating Sticky Mini-Player State
  const [isMobileView, setIsMobileView] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isManualPiP, setIsManualPiP] = useState(false);
  const [isFloatingDismissed, setIsFloatingDismissed] = useState(false);

  // Screen size check for mobile/tablet devices (< 1024px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll listener to detect when hero video moves out of view on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (!heroVideoAnchorRef.current) return;
      const rect = heroVideoAnchorRef.current.getBoundingClientRect();
      // On mobile, float when the hero video is scrolled near the top edge or user scrolls down
      const isPast = rect.bottom < 140 || window.scrollY > 150;
      setIsScrolledPastHero(isPast);

      // If user scrolls back up near the top of the page, reset dismissal so next scroll floats again
      if (window.scrollY < 60) {
        setIsFloatingDismissed(false);
        setIsManualPiP(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isFloating = isMobileView && (isManualPiP || (isScrolledPastHero && !isFloatingDismissed));

  // Control handlers
  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleExpandToHero = (e) => {
    if (e) e.stopPropagation();
    setIsManualPiP(false);
    setIsFloatingDismissed(true);
    if (heroVideoAnchorRef.current) {
      heroVideoAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDismissFloating = (e) => {
    if (e) e.stopPropagation();
    setIsManualPiP(false);
    setIsFloatingDismissed(true);
  };

  // Auto-play video on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  const [selectedCourseTab, setSelectedCourseTab] = useState('All');

  const courseCards = [
    {
      code: 'CS301',
      title: 'Database Management Systems',
      category: 'Systems',
      desc: 'B+ Tree indexing, 3NF/BCNF normalization proofs, ACID transaction recovery & serializability.',
      units: '5 Units · 48 Topics',
      icon: Database,
      tags: ['SQL & NoSQL', 'ACID Transactions', 'B+ Trees'],
      difficulty: 'High Yield',
    },
    {
      code: 'CS204',
      title: 'Data Structures & Algorithms',
      category: 'Algorithms',
      desc: 'Dynamic programming state formulations, graph traversals, amortized asymptotic complexity.',
      units: '6 Units · 62 Topics',
      icon: Code2,
      tags: ['DP Memoization', 'Graph Traversals', 'Big-O Proofs'],
      difficulty: 'Core Exam',
    },
    {
      code: 'CS308',
      title: 'Operating Systems',
      category: 'Systems',
      desc: 'Process concurrency, Coffman deadlock detection, virtual memory page replacement algorithms.',
      units: '5 Units · 54 Topics',
      icon: Terminal,
      tags: ['Semaphores', 'Deadlock Detection', 'Virtual Memory'],
      difficulty: 'Crucial Concept',
    },
    {
      code: 'MA201',
      title: 'Engineering Mathematics',
      category: 'Mathematics',
      desc: 'Fourier transforms, Laplace equations, multivariable calculus & linear algebra derivations.',
      units: '4 Units · 40 Topics',
      icon: Calculator,
      tags: ['Fourier Series', 'Laplace Transforms', 'Eigenvalues'],
      difficulty: 'Foundation',
    },
  ];

  const filteredCourses = selectedCourseTab === 'All' 
    ? courseCards 
    : courseCards.filter(c => c.category === selectedCourseTab);

  const faqs = [
    {
      q: 'What makes AISA different from standard ChatGPT or Copilot?',
      a: 'AISA is specifically calibrated to university engineering and science syllabi. Instead of just giving away final answers, it teaches you step-by-step through Socratic tutoring. Crucially, during scheduled college exams, AISA automatically pauses to protect your academic integrity.'
    },
    {
      q: 'How does the Exam-Aware Restriction feature work?',
      a: 'AISA syncs with university academic calendars. When an exam slot starts for your enrolled subject, AI query generation automatically locks, preventing accidental honor-code violations.'
    },
    {
      q: 'Can I flag or report inaccurate answers?',
      a: 'Yes. Every response includes a direct Responsible AI flag. Submissions are cataloged and reviewed by university faculty and teaching assistants to ensure 100% textbook accuracy.'
    },
    {
      q: 'Is this prototype completely free to test?',
      a: 'Yes. You can test the full student experience in-memory with pre-configured courses, simulated exam locks, and interactive tutoring.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#FDFCF7] text-charcoal overflow-hidden pt-16 sm:pt-20 font-sans selection:bg-gold-200 selection:text-charcoal">
      
      {/* 1. HERO SECTION WITH SCROLL & ENTRANCE REVEAL */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 max-w-7xl mx-auto bg-dot-pattern hero-glow-top-right">
        
        {/* Subtle Three.js canvas in deep background */}
        <ThreeHeroCanvas />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center relative z-10">
          
          {/* LEFT COLUMN: HERO COPY */}
          <motion.div 
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            {/* Modern Glassmorphic Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-xs hover:border-[#ED7D31]/40 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-800 font-bold tracking-tight">Syllabus-Grounded AI</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[#ED7D31] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Automatic Exam Lockouts
              </span>
            </div>

            {/* Main Headline with High-End Typographic Rhythm */}
            <div className="space-y-1.5">
              <h1 className="font-sans text-3xl xs:text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-black tracking-tight text-slate-900 leading-[1.1]">
                Master your syllabus.
              </h1>
              <h1 className="font-sans text-3xl xs:text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-black tracking-tight text-slate-900 leading-[1.1]">
                Ace your exams.
              </h1>
              <div className="pt-2 flex items-center flex-wrap gap-3">
                <div className="relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-2xl bg-gradient-to-r from-[#ED7D31] via-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 border border-white/20">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200 flex-shrink-0" />
                  <span className="font-sans text-2xl xs:text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px] font-black tracking-tight">
                    Stay honor-safe.
                  </span>
                </div>
              </div>
            </div>

            {/* Explanatory Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              Ask questions directly from your active college syllabus. AI assistance automatically pauses during scheduled exam windows — so you learn deeply without risking your academic integrity.
            </p>

            {/* Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('login')}
                className="group w-full sm:w-auto justify-center px-7 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-[#ED7D31] to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
              >
                <span>Choose your course</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-400 group-hover:text-[#ED7D31] transition-colors" />
                <span>See exam lockout</span>
              </button>
            </div>

            {/* 4 Feature Micro-Cards Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 max-w-lg pt-2 w-full">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/70 backdrop-blur-xs shadow-2xs hover:border-[#ED7D31]/30 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Free student access</span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/70 backdrop-blur-xs shadow-2xs hover:border-[#ED7D31]/30 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">100% Exam-safe lock</span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/70 backdrop-blur-xs shadow-2xs hover:border-[#ED7D31]/30 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-orange-50 text-[#ED7D31] flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Socratic derivations</span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/70 backdrop-blur-xs shadow-2xs hover:border-[#ED7D31]/30 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Faculty review audit trail</span>
              </div>
            </div>

            {/* Social Proof & Rating Strip */}
            <div className="flex items-center gap-4 pt-2 border-t border-slate-200/70 max-w-lg">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                  A
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                  R
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                  S
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                  +1.4k
                </div>
              </div>

              <div className="text-xs text-slate-600">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <span>★★★★★</span>
                  <span className="text-slate-900 font-black ml-1">4.9 / 5.0</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Trusted across B.Tech CSE & Engineering cohorts</p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: HERO ACADEMIC AI VIDEO / MEDIA SHOWCASE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 w-full flex flex-col items-center justify-center relative"
          >
            <div ref={heroVideoAnchorRef} className="relative w-full max-w-2xl lg:max-w-none">
              {/* Decorative Background Glow (Active when docked in hero) */}
              {!isFloating && (
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#ED7D31] via-amber-400 to-orange-500 rounded-[32px] blur-md opacity-35" />
              )}

              {/* Placeholder in hero when floating on mobile to prevent layout shift */}
              {isFloating && (
                <div className="w-full aspect-video rounded-3xl border-2 border-dashed border-amber-400/40 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-amber-500/10 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ED7D31] to-amber-500 text-white flex items-center justify-center mb-2 shadow-md shadow-orange-500/20 animate-pulse">
                    <Video className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-black text-charcoal">AISA Demo Video is Playing</p>
                  <p className="text-[11px] text-charcoal-muted mt-0.5 max-w-xs">
                    Playing in the bottom-right corner as you scroll through courses & modules
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualPiP(false);
                      setIsFloatingDismissed(true);
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-[#ED7D31] text-xs font-bold border border-amber-300 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand Video to Hero</span>
                  </button>
                </div>
              )}

              {/* Video Player Card (Floats to bottom-right on mobile when scrolled) */}
              <div className={`
                overflow-hidden bg-slate-950 group aspect-video transition-all duration-300 ease-out
                ${isFloating 
                  ? 'fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3 xs:right-4 z-50 w-48 xs:w-56 sm:w-64 rounded-2xl shadow-2xl shadow-black/60 border-2 border-white/95 ring-2 ring-[#ED7D31]/60 backdrop-blur-md' 
                  : 'relative rounded-3xl shadow-2xl border-2 border-white/90'
                }
              `}>
                
                {/* Embedded HTML5 Video with Audio, Auto-loop and Poster Fallback */}
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  poster={studentsTrioImg}
                  onLoadedData={() => setIsVideoAvailable(true)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={togglePlay}
                  className="w-full h-full object-cover cursor-pointer"
                >
                  <source src="/gemini_generated_video_5ff571c6.mp4" type="video/mp4" />
                  <source src="/hero-video.mp4" type="video/mp4" />
                  <img
                    src={studentsTrioImg}
                    alt="University scholars studying with AISA"
                    className="w-full h-full object-cover"
                  />
                </video>

                {/* Subtle Bottom Gradient for Controls Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Mini-Player Top Bar (Active only when floating) */}
                {isFloating && (
                  <div className="absolute top-2 inset-x-2 flex items-center justify-between z-30 pointer-events-auto">
                    <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ED7D31] animate-ping" />
                      <span className="text-[9px] font-black text-white tracking-wider uppercase">Live Demo</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleExpandToHero}
                        className="w-6 h-6 rounded-lg bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer shadow-sm"
                        title="Expand Video to Hero"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={handleDismissFloating}
                        className="w-6 h-6 rounded-lg bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer shadow-sm"
                        title="Close Mini-Player"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Central Play Button Overlay when Paused */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className={`absolute inset-0 m-auto rounded-full bg-[#ED7D31]/90 hover:bg-[#ED7D31] text-white flex items-center justify-center shadow-2xl backdrop-blur-sm cursor-pointer transition-transform hover:scale-110 active:scale-95 z-20 ${
                      isFloating ? 'w-10 h-10' : 'w-16 h-16'
                    }`}
                    title="Play Video"
                  >
                    <Play className={`${isFloating ? 'w-4 h-4' : 'w-7 h-7'} ml-0.5 fill-current`} />
                  </button>
                )}

                {/* Clean Bottom-Right Interactive Video Controls */}
                <div className={`absolute flex items-center gap-1.5 sm:gap-2 z-20 ${
                  isFloating ? 'bottom-2 right-2' : 'bottom-4 right-4'
                }`}>
                  {/* PiP Popout button on mobile when NOT floating */}
                  {!isFloating && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsManualPiP(true);
                      }}
                      className="lg:hidden w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                      title="Float to Corner (PiP)"
                    >
                      <Minimize2 className="w-4 h-4 text-amber-400" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleMute}
                    className={`${
                      isFloating ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl'
                    } bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-md`}
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {isMuted ? (
                      <VolumeX className={`${isFloating ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-slate-300`} />
                    ) : (
                      <Volume2 className={`${isFloating ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-400`} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className={`${
                      isFloating ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl'
                    } bg-[#ED7D31] hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-[#ED7D31]/30 transition-all cursor-pointer`}
                    title={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? (
                      <Pause className={`${isFloating ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                    ) : (
                      <Play className={`${isFloating ? 'w-3.5 h-3.5' : 'w-4 h-4'} ml-0.5 fill-current`} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CONTINUOUS MARQUEE TICKER RIBBON */}
      <div className="bg-charcoal py-4 text-white overflow-hidden border-y border-charcoal/80 select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-sans font-extrabold text-sm sm:text-base tracking-wider uppercase">
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> Master Course Concepts
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> Ace Semester Exams
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> 100% Honor Code Safe
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> CS301 Database Systems
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> CS204 Data Structures & Algorithms
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> CS308 Operating Systems
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> 24/7 Socratic AI Tutoring
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          
          {/* Duplicate loop */}
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> Master Course Concepts
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> Ace Semester Exams
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> 100% Honor Code Safe
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> CS301 Database Systems
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> CS204 Data Structures & Algorithms
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> CS308 Operating Systems
          </span>
          <span className="text-gold/40 text-xs">✦</span>
          <span className="flex items-center gap-2.5">
            <span className="text-gold font-bold">★</span> 24/7 Socratic AI Tutoring
          </span>
          <span className="text-gold/40 text-xs">✦</span>
        </div>
      </div>

      {/* 3. SYLLABUS INTELLIGENCE: COURSE MODULES SECTION (SCROLL REVEAL) */}
      {/* 3. SYLLABUS INTELLIGENCE: COURSE MODULES SECTION (DYNAMIC ANIMATIONS & FILTERS) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        {/* Ambient Warm Floating Glow Behind Cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[360px] bg-gradient-to-tr from-amber-400/15 via-orange-500/10 to-transparent blur-3xl pointer-events-none rounded-full -z-10" />

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#ED7D31] bg-orange-50/90 border border-orange-200/80 shadow-2xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Syllabus Intelligence Engine</span>
          </div>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
            Course modules supported right now
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Grounded directly in approved engineering department syllabi. Covers Unit 1 to Unit 5 with step-by-step Socratic derivations, proofs, and textbook exam benchmarks.
          </p>

          {/* Interactive Filter Pills with Spring Physics */}
          <div className="flex items-center gap-2 pt-6 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center flex-nowrap sm:flex-wrap">
            {['All', 'Systems', 'Algorithms', 'Mathematics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCourseTab(tab)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCourseTab === tab 
                    ? 'text-white shadow-md shadow-orange-500/25' 
                    : 'text-slate-600 bg-white/90 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {selectedCourseTab === tab && (
                  <motion.div
                    layoutId="activeCourseTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#ED7D31] to-amber-500 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span>{tab === 'All' ? '⚡ All Modules' : tab}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Card Grid with High-End Spring Hover & Shimmer Light Beams */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course) => {
              const Icon = course.icon;
              return (
                <motion.div
                  key={course.code}
                  layout
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -20 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.025,
                    transition: { type: "spring", stiffness: 400, damping: 20 }
                  }}
                  onClick={() => onNavigate('login')}
                  className="relative group bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-orange-500/15 hover:border-[#ED7D31]/60 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden backdrop-blur-xs"
                >
                  {/* Top Glowing Gradient Beam Indicator */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ED7D31] via-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Shimmer Light Reflection Sweep on Hover */}
                  <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1000 transform -skew-x-12 transition-transform pointer-events-none" />

                  <div>
                    {/* Header Row: Icon + Code Tag + Difficulty Pill */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[#ED7D31] flex items-center justify-center font-bold shadow-xs group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#ED7D31] group-hover:to-amber-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/30 transition-all duration-300">
                        <Icon className="w-5 h-5 transition-transform group-hover:rotate-6" />
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-mono font-black text-[#ED7D31] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/70 group-hover:bg-[#ED7D31] group-hover:text-white transition-colors duration-200">
                          {course.code}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {course.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-sans font-extrabold text-lg text-slate-900 mb-2 group-hover:text-[#ED7D31] transition-colors line-clamp-1">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {course.desc}
                    </p>

                    {/* Micro Topic Chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {course.tags.map((tag, tIdx) => (
                        <span 
                          key={tIdx} 
                          className="px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-600 text-[10px] font-semibold border border-slate-200/60 group-hover:border-amber-200 group-hover:bg-amber-50/60 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Footer with Animated Sliding Arrow */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono font-medium text-[11px]">{course.units}</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[#ED7D31] bg-amber-50 group-hover:bg-[#ED7D31] group-hover:text-white transition-all duration-200 shadow-2xs">
                      <span>Start</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 4. THREE CORE PLATFORM PILLARS (SCROLL REVEAL) */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-borderLight">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#ED7D31] bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
            Core Architecture
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal mt-4 mb-4">
            Engineered for University Standards
          </h2>
          <p className="text-base text-charcoal-muted leading-relaxed">
            Generic chatbots encourage plagiarism and hallucinate citations. AISA bridges course textbook rigor with institutional integrity policies.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Pillar 1 */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 border border-borderLight shadow-sm hover:shadow-soft-lg hover:border-gold transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gold/15 text-[#ED7D31] flex items-center justify-center mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-sans text-2xl font-bold text-charcoal mb-3">
                AI Academic Assistant
              </h3>
              <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                Ask deep technical questions and get course-relevant explanations, step-by-step mathematical proofs, and algorithmic breakdowns calibrated to university textbooks.
              </p>
            </div>
            <div className="pt-4 border-t border-borderLight flex items-center text-xs font-semibold text-charcoal">
              <CheckCircle2 className="w-4 h-4 text-successSoft mr-2" />
              Syllabus-Aligned Socratic Guidance
            </div>
          </motion.div>

          {/* Pillar 2 */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 border border-borderLight shadow-sm hover:shadow-soft-lg hover:border-gold transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gold/15 text-[#ED7D31] flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-sans text-2xl font-bold text-charcoal mb-3">
                Exam-Aware Restrictions
              </h3>
              <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                AI assistance automatically pauses during scheduled midterm and final exam windows to strictly protect academic integrity and comply with university honor codes.
              </p>
            </div>
            <div className="pt-4 border-t border-borderLight flex items-center text-xs font-semibold text-charcoal">
              <CheckCircle2 className="w-4 h-4 text-successSoft mr-2" />
              Automated Honor Lockout Protocol
            </div>
          </motion.div>

          {/* Pillar 3 */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 border border-borderLight shadow-sm hover:shadow-soft-lg hover:border-gold transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gold/15 text-[#ED7D31] flex items-center justify-center mb-6">
                <Flag className="w-6 h-6" />
              </div>
              <h3 className="font-sans text-2xl font-bold text-charcoal mb-3">
                Responsible AI Reporting
              </h3>
              <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                Flag inaccurate or ambiguous answers directly from the chat feed. Submissions are cataloged for faculty review, citation auditing, and continuous model refinement.
              </p>
            </div>
            <div className="pt-4 border-t border-borderLight flex items-center text-xs font-semibold text-charcoal">
              <CheckCircle2 className="w-4 h-4 text-successSoft mr-2" />
              Faculty Audit Queue Integration
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 5. COMPARISON MATRIX: Generic AI vs. AISA (SCROLL REVEAL) */}
      <section className="py-20 bg-wheat-100/50 border-y border-borderLight">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#ED7D31] bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
              Institutional Comparison
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-charcoal mt-3 mb-3">
              Generic AI vs. AISA Academic Platform
            </h2>
            <p className="text-sm text-charcoal-muted">
              How AISA solves the cheating, hallucination, and syllabus misalignment problems of consumer chatbots.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="bg-white rounded-3xl border border-borderLight shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <div className="grid grid-cols-12 p-4 sm:p-5 bg-ghost border-b border-borderLight font-sans font-bold text-xs sm:text-sm text-charcoal">
                  <div className="col-span-6 sm:col-span-5">Capability & Protocol</div>
                  <div className="col-span-3 sm:col-span-3 text-center text-charcoal-muted">Generic AI Chatbots</div>
                  <div className="col-span-3 sm:col-span-4 text-center text-gold font-bold">AISA Platform</div>
                </div>

                {[
                  {
                    feature: 'Exam-Schedule Automatic Lockout',
                    generic: 'No (High Plagiarism Risk)',
                    aisa: 'Yes (Automatic Lockout)',
                  },
                  {
                    feature: 'Syllabus & Course Slide Grounding',
                    generic: 'Unverified Internet Scrapes',
                    aisa: 'Curriculum Grounded',
                  },
                  {
                    feature: 'Responsible AI Feedback & Flagging',
                    generic: 'Ignored / No Human Loop',
                    aisa: 'Direct Faculty Audit Queue',
                  },
                  {
                    feature: 'Direct Homework Copying Protection',
                    generic: 'Blindly Solves Everything',
                    aisa: 'Socratic Conceptual Coaching',
                  },
                ].map((row, idx) => (
                  <div 
                    key={idx}
                    className="grid grid-cols-12 p-4 sm:p-5 border-b border-borderLight/60 text-xs sm:text-sm items-center hover:bg-wheat-50/50 transition-colors"
                  >
                    <div className="col-span-6 sm:col-span-5 font-semibold text-charcoal">
                      {row.feature}
                    </div>
                    <div className="col-span-3 sm:col-span-3 text-center text-charcoal-muted flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4 text-alertSoft hidden sm:inline" />
                      <span>{row.generic}</span>
                    </div>
                    <div className="col-span-3 sm:col-span-4 text-center font-bold text-charcoal flex items-center justify-center gap-1.5 bg-gold/15 py-1.5 px-2 rounded-xl border border-gold/30">
                      <CheckCircle2 className="w-4 h-4 text-successSoft" />
                      <span>{row.aisa}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sm:hidden px-4 py-2 bg-ghost/80 border-t border-borderLight/40 text-[11px] text-center text-charcoal-muted font-medium">
              👉 Swipe left/right to compare capabilities
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION (SCROLL REVEAL) */}
      <section className="py-20 bg-wheat-100/40 border-t border-borderLight">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#ED7D31] bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
              Frequently Asked Questions
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-charcoal mt-3 mb-2">
              Academic Governance & Platform Inquiries
            </h2>
            <p className="text-sm text-charcoal-muted">
              Everything you need to know about academic integrity, course contexts, and platform features.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="bg-white rounded-2xl border border-borderLight shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-sans font-bold text-base text-charcoal hover:bg-wheat-50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-charcoal-muted transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-gold' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-sm text-charcoal-muted leading-relaxed border-t border-borderLight/60 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 7. HIGH IMPACT CALL TO ACTION HERO BANNER (SCROLL REVEAL) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeInUp}
          className="rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-wheat-200 via-gold/30 to-wheat-200 border border-gold/40 shadow-soft-lg text-center space-y-6 relative overflow-hidden"
        >
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-7 h-7 text-charcoal" />
          </div>

          <h2 className="font-sans text-3xl sm:text-5xl font-extrabold text-charcoal max-w-2xl mx-auto leading-tight">
            Ready to Experience Exam-Aware AI Academic Tutoring?
          </h2>

          <p className="text-sm sm:text-base text-charcoal max-w-xl mx-auto leading-relaxed">
            Enter the student prototype now to explore syllabus-aligned query breakdown, exam simulation locks, and responsible AI auditing.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="px-8 py-4 rounded-xl bg-charcoal text-ghost font-bold text-base hover:bg-charcoal/90 shadow-md transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Launch Student Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
