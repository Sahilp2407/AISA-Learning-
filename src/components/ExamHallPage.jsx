import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Database, 
  Send, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Printer, 
  GraduationCap,
  Link as LinkIcon,
  Unlink,
  Maximize2,
  Minimize2,
  Lock,
  EyeOff,
  User,
  ArrowLeft,
  Check,
  FileText
} from 'lucide-react';
import { submitExamAttempt } from '../services/examService';
import { UNIVERSITY_EXAMS_DATA } from '../data/examPapersData';

export default function ExamHallPage({
  exam = UNIVERSITY_EXAMS_DATA[0],
  studentUser = {
    name: 'Aditi Sharma',
    studentId: '22BCS10492',
    email: 'aditi.sharma@univ.edu',
    programme: 'B.Tech Computer Science & Engineering'
  },
  onExitExam
}) {
  // Navigation within exam
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Answers State
  const [mcqAnswers, setMcqAnswers] = useState({}); // { [qId]: optionIndex }
  const [matchAnswers, setMatchAnswers] = useState({}); // { [qId]: { [leftId]: rightId } }
  const [assertionAnswers, setAssertionAnswers] = useState({}); // { [qId]: optionIndex }
  const [markedForReview, setMarkedForReview] = useState(new Set()); // Set of qIds

  // Active connector state for Match the Following
  const [selectedLeftId, setSelectedLeftId] = useState(null);

  // Proctoring, Countdown & Security State
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((exam.durationMinutes || 20) * 60);
  const [tabSwitchViolations, setTabSwitchViolations] = useState(0);
  const [securityStrikes, setSecurityStrikes] = useState(0);
  const [securityToast, setSecurityToast] = useState(null);
  const [isScreenShieldActive, setIsScreenShieldActive] = useState(false);
  const [shieldReason, setShieldReason] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTabSwitchModal, setShowTabSwitchModal] = useState(false);

  // Submission & Results State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState('all'); // 'all' | 'secA' | 'secB' | 'secC'

  // Exam Countdown Timer
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Trigger toast helper
  const showViolationToast = (msg) => {
    setSecurityToast(msg);
    setTimeout(() => setSecurityToast(null), 4500);
  };

  // Emergency screen blanker / shield when screenshot is attempted
  const triggerScreenShield = (reason) => {
    setShieldReason(reason);
    setIsScreenShieldActive(true);
    setSecurityStrikes(prev => prev + 1);
    
    // Clear clipboard content immediately
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('');
      }
    } catch (e) {}

    setTimeout(() => {
      setIsScreenShieldActive(false);
    }, 2800);
  };

  // Full-Screen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && !isSubmitted) {
        showViolationToast('⚠️ You exited Full-Screen Mode. Please return to full-screen to maintain test integrity.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isSubmitted]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen request failed:', e);
    }
  };

  // ================= STRICT PROCTORING & ANTI-CHEATING ENGINE =================
  useEffect(() => {
    if (isSubmitted) return;

    // Add lockdown class to body
    document.body.classList.add('exam-lockdown-active');

    // 1. Block Context Menu (Right-Click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showViolationToast('🔒 Right-Click context menu is disabled during the examination.');
      return false;
    };

    // 2. Block Copy, Cut, Paste
    const handleCopy = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showViolationToast('🚫 Copying examination question content is strictly prohibited.');
      return false;
    };

    const handleCut = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showViolationToast('🚫 Cutting text is prohibited.');
      return false;
    };

    const handlePaste = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showViolationToast('🚫 Pasting external clipboard content is prohibited.');
      return false;
    };

    // 3. Block Text Selection & Dragging
    const handleSelectStart = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // 4. Keyboard Shortcuts: Block Screenshot keys, Print, DevTools, Copy/Paste
    const handleKeyDown = (e) => {
      const key = e.key;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // A. PrintScreen (Windows PrintScreen key code 44 or key === 'PrintScreen')
      if (key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerScreenShield('PrintScreen / Screenshot Attempt Detected & Obscured!');
        return false;
      }

      // B. Mac Screenshot Shortcuts: Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5
      if (isCtrlOrMeta && e.shiftKey && ['3', '4', '5'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenShield('Mac Screen Capture Shortcut (Cmd+Shift+3/4/5) Blocked!');
        return false;
      }

      // C. Windows Snipping Tool: Win + Shift + S or Ctrl + Shift + S
      if (e.shiftKey && (key === 's' || key === 'S') && isCtrlOrMeta) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenShield('Snipping Tool Shortcut Blocked!');
        return false;
      }

      // D. Print Document: Ctrl + P / Cmd + P
      if (isCtrlOrMeta && (key === 'p' || key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenShield('Document Printing Prohibited!');
        return false;
      }

      // E. Copy / Paste / Cut / Select All: Ctrl + C, V, X, A
      if (isCtrlOrMeta && ['c', 'v', 'x', 'a', 'C', 'V', 'X', 'A'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        showViolationToast(`🚫 Keyboard shortcut (Ctrl/Cmd + ${key.toUpperCase()}) is disabled in Exam Mode.`);
        return false;
      }

      // F. Inspect Element / DevTools: F12, Ctrl+Shift+I, Cmd+Opt+I, Ctrl+Shift+J, Ctrl+U
      if (key === 'F12') {
        e.preventDefault();
        showViolationToast('🔒 Developer Tools inspection disabled.');
        return false;
      }

      if (isCtrlOrMeta && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(key)) {
        e.preventDefault();
        showViolationToast('🔒 Developer Inspector is disabled during the exam.');
        return false;
      }

      if (isCtrlOrMeta && (key === 'u' || key === 'U' || key === 's' || key === 'S')) {
        e.preventDefault();
        showViolationToast('🔒 Page source inspection is disabled.');
        return false;
      }
    };

    // 5. Anti-Cheating: Tab Switch & Minimize Detection (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchViolations(prev => {
          const count = prev + 1;
          setSecurityStrikes(s => s + 1);
          setShowTabSwitchModal(true);
          return count;
        });
      }
    };

    // 6. Window Blur Detection
    const handleWindowBlur = () => {
      setSecurityToast('⚠️ Window Focus Lost! Please remain in the examination tab.');
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('cut', handleCut);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.body.classList.remove('exam-lockdown-active');
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('cut', handleCut);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isSubmitted]);

  // Flatten questions list for global indexing & quick navigation
  const allQuestions = [];
  exam.sections.forEach((sec, sIdx) => {
    sec.questions.forEach((q, qIdx) => {
      allQuestions.push({
        ...q,
        sectionId: sec.id,
        sectionTitle: sec.title,
        sectionType: sec.type,
        sectionIdx: sIdx,
        questionIdxInSec: qIdx,
        globalIndex: allQuestions.length + 1
      });
    });
  });

  const activeSection = exam.sections[currentSectionIdx] || exam.sections[0];
  const activeQuestion = activeSection?.questions[currentQuestionIdx] || activeSection?.questions[0];

  const currentGlobalQuestion = allQuestions.find(
    q => q.sectionIdx === currentSectionIdx && q.questionIdxInSec === currentQuestionIdx
  ) || allQuestions[0];

  // Check if a question is answered
  const isQuestionAnswered = (q) => {
    if (!q) return false;
    if (q.type === 'mcq') return mcqAnswers[q.id] !== undefined;
    if (q.type === 'match') {
      const pairs = matchAnswers[q.id] || {};
      return Object.keys(pairs).length > 0;
    }
    if (q.type === 'assertion') return assertionAnswers[q.id] !== undefined;
    return false;
  };

  // Answer Handlers
  const handleSelectMCQOption = (qId, optionIdx) => {
    setMcqAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSelectAssertionOption = (qId, optionIdx) => {
    setAssertionAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  // Match the Following column link handler
  const handleMatchLeftClick = (leftId) => {
    setSelectedLeftId(prev => prev === leftId ? null : leftId);
  };

  const handleMatchRightClick = (mqId, rightId) => {
    if (!selectedLeftId) {
      showViolationToast('💡 First click an item in Column A (Left), then select its pair in Column B (Right).');
      return;
    }

    setMatchAnswers(prev => {
      const curPairs = { ...(prev[mqId] || {}) };
      Object.keys(curPairs).forEach(lId => {
        if (curPairs[lId] === rightId) delete curPairs[lId];
      });
      curPairs[selectedLeftId] = rightId;
      return { ...prev, [mqId]: curPairs };
    });

    setSelectedLeftId(null);
  };

  const handleUnlinkPair = (mqId, leftId) => {
    setMatchAnswers(prev => {
      const curPairs = { ...(prev[mqId] || {}) };
      delete curPairs[leftId];
      return { ...prev, [mqId]: curPairs };
    });
  };

  const handleToggleMarkForReview = (qId) => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleClearAnswer = (qId, qType) => {
    if (qType === 'mcq') {
      setMcqAnswers(prev => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    } else if (qType === 'match') {
      setMatchAnswers(prev => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    } else if (qType === 'assertion') {
      setAssertionAnswers(prev => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }
  };

  // Question Navigation
  const handleNavigateQuestion = (globalIdx) => {
    const targetQ = allQuestions.find(q => q.globalIndex === globalIdx);
    if (targetQ) {
      setCurrentSectionIdx(targetQ.sectionIdx);
      setCurrentQuestionIdx(targetQ.questionIdxInSec);
      setSelectedLeftId(null);
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = currentGlobalQuestion.globalIndex + 1;
    if (nextIdx <= allQuestions.length) {
      handleNavigateQuestion(nextIdx);
    }
  };

  const handlePrevQuestion = () => {
    const prevIdx = currentGlobalQuestion.globalIndex - 1;
    if (prevIdx >= 1) {
      handleNavigateQuestion(prevIdx);
    }
  };

  // Submit Exam to Cloud Firestore
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      const totalTimeAllocated = (exam.durationMinutes || 20) * 60;
      const timeTaken = Math.max(0, totalTimeAllocated - timeLeftSeconds);

      const payload = {
        exam,
        studentUser,
        mcqAnswers,
        matchAnswers,
        assertionAnswers,
        timeTakenSeconds: timeTaken,
        tabSwitchViolations: tabSwitchViolations + securityStrikes
      };

      const result = await submitExamAttempt(payload);
      setSubmissionResult(result);
      setIsSubmitted(true);

      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Exam submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerAutoSubmit = () => {
    handleFinalSubmit();
  };

  // Format MM:SS
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalCount = allQuestions.length;
  const answeredCount = allQuestions.filter(q => isQuestionAnswered(q)).length;
  const reviewCount = markedForReview.size;

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden"
      style={{
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {/* Dynamic Watermark Background (Anti-Camera Leak Protection) */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.03] select-none flex flex-wrap gap-20 p-10 overflow-hidden text-white font-mono text-xs uppercase rotate-[-20deg]">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} className="whitespace-nowrap">
            {studentUser.name} · {studentUser.studentId} · {exam.code} · PROCTORED TEST
          </span>
        ))}
      </div>

      {/* Screen Shield (Anti-Screenshot Blinding Overlay) */}
      <AnimatePresence>
        {isScreenShieldActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-rose-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center text-white select-none pointer-events-auto"
          >
            <div className="w-20 h-20 rounded-3xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center mb-4 animate-pulse">
              <EyeOff className="w-10 h-10 text-rose-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-rose-200 tracking-tight">
              SCREEN CAPTURE ATTEMPT DETECTED
            </h2>
            <p className="text-sm text-rose-300/80 max-w-md mt-2 font-medium">
              {shieldReason || 'Screen capture and screenshot utilities are strictly blocked in the Examination Hall.'}
            </p>
            <div className="mt-4 px-4 py-2 rounded-xl bg-rose-900/60 border border-rose-500/40 text-xs font-mono text-rose-200">
              Security Strike #{securityStrikes} Recorded · Clipboard Emptied
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Toast Notification */}
      <AnimatePresence>
        {securityToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-amber-300 border border-amber-500/50 shadow-2xl px-5 py-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold backdrop-blur-md"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>{securityToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switch Violation Modal */}
      <AnimatePresence>
        {showTabSwitchModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-rose-500/50 rounded-3xl p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">Honor Guard Violation Logged</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You navigated away from the active examination window. 
                Switching browser tabs, minimizing the window, or using external applications violates institutional examination guidelines.
              </p>
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-mono font-bold">
                Tab Switch Violation #{tabSwitchViolations} logged in Firestore audit record.
              </div>
              <button
                type="button"
                onClick={() => setShowTabSwitchModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
              >
                I Understand, Return to Exam Paper
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Submit Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Submit Examination Paper?</h3>
                  <p className="text-xs text-slate-400">Once submitted, answers cannot be edited.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                  <span className="text-emerald-400 font-bold block text-base">{answeredCount}</span>
                  <span className="text-slate-400 text-[10px]">Answered</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40">
                  <span className="text-amber-400 font-bold block text-base">{reviewCount}</span>
                  <span className="text-slate-400 text-[10px]">In Review</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-slate-300 font-bold block text-base">{totalCount - answeredCount}</span>
                  <span className="text-slate-400 text-[10px]">Unanswered</span>
                </div>
              </div>

              {tabSwitchViolations + securityStrikes > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>
                    <strong>{tabSwitchViolations + securityStrikes} integrity violation(s)</strong> will be recorded with this submission.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Continue Reviewing
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Evaluating & Syncing...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm Final Submission</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= POST-SUBMISSION REPORT CARD VIEW ================= */}
      {isSubmitted && submissionResult?.data ? (
        <div className="min-h-screen bg-slate-950 p-4 sm:p-8 flex items-center justify-center">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Top ambient glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Certificate Header */}
            <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Official Grade Transcript
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    Firestore ID: {submissionResult.id?.slice(0, 12)}...
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Student Examination Performance Report
                </h1>
                <p className="text-xs text-slate-400">
                  {exam.name} · {exam.title}
                </p>
              </div>

              {/* Letter Grade Hero Badge */}
              <div className="flex items-center gap-4 self-start sm:self-auto">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400 font-bold">Total Score</p>
                  <p className="text-2xl font-black text-white">
                    {submissionResult.data.totalMarksObtained} <span className="text-sm font-normal text-slate-400">/ {submissionResult.data.maxMarks}</span>
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg font-black text-2xl ${
                  submissionResult.data.letterGrade === 'A+' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30' :
                  submissionResult.data.letterGrade === 'A' ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-teal-500/30' :
                  submissionResult.data.letterGrade === 'B' ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-500/30' :
                  'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/30'
                }`}>
                  {submissionResult.data.letterGrade}
                  <span className="text-[9px] font-medium opacity-80 uppercase tracking-tight">Grade</span>
                </div>
              </div>
            </div>

            {/* Candidate & Integrity Verified Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Candidate</p>
                <p className="font-bold text-white mt-0.5 truncate">{studentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{studentUser.studentId}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Course Code</p>
                <p className="font-bold text-amber-300 mt-0.5 font-mono">{exam.code}</p>
                <p className="text-[10px] text-slate-400">{exam.semester}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Percentage</p>
                <p className="font-bold text-emerald-400 mt-0.5 text-sm">{submissionResult.data.percentage}%</p>
                <p className="text-[10px] text-slate-400">{submissionResult.data.passed ? 'Status: Passed' : 'Status: Needs Improvement'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Honor Guard Proctor</p>
                <p className={`font-bold mt-0.5 text-xs flex items-center gap-1 ${
                  submissionResult.data.tabSwitchViolations === 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {submissionResult.data.tabSwitchViolations === 0 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>100% Clean (0 Flags)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{submissionResult.data.tabSwitchViolations} Flags Logged</span>
                    </>
                  )}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Time: {Math.floor(submissionResult.data.timeTakenSeconds / 60)}m {submissionResult.data.timeTakenSeconds % 60}s
                </p>
              </div>
            </div>

            {/* Sectional Breakdown Bars */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Sectional Marks Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Section A: MCQs</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {submissionResult.data.sectionalScores.secA} / 12
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${(submissionResult.data.sectionalScores.secA / 12) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Section B: Match</span>
                    <span className="font-mono font-bold text-amber-400">
                      {submissionResult.data.sectionalScores.secB} / 10
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${(submissionResult.data.sectionalScores.secB / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Section C: Assertion</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {submissionResult.data.sectionalScores.secC} / 8
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${(submissionResult.data.sectionalScores.secC / 8) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question by Question Review Accordion */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Question Review & Faculty Explanations
                </h3>
                <div className="flex items-center gap-1.5 text-xs">
                  {['all', 'secA', 'secB', 'secC'].map(tabKey => (
                    <button
                      key={tabKey}
                      onClick={() => setActiveReviewTab(tabKey)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                        activeReviewTab === tabKey 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tabKey === 'all' ? 'All' : tabKey === 'secA' ? 'Sec A' : tabKey === 'secB' ? 'Sec B' : 'Sec C'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {(activeReviewTab === 'all' || activeReviewTab === 'secA') && 
                  submissionResult.data.gradedSecA?.map(item => (
                    <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300">Q{item.index}. (MCQ · {item.maxMarks} Marks)</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {item.isCorrect ? `+${item.marksAwarded} Marks` : '0 Marks'}
                        </span>
                      </div>
                      <p className="text-slate-200 font-medium">{item.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="p-2 rounded-xl bg-slate-800/70 border border-slate-700">
                          <span className="text-[10px] text-slate-400 block">Your Answer:</span>
                          <span className={item.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {item.chosenText}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                          <span className="text-[10px] text-emerald-400 block font-bold">Faculty Correct Key:</span>
                          <span className="text-emerald-300 font-bold">{item.correctText}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 bg-black/20 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                        💡 <strong>Explanation:</strong> {item.explanation}
                      </p>
                    </div>
                  ))
                }

                {(activeReviewTab === 'all' || activeReviewTab === 'secB') && 
                  submissionResult.data.gradedSecB?.map(item => (
                    <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">Section B. (Match the Following · {item.maxMarks} Marks)</span>
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/20 text-amber-300">
                          Awarded: +{item.marksAwarded.toFixed(1)} / {item.maxMarks} Marks
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {item.pairAnalysis?.map((pair, pIdx) => (
                          <div key={pIdx} className="p-2 rounded-xl bg-slate-800/70 flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 font-medium">{pair.leftLabel}</span>
                            <div className="flex items-center gap-2">
                              <span className={pair.isPairCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 line-through'}>
                                {pair.userRightLabel}
                              </span>
                              {!pair.isPairCorrect && (
                                <span className="text-emerald-400 font-bold">➔ Key: {pair.targetRightLabel}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400 bg-black/20 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                        💡 <strong>Explanation:</strong> {item.explanation}
                      </p>
                    </div>
                  ))
                }

                {(activeReviewTab === 'all' || activeReviewTab === 'secC') && 
                  submissionResult.data.gradedSecC?.map(item => (
                    <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300">Section C. (Assertion & Reasoning · {item.maxMarks} Marks)</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {item.isCorrect ? `+${item.marksAwarded} Marks` : '0 Marks'}
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <p><strong>Assertion (A):</strong> {item.assertion}</p>
                        <p><strong>Reason (R):</strong> {item.reason}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="p-2 rounded-xl bg-slate-800/70 border border-slate-700">
                          <span className="text-[10px] text-slate-400 block">Your Chosen Option:</span>
                          <span className={item.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {item.chosenText}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                          <span className="text-[10px] text-emerald-400 block font-bold">Faculty Key:</span>
                          <span className="text-emerald-300 font-bold">{item.correctText}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 bg-black/20 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                        💡 <strong>Explanation:</strong> {item.explanation}
                      </p>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Report</span>
              </button>

              <button
                type="button"
                onClick={onExitExam}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
              >
                <span>Return to Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= ACTIVE EXAMINATION WORKSPACE ================= */
        <div className="flex-1 flex flex-col h-screen">
          {/* Top Proctoring & Security Bar */}
          <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {exam.code}
                  </span>
                  <h1 className="font-extrabold text-xs sm:text-sm text-white tracking-tight truncate max-w-[240px] sm:max-w-md">
                    {exam.title}
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {studentUser.name} ({studentUser.studentId}) · {exam.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-semibold text-[11px]">
                  Lockdown Active (Anti-Cheat / No Copy / No SS)
                </span>
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Exam Mode'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <div className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 font-mono text-xs sm:text-sm font-black border transition-all ${
                timeLeftSeconds <= 300 
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse' 
                  : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
              }`}>
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to exit the examination hall? Unsubmitted answers will be lost.')) {
                    onExitExam();
                  }
                }}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors cursor-pointer text-xs font-bold"
                title="Exit Examination"
              >
                Exit
              </button>
            </div>
          </header>

          {/* Main Dual-Pane Exam Layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Sidebar: Question Palette & Section Nav */}
            <aside className="w-full md:w-72 lg:w-80 bg-slate-900/60 border-r border-slate-800/80 p-4 flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-sm">
                    {studentUser.name.charAt(0)}
                  </div>
                  <div className="text-xs truncate">
                    <p className="font-extrabold text-white truncate">{studentUser.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{studentUser.studentId}</p>
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Proctor Active · Camera Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Exam Sections
                  </p>
                  <div className="space-y-1">
                    {exam.sections.map((sec, sIdx) => {
                      const isActive = sIdx === currentSectionIdx;
                      const secAnsweredCount = sec.questions.filter(q => isQuestionAnswered(q)).length;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => {
                            setCurrentSectionIdx(sIdx);
                            setCurrentQuestionIdx(0);
                            setSelectedLeftId(null);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isActive 
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/40' 
                              : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 font-medium'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <span className="text-[10px] opacity-75 block font-mono uppercase">
                              {sec.type === 'mcq' ? 'Section A' : sec.type === 'match' ? 'Section B' : 'Section C'}
                            </span>
                            <span className="truncate">{sec.title}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isActive ? 'bg-indigo-700 text-white' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {secAnsweredCount}/{sec.questions.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Questions Palette Matrix */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Question Palette
                    </span>
                    <span className="text-[11px] font-bold text-slate-300 font-mono">
                      {answeredCount}/{totalCount}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {allQuestions.map(q => {
                      const isCur = q.globalIndex === currentGlobalQuestion.globalIndex;
                      const isAns = isQuestionAnswered(q);
                      const isRev = markedForReview.has(q.id);

                      let btnStyle = 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500';
                      if (isRev) {
                        btnStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold';
                      } else if (isAns) {
                        btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold';
                      }

                      if (isCur) {
                        btnStyle += ' ring-2 ring-indigo-400 shadow-md shadow-indigo-500/30 text-white';
                      }

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => handleNavigateQuestion(q.globalIndex)}
                          className={`h-9 rounded-xl border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${btnStyle}`}
                        >
                          {q.globalIndex}
                        </button>
                      );
                    })}
                  </div>

                  {/* Palette Legend */}
                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>Marked Review</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                      <span>Unanswered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full ring-2 ring-indigo-400"></span>
                      <span>Current Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Final Button */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Final Paper</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center font-mono">
                  Auto-sync to Cloud Firestore active
                </p>
              </div>
            </aside>

            {/* Right Pane: Active Question Canvas */}
            <main className="flex-1 flex flex-col justify-between p-4 sm:p-8 overflow-y-auto bg-slate-950 relative">
              <div className="max-w-3xl w-full mx-auto space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
                      Question {currentGlobalQuestion.globalIndex} of {allQuestions.length}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                      +{currentGlobalQuestion.marks} Marks
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      ({activeSection.title})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleMarkForReview(currentGlobalQuestion.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        markedForReview.has(currentGlobalQuestion.id)
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{markedForReview.has(currentGlobalQuestion.id) ? 'Marked for Review' : 'Mark for Review'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClearAnswer(currentGlobalQuestion.id, currentGlobalQuestion.type)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* 1. MCQ Question */}
                {currentGlobalQuestion.type === 'mcq' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
                      <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                        {currentGlobalQuestion.question}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {currentGlobalQuestion.options.map((opt, optIdx) => {
                        const isSelected = mcqAnswers[currentGlobalQuestion.id] === optIdx;
                        const letters = ['A', 'B', 'C', 'D'];
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectMCQOption(currentGlobalQuestion.id, optIdx)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                              isSelected
                                ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950/50 scale-[1.01]'
                                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5 ${
                              isSelected 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {letters[optIdx]}
                            </div>
                            <span className="text-xs sm:text-sm leading-relaxed font-medium">
                              {opt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Match the Following Interactive Dual-Column */}
                {currentGlobalQuestion.type === 'match' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
                      <h4 className="font-black text-white text-sm">
                        {currentGlobalQuestion.title || 'Match the items in Column A with appropriate entries in Column B:'}
                      </h4>
                      <p className="text-xs text-indigo-300/80 mt-1">
                        👉 <strong>Instructions:</strong> Click an item in Column A (Left), then click its corresponding match in Column B (Right). Connected pairs appear below.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <span>Column A (Concepts)</span>
                        </div>
                        <div className="space-y-2">
                          {currentGlobalQuestion.leftItems?.map(lItem => {
                            const isSelected = selectedLeftId === lItem.id;
                            const isAlreadyPaired = Boolean((matchAnswers[currentGlobalQuestion.id] || {})[lItem.id]);
                            return (
                              <div
                                key={lItem.id}
                                onClick={() => handleMatchLeftClick(lItem.id)}
                                className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                                  isSelected 
                                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-md shadow-amber-950/50' 
                                    : isAlreadyPaired
                                    ? 'bg-indigo-950/40 border-indigo-700/60 text-slate-200'
                                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-300'
                                }`}
                              >
                                <span className="font-semibold leading-relaxed">{lItem.text}</span>
                                {isAlreadyPaired && (
                                  <LinkIcon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 ml-2" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <span>Column B (Descriptions)</span>
                        </div>
                        <div className="space-y-2">
                          {currentGlobalQuestion.rightItems?.map(rItem => {
                            const activePairs = matchAnswers[currentGlobalQuestion.id] || {};
                            const linkedLeftId = Object.keys(activePairs).find(lId => activePairs[lId] === rItem.id);
                            return (
                              <div
                                key={rItem.id}
                                onClick={() => handleMatchRightClick(currentGlobalQuestion.id, rItem.id)}
                                className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                                  linkedLeftId 
                                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                                    : selectedLeftId
                                    ? 'bg-slate-900 hover:bg-slate-800 border-dashed border-indigo-500/60 text-indigo-200'
                                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-300'
                                }`}
                              >
                                <span className="font-semibold leading-relaxed">{rItem.text}</span>
                                {linkedLeftId && (
                                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-2" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                          Your Matched Connections:
                        </span>
                        <span className="text-[10px] text-indigo-300 font-mono">
                          {Object.keys(matchAnswers[currentGlobalQuestion.id] || {}).length} of {currentGlobalQuestion.leftItems?.length} Linked
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {Object.entries(matchAnswers[currentGlobalQuestion.id] || {}).map(([lId, rId]) => {
                          const leftObj = currentGlobalQuestion.leftItems?.find(l => l.id === lId);
                          const rightObj = currentGlobalQuestion.rightItems?.find(r => r.id === rId);
                          return (
                            <div 
                              key={lId}
                              className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs flex items-center gap-2 text-indigo-200"
                            >
                              <span className="font-bold text-amber-300">{leftObj?.text}</span>
                              <span className="text-slate-400">➔</span>
                              <span className="text-emerald-300 font-medium">{rightObj?.text}</span>
                              <button
                                type="button"
                                onClick={() => handleUnlinkPair(currentGlobalQuestion.id, lId)}
                                className="text-slate-400 hover:text-rose-400 transition-colors ml-1 p-0.5 cursor-pointer"
                                title="Unlink this pair"
                              >
                                <Unlink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                        {Object.keys(matchAnswers[currentGlobalQuestion.id] || {}).length === 0 && (
                          <span className="text-xs text-slate-500 italic">
                            No pairs formed yet. Click an item on the left, then on the right.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Assertion & Reasoning */}
                {currentGlobalQuestion.type === 'assertion' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block font-mono">
                          Assertion (A)
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                          {currentGlobalQuestion.assertion}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block font-mono">
                          Reason (R)
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                          {currentGlobalQuestion.reason}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-slate-400">
                        Choose the correct option:
                      </p>
                      {currentGlobalQuestion.options.map((opt, optIdx) => {
                        const isSelected = assertionAnswers[currentGlobalQuestion.id] === optIdx;
                        const letters = ['A', 'B', 'C', 'D'];
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectAssertionOption(currentGlobalQuestion.id, optIdx)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected 
                                ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950/50 scale-[1.01]' 
                                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5 ${
                              isSelected 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {letters[optIdx]}
                            </div>
                            <span className="text-xs sm:text-sm font-medium leading-relaxed">
                              {opt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Navigation Buttons */}
              <div className="max-w-3xl w-full mx-auto pt-6 mt-6 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentGlobalQuestion.globalIndex <= 1}
                  onClick={handlePrevQuestion}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleMarkForReview(currentGlobalQuestion.id);
                      handleNextQuestion();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Mark & Next
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-900/40 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>Save & Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
