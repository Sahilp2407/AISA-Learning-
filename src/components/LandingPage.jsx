import React, { useState } from 'react';
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
  Calculator
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

  const courseCards = [
    {
      code: 'CS301',
      title: 'Database Management Systems',
      desc: 'B+ Tree indexing, 3NF/BCNF normalization proofs, ACID transaction recovery & serializability.',
      units: '5 Units · 48 Topics',
      icon: Database,
    },
    {
      code: 'CS204',
      title: 'Data Structures & Algorithms',
      desc: 'Dynamic programming state formulations, graph traversals, amortized asymptotic complexity.',
      units: '6 Units · 62 Topics',
      icon: Code2,
    },
    {
      code: 'CS308',
      title: 'Operating Systems',
      desc: 'Process concurrency, Coffman deadlock detection, virtual memory page replacement algorithms.',
      units: '5 Units · 54 Topics',
      icon: Terminal,
    },
    {
      code: 'MA201',
      title: 'Engineering Mathematics',
      desc: 'Fourier transforms, Laplace equations, multivariable calculus & linear algebra derivations.',
      units: '4 Units · 40 Topics',
      icon: Calculator,
    },
  ];

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
          
          {/* LEFT COLUMN: HERO COPY */}
          <motion.div 
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-borderLight shadow-xs">
              <span className="w-2 h-2 rounded-full bg-successSoft animate-pulse"></span>
              <span className="text-charcoal font-medium">Syllabus-Grounded AI · Automatic Exam Lockouts</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="font-sans text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-charcoal leading-[1.15]">
                Master your syllabus.
              </h1>
              <h1 className="font-sans text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-charcoal leading-[1.15]">
                Ace your exams.
              </h1>
              <div className="pt-1.5">
                <span className="inline-block bg-gradient-to-r from-gold via-amber-500 to-amber-600 text-white font-sans text-3xl sm:text-4xl lg:text-[50px] font-extrabold px-3.5 py-1 rounded-2xl shadow-sm tracking-tight">
                  Stay honor-safe.
                </span>
              </div>
            </div>

            {/* Explanatory Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-charcoal-muted leading-relaxed max-w-xl">
              Ask questions from your active college syllabus. AI assistance automatically pauses during scheduled exam windows — so you learn deeply without risking your academic integrity.
            </p>

            {/* Dual Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => onNavigate('login')}
                className="gold-button px-7 py-3.5 rounded-2xl text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Choose your course</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-2xl text-sm font-bold text-charcoal bg-white hover:bg-wheat-100 border border-borderLight shadow-xs transition-all cursor-pointer"
              >
                <span>See exam lockout</span>
              </button>
            </div>

            {/* 4 Feature Checklist Pills */}
            <div className="grid grid-cols-2 gap-2.5 max-w-md pt-2 text-xs font-semibold text-charcoal">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0"></span>
                <span>Free student access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0"></span>
                <span>100% Exam-safe lock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0"></span>
                <span>Socratic derivations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0"></span>
                <span>Faculty review audit trail</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: HERO STUDENTS PHOTO */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full flex flex-col items-center justify-center relative"
          >
            <div className="relative w-full max-w-lg">
              <div className="relative rounded-3xl overflow-hidden shadow-soft-lg border-2 border-white bg-white/60 hover:shadow-xl transition-shadow duration-300">
                <img
                  src={studentsTrioImg}
                  alt="University scholars studying with AISA"
                  className="w-full h-auto object-cover"
                />
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#ED7D31] bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
            ⚡ SYLLABUS INTELLIGENCE
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal mt-3 mb-3">
            Course modules supported right now
          </h2>
          <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
            Curriculum tracks from top engineering departments. Covers Unit 1 to Unit 5 with derivations, proofs, and textbook references.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {courseCards.map((course, idx) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => onNavigate('login')}
                className="bg-white rounded-3xl p-6 border border-borderLight shadow-sm hover:shadow-soft-lg hover:border-gold transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-gold/15 text-[#ED7D31] flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-[#ED7D31] bg-gold/15 px-2.5 py-0.5 rounded-full border border-gold/30">
                      {course.code}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-lg text-charcoal mb-2 group-hover:text-gold transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
                    {course.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-borderLight flex items-center justify-between text-xs font-bold text-charcoal">
                  <span className="text-charcoal-muted font-mono">{course.units}</span>
                  <span className="text-gold group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                    Start →
                  </span>
                </div>
              </motion.div>
            );
          })}
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
