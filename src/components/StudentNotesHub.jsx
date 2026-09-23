import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  BookCheck, 
  Sparkles, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight,
  Download, 
  Mail, 
  Inbox, 
  Copy, 
  Check, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Lightbulb, 
  HelpCircle, 
  Code2, 
  GraduationCap, 
  Layers, 
  Bot, 
  CheckSquare, 
  Square,
  Play, 
  Pause, 
  ExternalLink,
  RotateCcw,
  Star,
  Award,
  Filter
} from 'lucide-react';
import { markNoteAsReadByStudent } from '../services/notesBroadcastService';

// Real-world analogies repository to make studying intuitive and enjoyable
const CONCEPT_ANALOGIES_MAP = {
  'ACID': {
    analogy: 'Think of an ATM Cash Withdrawal: If cash doesn’t come out, the bank rolls back and doesn’t deduct money (Atomicity). The total bank balance is preserved (Consistency). Two people using ATMs on the same joint account at 12:00:00 don’t collide (Isolation). Once receipt prints, a power outage cannot erase your transaction record (Durability).',
    simplified: 'Transactions must execute completely or not at all, keep data valid, run without crosstalk, and survive crashes.'
  },
  'Serializability': {
    analogy: 'Imagine a Single-Lane Narrow Bridge: Multiple cars (transactions) can cross from opposite ends concurrently, but the final outcome must be as if they crossed one strictly after the other without collisions.',
    simplified: 'Concurrent schedule that produces the identical result of running transactions one by one.'
  },
  'Two-Phase Locking': {
    analogy: 'Shopping Cart Checkout: You first put all items in your cart and lock down stock (Growing Phase). Once you pay at the register, you can only put bags in your car and cannot grab new groceries (Shrinking Phase).',
    simplified: 'Transactions first acquire all necessary locks, and once the first lock is released, no new locks may ever be requested.'
  },
  'TCP/IP': {
    analogy: 'Registered Post with Acknowledgment: TCP splits a book into numbered postcards. If postcard #3 gets lost in the rain, the receiver asks for #3 again and puts them in order before reading.',
    simplified: 'Guaranteed, sequenced, error-checked packet delivery between networked computers.'
  },
  'B+ Tree': {
    analogy: 'Library Index Cards: The cards on top guide you to the correct aisle and shelf (index nodes), but every actual book is neatly lined up on the bottom shelf with ribbon links to the next book (leaf nodes).',
    simplified: 'Self-balancing tree optimized for disk storage with fast range queries via linked leaf nodes.'
  },
  'OOP': {
    analogy: 'Architect Blueprint vs Houses: A blueprint is a Class. The 10 actual physical brick houses built in a colony are Objects. Inheritance is using the villa blueprint to make a luxury villa with extra rooms.',
    simplified: 'Structuring code around objects containing data fields and operational methods.'
  }
};

