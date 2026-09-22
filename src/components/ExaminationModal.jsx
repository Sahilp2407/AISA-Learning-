import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  X, 
  ShieldAlert, 
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
  Unlink
} from 'lucide-react';
import { submitExamAttempt } from '../services/examService';

export default function ExaminationModal({
  isOpen,
  onClose,
  exam,
  studentUser,
  onAttemptCompleted
}) {
  // Exam progress state
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Answers State
  const [mcqAnswers, setMcqAnswers] = useState({}); // { [qId]: optionIndex }
  const [matchAnswers, setMatchAnswers] = useState({}); // { [qId]: { [leftId]: rightId } }
  const [assertionAnswers, setAssertionAnswers] = useState({}); // { [qId]: optionIndex }
  const [markedForReview, setMarkedForReview] = useState(new Set()); // Set of qIds

  // Active connector state for Match the Following
  const [selectedLeftId, setSelectedLeftId] = useState(null);

  // Proctoring & Integrity state
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [tabSwitchViolations, setTabSwitchViolations] = useState(0);
  const [violationToast, setViolationToast] = useState(null);

  // Submission & Results State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState('all'); // 'all' | 'secA' | 'secB' | 'secC'

  // Initialize exam parameters when modal opens
  useEffect(() => {
    if (isOpen && exam) {
      setCurrentSectionIdx(0);
      setCurrentQuestionIdx(0);
      setMcqAnswers({});
      setMatchAnswers({});
      setAssertionAnswers({});
      setMarkedForReview(new Set());
      setSelectedLeftId(null);
      setTimeLeftSeconds((exam.durationMinutes || 20) * 60);
      setTabSwitchViolations(0);
      setViolationToast(null);
      setIsSubmitting(false);
      setIsSubmitted(false);
      setSubmissionResult(null);
      setShowConfirmation(false);
    }
  }, [isOpen, exam]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!isOpen || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isSubmitted]);

  // Anti-Cheating Honor Guard: Tab Switch & Window Blur Detection
  useEffect(() => {
    if (!isOpen || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchViolations(prev => {
          const updated = prev + 1;
          setViolationToast(`⚠️ Proctor Warning: Tab switch detected! (Violation #${updated}). This incident is logged.`);
          setTimeout(() => setViolationToast(null), 5000);
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOpen, isSubmitted]);

  if (!isOpen || !exam) return null;

  // Flatten questions list for global indexing
  const allQuestions = [];
  exam.sections.forEach((sec, sIdx) => {
    sec.questions.forEach((q, qIdx) => {
      allQuestions.push({
        ...q,
        sectionIndex: sIdx,
        sectionTitle: sec.title,
        sectionType: sec.type,
        globalIndex: allQuestions.length + 1
      });
    });
  });

  const currentSection = exam.sections[currentSectionIdx];
  const currentQ = currentSection?.questions[currentQuestionIdx];
  const currentGlobalQ = allQuestions.find(q => q.id === currentQ?.id);

  // Time formatting
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Status calculation for Question Palette buttons
  const getQuestionStatus = (q) => {
    if (markedForReview.has(q.id)) return 'marked';
    if (q.type === 'mcq' && mcqAnswers[q.id] !== undefined) return 'answered';
    if (q.type === 'match' && matchAnswers[q.id] && Object.keys(matchAnswers[q.id]).length > 0) return 'answered';
    if (q.type === 'assertion' && assertionAnswers[q.id] !== undefined) return 'answered';
    return 'unanswered';
  };

  const toggleMarkForReview = (qId) => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Match the following pair selection handler
  const handleConnectMatch = (leftId, rightId) => {
    if (!currentQ || isSubmitted) return;
    setMatchAnswers(prev => {
      const qPairs = { ...(prev[currentQ.id] || {}) };
      // If rightId is already paired with another leftId, remove that old pair
      Object.keys(qPairs).forEach(k => {
        if (qPairs[k] === rightId) delete qPairs[k];
      });
      qPairs[leftId] = rightId;
      return { ...prev, [currentQ.id]: qPairs };
    });
    setSelectedLeftId(null);
  };

  const handleRemovePair = (leftId) => {
    setMatchAnswers(prev => {
      const qPairs = { ...(prev[currentQ.id] || {}) };
      delete qPairs[leftId];
      return { ...prev, [currentQ.id]: qPairs };
    });
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentQuestionIdx < currentSection.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else if (currentSectionIdx < exam.sections.length - 1) {
      setCurrentSectionIdx(prev => prev + 1);
      setCurrentQuestionIdx(0);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    } else if (currentSectionIdx > 0) {
      setCurrentSectionIdx(prev => prev - 1);
      setCurrentQuestionIdx(exam.sections[currentSectionIdx - 1].questions.length - 1);
    }
  };

  const jumpToQuestion = (targetQ) => {
    setCurrentSectionIdx(targetQ.sectionIndex);
    const qIndexInSection = exam.sections[targetQ.sectionIndex].questions.findIndex(q => q.id === targetQ.id);
    setCurrentQuestionIdx(qIndexInSection !== -1 ? qIndexInSection : 0);
  };

  // Submit Exam
  const handleFinalSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    const timeSpent = (exam.durationMinutes * 60) - timeLeftSeconds;

    const payload = {
      exam,
      studentUser,
      mcqAnswers,
      matchAnswers,
      assertionAnswers,
      timeTakenSeconds: timeSpent,
      tabSwitchViolations
    };

    try {
      const res = await submitExamAttempt(payload);
      setSubmissionResult(res);
      setIsSubmitted(true);

      // Trigger high-achiever celebration
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 }
      });

      if (onAttemptCompleted) {
        onAttemptCompleted(res);
      }
    } catch (err) {
      console.error('Exam submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Answered counter
  const answeredTotal = allQuestions.filter(q => getQuestionStatus(q) === 'answered').length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col my-auto max-h-[96vh]"
        >
          {/* ================= 1. PROCTORED EXAM HEADER ================= */}
          <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-700">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ED7D31] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 font-black text-lg flex-shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    {exam.code} · {exam.semester}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{exam.department}</span>
                </div>
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5 truncate max-w-[280px] sm:max-w-md">
                  {exam.title}
                </h2>
              </div>
            </div>

            {/* Timer, Integrity Badge & Close */}
            <div className="flex items-center gap-3">
              {!isSubmitted ? (
                <>
                  {/* Tab Switch Honor Warning */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                    tabSwitchViolations > 0 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                      : 'bg-slate-800/80 text-slate-300 border-slate-700'
                  }`}>
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Integrity: {tabSwitchViolations === 0 ? 'Verified' : `${tabSwitchViolations} Flags`}</span>
                  </div>

                  {/* Real-time Ticking Countdown Timer */}
                  <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl border font-mono font-black text-sm shadow-md ${
                    timeLeftSeconds < 180 
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(timeLeftSeconds)}</span>
                  </div>
                </>
              ) : (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                  ✓ Graded & Verified
                </span>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Violation Toast Notification */}
          {violationToast && (
            <div className="bg-rose-500 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
              <AlertTriangle className="w-4 h-4" />
              <span>{violationToast}</span>
            </div>
          )}

          {/* ================= 2. ACTIVE EXAM HALL VIEW ================= */}
          {!isSubmitted ? (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Column: Question Navigator Palette */}
              <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Exam Navigator
                    </h4>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {answeredTotal} of {allQuestions.length} Answered
                    </p>
                  </div>

                  {/* Section Switcher Tabs */}
                  <div className="space-y-1">
                    {exam.sections.map((sec, sIdx) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => {
                          setCurrentSectionIdx(sIdx);
                          setCurrentQuestionIdx(0);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          currentSectionIdx === sIdx 
                            ? 'bg-[#ED7D31] text-white shadow-sm' 
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span className="truncate">{sec.title.split(':')[0]}</span>
                        <span className="text-[10px] opacity-80">{sec.questions.length} Qs</span>
                      </button>
                    ))}
                  </div>

                  {/* Question Grid Buttons */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Questions Palette
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {allQuestions.map((q) => {
                        const status = getQuestionStatus(q);
                        const isCurrent = currentGlobalQ?.id === q.id;

                        let badgeClasses = 'bg-white border-slate-200 text-slate-700 hover:border-slate-400';
                        if (status === 'answered') badgeClasses = 'bg-emerald-600 border-emerald-600 text-white font-bold';
                        else if (status === 'marked') badgeClasses = 'bg-indigo-600 border-indigo-600 text-white font-bold';
                        
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => jumpToQuestion(q)}
                            className={`w-9 h-9 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer font-bold relative ${badgeClasses} ${
                              isCurrent ? 'ring-2 ring-orange-500 scale-105 shadow-sm' : ''
                            }`}
                          >
                            <span>{q.globalIndex}</span>
                            {markedForReview.has(q.id) && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-1 ring-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-md bg-emerald-600" />
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-md bg-indigo-600" />
                      <span>Marked for Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300" />
                      <span>Not Answered</span>
                    </div>
                  </div>
                </div>

                {/* Submit Test Trigger */}
                <button
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Final Exam</span>
                </button>
              </div>

              {/* Right Column: Question Content Area */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
                {currentQ ? (
                  <div className="space-y-6">
                    {/* Question Header & Marks Badge */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#ED7D31] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                          {currentSection.title.split(':')[0]} · Question {currentGlobalQ?.globalIndex} of {allQuestions.length}
                        </span>
                        <h4 className="text-xs text-slate-500 font-semibold mt-1">
                          {currentSection.description}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                          {currentQ.marks} Marks
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMarkForReview(currentQ.id)}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            markedForReview.has(currentQ.id)
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                          }`}
                          title="Mark for later review"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${markedForReview.has(currentQ.id) ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* FORMAT 1: STANDARD MCQ */}
                    {currentQ.type === 'mcq' && (
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/70">
                          <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                            {currentQ.question}
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          {currentQ.options.map((opt, optIdx) => {
                            const isSelected = mcqAnswers[currentQ.id] === optIdx;
                            const label = String.fromCharCode(65 + optIdx);
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => setMcqAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }))}
                                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-50/90 border-[#ED7D31] text-slate-900 shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-slate-50/60'
                                }`}
                              >
                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                                  isSelected ? 'bg-[#ED7D31] text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {label}
                                </div>
                                <span className="text-xs sm:text-sm font-medium">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* FORMAT 2: INTERACTIVE MATCH THE FOLLOWING */}
                    {currentQ.type === 'match' && (
                      <div className="space-y-5">
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border border-blue-200/80">
                          <div className="flex items-center gap-2 text-[11px] font-black text-indigo-700 uppercase tracking-wider mb-1">
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Interactive Column Matcher</span>
                          </div>
                          <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                            {currentQ.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            👉 <strong>How to play:</strong> Click any item from <strong>Column A</strong>, then click its matching counterpart in <strong>Column B</strong>.
                          </p>
                        </div>

                        {/* Dual Columns Connector Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Left Column A */}
                          <div className="space-y-3">
                            <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
                              <span>Column A (Premises)</span>
                              <span className="text-[10px] text-slate-400 font-normal">Select Item</span>
                            </h5>
                            <div className="space-y-2">
                              {currentQ.leftItems.map((lItem) => {
                                const isSelected = selectedLeftId === lItem.id;
                                const existingRightId = matchAnswers[currentQ.id]?.[lItem.id];
                                const matchedRightObj = currentQ.rightItems.find(r => r.id === existingRightId);

                                return (
                                  <div
                                    key={lItem.id}
                                    onClick={() => setSelectedLeftId(isSelected ? null : lItem.id)}
                                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                                      isSelected
                                        ? 'bg-amber-100/90 border-[#ED7D31] ring-2 ring-[#ED7D31]/40 shadow-sm'
                                        : existingRightId
                                        ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-slate-900">{lItem.text}</span>
                                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                        {lItem.id}
                                      </span>
                                    </div>

                                    {existingRightId && (
                                      <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
                                        <span className="truncate flex-1">🔗 Paired with: <strong>{matchedRightObj?.text}</strong></span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemovePair(lItem.id);
                                          }}
                                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                          title="Remove Link"
                                        >
                                          <Unlink className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right Column B */}
                          <div className="space-y-3">
                            <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
                              <span>Column B (Target Solutions)</span>
                              <span className="text-[10px] text-slate-400 font-normal">Click to Connect</span>
                            </h5>
                            <div className="space-y-2">
                              {currentQ.rightItems.map((rItem) => {
                                // Check if this right item is already mapped to any left item
                                const matchedLeftKey = Object.keys(matchAnswers[currentQ.id] || {}).find(
                                  k => matchAnswers[currentQ.id][k] === rItem.id
                                );
                                const matchedLeftObj = currentQ.leftItems.find(l => l.id === matchedLeftKey);

                                return (
                                  <button
                                    key={rItem.id}
                                    type="button"
                                    onClick={() => {
                                      if (selectedLeftId) {
                                        handleConnectMatch(selectedLeftId, rItem.id);
                                      }
                                    }}
                                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                                      selectedLeftId
                                        ? 'hover:bg-amber-50 hover:border-amber-400 ring-1 ring-amber-300/40 bg-white'
                                        : matchedLeftKey
                                        ? 'bg-emerald-50/70 border-emerald-300'
                                        : 'bg-white border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-medium text-xs text-slate-800">{rItem.text}</span>
                                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                        {rItem.id}
                                      </span>
                                    </div>
                                    {matchedLeftKey && (
                                      <span className="text-[10px] font-bold text-emerald-700">
                                        ✓ Linked to {matchedLeftObj?.text} ({matchedLeftKey})
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Reset Pairs Action */}
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setMatchAnswers(prev => ({ ...prev, [currentQ.id]: {} }))}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Clear All Connections</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FORMAT 3: ASSERTION & REASONING */}
                    {currentQ.type === 'assertion' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#ED7D31] block">
                              Assertion (A)
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                              {currentQ.assertion}
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                              Reason (R)
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                              {currentQ.reason}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-extrabold text-slate-700 block">Select Evaluation Option:</span>
                          {currentQ.options.map((opt, optIdx) => {
                            const isSelected = assertionAnswers[currentQ.id] === optIdx;
                            const label = String.fromCharCode(65 + optIdx);
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => setAssertionAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }))}
                                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-50/90 border-[#ED7D31] text-slate-900 shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-slate-50/60'
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                  isSelected ? 'bg-[#ED7D31] text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {label}
                                </div>
                                <span className="text-xs font-medium">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Bottom Navigation Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={currentSectionIdx === 0 && currentQuestionIdx === 0}
                    onClick={handlePrev}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-5 py-2.5 rounded-xl bg-[#ED7D31] hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all hover:scale-105 cursor-pointer"
                    >
                      <span>Save & Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ================= 3. OFFICIAL PERFORMANCE REPORT CARD VIEW =================
            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
              {/* Institution Header Certificate */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ED7D31]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-[#ED7D31] text-white flex items-center justify-center mx-auto shadow-xl shadow-orange-500/30 mb-3">
                  <Award className="w-8 h-8" />
                </div>

                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                  Official Academic Scorecard & Evaluation
                </span>

                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  {submissionResult?.data?.scoreObtained} / {submissionResult?.data?.totalMarks} Marks
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Percentage: <strong>{submissionResult?.data?.percentage}%</strong> • Grade: <span className="font-black text-amber-400">{submissionResult?.data?.grade}</span> • Status: <span className="text-emerald-400 font-bold">{submissionResult?.data?.status}</span>
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  Student: <strong className="text-white">{studentUser?.name}</strong> ({studentUser?.studentId || '22BCS10492'}) · Course: {exam.code} ({exam.name})
                </p>
              </div>

              {/* Cloud Firestore Sync Record Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800">
                      Saved to Cloud Firestore Collection
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono text-emerald-700">
                      exam_attempts
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5 font-mono truncate">
                    Document ID: {submissionResult?.id}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Complete response sheet, section marks, and proctoring logs have been archived for official departmental audit.
                  </p>
                </div>
              </div>

              {/* Sectional Performance Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Section A: MCQs</span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {submissionResult?.data?.sectionBreakdown?.sectionA?.marks} / 12
                  </p>
                  <span className="text-[10px] text-slate-500">Conceptual Accuracy</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Section B: Match Following</span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {submissionResult?.data?.sectionBreakdown?.sectionB?.marks} / 10
                  </p>
                  <span className="text-[10px] text-slate-500">Column Linking Accuracy</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Section C: Assertion Reasoning</span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {submissionResult?.data?.sectionBreakdown?.sectionC?.marks} / 8
                  </p>
                  <span className="text-[10px] text-slate-500">Deductive Logic Analysis</span>
                </div>
              </div>

              {/* Comprehensive Question Review */}
              <div className="space-y-4 pt-2">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Detailed Question & Answer Review Sheet</span>
                  <span className="text-xs font-normal text-slate-500">All Sections Graded</span>
                </h4>

                {/* Section A Review */}
                <div className="space-y-3">
                  <h5 className="text-xs font-black text-[#ED7D31] uppercase tracking-wider">Section A: MCQs Review</h5>
                  {submissionResult?.data?.gradedSecA?.map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">Q{idx + 1}. {q.question}</span>
                        {q.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> +{q.marksAwarded} Marks
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-lg flex-shrink-0">
                            <XCircle className="w-3 h-3" /> 0 Marks
                          </span>
                        )}
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div>Your Selected Option: <strong className={q.isCorrect ? 'text-emerald-700' : 'text-rose-600'}>{q.chosenText}</strong></div>
                        {!q.isCorrect && <div>Correct Option Key: <strong className="text-emerald-700">{q.correctText}</strong></div>}
                      </div>
                      <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                        💡 <em>Faculty Solution Note:</em> {q.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Section B Review: Match the following */}
                <div className="space-y-3 pt-3">
                  <h5 className="text-xs font-black text-indigo-700 uppercase tracking-wider">Section B: Match the Following Pairs Review</h5>
                  {submissionResult?.data?.gradedSecB?.map((mq) => (
                    <div key={mq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{mq.title}</span>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                          {mq.marksAwarded} / {mq.maxMarks} Marks ({mq.matchedCorrectCount} Pairs Correct)
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mq.pairAnalysis?.map((pair, pIdx) => (
                          <div key={pIdx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                            <div className="truncate">
                              <span className="font-bold text-slate-800">{pair.leftText}</span>
                              <span className="text-slate-400 block text-[10px]">Your Match: <strong className={pair.isCorrect ? 'text-emerald-700' : 'text-rose-600'}>{pair.userMatchedRightText}</strong></span>
                            </div>
                            {pair.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                        💡 <em>Faculty Solution Note:</em> {mq.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Section C Review */}
                <div className="space-y-3 pt-3">
                  <h5 className="text-xs font-black text-blue-700 uppercase tracking-wider">Section C: Assertion & Reasoning Review</h5>
                  {submissionResult?.data?.gradedSecC?.map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">Q{idx + 1}. Assertion & Reasoning</span>
                        {q.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> +{q.marksAwarded} Marks
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-lg flex-shrink-0">
                            <XCircle className="w-3 h-3" /> 0 Marks
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-700 space-y-1">
                        <div><strong>(A):</strong> {q.assertion}</div>
                        <div><strong>(R):</strong> {q.reason}</div>
                        <div className="pt-1">Your Choice: <strong className={q.isCorrect ? 'text-emerald-700' : 'text-rose-600'}>{q.chosenText}</strong></div>
                        {!q.isCorrect && <div>Correct Key: <strong className="text-emerald-700">{q.correctText}</strong></div>}
                      </div>
                      <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                        💡 <em>Faculty Solution Note:</em> {q.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. CONFIRMATION POPUP ================= */}
          {showConfirmation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#ED7D31] border border-amber-200 flex items-center justify-center mx-auto text-xl">
                  ⚠️
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Ready to Submit Final Examination?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You have answered <strong>{answeredTotal} of {allQuestions.length}</strong> questions. Once submitted, your answers will be permanently evaluated and locked in Cloud Firestore.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Return to Exam
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    {isSubmitting ? 'Recording...' : 'Yes, Submit Exam'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. FOOTER (FOR POST-SUBMISSION) ================= */}
          {isSubmitted && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Scorecard</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#ED7D31] hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Close & Return to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
