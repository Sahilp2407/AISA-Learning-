import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentNotesHub from './StudentNotesHub';
import FormattedChatMessage from './FormattedChatMessage';
import { 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Cpu, 
  Code2, 
  Database, 
  Globe, 
  Server, 
  Terminal, 
  Bot, 
  MessageSquarePlus, 
  FileText, 
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Zap,
  HelpCircle,
  Flag,
  Send,
  X,
  LayoutGrid,
  Home,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  PanelRightClose,
  PanelRightOpen,
  Check,
  AlertTriangle,
  RotateCcw,
  Download,
  BookCheck,
  BrainCircuit,
  FileCode,
  Award,
  Calendar,
  Timer,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Copy,
  CheckCheck,
  Mail,
  Inbox,
  ExternalLink,
  Share2,
  Trash2
} from 'lucide-react';
import { generateSocraticResponse } from '../services/geminiService';
import { SEMESTERS_DATA } from '../data/curriculumData';
import { formatTime12Hr, getTimeString } from '../services/examLockService';
import { 
  getSavedBroadcastNotes, 
  getStudentReadNotes, 
  markNoteAsReadByStudent 
} from '../services/notesBroadcastService';
import SubjectQuizModal from './SubjectQuizModal';
import { fetchStudentSubmissions } from '../services/assessmentService';
import ExaminationModal from './ExaminationModal';
import { UNIVERSITY_EXAMS_DATA } from '../data/examPapersData';
import { fetchStudentExamAttempts } from '../services/examService';