export default function StudentNotesHub({
  user,
  notes = [],
  selectedNoteId,
  onSelectNote,
  onBackToCourses,
  onOpenAiTutor,
  onDownloadText
}) {
  // Currently active note object
  const activeNote = useMemo(() => {
    if (!notes || notes.length === 0) return null;
    if (selectedNoteId) {
      const found = notes.find(n => n.id === selectedNoteId);
      if (found) return found;
    }
    return notes[0];
  }, [notes, selectedNoteId]);

  // Tab: 'reader' (Pedagogical Study Guide) | 'webmail' (Official Exchange Email)
  const [activeTab, setActiveTab] = useState('reader');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');

  // Reader comfort controls
  const [fontSize, setFontSize] = useState('base'); // 'sm' | 'base' | 'lg'
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [copiedSection, setCopiedSection] = useState(null);
  const [bookmarkedNotes, setBookmarkedNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_bookmarked_notes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Active Recall: Track which Q&A flashcards are revealed
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [masteredChecklist, setMasteredChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_notes_checklist_progress');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Mobile responsive Master-Detail view toggle ('list' vs 'reader')
  const [mobileShowReader, setMobileShowReader] = useState(false);

  // Interactive Real-World Analogy toggle per concept index
  const [showAnalogyFor, setShowAnalogyFor] = useState({});

  // Audio summary simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Audio timer simulation
  useEffect(() => {
    let interval;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1.5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  // Mark active note as read when viewed
  useEffect(() => {
    if (activeNote?.id && user?.email) {
      markNoteAsReadByStudent(activeNote.id, user.email);
    }
  }, [activeNote?.id, user?.email]);

  // Unique subjects for filter chips
  const subjectList = useMemo(() => {
    const list = Array.from(new Set(notes.map(n => n.subjectCode).filter(Boolean)));
    return ['ALL', ...list];
  }, [notes]);

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesFilter = selectedSubjectFilter === 'ALL' || note.subjectCode === selectedSubjectFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        note.title?.toLowerCase().includes(q) ||
        note.subjectName?.toLowerCase().includes(q) ||
        note.subjectCode?.toLowerCase().includes(q) ||
        note.teacherName?.toLowerCase().includes(q) ||
        note.keyConcepts?.some(c => c.title?.toLowerCase().includes(q) || c.summary?.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [notes, selectedSubjectFilter, searchQuery]);

  // Copy helper
  const handleCopyText = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Toggle bookmark
  const toggleBookmark = (noteId) => {
    setBookmarkedNotes(prev => {
      const updated = { ...prev, [noteId]: !prev[noteId] };
      try {
        localStorage.setItem('aisa_bookmarked_notes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Toggle checklist item
  const toggleChecklistItem = (noteId, itemIndex) => {
    setMasteredChecklist(prev => {
      const key = `${noteId}_item_${itemIndex}`;
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('aisa_notes_checklist_progress', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Compute checklist mastery count
  const checklistMastery = useMemo(() => {
    if (!activeNote?.quickCheatSheet) return { completed: 0, total: 0, percent: 0 };
    const total = activeNote.quickCheatSheet.length;
    let completed = 0;
    activeNote.quickCheatSheet.forEach((_, idx) => {
      if (masteredChecklist[`${activeNote.id}_item_${idx}`]) completed++;
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [activeNote, masteredChecklist]);

  // Helper to find smart analogy
  const getAnalogyForConcept = (title) => {
    if (!title) return null;
    const upper = title.toUpperCase();
    for (const key of Object.keys(CONCEPT_ANALOGIES_MAP)) {
      if (upper.includes(key.toUpperCase())) {
        return CONCEPT_ANALOGIES_MAP[key];
      }
    }
    return {
      analogy: `Real-world example: Consider how ${title} works in production enterprise software. It acts as an invariant safeguard to guarantee correctness under concurrent multi-user load.`,
      simplified: `Essential foundation of this curriculum unit providing guaranteed behavior under concurrent system operations.`
    };
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col font-sans">
      
      {/* ================= TOP STUDY NAVIGATION & TOOLBAR ================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        
        {/* Left: Back button & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCourses}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer group"
            title="Return to Semesters Overview"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Curriculum</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="text-slate-400 hidden md:inline">Courses</span>
            <span className="text-slate-300 hidden md:inline">/</span>
            <span className="bg-amber-50 text-[#ED7D31] px-2.5 py-1 rounded-lg font-mono font-black border border-amber-200/80 flex items-center gap-1.5">
              <BookCheck className="w-3.5 h-3.5" />
              <span>FACULTY AI STUDY REPOSITORY</span>
            </span>
            {activeNote && (
              <>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <span className="font-bold text-slate-800 hidden sm:inline truncate max-w-[220px]">
                  {activeNote.subjectCode}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Study Reader Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Summary Bar */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-6 h-6 rounded-lg bg-[#ED7D31] text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xs"
              title={isPlayingAudio ? 'Pause Audio Notes' : 'Listen to AI Audio Summary'}
            >
              {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-700 leading-none">
                {isPlayingAudio ? 'Playing AI Lecture Summary' : 'Listen to Notes'}
              </span>
              <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-[#ED7D31] transition-all duration-300 rounded-full" 
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {isPlayingAudio ? `${Math.round(audioProgress)}%` : '3:45'}
            </span>
          </div>

          {/* Tab Switcher: Interactive Guide vs Exchange Mail */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('reader')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'reader'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#ED7D31]" />
              <span className="hidden sm:inline">Study Guide</span>
            </button>
            <button
              onClick={() => setActiveTab('webmail')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'webmail'
                  ? 'bg-white text-[#0078D4] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Inbox className="w-3.5 h-3.5 text-[#0078D4]" />
              <span className="hidden sm:inline">Outlook Notice</span>
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-mono font-bold text-slate-600">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 rounded-lg cursor-pointer ${fontSize === 'sm' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              title="Small text"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-1 rounded-lg cursor-pointer ${fontSize === 'base' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              title="Default text"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded-lg cursor-pointer ${fontSize === 'lg' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              title="Large text"
            >
              A+
            </button>
          </div>

          {/* Focus Mode Toggle */}
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isFocusMode 
                ? 'bg-amber-100 border-amber-300 text-amber-900' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode (Hide sidebar)'}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Bookmark Button */}
          {activeNote && (
            <button
              onClick={() => toggleBookmark(activeNote.id)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                bookmarkedNotes[activeNote.id]
                  ? 'bg-amber-50 border-amber-300 text-[#ED7D31]'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title="Bookmark this Study Guide"
            >
              {bookmarkedNotes[activeNote.id] ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}

          {/* Download Text Button */}
          {activeNote && (
            <button
              onClick={() => onDownloadText?.(activeNote)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#ED7D31] hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download (.txt)</span>
            </button>
          )}
        </div>
      </header>

      {/* ================= MAIN CONTENT LAYOUT ================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COURSE & NOTES DIRECTORY (Collapsible in Focus Mode) */}
        {!isFocusMode && (
          <aside className={`${mobileShowReader ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex-col flex-shrink-0 h-[calc(100vh-61px)] overflow-y-auto`}>
            
            {/* Search & Filter Header */}
            <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#ED7D31]" />
                  <span>Course Material Catalog</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {filteredNotes.length} Guides Available
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topics, formulas, or exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#ED7D31]/30 focus:border-[#ED7D31]"
                />
              </div>

              {/* Subject Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {subjectList.map(subj => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubjectFilter(subj)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedSubjectFilter === subj
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {subj === 'ALL' ? 'All Subjects' : subj}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes List */}
            <div className="p-3 space-y-2.5 flex-1">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No study notes match search</p>
                  <p className="text-[11px] text-slate-400">Try clearing filters or searching another keyword</p>
                </div>
              ) : (
                filteredNotes.map(note => {
                  const isSelected = activeNote?.id === note.id;
                  const isBookmarked = bookmarkedNotes[note.id];
                  return (
                    <motion.div
                      key={note.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        onSelectNote?.(note);
                        setMobileShowReader(true);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-1 ring-amber-400/40'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md font-mono font-black text-[10px] ${
                            isSelected ? 'bg-[#ED7D31] text-white' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {note.subjectCode}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">{note.semester}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {isBookmarked && (
                            <BookmarkCheck className="w-3.5 h-3.5 text-[#ED7D31] fill-current" />
                          )}
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Faculty Verified
                          </span>
                        </div>
                      </div>

                      {/* Note Title */}
                      <h4 className={`text-xs font-black leading-snug line-clamp-2 ${
                        isSelected ? 'text-slate-900' : 'text-slate-800'
                      }`}>
                        {note.title}
                      </h4>

                      {/* Metadata row */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span className="truncate max-w-[150px]">
                          By <strong>{note.teacherName}</strong>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 flex-shrink-0">
                          {note.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Bottom Socratic Help Prompt */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 border-t border-amber-200/80 m-3 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ED7D31]" />
                <span className="text-xs font-black text-slate-900">Need 1-on-1 Concept Tutoring?</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                AISA Socratic AI is grounded in this exact curriculum. Ask derivations, numericals, or quiz questions.
              </p>
              <button
                onClick={() => onOpenAiTutor?.(`Explain the core concept of ${activeNote?.subjectCode || 'this unit'}`)}
                className="w-full py-2 rounded-xl bg-[#ED7D31] hover:bg-orange-600 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Socratic AI Tutor</span>
              </button>
            </div>
          </aside>
        )}

        {/* CENTER MAIN READING CANVAS */}
        <main className={`${mobileShowReader ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#F8F9FA] h-[calc(100vh-61px)] overflow-y-auto px-3 sm:px-8 py-4 sm:py-6`}>
          <div className={`mx-auto transition-all ${isFocusMode ? 'max-w-4xl' : 'max-w-3xl'} w-full space-y-6 sm:space-y-8`}>
            
            {/* Mobile Back Button to Notes Directory */}
            <div className="md:hidden pb-1">
              <button
                type="button"
                onClick={() => setMobileShowReader(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#ED7D31]" />
                <span>← Back to Course Catalog</span>
              </button>
            </div>
            
            {/* If no note selected */}
            {!activeNote ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-black text-slate-800">Select a study guide to start reading</h3>
                <p className="text-xs text-slate-500">Pick any course module from the directory on the left</p>
              </div>
            ) : activeTab === 'webmail' ? (
              
              /* ================= TAB: OFFICIAL UNIVERSITY WEBMAIL DISPATCH ================= */
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-lg font-sans">
                  {/* Outlook / Exchange Top Ribbon */}
                  <div className="bg-[#0078D4] text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Inbox className="w-5 h-5" />
                      <div>
                        <span className="font-black text-xs sm:text-sm tracking-wider block">ITM UNIVERSITY WEBMAIL (EXCHANGE)</span>
                        <span className="text-[10px] font-mono opacity-80">Official Academic Dispatch • DKIM Signed</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-white/20 px-2.5 py-1 rounded-lg">Inbox • High Priority</span>
                  </div>

                  {/* Email Headers Card */}
                  <div className="p-6 border-b border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                        {activeNote.emailSubject || `Official AI Notes: ${activeNote.title}`}
                      </h2>
                      <span className="text-xs font-mono text-slate-500 flex-shrink-0">
                        {activeNote.date} ({activeNote.timestamp})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-700 pt-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 w-16">From:</strong>
                        <span className="font-bold text-slate-900">{activeNote.teacherName}</span>
                        <span className="text-slate-400 text-[11px]">&lt;{activeNote.teacherEmail || 'faculty.notice@isu.ac.in'}&gt;</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 w-16">To:</strong>
                        <span className="font-bold text-indigo-700">{user?.name || 'Aditi Sharma'}</span>
                        <span className="text-slate-400 text-[11px]">&lt;{user?.email || 'aditi.sharma@univ.edu'}&gt;</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 w-16">Cohort:</strong>
                        <span>{activeNote.semester} • B.Tech CSE ({activeNote.targetCohortCount || 42} Students)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 w-16">Course:</strong>
                        <span className="font-bold text-slate-800">{activeNote.subjectName} ({activeNote.subjectCode})</span>
                      </div>
                    </div>
                  </div>

                  {/* Email Body Content */}
                  <div className="p-8 space-y-6 text-slate-800 leading-relaxed text-sm">
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-[#ED7D31] text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs">
                        ISU
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">Department of Computer Science & Engineering</p>
                        <p className="text-xs text-slate-500">Official Curriculum Material & AI-Augmented Revision Guide</p>
                      </div>
                    </div>

                    <p>Dear <strong>{user?.name || 'Student'}</strong>,</p>

                    <p>
                      I have synthesized and authorized the official Socratic AI study guide for our ongoing module: <strong>{activeNote.title}</strong>. This guide condenses lecture slides, derivations, and midterm-ready questions specifically for your cohort.
                    </p>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">📌 Included in this Study Release:</p>
                      <ul className="space-y-1.5 text-xs text-slate-700 pl-5 list-disc">
                        <li><strong>{activeNote.keyConcepts?.length || 0} Core Curriculum Concepts</strong> with theoretical definitions and derivations</li>
                        <li><strong>Crucial Invariant Formulas</strong> and exam evaluation rules</li>
                        <li><strong>{activeNote.highYieldExamQA?.length || 0} High-Yield Midterm & Viva Questions</strong> with scoring rubrics</li>
                        <li><strong>1-Page Exam Cheat Sheet</strong> for last-minute revision</li>
                      </ul>
                    </div>

                    <p className="text-xs text-slate-600">
                      All explanations and answers follow the academic grading standards for ITM University semester assessments. Please study the guide thoroughly before our next lab viva.
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('reader')}
                        className="px-6 py-3 bg-[#ED7D31] hover:bg-orange-600 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 text-xs flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Open & Study Guide in Interactive Reader</span>
                      </button>
                    </div>

                    <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 font-mono space-y-1">
                      <p>Warm regards,</p>
                      <p className="font-bold text-slate-900 text-sm">{activeNote.teacherName}</p>
                      <p>{activeNote.teacherDesignation}</p>
                      <p>Department of Computer Science & Engineering • ITM University</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (

              /* ================= TAB: RICH PEDAGOGICAL STUDY GUIDE ================= */
              <div className="space-y-8">
                
                {/* 1. HERO HEADER CARD */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                  {/* Subject and Verification Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-xs px-3 py-1 rounded-xl bg-amber-50 text-[#ED7D31] border border-amber-200/80">
                      {activeNote.subjectCode}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                      {activeNote.semester}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Faculty AI Grounding</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400 ml-auto hidden sm:inline">
                      {activeNote.timestamp}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug font-sans">
                    {activeNote.title}
                  </h1>

                  {/* Author Attribution */}
                  <div className="flex items-center gap-3 pt-2 pb-1 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#ED7D31] text-white flex items-center justify-center font-black text-sm shadow-xs flex-shrink-0">
                      {activeNote.teacherName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">
                        {activeNote.teacherName}
                        <span className="font-normal text-slate-500 text-[11px] ml-1.5">
                          ({activeNote.teacherDesignation})
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        ITM University CSE • Source PDF: <span className="text-slate-700 font-semibold">{activeNote.pdfSource}</span>
                      </p>
                    </div>
                  </div>

                  {/* Module Scope & Learning Outcomes */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/70 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#ED7D31]" />
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                        Curriculum Scope & Midterm Objectives
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {activeNote.moduleOverview}
                    </p>
                  </div>

                  {/* Quick Jump Anchor Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none text-xs">
                    <a
                      href="#section-concepts"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold whitespace-nowrap transition-colors"
                    >
                      1. Core Concepts ({activeNote.keyConcepts?.length || 0})
                    </a>
                    <a
                      href="#section-formulas"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold whitespace-nowrap transition-colors"
                    >
                      2. Invariants & Formulas
                    </a>
                    <a
                      href="#section-exams"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold whitespace-nowrap transition-colors"
                    >
                      3. Exam Q&As ({activeNote.highYieldExamQA?.length || 0})
                    </a>
                    <a
                      href="#section-cheatsheet"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold whitespace-nowrap transition-colors"
                    >
                      4. 1-Page Checklist
                    </a>
                  </div>
                </div>

                {/* 2. SECTION 1: CORE THEORETICAL CONCEPTS */}
                <div id="section-concepts" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#ED7D31] text-white flex items-center justify-center text-xs font-black">1</span>
                      <span>Core Concepts & Theoretical Grounding</span>
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">
                      {activeNote.keyConcepts?.length || 0} Core Topics
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activeNote.keyConcepts?.map((concept, idx) => {
                      const conceptTitle = concept.heading || concept.title || `Concept ${idx + 1}`;
                      const analogyData = getAnalogyForConcept(conceptTitle);
                      const isAnalogyOpen = showAnalogyFor[idx];
                      const sectionKey = `concept_${idx}`;

                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-slate-300 shadow-xs space-y-3 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                              {conceptTitle}
                            </h4>
                            <button
                              onClick={() => handleCopyText(`${conceptTitle}\n${concept.summary}`, sectionKey)}
                              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Copy Concept Summary"
                            >
                              {copiedSection === sectionKey ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Concept Explanation Text */}
                          <p className={`text-slate-700 leading-relaxed ${
                            fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                          }`}>
                            {concept.summary}
                          </p>

                          {/* Interactive Socratic Learning Helper Bar */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowAnalogyFor(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#ED7D31] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-200/80"
                              >
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                <span>{isAnalogyOpen ? 'Hide Analogy' : '💡 Explain with Real-World Analogy'}</span>
                              </button>
                            </div>

                            <button
                              onClick={() => onOpenAiTutor?.(`Explain "${conceptTitle}" from ${activeNote.subjectCode} with real-world examples and midterm derivations`)}
                              className="text-[11px] font-bold text-slate-600 hover:text-[#ED7D31] flex items-center gap-1.5 cursor-pointer transition-colors px-2.5 py-1 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-200"
                            >
                              <Bot className="w-3.5 h-3.5 text-[#ED7D31]" />
                              <span>Ask AI about this topic →</span>
                            </button>
                          </div>

                          {/* Dynamic Analogy Reveal */}
                          <AnimatePresence>
                            {isAnalogyOpen && analogyData && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-amber-100/40 border border-amber-300 text-xs text-amber-950 space-y-2 mt-2">
                                  <div className="flex items-center gap-2 font-bold text-amber-900">
                                    <Sparkles className="w-4 h-4 text-[#ED7D31]" />
                                    <span>Intuitive Understanding (Mental Model)</span>
                                  </div>
                                  <p className="leading-relaxed">
                                    {analogyData.analogy}
                                  </p>
                                  <div className="pt-1 text-[11px] text-amber-900 font-semibold border-t border-amber-200">
                                    <strong>⚡ Quick Takeaway:</strong> {analogyData.simplified}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. SECTION 2: CRUCIAL FORMULAS, INVARIANTS & EQUATIONS */}
                <div id="section-formulas" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#ED7D31] text-white flex items-center justify-center text-xs font-black">2</span>
                      <span>Crucial Invariant Formulas & Exam Rules</span>
                    </h3>
                    <button
                      onClick={() => handleCopyText(activeNote.crucialFormulas?.join('\n') || '', 'all_formulas')}
                      className="text-xs font-bold text-[#ED7D31] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSection === 'all_formulas' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Formulas</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-[#0F172A] rounded-2xl p-5 sm:p-6 text-emerald-400 font-mono text-xs sm:text-sm border border-slate-800 shadow-lg space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                      <span className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-[#ED7D31]" />
                        <span>University Syllabus Invariants</span>
                      </span>
                      <span className="text-emerald-500 font-mono">Syntax Verified</span>
                    </div>

                    {activeNote.crucialFormulas?.map((formula, idx) => (
                      <div key={idx} className="flex items-start gap-3 py-1">
                        <span className="text-amber-500 select-none">&gt;</span>
                        <span className="leading-relaxed whitespace-pre-wrap">{formula}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. SECTION 3: HIGH-YIELD MIDTERM & VIVA EXAM Q&AS (ACTIVE RECALL) */}
                <div id="section-exams" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#ED7D31] text-white flex items-center justify-center text-xs font-black">3</span>
                        <span>High-Yield Midterm & Viva Exam Q&As</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Active Recall Mode: Try answering mentally before revealing the model answer
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeNote.highYieldExamQA?.map((qa, idx) => {
                      const isRevealed = revealedAnswers[idx];
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                        >
                          {/* Question Bar */}
                          <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold font-mono text-[10px]">
                                {qa.marks || '5 Marks Question'}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400">
                                Exam Probability: High
                              </span>
                            </div>

                            <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                              Q{idx + 1}. {qa.question}
                            </h4>

                            {/* Active Recall & Ask AI Buttons */}
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                  isRevealed
                                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                    : 'bg-[#ED7D31] hover:bg-orange-600 text-white shadow-sm'
                                }`}
                              >
                                <span>{isRevealed ? 'Hide Model Answer' : '👁️ Test Yourself (Click to Reveal Model Answer)'}</span>
                              </button>

                              <button
                                onClick={() => onOpenAiTutor?.(`Explain exam question Q${idx + 1} from ${activeNote.subjectCode}: "${qa.question}" and provide another similar practice problem with solution`)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Bot className="w-3.5 h-3.5 text-[#ED7D31]" />
                                <span>Ask AI for Solution & Similar Problem →</span>
                              </button>
                            </div>
                          </div>

                          {/* Model Answer (Revealed) */}
                          <AnimatePresence>
                            {isRevealed && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-5 sm:p-6 bg-white space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                      Professor's Model Answer:
                                    </span>
                                    <button
                                      onClick={() => handleCopyText(qa.answer, `qa_${idx}`)}
                                      className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                                    >
                                      {copiedSection === `qa_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                      <span>Copy</span>
                                    </button>
                                  </div>

                                  <p className={`text-slate-800 leading-relaxed ${
                                    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                                  }`}>
                                    {qa.answer}
                                  </p>

                                  {/* Professor's Exam Tip */}
                                  {qa.examTip && (
                                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <strong className="block text-emerald-950 font-bold mb-0.5">Faculty Grading Tip:</strong>
                                        <span>{qa.examTip}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. SECTION 4: 1-PAGE REVISION SHEET & INVARIANT CHECKLIST */}
                <div id="section-cheatsheet" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#ED7D31] text-white flex items-center justify-center text-xs font-black">4</span>
                        <span>1-Page Exam Cheat Sheet & Mastery Checklist</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Check off each invariant as you review to measure your exam readiness
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="font-bold text-[#ED7D31]">
                        {checklistMastery.completed}/{checklistMastery.total} Mastered
                      </span>
                      <span className="text-slate-400 ml-1.5">({checklistMastery.percent}%)</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${checklistMastery.percent}%` }}
                    />
                  </div>

                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-2.5">
                    {activeNote.quickCheatSheet?.map((item, idx) => {
                      const isChecked = masteredChecklist[`${activeNote.id}_item_${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleChecklistItem(activeNote.id, idx)}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                              : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'line-through opacity-80' : ''}`}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. BOTTOM ACTION BAR */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Finished reviewing this guide?</h4>
                    <p className="text-xs text-slate-500">Test your understanding with Socratic AI or download for offline exam prep</p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onOpenAiTutor?.(`Quiz me on ${activeNote.title}`)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#ED7D31]" />
                      <span>Take 3-Question Viva Quiz</span>
                    </button>

                    <button
                      onClick={() => onDownloadText?.(activeNote)}
                      className="px-5 py-2.5 rounded-xl bg-[#ED7D31] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Notes</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>

    </div>
  );
}
