import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  CloudCheck, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  Database,
  ArrowRight
} from 'lucide-react';
import { getSubjectMcqs } from '../data/subjectMcqsData';
import { saveQuizSubmission } from '../services/assessmentService';

export default function SubjectQuizModal({
  isOpen,
  onClose,
  subject,
  studentUser,
  onSubmissionSaved
}) {
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  // Initialize or reset quiz when modal opens or subject changes
  useEffect(() => {
    if (isOpen && subject) {
      const mcqs = getSubjectMcqs(subject.code, subject.name);
      setQuestions(mcqs);
      setCurrentIdx(0);
      setSelectedAnswers({});
      setTimerSeconds(0);
      setIsSubmitted(false);
      setIsSubmitting(false);
      setSubmissionResult(null);
      setShowReview(false);
    }
  }, [isOpen, subject, selectedUnit]);

  // Quiz timer
  useEffect(() => {
    if (!isOpen || isSubmitted) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSubmitted]);

  if (!isOpen || !subject) return null;

  const currentQ = questions[currentIdx] || null;
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectOption = (optIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (answeredCount === 0) return;
    setIsSubmitting(true);

    // Calculate score
    let correctCount = 0;
    const formattedAnswers = questions.map((q, idx) => {
      const chosen = selectedAnswers[q.id];
      const isCorrect = chosen === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        questionIndex: idx + 1,
        questionText: q.question,
        chosenOptionIndex: chosen !== undefined ? chosen : -1,
        chosenOptionText: chosen !== undefined ? q.options[chosen] : 'Unanswered',
        correctOptionIndex: q.correctIndex,
        correctOptionText: q.options[q.correctIndex],
        isCorrect
      };
    });

    const submissionPayload = {
      studentId: studentUser?.studentId || '22BCS10492',
      studentName: studentUser?.name || 'Aditi Sharma',
      studentEmail: studentUser?.email || 'aditi.sharma@univ.edu',
      department: studentUser?.department || 'Computer Science & Engineering',
      semester: studentUser?.academicYear || 'Semester 2',
      courseCode: subject.code,
      courseName: subject.name,
      unitNumber: selectedUnit,
      unitTitle: currentQ?.unitTitle || `Unit ${selectedUnit} Assessment`,
      score: correctCount,
      totalQuestions,
      timeSpentSeconds: timerSeconds,
      answers: formattedAnswers
    };

    try {
      const res = await saveQuizSubmission(submissionPayload);
      setSubmissionResult(res);
      setIsSubmitted(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onSubmissionSaved) {
        onSubmissionSaved(res);
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-auto max-h-[92dvh]"
        >
          {/* Header */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border-b border-amber-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#ED7D31] to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#ED7D31] bg-white px-1.5 py-0.5 rounded-md border border-amber-200 flex-shrink-0">
                    {subject.code}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">Unit {selectedUnit} MCQ</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-base leading-snug truncate max-w-[130px] xs:max-w-[220px] sm:max-w-md">
                  {subject.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-mono font-bold text-slate-700 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#ED7D31]" />
                <span>{formatTime(timerSeconds)}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {!isSubmitted && (
            <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-[#ED7D31]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {!isSubmitted ? (
              // ACTIVE QUIZ INTERFACE
              currentQ && (
                <div className="space-y-6">
                  {/* Stepper info */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-800">
                      Question {currentIdx + 1} of {totalQuestions}
                    </span>
                    <span className="font-medium">
                      {answeredCount} of {totalQuestions} answered
                    </span>
                  </div>

                  {/* Question Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/70">
                    <div className="text-[11px] font-extrabold text-[#ED7D31] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{currentQ.unitTitle}</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                      {currentQ.question}
                    </p>
                  </div>

                  {/* 4 Options */}
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQ.id] === optIdx;
                      const optLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50/80 border-[#ED7D31] text-slate-900 shadow-sm shadow-orange-500/10 scale-[1.005]'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-slate-50/70'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                            isSelected 
                              ? 'bg-[#ED7D31] text-white' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {optLabel}
                          </div>
                          <span className="text-xs sm:text-sm font-medium flex-1">
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              // POST-SUBMISSION RESULTS VIEW
              <div className="space-y-6 text-center py-4">
                {/* Result Card */}
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-[#ED7D31] text-white flex items-center justify-center mx-auto shadow-xl shadow-orange-500/25">
                  <Award className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#ED7D31] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Assessment Completed
                  </span>
                  <h4 className="text-2xl font-black text-slate-900 mt-2">
                    {submissionResult?.data?.score} / {submissionResult?.data?.totalQuestions} Correct
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Score: <strong>{submissionResult?.data?.percentage}%</strong> • Status: <span className="font-bold text-emerald-600">{submissionResult?.data?.status}</span> • Time: {formatTime(timerSeconds)}
                  </p>
                </div>

                {/* Cloud Firestore Sync Confirmation Badge */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-left flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800">
                        {submissionResult?.isCloud ? 'Cloud Firestore Synced' : 'Saved Locally (Fallback)'}
                      </span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono text-emerald-700">
                        quiz_submissions
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5 font-mono truncate">
                      Doc ID: {submissionResult?.id}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Your score has been verified and recorded for Student <strong>{studentUser?.name}</strong> ({studentUser?.studentId}) under {subject.code}.
                    </p>
                  </div>
                </div>

                {/* Question Review Accordion */}
                <div className="text-left space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReview(!showReview)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{showReview ? 'Hide' : 'Review'} Question Explanations & Answers ({questions.length})</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${showReview ? 'rotate-90' : ''}`} />
                  </button>

                  {showReview && (
                    <div className="space-y-3 pt-1">
                      {questions.map((q, idx) => {
                        const chosen = selectedAnswers[q.id];
                        const isCorrect = chosen === q.correctIndex;

                        return (
                          <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                Q{idx + 1}. {q.question}
                              </span>
                              {isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex-shrink-0">
                                  <CheckCircle2 className="w-3 h-3" /> Correct
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex-shrink-0">
                                  <XCircle className="w-3 h-3" /> Incorrect
                                </span>
                              )}
                            </div>
                            
                            <div className="text-xs text-slate-600 space-y-0.5">
                              <div>Your Answer: <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-600'}>{chosen !== undefined ? q.options[chosen] : 'Unanswered'}</strong></div>
                              {!isCorrect && <div>Correct Answer: <strong className="text-emerald-700">{q.options[q.correctIndex]}</strong></div>}
                            </div>

                            <p className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                              💡 <em>Explanation:</em> {q.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 pb-safe">
            {!isSubmitted ? (
              <>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    type="button"
                    disabled={currentIdx === totalQuestions - 1}
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {currentIdx === totalQuestions - 1 || answeredCount === totalQuestions ? (
                    <button
                      type="button"
                      disabled={isSubmitting || answeredCount === 0}
                      onClick={handleSubmitQuiz}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Saving to Cloud...</span>
                      ) : (
                        <>
                          <span>Submit Assessment</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                      className="px-4 py-2.5 rounded-xl bg-[#ED7D31] hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedAnswers({});
                    setCurrentIdx(0);
                    setTimerSeconds(0);
                    setShowReview(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#ED7D31] hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Close & Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