export default function DashboardPage({ 
  user, 
  isExamMode, 
  activeExamLock, 
  activeExamTiming, 
  currentTime = new Date(), 
  examLocks = [], 
  onLogout,
  onEnterExamHall,
  onBack
}) {
  // Navigation step state: 'semesters' | 'subjects' | 'subject_detail'
  const [currentStep, setCurrentStep] = useState('semesters');
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS_DATA[1]); // Default Sem 2
  const [selectedSubject, setSelectedSubject] = useState(SEMESTERS_DATA[1].subjects[3]); // Default DBMS
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Right sidebar chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);
  const [studentNote, setStudentNote] = useState('');
  const [msgFeedback, setMsgFeedback] = useState({});

  // Chat History Storage in Database / localStorage
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        sender: 'ai',
        text: 'Hello! I am your Syllabus-Grounded Academic AI Tutor. Ask me any conceptual question, equation derivation, or code problem from your enrolled course.',
        time: 'Just now',
        citations: ['Syllabus Ref: Semester 2 Units']
      }
    ];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [, setActiveChatTab] = useState('course'); // 'course' | 'global'

  // Persist chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aisa_chat_history', JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping, isChatOpen]);

  // Flag modal state
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('Citation Verification Needed');
  const [flaggedSuccess, setFlaggedSuccess] = useState(false);

  // Clear Chat State & Handler
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [chatClearToast, setChatClearToast] = useState(null);

  const handleClearChat = () => {
    const welcome = [
      {
        sender: 'ai',
        text: 'Hello! Chat history has been cleared. Ask me any conceptual question, equation derivation, or practice problem from your enrolled course.',
        time: 'Just now',
        citations: ['Syllabus Ref: Semester 2 Units']
      }
    ];
    setChatMessages(welcome);
    try {
      localStorage.removeItem('aisa_chat_history');
    } catch (e) {}
    setShowClearConfirm(false);
    setChatClearToast('Chat history cleared!');
    setTimeout(() => setChatClearToast(null), 2500);
  };

  // Resource Download Toast
  const [downloadToast, setDownloadToast] = useState(null);

  // Locked Semester Modal when student attempts to open locked semester
  const [lockedSemesterModal, setLockedSemesterModal] = useState(null);

  // Sprint 4: Faculty AI Notes & Email Notifications State
  const [broadcastNotes, setBroadcastNotes] = useState(() => getSavedBroadcastNotes());
  const [readNoteIds, setReadNoteIds] = useState(() => getStudentReadNotes(user?.email));
  const [selectedNoteModal, setSelectedNoteModal] = useState(null);
  const [noteModalTab, setNoteModalTab] = useState('guide'); // 'guide' | 'email'
  const [notesToast, setNotesToast] = useState(null);
  const [noteAccordionOpen, setNoteAccordionOpen] = useState(0);

  // Cloud Quiz & MCQ Assessments State (Firestore)
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizSubject, setQuizSubject] = useState(null);
  const [studentQuizSubmissions, setStudentQuizSubmissions] = useState([]);

  // University Proctored Examination State (Firestore 'exam_attempts')
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(UNIVERSITY_EXAMS_DATA[0]);
  const [studentExamAttempts, setStudentExamAttempts] = useState([]);

  // Load student's Firestore quiz attempts on load
  useEffect(() => {
    let isMounted = true;
    fetchStudentSubmissions(user?.email || 'aditi.sharma@univ.edu')
      .then(subs => {
        if (isMounted) setStudentQuizSubmissions(subs);
      })
      .catch(err => console.warn('Failed to fetch quiz submissions:', err));
    return () => { isMounted = false; };
  }, [user?.email]);

  // Load student's Firestore examination attempts on load
  useEffect(() => {
    let isMounted = true;
    fetchStudentExamAttempts(user?.email || 'aditi.sharma@univ.edu')
      .then(attempts => {
        if (isMounted) setStudentExamAttempts(attempts);
      })
      .catch(err => console.warn('Failed to fetch exam attempts:', err));
    return () => { isMounted = false; };
  }, [user?.email]);

  // Sync broadcast notes across tabs/windows
  useEffect(() => {
    const handleNotesBroadcasted = (e) => {
      const notes = e?.detail || getSavedBroadcastNotes();
      setBroadcastNotes(notes);
      if (notes.length > 0) {
        setNotesToast(`🔔 New Faculty Study Guide: "${notes[0].title}" published by ${notes[0].teacherName}!`);
        setTimeout(() => setNotesToast(null), 7000);
      }
    };

    window.addEventListener('aisa_notes_broadcasted', handleNotesBroadcasted);
    window.addEventListener('storage', handleNotesBroadcasted);

    return () => {
      window.removeEventListener('aisa_notes_broadcasted', handleNotesBroadcasted);
      window.removeEventListener('storage', handleNotesBroadcasted);
    };
  }, []);

  const unreadNotesCount = useMemo(() => {
    return broadcastNotes.filter(n => !readNoteIds.includes(n.id)).length;
  }, [broadcastNotes, readNoteIds]);

  const handleOpenNote = (note) => {
    setSelectedNoteModal(note);
    setCurrentStep('faculty_notes');
    setNoteModalTab('guide');
    markNoteAsReadByStudent(note.id, user?.email);
    setReadNoteIds(prev => (prev.includes(note.id) ? prev : [...prev, note.id]));
  };

  const handleDownloadNoteAsText = (note) => {
    if (!note) return;
    const concepts = (note.keyConcepts || []).map((kc, i) => `${i + 1}. ${kc.title || kc.heading || 'Concept'}\n   ${kc.summary || ''}`).join('\n\n');
    const formulas = (note.crucialFormulas || note.examFormulas || []).map((f, i) => `[${i + 1}] ${f}`).join('\n');
    const qas = (note.highYieldExamQA || []).map((qa, i) => `Q${i + 1} (${qa.marks || '5 Marks'}): ${qa.question}\nAnswer: ${qa.answer}\nTip: ${qa.examTip || ''}`).join('\n\n');
    const cheatsheet = (note.quickCheatSheet || []).map(cs => `• ${cs}`).join('\n');

    const textContent = `=====================================================
${note.title}
Course: ${note.subjectName} (${note.subjectCode}) - ${note.semester}
Faculty: ${note.teacherName} (${note.teacherDesignation})
Date: ${note.date} (${note.timestamp})
=====================================================

1. MODULE OVERVIEW:
${note.moduleOverview || ''}

2. KEY CONCEPTS & DEFINITIONS:
${concepts}

3. EXAM FORMULAS & INVARIANTS:
${formulas}

4. HIGH-YIELD EXAM QUESTIONS & ANSWERS:
${qas}

5. 1-PAGE REVISION CHEAT SHEET:
${cheatsheet}

=====================================================
Grounded in ITM University B.Tech CSE Curriculum
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.subjectCode}_AI_Study_Guide.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadToast(`📥 Downloaded "${note.subjectCode}_AI_Study_Guide.txt"!`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  // Ensure student stays on semesters overview when exam lock is active
  useEffect(() => {
    if (isExamMode && currentStep !== 'semesters') {
      setCurrentStep('semesters');
    }
  }, [isExamMode, currentStep]);

  // Navigate to subjects list
  const handleSelectSemester = (sem) => {
    if (isExamMode) {
      setLockedSemesterModal(sem);
      return;
    }
    if (sem.isLocked) {
      setLockedSemesterModal({
        name: sem.name,
        code: sem.code,
        reason: sem.lockedReason || 'This semester curriculum is currently locked for your cohort.',
        isAcademicLock: true
      });
      return;
    }
    setSelectedSemester(sem);
    setCurrentStep('subjects');
    setSearchQuery('');
    setCategoryFilter('All');
  };

  // Navigate to subject detail
  const handleSelectSubject = (subj) => {
    if (isExamMode) {
      setDownloadToast(`🔒 Access Frozen: Course materials are locked during ${activeExamLock?.course || 'scheduled exam'}.`);
      setTimeout(() => setDownloadToast(null), 3500);
      return;
    }
    setSelectedSubject(subj);
    setCurrentStep('subject_detail');
  };

  // Quick prompt trigger to Chat Drawer with live Gemini API
  const handleAskAI = async (promptText) => {
    setIsChatOpen(true);
    if (!promptText) return;

    if (isExamMode) return;

    const newMsg = { sender: 'user', text: promptText, time: 'Just now' };
    setChatMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    const activeCourseName = (currentStep === 'faculty_notes' && selectedNoteModal?.subjectName) || selectedSubject?.name || 'DBMS - SQL';
    const activeCourseCode = (currentStep === 'faculty_notes' && selectedNoteModal?.subjectCode) || selectedSubject?.code || 'CS204';
    const activeSemName = (currentStep === 'faculty_notes' && selectedNoteModal?.semester) || selectedSemester?.name || 'Semester 2';

    try {
      const response = await generateSocraticResponse({
        prompt: promptText,
        courseContext: {
          subjectName: activeCourseName,
          subjectCode: activeCourseCode,
          semesterName: activeSemName
        },
        history: chatMessages.map(m => ({ sender: m.sender, text: m.text }))
      });

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.text,
          time: 'Just now',
          citations: response.citations
        }
      ]);
    } catch (err) {
      console.error('Gemini call error in drawer:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '⚠️ Unable to connect to Gemini API right now. Please verify your internet connection or check your Gemini Key settings.',
          time: 'Just now',
          citations: ['Network Warning']
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isExamMode) return;
    const text = inputMessage.trim();
    setInputMessage('');
    handleAskAI(text);
  };

  // Filter subjects in active semester
  const filteredSubjects = (selectedSemester?.subjects || []).filter((subj) => {
    const matchesSearch = subj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          subj.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          subj.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || subj.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set((selectedSemester?.subjects || []).map(s => s.category))];

  return (
    <div className="min-h-screen bg-[#F4F3EE] text-charcoal flex flex-row overflow-hidden font-sans">
      
      {/* ================= 1. LEFT ICON MINI SIDEBAR ================= */}
      <aside className="w-16 sm:w-20 bg-[#161B22] text-white flex flex-col items-center justify-between py-6 border-r border-gray-800 z-30 flex-shrink-0">
        
        {/* Top App Logo */}
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={() => setCurrentStep('semesters')}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ED7D31] to-amber-500 flex items-center justify-center shadow-lg shadow-[#ED7D31]/30 hover:scale-105 transition-transform cursor-pointer"
            title="AISA Dashboard"
          >
            <GraduationCap className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-3 pt-4">
            <button
              onClick={() => setCurrentStep('semesters')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                currentStep === 'semesters' ? 'bg-[#ED7D31] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="All Semesters"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (broadcastNotes.length > 0 && !selectedNoteModal) {
                  setSelectedNoteModal(broadcastNotes[0]);
                }
                setCurrentStep('faculty_notes');
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                currentStep === 'faculty_notes' ? 'bg-[#ED7D31] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Faculty AI Study Notes & Repository"
            >
              <BookOpen className="w-5 h-5" />
              {unreadNotesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#ED7D31] absolute top-2 right-2 ring-2 ring-[#161B22]" />
              )}
            </button>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                isChatOpen ? 'bg-[#ED7D31] text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="AI Socratic Tutor Chat"
            >
              <Bot className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-[#ED7D31] absolute top-2 right-2 animate-ping" />
            </button>

            <button
              onClick={() => setIsExamMode(!isExamMode)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isExamMode ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={isExamMode ? 'Exam Lock Active' : 'Simulate Exam Mode'}
            >
              {isExamMode ? <ShieldAlert className="w-5 h-5 animate-pulse text-red-400" /> : <ShieldCheck className="w-5 h-5" />}
            </button>
          </nav>
        </div>

        {/* Bottom Student Avatar & Logout */}
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-9 h-9 rounded-full bg-[#ED7D31] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white/20"
            title={`${user?.name || 'Sahil Pandey'} (${user?.studentId || '2024.PSAIL'})`}
          >
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>

          <button
            onClick={onBack || onLogout}
            className="w-10 h-10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Back to Home Page"
          >
            <ArrowLeft className="w-4 h-4 text-[#ED7D31]" />
          </button>

          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ================= 2. MAIN CENTER CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {currentStep === 'faculty_notes' ? (
          <StudentNotesHub
            user={user}
            notes={broadcastNotes}
            selectedNoteId={selectedNoteModal?.id || broadcastNotes[0]?.id}
            onSelectNote={(note) => {
              setSelectedNoteModal(note);
              markNoteAsReadByStudent(note.id, user?.email);
              setReadNoteIds(prev => (prev.includes(note.id) ? prev : [...prev, note.id]));
            }}
            onBackToCourses={() => setCurrentStep('semesters')}
            onOpenAiTutor={(prompt) => {
              if (prompt) {
                handleAskAI(prompt);
              } else {
                setIsChatOpen(true);
              }
            }}
            onDownloadText={handleDownloadNoteAsText}
          />
        ) : (
          <>
            {/* Top App Header Bar */}
            <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-borderLight px-6 py-3.5 flex items-center justify-between gap-4">
              
              {/* Download Notification Toast */}
          {downloadToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#161B22] text-white px-4 py-2.5 rounded-2xl text-xs shadow-xl border border-amber-500/30 flex items-center gap-2 font-medium animate-bounce">
              <Download className="w-4 h-4 text-[#ED7D31]" />
              <span>{downloadToast}</span>
            </div>
          )}

          {/* New Faculty Notes Broadcast Toast */}
          {notesToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-600 to-[#ED7D31] text-white px-5 py-3 rounded-2xl text-xs shadow-2xl border border-amber-300 flex items-center gap-3 font-semibold animate-bounce max-w-xl">
              <Sparkles className="w-4 h-4 flex-shrink-0 animate-spin" />
              <span className="truncate">{notesToast}</span>
              <button
                onClick={() => {
                  if (broadcastNotes.length > 0) handleOpenNote(broadcastNotes[0]);
                  setNotesToast(null);
                }}
                className="px-3 py-1 bg-white text-[#ED7D31] rounded-xl text-[11px] font-black hover:bg-amber-50 cursor-pointer flex-shrink-0 shadow-sm"
              >
                Open Guide
              </button>
              <button onClick={() => setNotesToast(null)} className="text-white/80 hover:text-white p-1 cursor-pointer">✕</button>
            </div>
          )}

          {/* Back Button & Breadcrumbs Navigation */}
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-charcoal truncate">
            {/* Context-aware Universal Back Button */}
            <button
              type="button"
              onClick={() => {
                if (currentStep === 'subject_detail') {
                  setCurrentStep('subjects');
                } else if (currentStep === 'subjects') {
                  setCurrentStep('semesters');
                } else if (currentStep === 'faculty_notes') {
                  setCurrentStep('semesters');
                } else if (onBack) {
                  onBack();
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/90 text-charcoal font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer border border-stone-200/80 hover:border-stone-300 shrink-0 group"
              title={
                currentStep === 'subject_detail'
                  ? 'Back to Subjects'
                  : currentStep === 'subjects'
                  ? 'Back to Semesters'
                  : currentStep === 'faculty_notes'
                  ? 'Back to Dashboard'
                  : 'Back to Home Page'
              }
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#ED7D31] group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-extrabold text-xs">Back</span>
            </button>

            <div className="h-4 w-px bg-stone-200 shrink-0" />

            <button
              onClick={() => setCurrentStep('semesters')}
              className="text-charcoal-muted hover:text-charcoal flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#ED7D31]" />
              <span className="hidden sm:inline">Courses</span>
            </button>
            <span className="text-gray-300">/</span>

            <button
              onClick={() => setCurrentStep('semesters')}
              className={`hover:text-charcoal transition-colors cursor-pointer ${
                currentStep === 'semesters' ? 'font-bold bg-amber-50 text-[#ED7D31] px-2 py-0.5 rounded-lg' : 'text-charcoal-muted'
              }`}
            >
              B.Tech CSE 2024–28
            </button>

            {currentStep !== 'semesters' && (
              <>
                <span className="text-gray-300">/</span>
                <button
                  onClick={() => setCurrentStep('subjects')}
                  className={`hover:text-charcoal transition-colors cursor-pointer truncate ${
                    currentStep === 'subjects' ? 'font-bold bg-amber-50 text-[#ED7D31] px-2 py-0.5 rounded-lg' : 'text-charcoal-muted'
                  }`}
                >
                  {selectedSemester.name}
                </button>
              </>
            )}

            {currentStep === 'subject_detail' && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-white font-bold bg-[#ED7D31] px-2.5 py-0.5 rounded-lg truncate">
                  {selectedSubject.name}
                </span>
              </>
            )}
          </div>

          {/* Right Controls: Dynamic Exam Lock Status & Chat Toggle */}
          <div className="flex items-center gap-3">
            {/* Faculty AI Notes Button */}
            <button
              onClick={() => {
                if (broadcastNotes.length > 0) {
                  handleOpenNote(broadcastNotes[0]);
                }
              }}
              className="relative px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/80 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xs"
              title="View AI Study Guides & University Email Notifications"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#ED7D31]" />
              <span className="hidden md:inline">Faculty Notes</span>
              {unreadNotesCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-[#ED7D31] text-white text-[10px] font-black animate-pulse">
                  {unreadNotesCount} New
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                  {broadcastNotes.length}
                </span>
              )}
            </button>

            {/* Exam Lockout Status Badge */}
            {isExamMode ? (
              <div 
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-xs animate-pulse"
                title={`Exam Lock Active for ${activeExamLock?.course || 'Course'}. Unlocks in ${activeExamTiming?.timeRemainingStr || ''}`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span className="hidden md:inline">Exam Lock Active</span>
                {activeExamTiming?.timeRemainingStr && (
                  <span className="bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-md font-mono text-[10px]">
                    {activeExamTiming.timeRemainingStr}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline font-bold">AI Active</span>
              </div>
            )}

            {/* Toggle AI Tutor Drawer Button */}
            <button
              onClick={() => {
                if (isExamMode) {
                  setDownloadToast(`🔒 AI Tutor Locked: Queries are suppressed during active exam.`);
                  setTimeout(() => setDownloadToast(null), 3500);
                  return;
                }
                setIsChatOpen(!isChatOpen);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shadow-xs ${
                isExamMode
                  ? 'bg-rose-50/70 text-rose-700 border-rose-200 cursor-not-allowed'
                  : isChatOpen
                  ? 'bg-[#ED7D31] text-white border-[#ED7D31] cursor-pointer'
                  : 'bg-white hover:bg-stone-50 text-charcoal border-borderLight cursor-pointer'
              }`}
              title={isExamMode ? 'AI Tutor Locked during examination' : 'Toggle AI Tutor'}
            >
              <Bot className="w-4 h-4 text-current" />
              <span className="hidden sm:inline">AI Tutor</span>
              {isExamMode && <Lock className="w-3 h-3 text-rose-600" />}
            </button>
          </div>
        </header>

        {/* Dynamic Main Workspace Container */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1536px] w-full mx-auto space-y-6">
          
          {/* Prominent Active Exam Lockdown Banner (30-min buffer active) */}
          {isExamMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-200/90 shadow-md space-y-3.5 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-mono text-[10px] font-black uppercase tracking-wider">
                        Honor Code Lockdown Active
                      </span>
                      <span className="text-xs font-bold text-rose-800">
                        {activeExamTiming?.reason || '30-Minute Integrity Buffer in Progress'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                      {activeExamLock?.course || 'Course Examination Lockdown'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white/95 px-4 py-2.5 rounded-2xl border border-rose-200 shadow-xs self-start sm:self-center flex-shrink-0">
                  <Timer className="w-5 h-5 text-rose-600 animate-spin [animation-duration:8s]" />
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Portal Unlocks In</span>
                    <strong className="text-rose-700 font-mono text-sm font-black">
                      {activeExamTiming?.timeRemainingStr || '00:00'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-rose-200/70 text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#ED7D31] flex-shrink-0" />
                  <span>Exam Window: <strong>{activeExamLock?.date} · {activeExamLock?.startTime ? formatTime12Hr(activeExamLock.startTime) : ''} – {activeExamLock?.endTime ? formatTime12Hr(activeExamLock.endTime) : ''}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Integrity Buffer: <strong>Auto-locked 30m prior & releases 30m after completion</strong></span>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* ================= STEP 1: ALL SEMESTERS (LMS Grid) ================= */}
          {currentStep === 'semesters' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              {/* Header Title & Count */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
                    B.Tech CSE Curriculum (2024–28)
                  </h1>
                  <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
                    Select your semester to access course syllabus units, textbook proofs, and Socratic AI tutoring.
                  </p>
                </div>

                <span className="self-start sm:self-auto text-xs font-bold bg-white px-3.5 py-1.5 rounded-xl border border-borderLight text-charcoal shadow-xs">
                  8 Total Semesters
                </span>
              </div>

              {/* Proctored University Examination Hall (Firestore 'exam_attempts') */}
              <div className="rounded-3xl bg-white border border-[#E8DFC8] shadow-sm hover:shadow-md transition-all relative overflow-hidden text-[#1E1B18]">
                {/* Ambient subtle glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/10 via-orange-400/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                {/* Top Banner Row: Badges, Title & Quick Launch */}
                <div className="p-5 sm:p-6 border-b border-[#E8DFC8]/70 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#ED7D31] bg-amber-50 border border-amber-200/90 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <GraduationCap className="w-3.5 h-3.5 text-[#ED7D31]" />
                        Official Examination Hall
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        AI-Proctored · Lock-Down Honor Guard
                      </span>
                      <span className="text-[10px] font-mono text-stone-500 bg-[#FAF7EE] border border-[#E8DFC8] px-2 py-0.5 rounded-full">
                        Cloud: exam_attempts
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#1E1B18] flex items-center gap-2">
                      <span>🏛️ Apex Proctored Midterm Examination Portal</span>
                    </h3>

                    <p className="text-xs sm:text-sm text-[#6B6358] max-w-3xl leading-relaxed">
                      Multi-format evaluation platform: <strong className="text-[#1E1B18]">Section A (MCQs)</strong> · <strong className="text-[#1E1B18]">Section B (Interactive Matching Matrix)</strong> · <strong className="text-[#1E1B18]">Section C (Assertion & Reasoning)</strong>. Automatically evaluated with instantaneous certified Report Cards.
                    </p>
                  </div>

                  {/* Right: Paper Selector Pills + Enter Hall CTA */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 self-start xl:self-center">
                    <div className="flex bg-[#FAF7EE] p-1 rounded-2xl border border-[#E8DFC8]">
                      {UNIVERSITY_EXAMS_DATA.map((ex) => (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => setSelectedExam(ex)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedExam.id === ex.id
                              ? 'bg-[#ED7D31] text-white shadow-xs font-black'
                              : 'text-[#6B6358] hover:text-[#1E1B18] hover:bg-stone-200/50'
                          }`}
                        >
                          {ex.code} ({ex.durationMinutes}m)
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onEnterExamHall) {
                          onEnterExamHall(selectedExam);
                        } else {
                          setExamModalOpen(true);
                        }
                      }}
                      className="px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#ED7D31] to-[#F39C12] hover:from-[#d96c24] hover:to-[#e08e0b] text-white font-black text-xs sm:text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <GraduationCap className="w-4 h-4 text-white" />
                      <span>Enter Examination Hall</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Split Grid: Selected Exam Specs (Left 7 Cols) + Student Performance / Scorecard (Right 5 Cols) */}
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left Column (7 cols): Selected Paper Details & Specs */}
                  <div className="lg:col-span-7 bg-[#FAF7EE]/70 border border-[#E8DFC8] rounded-2xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8DFC8]/70">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-xs text-[#ED7D31] bg-white px-2.5 py-1 rounded-lg border border-[#E8DFC8] shadow-2xs">
                            {selectedExam.code}
                          </span>
                          <span className="font-black text-sm sm:text-base text-[#1E1B18]">{selectedExam.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-stone-500 bg-white px-2.5 py-0.5 rounded-full border border-[#E8DFC8]">
                          Semester {selectedExam.semester || 2}
                        </span>
                      </div>

                      <p className="text-xs text-[#6B6358] font-medium leading-relaxed">
                        {selectedExam.title} · Complete proctored midterm test with locked screen integrity verification.
                      </p>

                      <div className="grid grid-cols-3 gap-2.5 pt-1">
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8DFC8] text-center">
                          <span className="text-[10px] font-bold text-stone-400 block uppercase">Duration</span>
                          <strong className="text-xs sm:text-sm font-black text-[#1E1B18] flex items-center justify-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-[#ED7D31]" />
                            {selectedExam.durationMinutes} Mins
                          </strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8DFC8] text-center">
                          <span className="text-[10px] font-bold text-stone-400 block uppercase">Total Marks</span>
                          <strong className="text-xs sm:text-sm font-black text-emerald-800 flex items-center justify-center gap-1 mt-0.5">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            {selectedExam.totalMarks} (Pass: {selectedExam.passingMarks})
                          </strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8DFC8] text-center">
                          <span className="text-[10px] font-bold text-stone-400 block uppercase">Format</span>
                          <strong className="text-xs sm:text-sm font-black text-[#1E1B18] block mt-0.5">
                            3 Sections
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-[11px] text-stone-500 border-t border-[#E8DFC8]/60">
                      <span className="flex items-center gap-1.5 font-semibold text-stone-600">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Anti-Cheating Guard & Auto Screen Recording
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onEnterExamHall) onEnterExamHall(selectedExam);
                          else setExamModalOpen(true);
                        }}
                        className="text-xs font-black text-[#ED7D31] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Begin Examination</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Student's Latest Performance / History */}
                  <div className="lg:col-span-5 bg-[#FAF7EE]/70 border border-[#E8DFC8] rounded-2xl p-5 flex flex-col justify-between space-y-3">
                    {studentExamAttempts.length > 0 ? (
                      (() => {
                        const attempt = studentExamAttempts[0];
                        const examCode = attempt.courseCode || attempt.examCode || attempt.examId || 'CS204';
                        const examName = attempt.courseName || attempt.examName || attempt.examTitle || 'DBMS - SQL & Relational Architecture';
                        const score = attempt.scoreObtained ?? attempt.totalMarksObtained ?? 0;
                        const total = attempt.totalMarks || attempt.maxMarks || 30;
                        const percentage = attempt.percentage ?? Math.round((score / total) * 100);
                        const isPass = percentage >= 40;
                        const grade = attempt.grade || attempt.letterGrade || (
                          percentage >= 90 ? 'A+' :
                          percentage >= 80 ? 'A' :
                          percentage >= 70 ? 'B+' :
                          percentage >= 55 ? 'B' :
                          percentage >= 40 ? 'C' : 'F'
                        );

                        const gradeBadgeStyle =
                          grade.startsWith('A')
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : grade.startsWith('B')
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : grade === 'C'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200';

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-[#1E1B18] flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-[#ED7D31]" />
                                Latest Verified Exam Record
                              </span>
                              <span className="text-[10px] font-mono text-stone-500 bg-white px-2 py-0.5 rounded border border-[#E8DFC8]">
                                {studentExamAttempts.length} Completed
                              </span>
                            </div>

                            <div className="bg-white p-3.5 rounded-xl border border-[#E8DFC8] space-y-2.5 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-black text-[#ED7D31] bg-[#FAF7EE] px-2 py-0.5 rounded border border-[#E8DFC8]">
                                  {examCode}
                                </span>
                                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${gradeBadgeStyle}`}>
                                  Grade: {grade} · {percentage}%
                                </span>
                              </div>

                              <div>
                                <p className="text-xs font-black text-[#1E1B18] truncate">{examName}</p>
                                <div className="flex items-baseline justify-between mt-1">
                                  <span className="text-[11px] font-semibold text-stone-500">Official Score</span>
                                  <div className="text-sm font-black">
                                    <span className={isPass ? 'text-emerald-700' : 'text-rose-700'}>{score}</span>
                                    <span className="text-xs text-stone-400 font-bold"> / {total} Marks</span>
                                  </div>
                                </div>
                              </div>

                              <div className="w-full bg-stone-200/70 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${isPass ? 'bg-gradient-to-r from-amber-500 to-emerald-500' : 'bg-rose-500'}`} 
                                  style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                                <span className="font-mono flex items-center gap-1">
                                  {attempt.isCloud ? '☁️ Cloud Verified' : '💾 Local Synced'}
                                </span>
                                <span>{attempt.submittedAtFormatted || 'Recent'}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const matched = UNIVERSITY_EXAMS_DATA.find(e => e.id === attempt.examId || e.code === examCode) || selectedExam;
                                if (onEnterExamHall) onEnterExamHall(matched);
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#FAF7EE] border border-[#E8DFC8] text-xs font-bold text-stone-700 hover:text-[#ED7D31] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span>Re-take / Review Exam</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#ED7D31] flex items-center justify-center border border-amber-200">
                          <Award className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-black text-[#1E1B18]">No Proctored Attempts Yet</h4>
                        <p className="text-[11px] text-[#6B6358] max-w-xs leading-relaxed">
                          Select your university exam paper and launch the proctored hall to get evaluated.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cloud Quiz & Assessment Records (Firestore Synced) */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-emerald-50/80 border border-emerald-200/90 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                          Cloud Firestore Synced
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium font-mono">quiz_submissions</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                        My Unit MCQs & Assessment Performance ({studentQuizSubmissions.length} Attempts)
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      // Default quick quiz with Semester 2 core (DBMS)
                      const dbmsSub = SEMESTERS_DATA[1]?.subjects?.find(s => s.code === 'CS204') || SEMESTERS_DATA[0]?.subjects[0];
                      setQuizSubject(dbmsSub);
                      setQuizModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 self-start sm:self-auto"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Take Practice Quiz</span>
                  </button>
                </div>

                {studentQuizSubmissions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {studentQuizSubmissions.slice(0, 3).map((sub, i) => (
                      <div key={sub.id || i} className="p-3 rounded-2xl bg-white border border-emerald-200/70 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {sub.courseCode}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sub.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sub.score}/{sub.totalQuestions} ({sub.percentage}%)
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 truncate">{sub.courseName}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{sub.submittedAtStr || 'Recent'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-3 rounded-2xl border border-emerald-200/50">
                    💡 No quiz records yet today. Click <strong>"Take Practice Quiz"</strong> above or click <strong>MCQs</strong> on any subject card to test your conceptual clarity. Your scores will instantly record to Google Cloud Firestore!
                  </p>
                )}
              </div>

              {/* Semesters Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {SEMESTERS_DATA.map((sem) => (
                  <div
                    key={sem.id}
                    onClick={() => handleSelectSemester(sem)}
                    className={`group bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                      isExamMode 
                        ? 'border-rose-200 shadow-xs bg-slate-50/70 select-none hover:border-rose-400 hover:shadow-md' 
                        : sem.isLocked
                        ? 'border-slate-300 shadow-xs bg-slate-50/75 hover:border-slate-400 hover:shadow-md'
                        : 'border-[#E8E5DD] shadow-sm hover:shadow-xl hover:border-[#ED7D31]'
                    }`}
                  >
                    {/* Top Accent Band */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 transition-opacity ${
                      isExamMode 
                        ? 'bg-rose-500 opacity-90' 
                        : sem.isLocked
                        ? 'bg-slate-400 opacity-70 group-hover:opacity-100'
                        : 'bg-gradient-to-r from-[#ED7D31] to-amber-400 opacity-80 group-hover:opacity-100'
                    }`} />

                    {isExamMode ? (
                      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-xl text-[10px] font-black uppercase tracking-wider border border-rose-200 shadow-2xs">
                        <Lock className="w-3 h-3 text-rose-600" />
                        <span>Locked</span>
                      </div>
                    ) : sem.isLocked ? (
                      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-300 shadow-2xs">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>Locked</span>
                      </div>
                    ) : null}

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                          isExamMode 
                            ? 'text-rose-700 bg-rose-50 border-rose-200' 
                            : sem.isLocked
                            ? 'text-slate-600 bg-slate-100 border-slate-200'
                            : 'text-[#ED7D31] bg-[#ED7D31]/10 border-[#ED7D31]/20'
                        }`}>
                          {sem.code}
                        </span>
                        <span className="text-xs text-charcoal-muted font-semibold bg-stone-100 px-2.5 py-0.5 rounded-lg">
                          {sem.subjectCount} Subjects
                        </span>
                      </div>

                      <h3 className={`font-sans text-xl font-extrabold mb-2 transition-colors flex items-center justify-between ${
                        isExamMode 
                          ? 'text-slate-800 group-hover:text-rose-700' 
                          : sem.isLocked
                          ? 'text-slate-700 group-hover:text-slate-900'
                          : 'text-charcoal group-hover:text-[#ED7D31]'
                      }`}>
                        <span>{sem.id}. {sem.name}</span>
                        {sem.isLocked && <Lock className="w-4 h-4 text-slate-400" />}
                      </h3>

                      <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2 mb-6">
                        {sem.subjects.map(s => s.name).slice(0, 3).join(', ')}...
                      </p>
                    </div>

                    {/* Progress Bar & CTA */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-charcoal-muted font-medium">Syllabus Completion</span>
                          <span className="font-bold text-charcoal">{sem.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isExamMode || sem.isLocked ? 'bg-slate-300' : 'bg-gradient-to-r from-[#ED7D31] to-amber-500'
                            }`}
                            style={{ width: `${Math.max(sem.progress, sem.isLocked ? 0 : 6)}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        {isExamMode ? (
                          <div className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs group-hover:bg-rose-100 transition-colors">
                            <span className="flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-rose-600" />
                              <span>Access Locked (Exam Active)</span>
                            </span>
                            <span className="text-[10px] font-mono font-semibold text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-md">
                              {activeExamTiming?.timeRemainingStr || 'Locked'}
                            </span>
                          </div>
                        ) : sem.isLocked ? (
                          <div className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold shadow-2xs group-hover:bg-slate-200/70 group-hover:text-slate-800 transition-colors">
                            <span className="flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                              <span>Upcoming Term (Locked)</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                              Year 4
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs font-bold text-[#ED7D31] group-hover:translate-x-1 transition-transform">
                            <span>Open Semester Subjects</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: SUBJECTS LIST (LMS Grid) ================= */}
          {currentStep === 'subjects' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              {/* Header with Back Button & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentStep('semesters')}
                    className="w-10 h-10 rounded-2xl bg-white border border-borderLight hover:border-[#ED7D31] text-charcoal flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                    title="Back to Semesters"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
                      {selectedSemester.name} ({filteredSubjects.length})
                    </h1>
                    <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
                      Select any course module to explore syllabus units, textbook proofs, and Socratic AI tutor.
                    </p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search subject..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-charcoal rounded-2xl text-xs sm:text-sm border border-borderLight focus:outline-none focus:ring-2 focus:ring-[#ED7D31]"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      categoryFilter === cat
                        ? 'bg-charcoal text-white shadow-xs'
                        : 'bg-white text-charcoal-muted hover:text-charcoal border border-borderLight'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Subjects Grid (Like reference LMS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSubjects.map((subj, idx) => (
                  <div
                    key={subj.id}
                    onClick={() => handleSelectSubject(subj)}
                    className="group bg-white rounded-3xl p-6 border border-[#E8E5DD] shadow-sm hover:shadow-xl hover:border-[#ED7D31] transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold text-[#ED7D31] bg-[#ED7D31]/10 px-2.5 py-0.5 rounded-full border border-[#ED7D31]/20">
                          {subj.code}
                        </span>
                        <span className="text-[10px] font-semibold text-charcoal-muted bg-stone-100 px-2.5 py-0.5 rounded-md">
                          {subj.category}
                        </span>
                      </div>

                      <h3 className="font-sans text-lg font-bold text-charcoal group-hover:text-[#ED7D31] transition-colors mb-2 line-clamp-2">
                        {idx + 1}. {subj.name}
                      </h3>

                      <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2 mb-4">
                        {subj.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold gap-2">
                      <div className="flex items-center gap-1.5 text-charcoal">
                        <BookOpen className="w-4 h-4 text-[#ED7D31]" />
                        <span>{subj.units} Units</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {UNIVERSITY_EXAMS_DATA.find(e => e.code === subj.code) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const matchedExam = UNIVERSITY_EXAMS_DATA.find(e => e.code === subj.code);
                              if (onEnterExamHall) {
                                onEnterExamHall(matchedExam);
                              } else {
                                setSelectedExam(matchedExam);
                                setExamModalOpen(true);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 flex items-center gap-1 transition-all cursor-pointer shadow-2xs hover:scale-105"
                            title="Take Proctored Midterm Examination"
                          >
                            <GraduationCap className="w-3 h-3 text-indigo-600" />
                            <span>Exam</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuizSubject(subj);
                            setQuizModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 transition-all cursor-pointer shadow-2xs hover:scale-105"
                          title="Practice MCQs & Save Score to Cloud"
                        >
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>MCQs</span>
                        </button>

                        <span className="text-[#ED7D31] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                          Syllabus →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ================= STEP 3: SUBJECT DETAIL & SYLLABUS UNITS ================= */}
          {currentStep === 'subject_detail' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              {/* Subject Hero Header */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5DD] shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setCurrentStep('subjects')}
                    className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-charcoal flex items-center justify-center transition-colors cursor-pointer"
                    title="Back to Subjects"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold text-[#ED7D31] bg-[#ED7D31]/10 px-2.5 py-1 rounded-full border border-[#ED7D31]/20">
                    {selectedSubject.code} · {selectedSemester.name}
                  </span>
                  <span className="text-xs text-charcoal-muted font-semibold">5 Academic Credits</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <h1 className="font-sans text-2xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
                      {selectedSubject.name}
                    </h1>
                    <p className="text-sm text-charcoal-muted mt-2 leading-relaxed">
                      {selectedSubject.desc} Covers foundational mathematical models, formal textbook proofs, and university semester examination blueprints.
                    </p>
                  </div>

                  {/* Assessment & Socratic AI Triggers */}
                  <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                    {UNIVERSITY_EXAMS_DATA.find(e => e.code === selectedSubject.code) && (
                      <button
                        type="button"
                        onClick={() => {
                          const matchedExam = UNIVERSITY_EXAMS_DATA.find(e => e.code === selectedSubject.code);
                          if (onEnterExamHall) {
                            onEnterExamHall(matchedExam);
                          } else {
                            setSelectedExam(matchedExam);
                            setExamModalOpen(true);
                          }
                        }}
                        className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white text-sm font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      >
                        <GraduationCap className="w-4 h-4 text-white" />
                        <span>Enter Proctored Exam ({UNIVERSITY_EXAMS_DATA.find(e => e.code === selectedSubject.code)?.durationMinutes}m)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setQuizSubject(selectedSubject);
                        setQuizModalOpen(true);
                      }}
                      className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <Award className="w-4 h-4 text-white" />
                      <span>Take Practice MCQs</span>
                    </button>

                    <button
                      onClick={() => handleAskAI(`Give me a high-yield summary of ${selectedSubject.name}`)}
                      className="gold-button px-6 py-3.5 rounded-2xl text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Launch AI Socratic Tutor</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Approved Academic Resources & Downloads Hub */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E5DD] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#ED7D31] flex items-center justify-center">
                      <BookCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-sans text-base font-bold text-charcoal">
                        Approved Textbook References & Lecture Notes
                      </h3>
                      <p className="text-xs text-charcoal-muted">Faculty-reviewed curriculum resources for {selectedSubject.name}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ✓ Verified Academic Sources
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-borderLight flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                        <FileText className="w-4 h-4 text-[#ED7D31]" />
                        <span>Official Course Lecture Slides</span>
                      </div>
                      <p className="text-[11px] text-charcoal-muted">Complete 5-unit slide deck provided by department faculty.</p>
                    </div>
                    <button
                      onClick={() => {
                        setDownloadToast(`Downloading ${selectedSubject.code}_Lecture_Slides.pdf`);
                        setTimeout(() => setDownloadToast(null), 3000);
                      }}
                      className="w-full py-2 bg-white hover:bg-amber-50 text-charcoal font-bold text-xs rounded-xl border border-borderLight transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#ED7D31]" />
                      <span>Download PDF Notes</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-borderLight flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                        <BookOpen className="w-4 h-4 text-[#ED7D31]" />
                        <span>Standard Reference Textbook</span>
                      </div>
                      <p className="text-[11px] text-charcoal-muted">Database System Concepts (Silberschatz, Korth, Sudarshan 7th Ed).</p>
                    </div>
                    <button
                      onClick={() => handleAskAI(`What chapters in Database System Concepts cover ${selectedSubject.name}?`)}
                      className="w-full py-2 bg-white hover:bg-amber-50 text-charcoal font-bold text-xs rounded-xl border border-borderLight transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ED7D31]" />
                      <span>View Chapter Maps</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-borderLight flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                        <BrainCircuit className="w-4 h-4 text-[#ED7D31]" />
                        <span>Socratic Exam Practice Bank</span>
                      </div>
                      <p className="text-[11px] text-charcoal-muted">Interactive flashcards & previous semester viva questions.</p>
                    </div>
                    <button
                      onClick={() => handleAskAI(`Generate 3 high-yield Socratic practice exam questions for ${selectedSubject.name}`)}
                      className="w-full py-2 bg-white hover:bg-amber-50 text-charcoal font-bold text-xs rounded-xl border border-borderLight transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-[#ED7D31]" />
                      <span>Generate Quiz Bank</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 5 Units Curriculum Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-xl font-extrabold text-charcoal">
                    Syllabus Units & Socratic Quick-Launch
                  </h3>
                  <span className="text-xs text-charcoal-muted font-medium">5 Units (100% Exam-Aligned)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { unit: 'Unit 1', title: 'Foundational Theory & Conceptual Models', topics: 'Entity relationships, system architecture, relational constraints, algebraic operators.', priority: 'Core Base' },
                    { unit: 'Unit 2', title: 'Formal Specifications & Language Protocols', topics: 'Schema definitions, query compilation, relational algebra derivations, calculus.', priority: 'High Weightage' },
                    { unit: 'Unit 3', title: 'Normalization, 3NF & BCNF Proofs', topics: 'Lossless join decompositions, functional dependencies, Armstrong axioms, synthesis.', priority: 'Exam Critical' },
                    { unit: 'Unit 4', title: 'ACID Concurrency, Locking & 2PL', topics: 'Serializability graph testing, timestamp ordering, write-ahead logging, recovery protocols.', priority: 'Midterm Core' },
                    { unit: 'Unit 5', title: 'Indexing top-down: B+ Trees & Cost Analysis', topics: 'Fanout calculations, tree height proofs, buffer pool replacement, hash indices.', priority: 'Finals Focus' }
                  ].map((u, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-3xl p-6 border border-[#E8E5DD] shadow-sm hover:shadow-xl hover:border-[#ED7D31] transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-mono font-bold text-[#ED7D31] bg-[#ED7D31]/10 px-2 py-0.5 rounded-md border border-[#ED7D31]/20">
                            {u.unit}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {u.priority}
                          </span>
                        </div>

                        <h4 className="font-sans font-bold text-base text-charcoal mb-2">
                          {u.title}
                        </h4>

                        <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
                          {u.topics}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAskAI(`Explain ${selectedSubject.name} — ${u.unit}: ${u.title}`)}
                        className="w-full py-2.5 px-3 bg-amber-50/80 hover:bg-amber-100 text-charcoal font-bold text-xs rounded-xl border border-amber-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#ED7D31]" />
                        <span>Ask AI for {u.unit}</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </main>
          </>
        )}
      </div>

      {/* ================= 3. RIGHT AI SOCRATIC CHAT PANEL (LMS Drawer) ================= */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-screen bg-white border-l border-borderLight flex flex-col justify-between shadow-2xl z-30 flex-shrink-0 relative overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-borderLight flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#ED7D31] text-white flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-sans font-bold text-sm text-charcoal leading-tight">
                    Socratic AI Tutor
                  </h3>
                  <p className="text-[10px] text-charcoal-muted leading-tight font-medium">
                    {selectedSubject?.name ? selectedSubject.name.slice(0, 24) + '...' : 'Academic Chat'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(prev => !prev)}
                  disabled={chatMessages.length <= 1}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-stone-600 hover:text-rose-600 hover:bg-rose-50 border border-stone-200/80 hover:border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-3.5 h-3.5 text-stone-500 hover:text-rose-600" />
                  <span className="text-[11px]">Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlagModalOpen(true)}
                  className="p-1.5 rounded-lg text-charcoal-muted hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                  title="Flag for Faculty Review"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clear Chat Confirmation Banner */}
            {showClearConfirm && (
              <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-900 animate-fadeIn">
                <span className="font-bold text-[11px] flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  Clear entire chat history?
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black cursor-pointer shadow-xs transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 rounded-md bg-white hover:bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Clear Chat Success Toast */}
            {chatClearToast && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1.5 text-center text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1.5 animate-fadeIn">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{chatClearToast}</span>
              </div>
            )}

            {/* Exam Locked Notice if exam is active */}
            {isExamMode ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-rose-50/60 space-y-4">
                <div className="w-14 h-14 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                  <ShieldAlert className="w-7 h-7 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-200 text-rose-900 text-[10px] font-mono font-black uppercase tracking-wider">
                    Honor Code Lockdown
                  </span>
                  <h4 className="font-sans font-extrabold text-base text-slate-900">
                    AI Queries Suppressed
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Automated academic restriction active for course examination integrity.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-rose-200 text-left space-y-2 w-full text-xs shadow-xs">
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Active Examination:
                  </div>
                  <p className="font-extrabold text-slate-900 text-xs">
                    {activeExamLock?.course || 'Examination Session'}
                  </p>
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Exam Slot:</span>
                      <strong className="font-mono text-slate-800">
                        {activeExamLock?.startTime ? formatTime12Hr(activeExamLock.startTime) : ''} – {activeExamLock?.endTime ? formatTime12Hr(activeExamLock.endTime) : ''}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Current Stage:</span>
                      <span className="text-[#D96618] font-bold">
                        {activeExamTiming?.reason || 'Lock in progress'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Buffer Rule:</span>
                      <span className="text-slate-700 font-medium">±30m Pre & Post Lock</span>
                    </div>
                  </div>
                </div>

                <div className="w-full p-3 bg-white rounded-2xl border border-rose-200 shadow-2xs flex items-center justify-center gap-2 text-rose-700 text-xs font-bold font-mono">
                  <Timer className="w-4 h-4 text-rose-600 animate-spin [animation-duration:8s]" />
                  <span>Unlocks in: {activeExamTiming?.timeRemainingStr || 'Locked'}</span>
                </div>
              </div>
            ) : (
              /* Chat Messages Feed */
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} group`}
                  >
                    {/* Verified Faculty Answer Badge */}
                    {msg.sender === 'faculty' && (
                      <div className="mb-1 flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Faculty Answer</span>
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed text-left shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#ED7D31] text-white rounded-br-sm'
                          : msg.sender === 'faculty'
                          ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-bl-sm font-medium'
                          : 'bg-stone-50 text-charcoal border border-borderLight rounded-bl-sm'
                      }`}
                    >
                      <FormattedChatMessage
                        content={msg.text}
                        isUser={msg.sender === 'user'}
                      />
                    </div>

                    {msg.citations && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#ED7D31] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-successSoft" />
                        <span>{msg.citations[0]}</span>
                      </div>
                    )}

                    {/* AI Message Action Buttons: Thumbs Up/Down, Copy Code, Ask Teacher */}
                    {msg.sender === 'ai' && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                        {/* Thumbs Up */}
                        <button
                          onClick={() => setMsgFeedback(prev => ({ ...prev, [i]: 'up' }))}
                          className={`p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ${
                            msgFeedback[i] === 'up' ? 'text-emerald-600 font-bold' : 'hover:text-slate-700'
                          }`}
                          title="Accurate & helpful"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>

                        {/* Thumbs Down (AI Hallucination Reporting) */}
                        <button
                          onClick={() => {
                            setMsgFeedback(prev => ({ ...prev, [i]: 'down' }));
                            setFlagReason('Hallucinated Reference');
                            setStudentNote(`Reported hallucination in response: "${msg.text.slice(0, 60)}..."`);
                            setFlagModalOpen(true);
                          }}
                          className={`p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ${
                            msgFeedback[i] === 'down' ? 'text-rose-600 font-bold' : 'hover:text-slate-700'
                          }`}
                          title="Report Hallucination"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>

                        {/* One-click Copy Code / Text */}
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(msg.text);
                            setCopiedMsgIdx(i);
                            setTimeout(() => setCopiedMsgIdx(null), 2000);
                          }}
                          className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                          title="Copy text / code block"
                        >
                          {copiedMsgIdx === i ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              <span className="text-[9px] text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>

                        {/* Ask Teacher / Escalate Doubt */}
                        <button
                          onClick={() => {
                            setFlagReason('Citation Verification Needed');
                            setStudentNote(`Student doubt regarding: "${msg.text.slice(0, 60)}..."`);
                            setFlagModalOpen(true);
                          }}
                          className="px-2 py-0.5 rounded-md hover:bg-amber-50 hover:text-amber-700 text-slate-500 font-semibold text-[10px] flex items-center gap-1 transition-colors cursor-pointer ml-0.5"
                          title="Ask Faculty / Escalate doubt"
                        >
                          <Flag className="w-2.5 h-2.5 text-amber-500" />
                          <span>Ask Teacher</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-stone-100 max-w-[120px] text-charcoal-muted">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}

                {/* Auto-scroll target */}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Bottom Input Field */}
            {!isExamMode && (
              <div className="p-3 border-t border-borderLight bg-white">
                {/* Quick Topic Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1">
                  <button
                    onClick={() => handleAskAI('Explain 3NF vs BCNF proofs')}
                    className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-semibold text-charcoal whitespace-nowrap cursor-pointer"
                  >
                    💡 3NF vs BCNF
                  </button>
                  <button
                    onClick={() => handleAskAI('How does B+ Tree Fanout work?')}
                    className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-semibold text-charcoal whitespace-nowrap cursor-pointer"
                  >
                    🌳 B+ Trees
                  </button>
                  <button
                    onClick={() => handleAskAI('Explain ACID 2PL concurrency')}
                    className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-semibold text-charcoal whitespace-nowrap cursor-pointer"
                  >
                    🔒 ACID & 2PL
                  </button>
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask a syllabus question..."
                    className="flex-1 py-2.5 px-3.5 bg-stone-50 text-charcoal rounded-xl text-xs border border-borderLight focus:outline-none focus:ring-2 focus:ring-[#ED7D31]"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-2.5 rounded-xl bg-[#ED7D31] text-white disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flag / Responsible AI Modal */}
      {flagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-borderLight shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Flag className="w-6 h-6" />
            </div>

            {flaggedSuccess ? (
              <div className="space-y-2 py-3">
                <CheckCircle2 className="w-10 h-10 text-successSoft mx-auto" />
                <h3 className="font-sans font-bold text-base text-charcoal">Report Submitted</h3>
                <p className="text-xs text-charcoal-muted">
                  Your citation flag has been cataloged for academic faculty review.
                </p>
                <button
                  onClick={() => {
                    setFlaggedSuccess(false);
                    setFlagModalOpen(false);
                  }}
                  className="gold-button w-full py-2.5 rounded-xl text-xs font-bold mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-sans font-extrabold text-lg text-charcoal">
                  Escalate Doubt & Report to Faculty
                </h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Send this doubt or AI response flag directly to your course instructor's review queue.
                </p>

                <div className="space-y-2 text-left">
                  <label className="block text-[11px] font-bold text-slate-700">Reason Category:</label>
                  <select
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-borderLight text-xs bg-stone-50 text-charcoal font-medium"
                  >
                    <option>Citation Verification Needed</option>
                    <option>Hallucinated Reference / Inaccurate Output</option>
                    <option>Ambiguous Mathematical Proof</option>
                    <option>Out of Syllabus Content</option>
                    <option>Concept Clarification Doubt</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold text-slate-700">Student Doubt Note:</label>
                  <textarea
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
                    placeholder="Write details for your faculty mentor..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-borderLight text-xs bg-stone-50 text-charcoal font-normal placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ED7D31]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setStudentNote('');
                      setFlagModalOpen(false);
                    }}
                    className="w-1/2 py-2.5 rounded-xl border border-borderLight text-xs font-semibold text-charcoal hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setFlaggedSuccess(true);
                      setStudentNote('');
                    }}
                    className="gold-button w-1/2 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Escalate to Faculty
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Locked Semester Access Modal */}
      {lockedSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border shadow-2xl space-y-4 text-left ${
              lockedSemesterModal.isAcademicLock ? 'border-amber-200' : 'border-rose-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-md flex-shrink-0 ${
                  lockedSemesterModal.isAcademicLock 
                    ? 'bg-amber-500 shadow-amber-500/30' 
                    : 'bg-rose-500 shadow-rose-500/30'
                }`}>
                  {lockedSemesterModal.isAcademicLock ? (
                    <Lock className="w-6 h-6" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  )}
                </div>
                <div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider ${
                    lockedSemesterModal.isAcademicLock
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {lockedSemesterModal.isAcademicLock ? 'Academic Cohort Restriction' : 'Honor Code Lockdown'}
                  </span>
                  <h3 className="font-sans font-extrabold text-lg text-slate-900 mt-0.5">
                    {lockedSemesterModal.name} is Locked
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setLockedSemesterModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {lockedSemesterModal.isAcademicLock ? (
              <>
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-1.5 text-xs">
                  <p className="text-amber-950 font-bold leading-relaxed">
                    {lockedSemesterModal.name} ({lockedSemesterModal.code}) is not yet available for enrollment.
                  </p>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    {lockedSemesterModal.reason || 'This advanced 4th-year semester curriculum is currently locked for your current cohort.'}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Eligible Batch:</span>
                    <strong className="text-slate-900 font-bold">4th Year (B.Tech 2027–2028)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Curriculum Status:</span>
                    <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md text-[11px]">Upcoming Academic Year</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Active Terms Accessible:</span>
                    <span className="text-emerald-700 font-bold">Semesters 1 to 6</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setLockedSemesterModal(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Got It, Return to Overview
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/90 space-y-1.5 text-xs">
                  <p className="text-slate-800 font-bold leading-relaxed">
                    You cannot open {lockedSemesterModal.name} ({lockedSemesterModal.code}) while the examination lockdown is active.
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    To maintain institutional test integrity, all semester course materials, subject modules, and study tools are temporarily frozen.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Exam in Progress:</span>
                    <strong className="text-slate-900 font-bold">{activeExamLock?.course || 'CS204 - DBMS - SQL'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Scheduled Window:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {activeExamLock?.startTime ? formatTime12Hr(activeExamLock.startTime) : ''} – {activeExamLock?.endTime ? formatTime12Hr(activeExamLock.endTime) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Security Buffer:</span>
                    <span className="text-rose-700 font-semibold">±30m Pre & Post Buffer Active</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Portal Releases In:</span>
                    <span className="font-mono font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md text-xs">
                      {activeExamTiming?.timeRemainingStr || 'Locked'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setLockedSemesterModal(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Understood, Return to Overview
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Subject Practice Quiz & Cloud Assessment Modal */}
      <SubjectQuizModal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        subject={quizSubject}
        studentUser={user}
        onSubmissionSaved={(res) => {
          if (res?.data) {
            setStudentQuizSubmissions(prev => [
              { ...res.data, id: res.id, isCloud: res.isCloud, submittedAtStr: 'Just now' },
              ...prev
            ]);
          }
        }}
      />

      {/* Proctored University Examination Modal & Report Card */}
      <ExaminationModal
        isOpen={examModalOpen}
        onClose={() => setExamModalOpen(false)}
        exam={selectedExam}
        studentUser={user}
        onAttemptCompleted={(res) => {
          if (res?.data) {
            setStudentExamAttempts(prev => [
              { ...res.data, id: res.id, isCloud: res.isCloud, submittedAtFormatted: 'Just now' },
              ...prev
            ]);
          }
        }}
      />

    </div>
  );
}
