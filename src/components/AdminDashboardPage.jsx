import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  BookOpen, 
  Sparkles, 
  Flag, 
  Lock, 
  Unlock, 
  UserCheck, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  FileText, 
  TrendingUp, 
  Clock, 
  Plus, 
  X,
  Building2,
  Check,
  ChevronRight,
  Sparkle,
  SlidersHorizontal,
  Layers,
  GraduationCap,
  Users,
  Award,
  BarChart3,
  Filter,
  Mail,
  ExternalLink,
  BrainCircuit,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  ChevronLeft,
  Eye,
  Activity,
  FileCheck,
  Send,
  Terminal,
  CheckCheck,
  FileSearch,
  MessageSquare,
  Calendar,
  Timer,
  Trash2,
  Zap,
  UploadCloud,
  FileUp,
  File,
  Share2,
  Inbox,
  Copy,
  Database,
  ArrowLeft
} from 'lucide-react';
import { SEMESTERS_DATA } from '../data/curriculumData';
import { STUDENTS_DATA, FACULTY_DATA } from '../data/studentsData';
import { AI_AUDIT_DATA } from '../data/aiAuditData';
import { syncCurriculumToFirestore, fetchAllSubmissions } from '../services/assessmentService';
import { fetchAllExamAttempts } from '../services/examService';
import { 
  generateAIStudyNotes, 
  publishNewBroadcastNote, 
  getSavedBroadcastNotes,
  getDemoPDFsForSubject,
  SUBJECT_DEMO_PDFS_MAP
} from '../services/notesBroadcastService';
import { 
  getTodayDateString, 
  getTimeString, 
  formatTime12Hr, 
  evaluateLockTiming,
  getActiveExamLockSummary,
  parseDateTime
} from '../services/examLockService';

// Helper to construct pre-written, detailed academic advisory & performance email for students
export const buildStudentPerformanceEmail = (student, adminUser) => {
  if (!student) return { subject: '', body: '', mailtoUrl: '', gmailUrl: '' };

  const subject = `[Academic Advisory] Progress & Performance Review - ${student.name} (${student.semester || 'Semester 3'}, CSE)`;

  const greeting = `Dear ${student.name},`;

  const intro = `I hope this email finds you well.\n\nThis is an official academic performance review from the Department of Computer Science & Engineering regarding your current semester progress and continuous assessment benchmarks at Apex Institute of Science & Technology.`;

  const statusNote = student.performanceStatus === 'Needs Support'
    ? `⚠️ CURRENT ACADEMIC STATUS: NEEDS SUPPORT\nOur continuous evaluation metrics indicate that you currently require focused academic reinforcement to strengthen your test scores and overall course comprehension.`
    : student.performanceStatus === 'Top Performer'
    ? `🌟 CURRENT ACADEMIC STATUS: TOP PERFORMER\nCommendations on demonstrating stellar academic performance, high attendance, and exceptional engagement in your cohort!`
    : `✅ CURRENT ACADEMIC STATUS: ON TRACK\nYou are maintaining satisfactory academic progress across your coursework. Keep up the consistent effort.`;

  const metricsBlock = `📊 KEY ACADEMIC METRICS SUMMARY:\n--------------------------------------------------\n• Student Name: ${student.name}\n• Institutional Email: ${student.email}\n• Academic Program: ${student.department || 'Computer Science & Engineering'} · ${student.semester || 'Semester 3'} (${student.batchYear || '2024'} Batch)\n• Course Syllabus Progress: ${student.completionRate}%\n• Continuous Assessment Average: ${student.avgTestScore}%\n• Lecture & Practical Attendance: ${student.attendance}%\n• Socratic AI Prompts & Queries Engaged: ${student.aiQueriesCount}`;

  const scoresBlock = `📝 CONTINUOUS ASSESSMENT BREAKDOWN:\n--------------------------------------------------\n• Quiz 1 (SQL & DB Concepts): ${student.quiz1Score} / 20 (${((student.quiz1Score / 20) * 100).toFixed(0)}%)\n• Mid-Term Examination: ${student.midtermScore}%\n• Practical Lab Evaluation: ${student.labScore} / 50 (${((student.labScore / 50) * 100).toFixed(0)}%)`;

  const subjectsBlock = student.enrolledSubjects && student.enrolledSubjects.length > 0
    ? `\n📚 ENROLLED SEMESTER COURSES BREAKDOWN:\n--------------------------------------------------\n${student.enrolledSubjects.map(sub => `• [${sub.code}] ${sub.name}: ${sub.completion}% Completed | Assessment Score: ${sub.score}`).join('\n')}`
    : '';

  const recommendations = student.performanceStatus === 'Needs Support'
    ? `📌 RECOMMENDED ACTION STEPS:\n1. Review the faculty lecture notes and AI summary modules available on your student portal.\n2. Schedule a 1-on-1 mentoring session with faculty during office consultation hours this week.\n3. Complete the interactive practice recall quizzes to reinforce foundational concepts before the upcoming midterms.`
    : `📌 RECOMMENDED ACTION STEPS:\n1. Maintain your steady study cadence and active practical lab contributions.\n2. Continue utilizing the Socratic AI tutor for deep concept reinforcement.\n3. Assist peers during collaborative study circles.`;

  const closing = `\nIf you have any questions, need academic support, or would like to discuss your progress, please reply directly to this email or visit the faculty department room.\n\nWarm regards,\n${adminUser?.name || 'Academic Dean & Course Coordinator'}\n${adminUser?.email || 'admin@isu.ac.in'}\nDepartment of Computer Science & Engineering\nApex Institute of Science & Technology (ISU)`;

  const fullBody = `${greeting}\n\n${intro}\n\n${statusNote}\n\n${metricsBlock}\n\n${scoresBlock}${subjectsBlock}\n\n${recommendations}\n\n${closing}`;

  const mailtoUrl = `mailto:${student.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(student.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;

  return { subject, body: fullBody, mailtoUrl, gmailUrl };
};

export default function AdminDashboardPage({ 
  adminUser, 
  examLocks: propExamLocks, 
  currentTime = new Date(), 
  onToggleExamLock, 
  onAddExamLock, 
  onDeleteExamLock, 
  onEndAllLockouts,
  onInstantDemoLock,
  onLogout,
  onBack
}) {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'exam_locks' | 'audit_flags' | 'curriculum'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Student Directory Filter & Modal States
  const [studentSearch, setStudentSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [copiedEmailText, setCopiedEmailText] = useState(false);

  // Selected semester & subject for Admin Course Audit Explorer
  const [adminSemester, setAdminSemester] = useState(SEMESTERS_DATA[1]); // Sem 2 default
  const [adminSubject, setAdminSubject] = useState(SEMESTERS_DATA[1].subjects[3]); // DBMS default

  // Selected semester & subject for Dedicated Notes Upload & Broadcast Studio
  const [uploadSemester, setUploadSemester] = useState(SEMESTERS_DATA[1]); // Sem 2 default
  const [uploadSubject, setUploadSubject] = useState(SEMESTERS_DATA[1].subjects[3]); // DBMS default
  const [broadcastHistory, setBroadcastHistory] = useState(() => getSavedBroadcastNotes());

  // Fallback internal locks if not provided via props
  const [internalLocks, setInternalLocks] = useState([]);
  const examLocks = propExamLocks || internalLocks;

  // Responsible AI Audit & Incident Dossiers State
  const [auditFlags, setAuditFlags] = useState(AI_AUDIT_DATA);
  const [selectedAuditReport, setSelectedAuditReport] = useState(null);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState('All');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('All');
  const [auditStatusFilter, setAuditStatusFilter] = useState('All');
  const [auditNotificationToast, setAuditNotificationToast] = useState('');
  const [facultyAuditNote, setFacultyAuditNote] = useState('');

  // New Lock Schedule Modal State with precise Date & Time fields
  const [showAddLockModal, setShowAddLockModal] = useState(false);
  const [lockCourse, setLockCourse] = useState('DBMS - SQL (CS204)');
  const [lockSemester, setLockSemester] = useState('Semester 2');
  const [lockDate, setLockDate] = useState(() => getTodayDateString());
  const [lockStartTime, setLockStartTime] = useState('10:00');
  const [lockEndTime, setLockEndTime] = useState('13:00');

  const activeLockSummary = useMemo(() => {
    return getActiveExamLockSummary(examLocks, currentTime);
  }, [examLocks, currentTime]);

  // Firestore Cloud Quiz & Course Sync State
  const [allQuizSubmissions, setAllQuizSubmissions] = useState([]);
  const [allExamAttempts, setAllExamAttempts] = useState([]);
  const [syncingCourses, setSyncingCourses] = useState(false);
  const [syncCoursesResult, setSyncCoursesResult] = useState(null);

  // Load all quiz and exam submissions from Firestore on mount
  React.useEffect(() => {
    let isMounted = true;
    fetchAllSubmissions()
      .then(subs => {
        if (isMounted) setAllQuizSubmissions(subs);
      })
      .catch(err => console.warn('Failed to fetch all quiz submissions:', err));

    fetchAllExamAttempts()
      .then(attempts => {
        if (isMounted) setAllExamAttempts(attempts);
      })
      .catch(err => console.warn('Failed to fetch all exam attempts:', err));

    return () => { isMounted = false; };
  }, []);

  const handleSyncCoursesToFirestore = async () => {
    setSyncingCourses(true);
    try {
      const res = await syncCurriculumToFirestore();
      if (res.success) {
        setSyncCoursesResult(`✅ Successfully synced ${res.totalSynced} Courses & Modules to Firestore collection 'courses'!`);
      } else {
        setSyncCoursesResult('⚠️ Firestore sync completed with some errors.');
      }
    } catch (e) {
      setSyncCoursesResult('⚠️ Firestore sync failed: ' + e.message);
    } finally {
      setSyncingCourses(false);
      setTimeout(() => setSyncCoursesResult(null), 6000);
    }
  };

  // Sprint 4 (FR-ADMIN): User Management Sub-Tab ('students' | 'faculty')
  const [userDirectorySubTab, setUserDirectorySubTab] = useState('students');
  const [facultySearch, setFacultySearch] = useState('');

  // Sprint 4 (FR-ADMIN & Items 1 & 6): Syllabus & Notes Drag-and-Drop Upload State
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // null or 0..100
  const [uploadStatusText, setUploadStatusText] = useState('');
  
  // Subject-wise view filters for Studio
  const [docsSubjectFilter, setDocsSubjectFilter] = useState('current'); // 'current' | 'all'
  const [broadcastSubjectFilter, setBroadcastSubjectFilter] = useState('current'); // 'current' | 'all'

  const [uploadedSyllabusDocs, setUploadedSyllabusDocs] = useState([
    // CS204 DBMS - SQL
    {
      id: 'doc-cs204-1',
      name: 'CS204_DBMS_Full_Syllabus_Units_1-5.pdf',
      size: '4.2 MB',
      date: '2024-09-18',
      courseCode: 'CS204',
      status: 'Grounded & Indexed',
      units: 'Units 1–5 Comprehensive',
      chunksCount: 142
    },
    {
      id: 'doc-cs204-2',
      name: 'CS204_Unit_3_Relational_Algebra_Transactions.pdf',
      size: '2.8 MB',
      date: '2024-09-19',
      courseCode: 'CS204',
      status: 'Grounded & Indexed',
      units: 'Unit 3: Transactions & 2PL',
      chunksCount: 88
    },
    // CS202 Computer Networking
    {
      id: 'doc-cs202-1',
      name: 'CS202_Unit_2_OSI_TCP_IP_Protocol_Architecture.pdf',
      size: '2.7 MB',
      date: '2024-09-19',
      courseCode: 'CS202',
      status: 'Grounded & Indexed',
      units: 'Unit 2: Transport & Network Layers',
      chunksCount: 94
    },
    {
      id: 'doc-cs202-2',
      name: 'CS202_Unit_4_Routing_Algorithms_BGP_OSPF_DNS.pdf',
      size: '3.5 MB',
      date: '2024-09-20',
      courseCode: 'CS202',
      status: 'Grounded & Indexed',
      units: 'Unit 4: Routing & Application Protocols',
      chunksCount: 112
    },
    // CS201 Java Programming
    {
      id: 'doc-cs201-1',
      name: 'CS201_Unit_2_OOP_Polymorphism_Interfaces_AbstractClasses.pdf',
      size: '2.4 MB',
      date: '2024-09-18',
      courseCode: 'CS201',
      status: 'Grounded & Indexed',
      units: 'Unit 2: Advanced OOP & Interfaces',
      chunksCount: 76
    },
    // CS203 DSA - I
    {
      id: 'doc-cs203-1',
      name: 'CS203_Unit_3_Binary_Search_Trees_AVL_Rotations.pdf',
      size: '3.8 MB',
      date: '2024-09-19',
      courseCode: 'CS203',
      status: 'Grounded & Indexed',
      units: 'Unit 3: Trees, Heaps & Balancing',
      chunksCount: 120
    },
    // CS207 JavaScript
    {
      id: 'doc-cs207-1',
      name: 'CS207_Unit_4_AsyncAwait_EventLoop_Fetch_APIs.pdf',
      size: '3.2 MB',
      date: '2024-09-20',
      courseCode: 'CS207',
      status: 'Grounded & Indexed',
      units: 'Unit 4: Event Loop & Microtasks',
      chunksCount: 84
    },
    // CS208 UI/UX & Design Thinking
    {
      id: 'doc-cs208-1',
      name: 'CS208_Unit_2_Design_Systems_Figma_Wireframes.pdf',
      size: '3.4 MB',
      date: '2024-09-20',
      courseCode: 'CS208',
      status: 'Grounded & Indexed',
      units: 'Unit 2: Design Tokens & Components',
      chunksCount: 70
    }
  ]);

  const filteredFaculty = useMemo(() => {
    return FACULTY_DATA.filter((fac) => {
      const q = facultySearch.toLowerCase();
      return (
        fac.name.toLowerCase().includes(q) ||
        fac.empId.toLowerCase().includes(q) ||
        fac.email.toLowerCase().includes(q) ||
        fac.role.toLowerCase().includes(q) ||
        fac.assignedCourses.some(c => c.toLowerCase().includes(q))
      );
    });
  }, [facultySearch]);

  const handleSimulateFileUpload = (file) => {
    if (!file) return;
    setUploadProgress(15);
    setUploadStatusText(`Scanning "${file.name}" for syllabus topics & headings...`);

    setTimeout(() => {
      setUploadProgress(45);
      setUploadStatusText('Vectorizing text segments (768-dim embeddings)...');
    }, 450);

    setTimeout(() => {
      setUploadProgress(78);
      setUploadStatusText('Binding to anti-cheat exam guardrails & citation anchors...');
    }, 950);

    setTimeout(() => {
      setUploadProgress(100);
      setUploadStatusText('✅ Successfully Indexed into Socratic Grounding RAG!');

      const targetSubject = activeTab === 'notes_upload' ? uploadSubject : adminSubject;
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024) > 0.1 ? (file.size / (1024 * 1024)).toFixed(1) : 1.2)} MB`,
        date: getTodayDateString(),
        courseCode: targetSubject?.code || 'CS204',
        status: 'Grounded & Indexed',
        units: `${targetSubject?.units || 5} Course Units Grounded`,
        chunksCount: Math.floor(40 + Math.random() * 90)
      };

      setUploadedSyllabusDocs(prev => [newDoc, ...prev]);

      setTimeout(() => {
        setUploadProgress(null);
        setUploadStatusText('');
        setAuditNotificationToast(`📄 "${file.name}" uploaded and indexed into ${targetSubject?.name || 'Curriculum'}!`);
        setTimeout(() => setAuditNotificationToast(''), 4500);
      }, 1200);
    }, 1600);
  };

  const handleQuickDemoUpload = (specificPdf = null) => {
    const targetSub = activeTab === 'notes_upload' ? uploadSubject : adminSubject;
    if (specificPdf) {
      handleSimulateFileUpload({
        name: specificPdf.name,
        size: parseFloat(specificPdf.size || '2.5') * 1024 * 1024
      });
      return;
    }

    const demoFiles = getDemoPDFsForSubject(targetSub);
    const chosen = (demoFiles && demoFiles.length > 0)
      ? demoFiles[Math.floor(Math.random() * demoFiles.length)]
      : { name: `${targetSub?.code || 'CS204'}_Unit_1_Core_Lecture_Notes.pdf`, size: '2.8 MB' };

    handleSimulateFileUpload({
      name: chosen.name,
      size: parseFloat(chosen.size || '2.8') * 1024 * 1024
    });
  };

  // AI Study Notes Generator & Email Broadcast State
  const [broadcastModalDoc, setBroadcastModalDoc] = useState(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [generationStep, setGenerationStep] = useState(0); // 1=scanning, 2=synthesizing, 3=ready
  const [generatedNotesPreview, setGeneratedNotesPreview] = useState(null);
  const [isDispatchingEmails, setIsDispatchingEmails] = useState(false);
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState(null);
  const [previewActiveTab, setPreviewActiveTab] = useState('concepts'); // 'concepts' | 'formulas' | 'exam_qa' | 'cheatsheet'

  const handleOpenBroadcastModal = (doc) => {
    setBroadcastModalDoc(doc);
    setIsGeneratingNotes(true);
    setGenerationStep(1);
    setGeneratedNotesPreview(null);
    setIsDispatchingEmails(false);
    setDispatchSuccessToast(null);

    // Resolve exact matching subject from SEMESTERS_DATA using courseCode
    let targetSub = activeTab === 'notes_upload' ? uploadSubject : adminSubject;
    if (doc?.courseCode) {
      for (const sem of SEMESTERS_DATA) {
        const found = sem.subjects.find(s => s.code === doc.courseCode);
        if (found) {
          targetSub = { ...found, semester: sem.name };
          break;
        }
      }
    }

    setTimeout(() => {
      setGenerationStep(2);
    }, 600);

    setTimeout(() => {
      setGenerationStep(3);
      const notes = generateAIStudyNotes(doc.name, targetSub, adminUser);
      setGeneratedNotesPreview(notes);
      setIsGeneratingNotes(false);
    }, 1200);
  };

  const handleConfirmEmailBroadcast = () => {
    if (!generatedNotesPreview) return;
    setIsDispatchingEmails(true);

    setTimeout(() => {
      publishNewBroadcastNote(generatedNotesPreview);
      setBroadcastHistory(getSavedBroadcastNotes());
      setIsDispatchingEmails(false);
      const targetSemName = activeTab === 'notes_upload' ? uploadSemester?.name : adminSemester.name;
      setDispatchSuccessToast(`✉️ Successfully broadcasted AI Study Notes to 42 enrolled students of ${targetSemName}!`);
      setAuditNotificationToast(`📢 Study Notes for "${generatedNotesPreview.title}" dispatched to all student inboxes!`);
      setTimeout(() => {
        setAuditNotificationToast('');
      }, 5000);
    }, 1400);
  };

  const handleEndAllActiveLocks = () => {
    if (onEndAllLockouts) {
      onEndAllLockouts();
    } else {
      setInternalLocks((prev) =>
        prev.map((item) => {
          const timing = evaluateLockTiming(item, currentTime);
          if (timing.isLocked) {
            return { ...item, manualOverride: 'unlocked', status: 'Inactive' };
          }
          return item;
        })
      );
    }
    setAuditNotificationToast('✅ Examination Lockout Ended: All student portals have been restored and activated!');
    setTimeout(() => setAuditNotificationToast(''), 4500);
  };

  const handleTriggerInstantDemoLock = (course = 'DBMS - SQL (CS204)') => {
    if (onInstantDemoLock) {
      onInstantDemoLock(course);
    } else {
      const now = new Date();
      const demoStart = new Date(now.getTime() - 10 * 60 * 1000);
      const demoEnd = new Date(now.getTime() + 50 * 60 * 1000);
      const demoLock = {
        id: `lock-instant-demo-${Date.now()}`,
        course,
        semester: 'Semester 2',
        date: getTodayDateString(0),
        startTime: getTimeString(demoStart),
        endTime: getTimeString(demoEnd),
        status: 'Active',
        manualOverride: 'locked',
        lockedQueries: 0,
        department: adminUser?.department || 'Computer Science & Engineering'
      };
      setInternalLocks((prev) => [demoLock, ...prev]);
    }
    setAuditNotificationToast('⚡ Instant Demo Lockout Activated: Student portals are now locked with 30-min buffer!');
    setTimeout(() => setAuditNotificationToast(''), 4500);
  };

  const toggleExamLockStatus = (id) => {
    if (onToggleExamLock) {
      onToggleExamLock(id);
    } else {
      setInternalLocks((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
            : item
        )
      );
    }
  };

  // Student Key Metrics Calculation
  const studentMetrics = useMemo(() => {
    const total = STUDENTS_DATA.length;
    const avgCompletion = Math.round(STUDENTS_DATA.reduce((acc, s) => acc + s.completionRate, 0) / total);
    const avgScore = Math.round(STUDENTS_DATA.reduce((acc, s) => acc + s.avgTestScore, 0) / total);
    const topCount = STUDENTS_DATA.filter(s => s.performanceStatus === 'Top Performer').length;
    const supportCount = STUDENTS_DATA.filter(s => s.performanceStatus === 'Needs Support').length;
    return { total, avgCompletion, avgScore, topCount, supportCount };
  }, []);

  // Filtered Students list computation
  const filteredStudents = useMemo(() => {
    return STUDENTS_DATA.filter((st) => {
      const matchesSearch =
        st.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
        st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        st.rollNo.toLowerCase().includes(studentSearch.toLowerCase());
      
      const matchesBatch = batchFilter === 'All' || st.batchYear === batchFilter;
      const matchesStatus = statusFilter === 'All' || st.performanceStatus === statusFilter;

      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [studentSearch, batchFilter, statusFilter]);

  // Filtered AI Audit Incidents list computation
  const filteredAuditFlags = useMemo(() => {
    return auditFlags.filter((item) => {
      const matchesSearch =
        item.studentName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        item.studentEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
        item.rollNo.toLowerCase().includes(auditSearch.toLowerCase()) ||
        item.course.toLowerCase().includes(auditSearch.toLowerCase()) ||
        item.studentQuery.toLowerCase().includes(auditSearch.toLowerCase()) ||
        item.id.toLowerCase().includes(auditSearch.toLowerCase()) ||
        item.flagTriggerReason.toLowerCase().includes(auditSearch.toLowerCase());

      const matchesSeverity = auditSeverityFilter === 'All' || item.severity === auditSeverityFilter;
      const matchesStatus = auditStatusFilter === 'All' || item.status === auditStatusFilter;
      const matchesCategory =
        auditCategoryFilter === 'All' ||
        (auditCategoryFilter === 'Exam Solution' && item.category.includes('Exam')) ||
        (auditCategoryFilter === 'Code Gen' && item.category.includes('Code Generation')) ||
        (auditCategoryFilter === 'Out of Syllabus' && item.category.includes('Out of Syllabus')) ||
        (auditCategoryFilter === 'Citation' && item.category.includes('Citation')) ||
        (auditCategoryFilter === 'Security' && item.category.includes('Reverse Engineering'));

      return matchesSearch && matchesSeverity && matchesStatus && matchesCategory;
    });
  }, [auditFlags, auditSearch, auditSeverityFilter, auditStatusFilter, auditCategoryFilter]);

  const resolveAuditFlag = (id, note = '') => {
    setAuditFlags((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedTrail = [
            ...item.verificationReport.auditTrail,
            { time: 'Just Now', event: `Verified & Grounded by ${adminUser?.name || 'Faculty Administrator'}${note ? `: "${note}"` : ''}` }
          ];
          return {
            ...item,
            status: 'Grounded & Resolved',
            verificationReport: {
              ...item.verificationReport,
              auditTrail: updatedTrail,
              recommendedAction: `Resolved by ${adminUser?.name || 'Faculty Admin'} (${adminUser?.email || 'meetd@itm.edu'}). Socratic guidelines verified.`
            }
          };
        }
        return item;
      })
    );

    if (selectedAuditReport && selectedAuditReport.id === id) {
      setSelectedAuditReport((prev) => ({
        ...prev,
        status: 'Grounded & Resolved',
        verificationReport: {
          ...prev.verificationReport,
          recommendedAction: `Resolved by ${adminUser?.name || 'Faculty Admin'}. Socratic guidelines verified.`
        }
      }));
    }

    setAuditNotificationToast(`Audit Incident ${id} marked as Grounded & Resolved.`);
    setTimeout(() => setAuditNotificationToast(''), 4000);
  };

  const issueStudentAdvisory = (item) => {
    setAuditNotificationToast(
      `Academic Integrity Advisory dispatched to ${item.studentName} (${item.studentEmail}).`
    );
    setTimeout(() => setAuditNotificationToast(''), 4500);
  };

  const handleCreateLock = (e) => {
    e.preventDefault();
    const newLock = {
      id: `lock-${Date.now()}`,
      course: lockCourse,
      semester: lockSemester,
      date: lockDate,
      startTime: lockStartTime,
      endTime: lockEndTime,
      status: 'Active',
      manualOverride: null,
      lockedQueries: 0,
      department: adminUser?.department || 'Computer Science & Engineering'
    };
    if (onAddExamLock) {
      onAddExamLock(newLock);
    } else {
      setInternalLocks((prev) => [newLock, ...prev]);
    }
    setShowAddLockModal(false);
    setAuditNotificationToast(`Exam Lock scheduled for ${lockCourse}: Auto-buffer active 30m prior (${lockDate})`);
    setTimeout(() => setAuditNotificationToast(''), 4500);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] flex flex-row overflow-hidden font-sans selection:bg-[#ED7D31]/20 selection:text-[#1E293B]">
      
      {/* ================= 1. SLEEK ENTERPRISE ADMIN SIDEBAR ================= */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-18 px-2' : 'w-64 px-4'
        } bg-[#0F172A] text-white flex flex-col justify-between py-5 border-r border-slate-800/80 z-30 flex-shrink-0 shadow-2xl transition-all duration-300 ease-in-out`}
      >
        <div className="space-y-6">
          {/* Top Brand Logo & Collapse Toggle */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ED7D31] via-amber-500 to-orange-600 flex items-center justify-center shadow-md text-white font-bold flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <h2 className="font-sans font-extrabold text-sm text-white tracking-tight leading-none truncate">
                    AISA Governance
                  </h2>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Admin Control
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar Collapse Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand Sidebar" : "Hide Sidebar"}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#ED7D31]" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <button
              onClick={() => setActiveTab('students')}
              title="Student Directory & Reports"
              className={`w-full flex items-center gap-3 ${
                sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-3'
              } rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-[#ED7D31] text-white shadow-md shadow-[#ED7D31]/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="truncate">Student Directory</span>
                  <span className="ml-auto bg-slate-800 text-amber-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">
                    {STUDENTS_DATA.length}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('exam_locks')}
              title="Exam Lockouts"
              className={`w-full flex items-center gap-3 ${
                sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-3'
              } rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'exam_locks'
                  ? 'bg-[#ED7D31] text-white shadow-md shadow-[#ED7D31]/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Exam Lockouts</span>}
            </button>

            <button
              onClick={() => setActiveTab('audit_flags')}
              title="AI Flag Audit Queue"
              className={`w-full flex items-center gap-3 ${
                sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-3'
              } rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer relative ${
                activeTab === 'audit_flags'
                  ? 'bg-[#ED7D31] text-white shadow-md shadow-[#ED7D31]/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Flag className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="truncate">AI Audit Flags</span>
                  {auditFlags.filter(f => f.status === 'Pending Faculty Review').length > 0 && (
                    <span className="ml-auto bg-amber-400 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full shadow-xs">
                      {auditFlags.filter(f => f.status === 'Pending Faculty Review').length}
                    </span>
                  )}
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('curriculum')}
              title="Syllabus Grounding"
              className={`w-full flex items-center gap-3 ${
                sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-3'
              } rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'curriculum'
                  ? 'bg-[#ED7D31] text-white shadow-md shadow-[#ED7D31]/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Syllabus Grounding</span>}
            </button>

            {/* Dedicated Tab 4: Upload Notes & AI Broadcast */}
            <button
              onClick={() => setActiveTab('notes_upload')}
              title="Upload Notes & AI Broadcast"
              className={`w-full flex items-center gap-3 ${
                sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-3'
              } rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer relative ${
                activeTab === 'notes_upload'
                  ? 'bg-[#ED7D31] text-white shadow-md shadow-[#ED7D31]/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UploadCloud className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="truncate">Upload Notes & Broadcast</span>
                  <span className="ml-auto bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                    AI
                  </span>
                </>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom User Avatar Profile */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 px-1.5 py-1">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white leading-tight truncate">{adminUser?.name || 'Faculty Admin'}</p>
                <p className="text-[10px] text-slate-400 leading-tight font-mono truncate">{adminUser?.email || 'admin@itm.edu'}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1" title={adminUser?.email || 'admin@itm.edu'}>
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs">
                {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
              </div>
            </div>
          )}

          <button
            onClick={onBack || onLogout}
            title="Back to Landing Page"
            className={`w-full flex items-center ${
              sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'
            } py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer`}
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0 text-[#ED7D31]" />
            {!sidebarCollapsed && <span className="ml-2.5">Back to Home</span>}
          </button>

          <button
            onClick={onLogout}
            title="Logout Portal"
            className={`w-full flex items-center ${
              sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'
            } py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-2.5">Logout Portal</span>}
          </button>
        </div>
      </aside>

      {/* ================= 2. MAIN ADMIN CONTENT WORKSPACE ================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#FAFAFA]">
        
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Back to Home Button */}
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs group"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-4 h-4 text-[#ED7D31] group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>

            {/* Quick Toggle Button in Header */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs"
              title={sidebarCollapsed ? "Expand Sidebar" : "Hide Sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#ED7D31]" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
              <span className="hidden sm:inline text-[11px]">
                {sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
              </span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#ED7D31] uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Department Portal
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">ITM University Governance</span>
              </div>
              <h1 className="font-sans text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {adminUser?.department || 'Computer Science & Engineering'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 1-Click Instant Demo Lockout Action for Teacher Presentation */}
            {!activeLockSummary.hasActiveLock ? (
              <button
                onClick={() => handleTriggerInstantDemoLock('DBMS - SQL (CS204)')}
                className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-[#ED7D31] hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#ED7D31]/25 cursor-pointer transition-all hover:scale-105 active:scale-95"
                title="1-Click Demo for Sir: Instantly lock all student portals"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Instant Lockout (Demo)</span>
              </button>
            ) : (
              <button
                onClick={handleEndAllActiveLocks}
                className="px-3.5 py-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
                title="1-Click Demo: Instantly release all student portals"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>End Lockout (Demo)</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs font-bold text-emerald-800 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Syllabus Compliance 100%</span>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* Prominent Active Exam Lockdown Banner with 1-Click End Lockout Button */}
          {activeLockSummary.hasActiveLock && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 border-2 border-rose-300 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-600/30">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-mono text-[10px] font-black uppercase tracking-wider">
                      Student Portal Lockdown Active
                    </span>
                    <span className="text-xs font-bold text-rose-900">
                      {activeLockSummary.timing?.reason || '30-Minute Integrity Buffer Active'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    {activeLockSummary.activeLock?.course}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Student portals are locked. Scheduled unlock in: <strong className="font-mono text-rose-700 font-bold">{activeLockSummary.timing?.timeRemainingStr || 'Locked'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-center flex-shrink-0">
                <button
                  onClick={handleEndAllActiveLocks}
                  className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow-md shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer"
                  title="Immediately ends lockout and re-activates all student portals"
                >
                  <Unlock className="w-4 h-4" />
                  <span>End Lockout (Activate Student Portal)</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Global Notification Toast */}
          {auditNotificationToast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm text-left"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{auditNotificationToast}</span>
              </div>
              <button
                onClick={() => setAuditNotificationToast('')}
                className="text-emerald-700 hover:text-emerald-900 font-extrabold cursor-pointer ml-4"
              >
                ✕
              </button>
            </motion.div>
          )}

          {/* ================= TAB 0: STUDENT DIRECTORY & PERFORMANCE REPORTS ================= */}
          {activeTab === 'students' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Directory Overview Header Banner */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-[#ED7D31] uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      Institutional Directory
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Academic Session 2024–2025</span>
                  </div>
                  <h2 className="font-sans text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Student Roster & Curriculum Performance Analytics
                  </h2>
                  <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
                    Institutional governance console monitoring continuous student evaluations, course syllabus progression, test assessment benchmarks, and syllabus-grounded AI tutoring interactions.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
                    <Users className="w-4 h-4 text-[#ED7D31]" />
                    <span>Active Cohort: <strong className="text-slate-900">{filteredStudents.length}</strong> / {STUDENTS_DATA.length} Students</span>
                  </div>
                </div>
              </div>

              {/* 4 Professional Academic KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Enrolled</span>
                    <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{studentMetrics.total}</p>
                    <p className="text-[11px] text-slate-500 font-medium">Verified ISU Student Accounts</p>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>100% Active in Directory</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Syllabus Progress</span>
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{studentMetrics.avgCompletion}%</p>
                    <p className="text-[11px] text-slate-500 font-medium">Department Syllabus Completion</p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${studentMetrics.avgCompletion}%` }} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Assessment Average</span>
                    <div className="w-7 h-7 rounded-xl bg-amber-50 text-[#ED7D31] flex items-center justify-center">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-600">{studentMetrics.avgScore}%</p>
                    <p className="text-[11px] text-slate-500 font-medium">Continuous Cumulative Grade A</p>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <span>Includes Midterm & Quizzes</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Academic Intervention</span>
                    <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-rose-600">{studentMetrics.supportCount}</p>
                    <p className="text-[11px] text-slate-500 font-medium">Students Recommended for Support</p>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center gap-1 text-[11px] text-rose-600 font-bold">
                    <span>Below 75% Benchmarks</span>
                  </div>
                </div>
              </div>

              {/* Sprint 4 Item 3: Basic Analytics Dashboard: Total Doubts Asked & Topic Stats */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold text-[#ED7D31] uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                        Institutional Analytics
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Live Doubts Telemetry</span>
                    </div>
                    <h3 className="font-sans text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      AI Doubts Analytics & Curriculum Topic Distribution
                    </h3>
                    <p className="text-xs text-slate-500 max-w-2xl">
                      Real-time breakdown of total questions asked, difficulty hot-spots in the syllabus, and automated Socratic resolution efficiency.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>96.4% Socratic Resolution</span>
                    </span>
                  </div>
                </div>

                {/* 4 Analytics Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-2xl border border-amber-200/80 space-y-1">
                    <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">Total Doubts Asked</span>
                    <p className="text-2xl font-black text-slate-900">3,420</p>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <span>↗ +18.4%</span>
                      <span className="font-normal text-slate-500">this semester</span>
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">Avg AI Latency</span>
                    <p className="text-2xl font-black text-slate-900">1.1s</p>
                    <span className="text-[10px] text-slate-500 font-medium">Gemini Socratic Engine</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">Highest Doubt Topic</span>
                    <p className="text-2xl font-black text-[#ED7D31]">Unit 3 & 4</p>
                    <span className="text-[10px] text-slate-500 font-medium">Normalization & B+ Trees</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">Faculty Escalations</span>
                    <p className="text-2xl font-black text-rose-600">123</p>
                    <span className="text-[10px] text-rose-700 font-bold">3.6% Verified by Teachers</span>
                  </div>
                </div>

                {/* Topic Distribution Progress Bars */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#ED7D31]" />
                      <span>Syllabus Topic Doubt Distribution</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">Indexed across all semesters</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-medium">
                    <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800">1. Normalization, Functional Dependencies & BCNF</span>
                        <span className="text-[#ED7D31]">34% (1,162 doubts)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#ED7D31] rounded-full" style={{ width: '34%' }} />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800">2. B+ Tree Indexing & Disk Storage Architecture</span>
                        <span className="text-amber-600">28% (957 doubts)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '28%' }} />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800">3. Concurrency Control, 2PL & Serializability</span>
                        <span className="text-indigo-600">21% (718 doubts)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '21%' }} />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800">4. Relational Algebra & SQL Nested Queries</span>
                        <span className="text-emerald-600">17% (583 doubts)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '17%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sprint 4 Item 2: Admin User Management Subtab Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-fit">
                  <button
                    onClick={() => setUserDirectorySubTab('students')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      userDirectorySubTab === 'students'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-[#ED7D31]" />
                    <span>Student Accounts ({STUDENTS_DATA.length})</span>
                  </button>

                  <button
                    onClick={() => setUserDirectorySubTab('faculty')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      userDirectorySubTab === 'faculty'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-4 h-4 text-[#ED7D31]" />
                    <span>Faculty & Mentor Directory ({FACULTY_DATA.length})</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {userDirectorySubTab === 'students' ? (
                    <span>Showing <strong className="text-slate-900">{filteredStudents.length}</strong> enrolled students</span>
                  ) : (
                    <span>Showing <strong className="text-slate-900">{filteredFaculty.length}</strong> active faculty instructors</span>
                  )}
                </div>
              </div>

              {/* SUBTAB 1: STUDENTS DIRECTORY */}
              {userDirectorySubTab === 'students' && (
                <div className="space-y-4">
                  {/* Sleek Search & Academic Filter Bar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full md:w-[420px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by student name, roll number, or institutional email..."
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ED7D31] focus:bg-white transition-all shadow-inner-xs"
                  />
                  {studentSearch && (
                    <button onClick={() => setStudentSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-medium text-slate-700">
                    <Filter className="w-3.5 h-3.5 text-[#ED7D31]" />
                    <span className="text-slate-500 font-semibold">Cohort:</span>
                    <select
                      value={batchFilter}
                      onChange={(e) => setBatchFilter(e.target.value)}
                      className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Cohorts (2023–2025)</option>
                      <option value="2023">2023 Batch</option>
                      <option value="2024">2024 Batch</option>
                      <option value="2025">2025 Batch</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-medium text-slate-700">
                    <BarChart3 className="w-3.5 h-3.5 text-[#ED7D31]" />
                    <span className="text-slate-500 font-semibold">Academic Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Standings</option>
                      <option value="Top Performer">Honors / Top Performer (85%+)</option>
                      <option value="On Track">On Track (75%–84%)</option>
                      <option value="Needs Support">Requires Support (&lt;75%)</option>
                    </select>
                  </div>

                  {(studentSearch || batchFilter !== 'All' || statusFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setStudentSearch('');
                        setBatchFilter('All');
                        setStatusFilter('All');
                      }}
                      className="px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-dashed border-slate-300"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Master Student Directory Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50/95 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-4 pl-6 pr-4">Student & Institutional ID</th>
                        <th className="py-4 px-4">Academic Term</th>
                        <th className="py-4 px-4">Curriculum Progress</th>
                        <th className="py-4 px-4 text-center">Cumulative Score</th>
                        <th className="py-4 px-4">Continuous Evaluation</th>
                        <th className="py-4 px-4 text-center">Standing</th>
                        <th className="py-4 pl-4 pr-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            No enrolled students match your search criteria "{studentSearch}".
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50/80 transition-colors group">
                            {/* Student Profile & Email */}
                            <td className="py-3.5 pl-6 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200/80 text-[#ED7D31] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                                  {st.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-slate-900 text-xs leading-snug truncate group-hover:text-[#ED7D31] transition-colors">{st.name}</p>
                                  <p className="text-[11px] font-mono text-slate-500 leading-tight truncate">{st.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Academic Term & Roll No */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div>
                                <span className="font-bold text-slate-800 block text-xs leading-tight">{st.semester}</span>
                                <span className="text-[11px] text-slate-400 font-mono tracking-tight block">{st.rollNo}</span>
                              </div>
                            </td>

                            {/* Course Progress */}
                            <td className="py-3.5 px-4">
                              <div className="w-36 space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-slate-800">{st.completionRate}%</span>
                                  <span className="text-[10px] text-slate-400 font-medium">Completed</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      st.completionRate >= 85
                                        ? 'bg-emerald-500'
                                        : st.completionRate >= 75
                                        ? 'bg-[#ED7D31]'
                                        : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${st.completionRate}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Cumulative Score */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-xs">
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                <span className="font-black text-slate-900 text-xs">{st.avgTestScore}%</span>
                              </div>
                            </td>

                            {/* Continuous Assessments Breakdown */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-1 text-[10px] font-bold">
                                <span className="text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/60 inline-block w-fit">
                                  Quiz: {st.quiz1Score}/20
                                </span>
                                <span className="text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-200/60 inline-block w-fit">
                                  Midterm: {st.midtermScore}%
                                </span>
                              </div>
                            </td>

                            {/* Standing Tag */}
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                st.performanceStatus === 'Top Performer'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : st.performanceStatus === 'On Track'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  st.performanceStatus === 'Top Performer' ? 'bg-emerald-500' : st.performanceStatus === 'On Track' ? 'bg-blue-500' : 'bg-rose-500'
                                }`} />
                                {st.performanceStatus}
                              </span>
                            </td>

                            {/* Action Button */}
                            <td className="py-3.5 pl-4 pr-6 text-right">
                              <button
                                onClick={() => setSelectedStudentModal(st)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#ED7D31] bg-amber-50/80 hover:bg-[#ED7D31] hover:text-white transition-all cursor-pointer border border-amber-200/80 shadow-xs inline-flex items-center gap-1"
                              >
                                <span>Report</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: FACULTY & INSTRUCTOR DIRECTORY (Sprint 4 Item 2) */}
          {userDirectorySubTab === 'faculty' && (
            <div className="space-y-4">
              {/* Faculty Search & Department Filter Bar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-[420px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    placeholder="Search faculty by name, employee ID, or course..."
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ED7D31] focus:bg-white transition-all shadow-inner-xs"
                  />
                  {facultySearch && (
                    <button onClick={() => setFacultySearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-[#ED7D31] flex items-center gap-1.5 shadow-xs">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Department of Computer Science & Engineering</span>
                  </span>
                </div>
              </div>

              {/* Master Faculty Directory Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50/95 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-4 pl-6 pr-4">Faculty Member & ID</th>
                        <th className="py-4 px-4">Designation & Department</th>
                        <th className="py-4 px-4">Assigned Courses</th>
                        <th className="py-4 px-4">Governance Role</th>
                        <th className="py-4 px-4 text-center">Active Doubts</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 pl-4 pr-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredFaculty.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            No faculty members match "{facultySearch}".
                          </td>
                        </tr>
                      ) : (
                        filteredFaculty.map((fac) => (
                          <tr key={fac.id} className="hover:bg-slate-50/80 transition-colors group">
                            {/* Name & Email */}
                            <td className="py-3.5 pl-6 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                                  {fac.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-slate-900 text-xs leading-snug group-hover:text-[#ED7D31] transition-colors">{fac.name}</p>
                                  <p className="text-[11px] font-mono text-slate-500 leading-tight">{fac.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Designation */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div>
                                <span className="font-bold text-slate-800 block text-xs leading-tight">{fac.designation}</span>
                                <span className="text-[11px] text-slate-400 font-mono tracking-tight block">{fac.empId} • {fac.cabin}</span>
                              </div>
                            </td>

                            {/* Courses */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {fac.assignedCourses.map((c, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-[#ED7D31] font-mono text-[10px] font-bold">
                                    {c.split(' - ')[0]}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-3.5 px-4">
                              <span className="text-slate-700 font-semibold block text-xs">{fac.role}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{fac.permissions}</span>
                            </td>

                            {/* Doubts */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-black text-xs">
                                <MessageSquare className="w-3 h-3 text-[#ED7D31]" />
                                <span>{fac.activeDoubtCount}</span>
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                fac.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : fac.status === 'In Proctoring'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  fac.status === 'Active' ? 'bg-emerald-500' : fac.status === 'In Proctoring' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                                }`} />
                                {fac.status}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="py-3.5 pl-4 pr-6 text-right">
                              <a
                                href={`mailto:${fac.email}`}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-[#ED7D31] hover:text-white transition-all cursor-pointer border border-slate-200 shadow-xs inline-flex items-center gap-1"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Contact</span>
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

          {/* ================= TAB 1: EXAM LOCKOUTS MANAGER ================= */}
          {activeTab === 'exam_locks' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Top Quick Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Active Exam Locks</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#ED7D31] flex items-center justify-center border border-amber-200/60">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      {examLocks.filter(e => evaluateLockTiming(e, currentTime).isLocked).length} <span className="text-base font-bold text-slate-500">Active</span>
                    </p>
                    <p className="text-[11px] text-[#ED7D31] font-bold mt-1">🔒 30-min Buffer Enforced</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Scheduled Exams</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      {examLocks.length} <span className="text-base font-bold text-slate-500">Windows</span>
                    </p>
                    <p className="text-[11px] text-blue-700 font-bold mt-1">Institutional Schedule</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Pending AI Flags</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                      <Flag className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      {auditFlags.filter(f => f.status === 'Pending Faculty Review').length} <span className="text-base font-bold text-slate-500">Items</span>
                    </p>
                    <p className="text-[11px] text-amber-700 font-bold mt-1">Faculty Review Queue</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Automatic Buffer Policy</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
                      <Timer className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">±30 Minutes</p>
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">Pre & Post Integrity Lock</p>
                  </div>
                </div>
              </div>

              {/* Informational Policy Banner */}
              <div className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ED7D31] animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-[#D96618]">
                      Automated 30-Minute Honor Buffer Rule
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    Once scheduled, the student portal automatically enters strict lockout mode <strong>30 minutes before the exam starts</strong> (to prevent last-minute answer generation) and remains locked until <strong>30 minutes after the exam concludes</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                  {!activeLockSummary.hasActiveLock ? (
                    <button
                      onClick={() => handleTriggerInstantDemoLock('DBMS - SQL (CS204)')}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-[#ED7D31] hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-[#ED7D31]/25 transition-transform active:scale-95"
                      title="Demo for Sir: 1-Click activate instant exam lockout"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Instant Lockout (Demo)</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleEndAllActiveLocks}
                      className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/30 transition-transform active:scale-95"
                      title="Immediately end current active lockout"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>End Active Lockout</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowAddLockModal(true)}
                    className="gold-button px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Schedule Exam Lock</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 border-b border-slate-200/90 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-4 px-6">Course Name & Code</th>
                        <th className="py-4 px-6">Exam Date & Window</th>
                        <th className="py-4 px-6">Lockout Window (±30m Buffer)</th>
                        <th className="py-4 px-6">Lock Status</th>
                        <th className="py-4 px-6">Restricted Queries</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {examLocks.map((item) => {
                        const timing = evaluateLockTiming(item, currentTime);
                        const startFormatted = timing.lockEffectiveStart ? getTimeString(timing.lockEffectiveStart) : item.startTime;
                        const endFormatted = timing.lockEffectiveEnd ? getTimeString(timing.lockEffectiveEnd) : item.endTime;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-4.5 px-6 font-bold text-slate-900">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  timing.isLocked ? 'bg-amber-100 text-[#ED7D31]' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900 text-xs">{item.course}</div>
                                  <div className="text-[11px] text-slate-400 font-medium">{item.semester || 'B.Tech CSE'}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4.5 px-6 text-slate-700">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                                  <Calendar className="w-3.5 h-3.5 text-[#ED7D31]" />
                                  <span>{item.date || getTodayDateString()}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {formatTime12Hr(item.startTime)} – {formatTime12Hr(item.endTime)}
                                </div>
                              </div>
                            </td>

                            <td className="py-4.5 px-6 text-slate-700">
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D96618]">
                                  <Clock className="w-3.5 h-3.5 text-[#ED7D31]" />
                                  {formatTime12Hr(startFormatted)} – {formatTime12Hr(endFormatted)}
                                </span>
                                <div className="text-[10px] text-slate-400 font-semibold">
                                  Includes 30m pre & post buffer
                                </div>
                              </div>
                            </td>

                            <td className="py-4.5 px-6">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                                  timing.isLocked
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : timing.status === 'Scheduled'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    timing.isLocked 
                                      ? 'bg-rose-500 animate-ping' 
                                      : timing.status === 'Scheduled'
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`} />
                                  {timing.isLocked ? 'Lock Active' : timing.status === 'Scheduled' ? 'Scheduled' : 'Concluded'}
                                </span>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {timing.isLocked ? (
                                    <strong className="text-rose-600 font-mono">{timing.timeRemainingStr} to unlock</strong>
                                  ) : timing.status === 'Scheduled' ? (
                                    <span className="font-mono text-amber-700">Locks in {timing.timeRemainingStr}</span>
                                  ) : (
                                    'Buffer expired'
                                  )}
                                </p>
                              </div>
                            </td>

                            <td className="py-4.5 px-6 font-mono font-bold text-slate-900">
                              <span className="bg-slate-100 px-2.5 py-1 rounded-xl text-slate-800">
                                {item.lockedQueries || 0} Blocked
                              </span>
                            </td>

                            <td className="py-4.5 px-6 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => toggleExamLockStatus(item.id)}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                                    timing.isLocked
                                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                                      : 'bg-amber-50 hover:bg-amber-100 text-[#D96618] border border-amber-200'
                                  }`}
                                  title={timing.isLocked ? 'End lockout now and activate student portal immediately' : 'Force lock immediately'}
                                >
                                  {timing.isLocked ? (
                                    <>
                                      <Unlock className="w-3.5 h-3.5" />
                                      <span>End Lockout</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3.5 h-3.5" />
                                      <span>Force Lock</span>
                                    </>
                                  )}
                                </button>

                                {onDeleteExamLock && (
                                  <button
                                    onClick={() => onDeleteExamLock(item.id)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                                    title="Delete Scheduled Lock"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Proctored Examination Submissions & Grade Roster (Firestore 'exam_attempts') */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        Cloud Firestore Synced
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">exam_attempts</span>
                    </div>
                    <h3 className="font-sans text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      <span>Proctored University Examination Submissions ({allExamAttempts.length} Records)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluated multi-format answer sheets (MCQs, Match the Following, Assertion & Reasoning) submitted by students.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      fetchAllExamAttempts().then(att => setAllExamAttempts(att));
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refresh Roster</span>
                  </button>
                </div>

                {allExamAttempts.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Course / Paper</th>
                          <th className="py-3 px-4">Score / Max</th>
                          <th className="py-3 px-4">Grade</th>
                          <th className="py-3 px-4">Sectional Marks</th>
                          <th className="py-3 px-4">Time Taken</th>
                          <th className="py-3 px-4">Integrity Flags</th>
                          <th className="py-3 px-4">Submitted At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allExamAttempts.map((att, idx) => (
                          <tr key={att.id || idx} className="hover:bg-indigo-50/20 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{att.studentName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{att.studentEmail}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                                {att.examCode || 'EXAM'}
                              </span>
                              <p className="text-[11px] text-slate-700 font-medium truncate max-w-[180px] mt-0.5">
                                {att.examName}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-black text-slate-900 text-sm">
                                {att.totalMarksObtained} / {att.maxMarks || 30}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {att.percentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full font-black text-xs inline-block ${
                                att.letterGrade === 'A+' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                att.letterGrade === 'A' ? 'bg-teal-100 text-teal-800 border border-teal-300' :
                                att.letterGrade === 'B' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {att.letterGrade || 'A'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-0.5 text-[10px]">
                                <span className="inline-block bg-slate-100 px-1.5 py-0.5 rounded font-mono mr-1">
                                  MCQ: {att.sectionalScores?.secA || 0}/12
                                </span>
                                <span className="inline-block bg-slate-100 px-1.5 py-0.5 rounded font-mono mr-1">
                                  Match: {att.sectionalScores?.secB || 0}/10
                                </span>
                                <span className="inline-block bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                                  Assert: {att.sectionalScores?.secC || 0}/8
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">
                              {Math.floor((att.timeTakenSeconds || 0) / 60)}m {(att.timeTakenSeconds || 0) % 60}s
                            </td>
                            <td className="py-3 px-4">
                              {(att.tabSwitchViolations || 0) > 0 ? (
                                <span className="px-2 py-0.5 rounded font-bold text-rose-700 bg-rose-50 border border-rose-200 text-[10px] flex items-center gap-1 w-fit">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  {att.tabSwitchViolations} Tab Switch(es)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Clean (0 Flags)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                              {att.submittedAtFormatted || 'Recent'}
                              <span className="block text-[9px] text-slate-400">
                                Doc: {att.id?.slice(0, 10)}...
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                    <p className="text-xs font-bold text-slate-700">No Proctored Exam Submissions Recorded Yet</p>
                    <p className="text-[11px] text-slate-500">
                      When students enter the Examination Hall from their dashboard and complete their exams, their multi-format answer keys, section marks, and proctor logs will automatically appear here in real-time.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= TAB 2: RESPONSIBLE AI AUDIT QUEUE ================= */}
          {activeTab === 'audit_flags' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Notification Toast */}
              {auditNotificationToast && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{auditNotificationToast}</span>
                  </div>
                  <button
                    onClick={() => setAuditNotificationToast('')}
                    className="text-emerald-700 hover:text-emerald-900 font-extrabold cursor-pointer"
                  >
                    ✕
                  </button>
                </motion.div>
              )}

              {/* Institutional Header Banner */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ED7D31] bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      Department Governance · CSE Responsible AI Lab
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Session 2024–2025</span>
                  </div>
                  <h3 className="font-sans text-xl font-extrabold text-slate-900">
                    Responsible AI Audit & Model Integrity Dossiers
                  </h3>
                  <p className="text-xs text-slate-500 max-w-3xl">
                    Real-time forensic telemetry monitoring student prompts, curriculum grounding deviations, exam lock violations, and citation fidelity across all B.Tech CSE cohorts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Socratic Guardrail: ACTIVE (v3.2)
                  </span>
                </div>
              </div>

              {/* 4 Governance KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Interceptions</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{auditFlags.length}</p>
                    <p className="text-[11px] text-blue-700 font-bold mt-1">Logged Telemetry Incidents</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                      <Flag className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      {auditFlags.filter(f => f.status === 'Pending Faculty Review').length}
                    </p>
                    <p className="text-[11px] text-amber-700 font-bold mt-1">Action Required Queue</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Critical Integrity Breaches</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      {auditFlags.filter(f => f.severity === 'Critical').length}
                    </p>
                    <p className="text-[11px] text-rose-700 font-bold mt-1">Exam & Assessment Locks</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Grounded & Resolved</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
                      <CheckCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      {auditFlags.filter(f => f.status === 'Grounded & Resolved').length}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">Pedagogically Verified</p>
                  </div>
                </div>
              </div>

              {/* Filter Toolbar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search by student name, roll number, query keyword, or course..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ED7D31]/30 focus:border-[#ED7D31] transition-all"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400 font-medium">Severity:</span>
                    <select
                      value={auditSeverityFilter}
                      onChange={(e) => setAuditSeverityFilter(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Severities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
                    <select
                      value={auditCategoryFilter}
                      onChange={(e) => setAuditCategoryFilter(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Violation Categories</option>
                      <option value="Exam Solution">Exam Solution Leaks</option>
                      <option value="Code Gen">Graded Assignment Code</option>
                      <option value="Out of Syllabus">Out of Syllabus Scope</option>
                      <option value="Citation">Citation Verification</option>
                      <option value="Security">Jailbreak & Security</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
                    <select
                      value={auditStatusFilter}
                      onChange={(e) => setAuditStatusFilter(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending Faculty Review">Pending Review</option>
                      <option value="Grounded & Resolved">Grounded & Resolved</option>
                    </select>
                  </div>

                  {(auditSearch || auditSeverityFilter !== 'All' || auditCategoryFilter !== 'All' || auditStatusFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setAuditSearch('');
                        setAuditSeverityFilter('All');
                        setAuditCategoryFilter('All');
                        setAuditStatusFilter('All');
                      }}
                      className="px-3.5 py-2 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold border border-dashed border-slate-300 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Audit Incidents List */}
              <div className="space-y-4">
                {filteredAuditFlags.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <FileSearch className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-base text-slate-800">No Audit Incidents Match Filters</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      All student queries in this category adhere to institutional Socratic guidelines and curriculum grounding rules.
                    </p>
                  </div>
                ) : (
                  filteredAuditFlags.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-5"
                    >
                      {/* Incident Header: Student Profile & Telemetry Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-[#ED7D31] text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
                            {item.studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                                {item.studentName}
                              </h4>
                              <span className="font-mono text-xs text-slate-500 font-medium">
                                ({item.rollNo})
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                · {item.studentEmail}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-[#ED7D31] bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                                {item.course}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                {item.semester} ({item.batchYear})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                          {/* Severity Pill */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                              item.severity === 'Critical'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : item.severity === 'High'
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : item.severity === 'Moderate'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.severity === 'Critical'
                                  ? 'bg-rose-500 animate-ping'
                                  : item.severity === 'High'
                                  ? 'bg-orange-500'
                                  : item.severity === 'Moderate'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            {item.severity} Severity
                          </span>

                          <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                            {item.id} · {item.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Incident Forensic Breakdown: 3 Distinct Cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                        {/* 1. Student Prompt */}
                        <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                              Intercepted Student Prompt
                            </span>
                            <p className="text-slate-800 font-semibold italic text-xs leading-relaxed">
                              "{item.studentQuery}"
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-medium">
                            Channel: {item.flaggedLocation.sessionType}
                          </div>
                        </div>

                        {/* 2. Why Flagged */}
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              Why It Was Flagged (Trigger Reason)
                            </span>
                            <p className="text-amber-950 font-bold text-xs leading-relaxed">
                              {item.flagTriggerReason}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-amber-200/60 text-[10px] text-amber-800 font-medium">
                            Category: <strong className="font-bold">{item.category}</strong>
                          </div>
                        </div>

                        {/* 3. Interception Location & Grounding */}
                        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 space-y-2 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                              Curriculum Location & Grounding
                            </span>
                            <p className="text-slate-800 font-medium text-xs">
                              <strong className="text-blue-900 block font-bold mb-0.5">{item.flaggedLocation.curriculumModule}</strong>
                              <span className="text-slate-500 block text-[11px]">{item.flaggedLocation.syllabusReference}</span>
                            </p>
                          </div>
                          <div className="pt-2 border-t border-blue-200/60 text-[10px] text-blue-700 font-mono font-medium flex items-center justify-between">
                            <span>{item.verificationReport.confidenceScore}</span>
                            <span className="text-slate-400">{item.flaggedLocation.interceptedAt.split(' ')[1]} IST</span>
                          </div>
                        </div>
                      </div>

                      {/* Action & Resolution Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.status === 'Grounded & Resolved' ? (
                            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Grounded & Verified by Faculty
                            </span>
                          ) : (
                            <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              Pending Faculty Review
                            </span>
                          )}

                          <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                            Engine: {item.flaggedLocation.detectionEngine.split('·')[0]}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelectedAuditReport(item)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>Inspect Full Audit Dossier</span>
                          </button>

                          {item.status !== 'Grounded & Resolved' && (
                            <>
                              <button
                                onClick={() => issueStudentAdvisory(item)}
                                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Dispatches an academic warning to student's institutional ISU email"
                              >
                                <Send className="w-3.5 h-3.5 text-amber-700" />
                                <span>Send Advisory</span>
                              </button>

                              <button
                                onClick={() => resolveAuditFlag(item.id)}
                                className="gold-button px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Resolve & Ground</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ================= TAB 3: CURRICULUM & COURSE CONTROL ================= */}
          {activeTab === 'curriculum' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Header Info Banner */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-sans text-lg font-extrabold text-slate-900">
                    B.Tech CSE Curriculum & Course Management
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse all 8 Semesters, audit syllabus grounding rules, and enforce exam locks per course.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    disabled={syncingCourses}
                    onClick={handleSyncCoursesToFirestore}
                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    title="Upload all courses and modules to Cloud Firestore 'courses' collection"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{syncingCourses ? 'Syncing to Cloud...' : 'Sync Courses to Cloud'}</span>
                  </button>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-full border border-emerald-200">
                    ✓ Synced with Student Portal
                  </span>
                </div>
              </div>

              {syncCoursesResult && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>{syncCoursesResult}</span>
                </div>
              )}

              {/* 8 Semesters Navigation Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs no-scrollbar">
                {SEMESTERS_DATA.map((sem) => (
                  <button
                    key={sem.id}
                    onClick={() => {
                      setAdminSemester(sem);
                      if (sem.subjects.length > 0) setAdminSubject(sem.subjects[0]);
                    }}
                    className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      adminSemester.id === sem.id
                        ? 'bg-[#ED7D31] text-white border-[#ED7D31] shadow-md shadow-[#ED7D31]/20'
                        : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sem.name} <span className="opacity-70 text-[10px]">({sem.subjects.length})</span>
                  </button>
                ))}
              </div>

              {/* Selected Semester Subjects Explorer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {adminSemester.subjects.map((subj) => (
                  <div
                    key={subj.id}
                    onClick={() => setAdminSubject(subj)}
                    className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                      adminSubject.id === subj.id
                        ? 'bg-amber-50/40 border-[#ED7D31] ring-2 ring-[#ED7D31]/20 shadow-md'
                        : 'bg-white border-slate-200/90 hover:border-amber-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-[#ED7D31] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {subj.code}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {subj.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                        {subj.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {subj.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{subj.units} Syllabus Units</span>
                      <span className="text-[#ED7D31] flex items-center gap-1 text-[11px]">
                        Inspect →
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Subject Detail & Exam Lock Controller Card */}
              {adminSubject && (
                <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-[#ED7D31] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {adminSubject.code}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{adminSemester.name}</span>
                      </div>
                      <h3 className="font-sans text-xl font-extrabold text-slate-900">
                        {adminSubject.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{adminSubject.desc}</p>
                    </div>

                    <button
                      onClick={() => {
                        setNewCourseName(`${adminSubject.name} (${adminSubject.code})`);
                        setShowAddLockModal(true);
                      }}
                      className="gold-button px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md self-start lg:self-center"
                    >
                      <Lock className="w-4 h-4 text-white" />
                      <span>Lock Exam Window for {adminSubject.code}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <BookOpen className="w-4 h-4 text-[#ED7D31]" />
                        <span>Approved Faculty Textbook References</span>
                      </div>
                      <ul className="space-y-2 text-slate-600 font-medium">
                        <li className="flex items-center gap-2">• Standard University Reference Edition (7th Ed)</li>
                        <li className="flex items-center gap-2">• Approved Department Lecture Slides & Problem Sets</li>
                      </ul>
                    </div>

                    <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>AI Grounding & Socratic Rules</span>
                      </div>
                      <ul className="space-y-2 text-slate-600 font-medium">
                        <li className="flex items-center gap-2">• Answers grounded in 5 core syllabus units</li>
                        <li className="flex items-center gap-2">• Anti-cheat exam lockout protocol synced</li>
                      </ul>
                    </div>
                  </div>

                  {/* Clean Notes & AI Broadcast Gateway */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ED7D31] to-amber-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#ED7D31] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-amber-200">
                              Dedicated Notes Studio
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">Auto-Synthesize & Email</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">
                            Upload Notes & Broadcast AI Study Guides for {adminSubject.name}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Use the dedicated 4-step studio to upload PDFs, generate structured revision notes, and broadcast to student dashboards and emails.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadSemester(adminSemester);
                          setUploadSubject(adminSubject);
                          setActiveTab('notes_upload');
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-[#ED7D31] hover:bg-orange-600 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-[#ED7D31]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Open Notes Studio</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Indexed Grounded Documents Repository List */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#ED7D31]" />
                          <span>Indexed Syllabus Documents for {adminSubject.code} ({uploadedSyllabusDocs.length})</span>
                        </span>
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Grounding Active</span>
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-xs">
                        {uploadedSyllabusDocs.map((doc) => (
                          <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-[#ED7D31] flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-xs text-slate-900 leading-snug">{doc.name}</h5>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                                  <span>{doc.size}</span>
                                  <span>•</span>
                                  <span>{doc.units}</span>
                                  <span>•</span>
                                  <span className="font-mono text-slate-400">Indexed {doc.date}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleOpenBroadcastModal(doc)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#ED7D31] hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                title="Generate AI Revision Notes & Broadcast to Semester Students"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Generate AI Notes & Broadcast</span>
                              </button>

                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold">
                                ✓ Grounded
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadedSyllabusDocs(prev => prev.filter(d => d.id !== doc.id));
                                  setAuditNotificationToast(`🗑️ Removed document "${doc.name}" from grounding index.`);
                                  setTimeout(() => setAuditNotificationToast(''), 4000);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove from index"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: DEDICATED NOTES UPLOAD & STUDENT AI BROADCAST STUDIO               */}
          {/* ========================================================================= */}
          {activeTab === 'notes_upload' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Studio Hero Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#ED7D31]/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#ED7D31] text-white text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
                        Faculty Studio
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold border border-amber-400/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>AI Notes Synthesizer</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-indigo-400/20 text-indigo-300 text-[10px] font-extrabold border border-indigo-400/30 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-indigo-400" />
                        <span>Instant Email Dispatch</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Faculty Notes Upload & Student AI Broadcast Studio
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Upload course PDFs, lecture slides, or question banks. The Socratic AI engine synthesizes key concepts, formulas, and high-yield exam Q&A into a student revision guide, broadcasting it directly to student dashboards and institutional mailboxes.
                    </p>
                  </div>

                  {/* Fast Action & Cohort Stats Pill */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleQuickDemoUpload}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-[#ED7D31] to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title="Instantly simulate uploading CS204 Unit 3/4 Notes for presentation"
                    >
                      <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                      <span>⚡ 1-Click Demo Upload (for Sir)</span>
                    </button>

                    <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between gap-3 text-slate-300">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#ED7D31]" />
                          <span>Active Cohort:</span>
                        </span>
                        <span className="font-bold text-white">42 Enrolled Students</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Inbox className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Student Mailboxes:</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">@isu.ac.in Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* STEP 1: SELECT TARGET SEMESTER & COURSE                      */}
              {/* ============================================================= */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ED7D31] to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      1
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 leading-tight">
                        Step 1: Select Target Semester & Course
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose the target student cohort who will receive the generated notes & email broadcast.
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#ED7D31] text-[11px] font-black self-start sm:self-center">
                    Target: {uploadSemester.name} › {uploadSubject.code}
                  </span>
                </div>

                {/* Semester Selector Pills (1 to 8) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Select Academic Semester:
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {SEMESTERS_DATA.map((sem) => {
                      const isSelected = uploadSemester.id === sem.id;
                      return (
                        <button
                          key={sem.id}
                          type="button"
                          onClick={() => {
                            setUploadSemester(sem);
                            setUploadSubject(sem.subjects[0]);
                          }}
                          className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#ED7D31] text-white shadow-md shadow-[#ED7D31]/30 ring-2 ring-[#ED7D31]/20 scale-102'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                          }`}
                        >
                          <span>{sem.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {sem.subjects.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Course Grid for the Selected Semester */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Select Course in {uploadSemester.name}:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {uploadSemester.subjects.map((sub) => {
                      const isSubSelected = uploadSubject.code === sub.code;
                      return (
                        <button
                          key={sub.code}
                          type="button"
                          onClick={() => setUploadSubject(sub)}
                          className={`p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 border ${
                            isSubSelected
                              ? 'bg-amber-50/70 border-[#ED7D31] ring-2 ring-[#ED7D31]/25 shadow-sm'
                              : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-extrabold text-[#ED7D31] bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                              {sub.code}
                            </span>
                            {isSubSelected && (
                              <span className="w-5 h-5 rounded-full bg-[#ED7D31] text-white flex items-center justify-center text-[10px]">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">{sub.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{sub.units} Units • {sub.category || 'Core'}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* STEP 2: DRAG-AND-DROP FILE UPLOAD STUDIO (SUBJECT-SPECIFIC) */}
              {/* ============================================================= */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ED7D31] to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      2
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 leading-tight">
                        Step 2: Upload Lecture Notes / Syllabus Document for {uploadSubject.code}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Drop documents for <strong>{uploadSubject.name}</strong> to trigger text extraction and AI revision notes synthesis.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-[#ED7D31] font-mono bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 font-bold self-start sm:self-center">
                    Target: <strong>{uploadSubject.name} ({uploadSubject.code})</strong>
                  </span>
                </div>

                {/* Dropzone Container */}
                <div className="border-2 border-dashed border-amber-300 hover:border-[#ED7D31] bg-amber-50/20 hover:bg-amber-50/40 rounded-3xl p-7 text-center transition-all duration-200 group relative">
                  <input
                    type="file"
                    id="dedicated-notes-upload-input"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleSimulateFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <label
                    htmlFor="dedicated-notes-upload-input"
                    className="flex flex-col items-center justify-center cursor-pointer space-y-3"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 text-[#ED7D31] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-8 h-8" />
                    </div>

                    <div>
                      <p className="font-black text-sm sm:text-base text-slate-900">
                        Drag & drop PDF or lecture notes for {uploadSubject.name} ({uploadSubject.code})
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        or <span className="text-[#ED7D31] underline font-extrabold">browse files from computer</span> (PDF, DOCX, TXT up to 50MB)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-medium text-slate-500">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">✓ Socratic Text Extraction</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">✓ Formula & Key Terms</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">✓ Viva & Exam Q&A</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">✓ Direct Email Dispatch</span>
                    </div>
                  </label>

                  {/* Subject-Wise Pre-configured Demo PDFs Section */}
                  <div className="mt-5 pt-5 border-t border-amber-200/60 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#ED7D31]" />
                        <span>Pre-configured Demo PDFs for {uploadSubject.name} ({uploadSubject.code}):</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleQuickDemoUpload()}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#ED7D31] hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>⚡ 1-Click Demo Upload for {uploadSubject.code}</span>
                      </button>
                    </div>

                    {/* Grid of Clickable Demo PDFs for the Selected Subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                      {getDemoPDFsForSubject(uploadSubject).map((demoPdf) => (
                        <button
                          key={demoPdf.id}
                          type="button"
                          onClick={() => handleQuickDemoUpload(demoPdf)}
                          className="p-3 bg-white hover:bg-amber-50/60 rounded-2xl border border-amber-200/90 shadow-2xs hover:shadow-xs transition-all text-left flex items-center justify-between gap-3 group/item cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#ED7D31] flex items-center justify-center flex-shrink-0 border border-amber-200">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <h5 className="font-extrabold text-xs text-slate-900 truncate group-hover/item:text-[#ED7D31] transition-colors">
                                {demoPdf.name}
                              </h5>
                              <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                {demoPdf.size} • {demoPdf.units}
                              </p>
                            </div>
                          </div>

                          <span className="px-2 py-1 rounded-xl bg-amber-100/70 text-[#ED7D31] text-[10px] font-extrabold flex items-center gap-1 flex-shrink-0 group-hover/item:bg-[#ED7D31] group-hover/item:text-white transition-colors">
                            <Zap className="w-3 h-3" />
                            <span>Upload</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upload Progress Bar */}
                {uploadProgress !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-white rounded-2xl border border-amber-200 shadow-md space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 text-slate-800">
                        <FileUp className="w-4 h-4 text-[#ED7D31] animate-bounce" />
                        <span>{uploadStatusText}</span>
                      </div>
                      <span className="font-mono font-black text-[#ED7D31] text-sm">{uploadProgress}%</span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-[#ED7D31] to-orange-600 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ============================================================= */}
              {/* STEP 3: DOCUMENT REPOSITORY & AI GENERATOR (SUBJECT-SPECIFIC)*/}
              {/* ============================================================= */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ED7D31] to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      3
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 leading-tight">
                        Step 3: Generate AI Notes & Broadcast for {uploadSubject.code}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Synthesize uploaded documents for <strong>{uploadSubject.name}</strong> into comprehensive student revision guides.
                      </p>
                    </div>
                  </div>

                  {/* Filter Switcher: Current Course vs All Courses */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setDocsSubjectFilter('current')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        docsSubjectFilter === 'current'
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      🎯 {uploadSubject.code} Only ({uploadedSyllabusDocs.filter(d => d.courseCode === uploadSubject.code).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocsSubjectFilter('all')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        docsSubjectFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      🌐 All Courses ({uploadedSyllabusDocs.length})
                    </button>
                  </div>
                </div>

                {/* Filtered Document Cards List */}
                {(() => {
                  const filteredDocs = docsSubjectFilter === 'current'
                    ? uploadedSyllabusDocs.filter(d => d.courseCode === uploadSubject.code)
                    : uploadedSyllabusDocs;

                  if (filteredDocs.length === 0) {
                    return (
                      <div className="p-8 text-center bg-slate-50/70 border border-dashed border-slate-300 rounded-3xl space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#ED7D31] flex items-center justify-center mx-auto border border-amber-200">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm text-slate-900">
                            No documents ingested for {uploadSubject.name} ({uploadSubject.code}) yet
                          </h5>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Click below to immediately ingest an official sample PDF for {uploadSubject.code}.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickDemoUpload()}
                          className="px-4 py-2 rounded-xl bg-[#ED7D31] hover:bg-orange-600 text-white text-xs font-black shadow-md cursor-pointer transition-all inline-flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>⚡ Ingest Sample PDF for {uploadSubject.code}</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-xs">
                      {filteredDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                        >
                          <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-[#ED7D31] flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-[#ED7D31] text-white font-mono text-[10px] font-black">
                                  {doc.courseCode}
                                </span>
                                <h5 className="font-black text-xs sm:text-sm text-slate-900">{doc.name}</h5>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium mt-1">
                                <span>{doc.size}</span>
                                <span>•</span>
                                <span>{doc.units}</span>
                                <span>•</span>
                                <span className="font-mono text-slate-400">Uploaded {doc.date}</span>
                                <span>•</span>
                                <span className="text-emerald-700 font-bold">✓ Vector Indexed</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
                            <button
                              type="button"
                              onClick={() => handleOpenBroadcastModal(doc)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-[#ED7D31] to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Generate AI Notes & Broadcast ({doc.courseCode})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setUploadedSyllabusDocs(prev => prev.filter(d => d.id !== doc.id));
                                setAuditNotificationToast(`🗑️ Removed document "${doc.name}" from repository.`);
                                setTimeout(() => setAuditNotificationToast(''), 4000);
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* ============================================================= */}
              {/* STEP 4: ACTIVE BROADCASTS & LIVE EMAIL DELIVERY LOG          */}
              {/* ============================================================= */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ED7D31] to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      4
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 leading-tight">
                        Step 4: Live Broadcast History & Email Delivery Logs
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Audit dispatched study guides, student portal notifications, and university mail delivery.
                      </p>
                    </div>
                  </div>

                  {/* Filter Switcher: Current Course vs All Courses */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setBroadcastSubjectFilter('current')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        broadcastSubjectFilter === 'current'
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      🎯 {uploadSubject.code} Only ({broadcastHistory.filter(b => b.subjectCode === uploadSubject.code).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastSubjectFilter('all')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        broadcastSubjectFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      🌐 All Courses ({broadcastHistory.length})
                    </button>
                  </div>
                </div>

                {/* Filtered Broadcast Cards List */}
                {(() => {
                  const filteredBroadcasts = broadcastSubjectFilter === 'current'
                    ? broadcastHistory.filter(b => b.subjectCode === uploadSubject.code)
                    : broadcastHistory;

                  if (filteredBroadcasts.length === 0) {
                    return (
                      <div className="p-8 text-center bg-slate-50/70 border border-dashed border-slate-300 rounded-3xl space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
                          <Inbox className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm text-slate-900">
                            No study guides broadcasted for {uploadSubject.name} ({uploadSubject.code}) yet
                          </h5>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Click "Generate AI Notes & Broadcast" in Step 3 above to dispatch revision notes and emails to students.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filteredBroadcasts.map((b) => (
                        <div
                          key={b.id}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-[#ED7D31] text-white font-mono text-[10px] font-extrabold">
                                {b.subjectCode}
                              </span>
                              <h4 className="font-black text-xs sm:text-sm text-slate-900">{b.title}</h4>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                                ✓ Dispatched
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-1">{b.moduleOverview}</p>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1 text-slate-700">
                                <Users className="w-3.5 h-3.5 text-[#ED7D31]" />
                                <span>{b.recipientsCount} Students ({b.semester})</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-indigo-700">
                                <Mail className="w-3.5 h-3.5" />
                                <span>Emails sent to @isu.ac.in</span>
                              </span>
                              <span>•</span>
                              <span className="font-mono text-slate-400">Broadcasted {b.broadcastDate || b.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setGeneratedNotesPreview(b);
                                setBroadcastModalDoc({ name: b.documentSource || b.pdfSource, size: '2.4 MB' });
                                setIsGeneratingNotes(false);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Full Notes</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* Schedule Exam Lock Modal with 30-Min Buffer & Precise Date/Time */}
      {showAddLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-[#ED7D31] flex items-center justify-center border border-amber-200">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Schedule Course Examination Lock
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Enforces automatic 30-min pre & post exam portal lockout
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddLockModal(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLock} className="space-y-4 text-xs font-medium">
              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Testing Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const s = new Date(now.getTime() - 15 * 60 * 1000);
                      const e = new Date(now.getTime() + 45 * 60 * 1000);
                      setLockDate(getTodayDateString());
                      setLockStartTime(getTimeString(s));
                      setLockEndTime(getTimeString(e));
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 text-[11px] transition-colors cursor-pointer"
                  >
                    ⚡ Test Active Lock Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const s = new Date(now.getTime() + 45 * 60 * 1000);
                      const e = new Date(now.getTime() + 165 * 60 * 1000);
                      setLockDate(getTodayDateString());
                      setLockStartTime(getTimeString(s));
                      setLockEndTime(getTimeString(e));
                    }}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200 text-[11px] transition-colors cursor-pointer"
                  >
                    ⏰ Upcoming in 45 Mins
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLockDate(getTodayDateString());
                      setLockStartTime('10:00');
                      setLockEndTime('13:00');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] transition-colors cursor-pointer"
                  >
                    Morning 10:00 – 13:00
                  </button>
                </div>
              </div>

              {/* Target Course */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Select Target Course / Subject:
                </label>
                <select
                  value={lockCourse}
                  onChange={(e) => setLockCourse(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#ED7D31]"
                >
                  {SEMESTERS_DATA.flatMap(sem => sem.subjects.map(s => `${s.name} (${s.code})`)).map((cName, idx) => (
                    <option key={idx} value={cName}>{cName}</option>
                  ))}
                </select>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Exam Date:
                  </label>
                  <input
                    type="date"
                    value={lockDate}
                    onChange={(e) => setLockDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#ED7D31]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Start Time:
                  </label>
                  <input
                    type="time"
                    value={lockStartTime}
                    onChange={(e) => setLockStartTime(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#ED7D31]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    End Time:
                  </label>
                  <input
                    type="time"
                    value={lockEndTime}
                    onChange={(e) => setLockEndTime(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#ED7D31]"
                  />
                </div>
              </div>

              {/* Buffer Visual Preview Card */}
              {(() => {
                const sDt = parseDateTime(lockDate, lockStartTime);
                const eDt = parseDateTime(lockDate, lockEndTime);
                const preLock = sDt ? new Date(sDt.getTime() - 30 * 60 * 1000) : null;
                const postLock = eDt ? new Date(eDt.getTime() + 30 * 60 * 1000) : null;

                return (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>Calculated Lockout Window (±30m Rule)</span>
                      <span className="bg-amber-200/60 text-[#D96618] px-2 py-0.5 rounded-md font-mono text-[10px]">
                        Auto-Enforced
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Lock Begins</span>
                        <strong className="text-rose-600 font-mono text-xs">
                          {preLock ? formatTime12Hr(getTimeString(preLock)) : '--'}
                        </strong>
                        <span className="text-[9px] text-rose-500 block font-medium">30m pre-exam</span>
                      </div>

                      <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Exam Session</span>
                        <strong className="text-slate-800 font-mono text-xs">
                          {formatTime12Hr(lockStartTime)}
                        </strong>
                        <span className="text-[9px] text-slate-500 block font-medium">Paper Starts</span>
                      </div>

                      <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Lock Releases</span>
                        <strong className="text-emerald-700 font-mono text-xs">
                          {postLock ? formatTime12Hr(getTimeString(postLock)) : '--'}
                        </strong>
                        <span className="text-[9px] text-emerald-600 block font-medium">30m post-exam</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-amber-900/80 leading-tight">
                      During this continuous window, all student AI prompts, chat assistants, and solution generators for this cohort are suppressed with honor-code advisory warnings.
                    </p>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLockModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md"
                >
                  Save & Enforce Schedule
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ================= STUDENT PERFORMANCE DOSSIER MODAL ================= */}
      {selectedStudentModal && (() => {
        const emailData = buildStudentPerformanceEmail(selectedStudentModal, adminUser);
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Top Bar Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ED7D31] to-amber-500 text-white font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
                  {selectedStudentModal.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-extrabold text-xl text-slate-900 tracking-tight">
                      {selectedStudentModal.name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      selectedStudentModal.performanceStatus === 'Top Performer'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : selectedStudentModal.performanceStatus === 'On Track'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {selectedStudentModal.performanceStatus}
                    </span>
                  </div>
                  <a
                    href={emailData.mailtoUrl}
                    onClick={() => {
                      navigator.clipboard?.writeText(`Subject: ${emailData.subject}\n\n${emailData.body}`);
                      setAuditNotificationToast(`📧 Opening mail client for ${selectedStudentModal.name}... Pre-filled subject & body ready to send.`);
                      setTimeout(() => setAuditNotificationToast(''), 4500);
                    }}
                    title="Click to compose pre-filled email in your mail app"
                    className="text-xs font-mono text-[#ED7D31] hover:underline font-semibold mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{selectedStudentModal.email}</span>
                    <ExternalLink className="w-3 h-3 text-[#ED7D31]/70" />
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedStudentModal.department} · {selectedStudentModal.semester} ({selectedStudentModal.batchYear} Batch)</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedStudentModal(null);
                  setShowEmailPreview(false);
                }}
                className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Metrics Quad Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Course Progress</span>
                <p className="text-2xl font-black text-slate-900">{selectedStudentModal.completionRate}%</p>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedStudentModal.completionRate}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Test Average</span>
                <p className="text-2xl font-black text-amber-600">{selectedStudentModal.avgTestScore}%</p>
                <span className="text-[10px] text-slate-400 font-medium block">Grade A Assessment</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance</span>
                <p className="text-2xl font-black text-slate-900">{selectedStudentModal.attendance}%</p>
                <span className="text-[10px] text-emerald-600 font-semibold block">Regular Status</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Queries</span>
                <p className="text-2xl font-black text-slate-900">{selectedStudentModal.aiQueriesCount}</p>
                <span className="text-[10px] text-slate-400 font-medium block">Socratic Prompts</span>
              </div>
            </div>

            {/* Recent Assessments Breakdown */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Recent Test & Quiz Performance Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 block">Quiz 1: SQL & DB Concepts</span>
                  <p className="text-lg font-black text-slate-900">{selectedStudentModal.quiz1Score} <span className="text-xs text-slate-500 font-normal">/ 20</span></p>
                  <p className="text-[10px] font-semibold text-emerald-700">Passed ({(selectedStudentModal.quiz1Score/20*100).toFixed(0)}%)</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
                  <span className="text-[11px] font-bold text-blue-900 block">Mid-Term Assessment</span>
                  <p className="text-lg font-black text-slate-900">{selectedStudentModal.midtermScore}%</p>
                  <p className="text-[10px] font-semibold text-blue-700">Highest Score Range</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-900 block">Practical Lab Evaluation</span>
                  <p className="text-lg font-black text-slate-900">{selectedStudentModal.labScore} <span className="text-xs text-slate-500 font-normal">/ 50</span></p>
                  <p className="text-[10px] font-semibold text-indigo-700">Validated by Faculty</p>
                </div>
              </div>
            </div>

            {/* Enrolled Courses Progress */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#ED7D31]" />
                Enrolled Semester Courses Progress
              </h4>
              <div className="space-y-2">
                {selectedStudentModal.enrolledSubjects.map((sub, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-[10px] text-slate-700 shadow-2xs">
                        {i + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#ED7D31] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {sub.code}
                        </span>
                        <h5 className="font-bold text-xs text-slate-900">{sub.name}</h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900">{sub.completion}%</span>
                        <span className="text-[10px] text-slate-400 block">Completed</span>
                      </div>
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-[#ED7D31] rounded-full" style={{ width: `${sub.completion}%` }} />
                      </div>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl font-mono font-bold text-[#ED7D31]">
                        {sub.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Firestore Quiz Assessments */}
            {(() => {
              const studentQuizzes = allQuizSubmissions.filter(q => q.studentEmail === selectedStudentModal.email);
              return (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Cloud Quiz & Unit Assessment Logs ({studentQuizzes.length})
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Firestore: quiz_submissions
                    </span>
                  </div>

                  {studentQuizzes.length > 0 ? (
                    <div className="space-y-2">
                      {studentQuizzes.map((quiz, qIdx) => (
                        <div key={quiz.id || qIdx} className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                                {quiz.courseCode}
                              </span>
                              <strong className="text-slate-900">{quiz.courseName}</strong>
                              <span className="text-slate-400">· {quiz.unitTitle}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono">
                              Doc: {quiz.id} · Submitted: {quiz.submittedAtStr || 'Recent'}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className={`px-2.5 py-1 rounded-xl font-bold font-mono text-xs ${
                              quiz.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {quiz.score} / {quiz.totalQuestions} ({quiz.percentage}%)
                            </span>
                            <span className="text-[10px] text-emerald-700 block font-semibold">{quiz.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      No cloud assessment submissions recorded yet for {selectedStudentModal.name}. Any quizzes completed via the student portal will instantly sync here from Cloud Firestore.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Live Firestore Proctored Exam Attempts */}
            {(() => {
              const studentExams = allExamAttempts.filter(e => e.studentEmail === selectedStudentModal.email);
              return (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      Proctored Exam Reports & Submissions ({studentExams.length})
                    </h4>
                    <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Firestore: exam_attempts
                    </span>
                  </div>

                  {studentExams.length > 0 ? (
                    <div className="space-y-2">
                      {studentExams.map((ex, eIdx) => (
                        <div key={ex.id || eIdx} className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200 text-[10px]">
                                {ex.examCode}
                              </span>
                              <strong className="text-slate-900">{ex.examName}</strong>
                              <span className="text-slate-500 font-medium">({ex.percentage}%)</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                              <span>Sec A: {ex.sectionalScores?.secA || 0}/12</span>
                              <span>Sec B: {ex.sectionalScores?.secB || 0}/10</span>
                              <span>Sec C: {ex.sectionalScores?.secC || 0}/8</span>
                              <span>• Flags: {ex.tabSwitchViolations || 0}</span>
                              <span className="font-mono">Doc: {ex.id?.slice(0, 8)}...</span>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-1">
                            <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                              ex.letterGrade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                              ex.letterGrade === 'A' ? 'bg-teal-100 text-teal-800' :
                              ex.letterGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              Grade {ex.letterGrade || 'A'} ({ex.totalMarksObtained}/{ex.maxMarks || 30})
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {ex.submittedAtFormatted || 'Recent'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      No proctored exam attempts logged yet for {selectedStudentModal.name}. When {selectedStudentModal.name} takes an exam in the student portal, their multi-format evaluation and honor guard integrity log will automatically record here.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Pre-written Email Preview Drawer */}
            {showEmailPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#ED7D31]" />
                    Pre-Written Email Content (Ready to Dispatch)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(`Subject: ${emailData.subject}\n\n${emailData.body}`);
                      setCopiedEmailText(true);
                      setTimeout(() => setCopiedEmailText(false), 2200);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    {copiedEmailText ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                    <span>{copiedEmailText ? 'Copied to Clipboard!' : 'Copy Entire Email'}</span>
                  </button>
                </div>

                <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                  <p className="text-slate-600"><strong className="text-slate-900 font-sans">To:</strong> {selectedStudentModal.email}</p>
                  <p className="text-slate-600"><strong className="text-slate-900 font-sans">Subject:</strong> {emailData.subject}</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 max-h-48 overflow-y-auto font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {emailData.body}
                </div>
              </motion.div>
            )}

            {/* Modal Bottom Action Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* 1-Click Native Mail Client (Apple Mail / Outlook) */}
                <a
                  href={emailData.mailtoUrl}
                  onClick={() => {
                    navigator.clipboard?.writeText(`Subject: ${emailData.subject}\n\n${emailData.body}`);
                    setAuditNotificationToast(`📧 Mail client launched for ${selectedStudentModal.name}! Subject and body are pre-filled — just click Send.`);
                    setTimeout(() => setAuditNotificationToast(''), 4500);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  title="Opens Mail.app or Outlook with To, Subject & Pre-written content pre-filled. Just click Send!"
                >
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>Email Performance Alert</span>
                </a>

                {/* 1-Click Web Gmail Compose */}
                <a
                  href={emailData.gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    navigator.clipboard?.writeText(`Subject: ${emailData.subject}\n\n${emailData.body}`);
                    setAuditNotificationToast(`📬 Gmail Web opened for ${selectedStudentModal.name} with pre-filled content! Just click Send.`);
                    setTimeout(() => setAuditNotificationToast(''), 4500);
                  }}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#ED7D31] border border-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Opens Gmail in browser with To, Subject & Pre-written body populated"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#ED7D31]" />
                  <span>Open in Gmail Web</span>
                </a>

                {/* Preview / Copy Toggle */}
                <button
                  type="button"
                  onClick={() => setShowEmailPreview(!showEmailPreview)}
                  className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Preview pre-written email body"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showEmailPreview ? 'Hide Draft' : 'Preview Pre-written Content'}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedStudentModal(null);
                  setShowEmailPreview(false);
                }}
                className="w-full sm:w-auto gold-button px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Student Report
              </button>
            </div>
          </motion.div>
        </div>
        );
      })()}

      {/* ================= FORENSIC AI AUDIT DOSSIER MODAL ================= */}
      {selectedAuditReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-6 my-8 max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-[#ED7D31] text-white flex items-center justify-center font-black text-xl shadow-xs">
                  {selectedAuditReport.studentName.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#ED7D31] bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {selectedAuditReport.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        selectedAuditReport.severity === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : selectedAuditReport.severity === 'High'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : selectedAuditReport.severity === 'Moderate'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {selectedAuditReport.severity} Severity
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedAuditReport.timestamp}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mt-1">
                    {selectedAuditReport.studentName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Roll: <strong className="text-slate-700">{selectedAuditReport.rollNo}</strong> · Email: <strong className="text-slate-700">{selectedAuditReport.studentEmail}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedAuditReport(null);
                  setFacultyAuditNote('');
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Telemetry Overview Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course Context</span>
                <p className="font-extrabold text-slate-900 truncate">{selectedAuditReport.course.split(':')[0]}</p>
                <span className="text-[10px] text-slate-500 block">{selectedAuditReport.semester}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Session Channel</span>
                <p className="font-extrabold text-slate-900 truncate">{selectedAuditReport.flaggedLocation.sessionType}</p>
                <span className="text-[10px] text-slate-500 block">Authenticated ISU Session</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardrail Engine</span>
                <p className="font-extrabold text-slate-900 truncate">{selectedAuditReport.flaggedLocation.detectionEngine.split('·')[0]}</p>
                <span className="text-[10px] text-emerald-600 font-bold block">Active Interception</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detection Confidence</span>
                <p className="font-extrabold text-slate-900 truncate">{selectedAuditReport.verificationReport.confidenceScore}</p>
                <span className="text-[10px] text-slate-500 font-mono block">{selectedAuditReport.flaggedLocation.tokenUsage}</span>
              </div>
            </div>

            {/* Detailed Forensic Triad: Prompt vs Reason vs AI Output */}
            <div className="space-y-4 text-xs">
              {/* Box 1: Intercepted Prompt */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#ED7D31]" />
                    Verbatim Student Query (Intercepted Input)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Channel: {selectedAuditReport.flaggedLocation.sessionType}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-slate-900 font-medium text-xs sm:text-sm italic leading-relaxed">
                  "{selectedAuditReport.studentQuery}"
                </div>
              </div>

              {/* Box 2: Trigger Reason (Why Flagged) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Why This Was Flagged in Audit Log (Integrity Deviation)
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                    Category: {selectedAuditReport.category}
                  </span>
                </div>
                <p className="text-amber-950 font-bold text-xs sm:text-sm leading-relaxed">
                  {selectedAuditReport.flagTriggerReason}
                </p>
                <p className="text-[11px] text-amber-800 font-medium pt-1 border-t border-amber-200/60">
                  Grounding Alignment: <strong className="text-amber-950">{selectedAuditReport.verificationReport.syllabusAlignment}</strong>
                </p>
              </div>

              {/* Box 3: Model Action & Socratic Mitigation */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Model Guardrail Action & Socratic Output
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800">
                    Direct Solution Suppressed
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-emerald-200/80 text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
                  {selectedAuditReport.aiModelResponse}
                </div>
              </div>
            </div>

            {/* Curriculum Location & Syllabus Grounding */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Curriculum Module & Syllabus Reference
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Course & Module</span>
                  <p className="font-bold text-xs text-slate-900">{selectedAuditReport.course}</p>
                  <p className="text-[11px] text-blue-800 font-medium mt-0.5">{selectedAuditReport.flaggedLocation.curriculumModule}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Syllabus Citation</span>
                  <p className="font-medium text-[11px] text-slate-700">{selectedAuditReport.flaggedLocation.syllabusReference}</p>
                </div>
              </div>
            </div>

            {/* Chronological Audit Trail */}
            <div className="space-y-2 text-xs">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                Automated Incident Audit Trail
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 font-mono text-[11px]">
                {selectedAuditReport.verificationReport.auditTrail.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold w-20 flex-shrink-0">{item.time}</span>
                    <span className="text-slate-700">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Faculty Disposition & Resolution Actions */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">
                Faculty Disposition & Resolution Notes:
              </label>
              <textarea
                value={facultyAuditNote}
                onChange={(e) => setFacultyAuditNote(e.target.value)}
                placeholder="Enter faculty audit remarks (e.g. Socratic guidance verified, student counseled regarding quiz regulations)..."
                rows={2}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ED7D31]/30 focus:border-[#ED7D31]"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => issueStudentAdvisory(selectedAuditReport)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4 text-amber-700" />
                  <span>Dispatch Academic Advisory to Student</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {selectedAuditReport.status !== 'Grounded & Resolved' && (
                    <button
                      onClick={() => resolveAuditFlag(selectedAuditReport.id, facultyAuditNote)}
                      className="w-full sm:w-auto gold-button px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Mark Resolved</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedAuditReport(null);
                      setFacultyAuditNote('');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= SPRINT 4: AI STUDY NOTES GENERATOR & EMAIL BROADCAST MODAL ================= */}
      {broadcastModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-[#ED7D31] flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-[#ED7D31] uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Faculty AI Studio
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Automated Student Dispatch</span>
                  </div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                    Generate AI Study Notes & Email Broadcast
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-md">
                    Source: <span className="font-mono text-slate-700">{broadcastModalDoc.name}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setBroadcastModalDoc(null)}
                className="text-slate-400 hover:text-slate-900 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1">
              {/* Generating Animation State */}
              {isGeneratingNotes && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-200 text-[#ED7D31] flex items-center justify-center animate-bounce shadow-md">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      {generationStep === 1 && 'Scanning Document & Extracting Core Syllabus Topics...'}
                      {generationStep === 2 && 'Synthesizing High-Yield Concepts & Exam Formulas...'}
                      {generationStep === 3 && 'Formulating Viva Questions & Revision Cheat Sheet...'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Gemini Socratic Engine is converting raw PDF text into high-retention student revision notes.
                    </p>
                  </div>
                  <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-[#ED7D31] transition-all duration-500 rounded-full"
                      style={{ width: generationStep === 1 ? '35%' : generationStep === 2 ? '75%' : '98%' }}
                    />
                  </div>
                </div>
              )}

              {/* Generated Notes Preview State */}
              {!isGeneratingNotes && generatedNotesPreview && (
                <div className="space-y-4">
                  {/* Banner */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        Target Recipient Cohort
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {adminSemester.name} • {generatedNotesPreview.subjectName} ({generatedNotesPreview.subjectCode})
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Will be dispatched to <strong>42 verified student inboxes</strong> (`@isu.ac.in`) & published in their portal.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 self-start sm:self-center flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready to Broadcast</span>
                    </span>
                  </div>

                  {/* Note Title & Overview */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generated Note Title</span>
                    <h5 className="font-black text-sm text-slate-900">{generatedNotesPreview.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{generatedNotesPreview.moduleOverview}</p>
                  </div>

                  {/* 4 Preview Tabs */}
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
                    <button
                      onClick={() => setPreviewActiveTab('concepts')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        previewActiveTab === 'concepts' ? 'bg-[#ED7D31] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      💡 Key Concepts ({generatedNotesPreview.keyConcepts.length})
                    </button>
                    <button
                      onClick={() => setPreviewActiveTab('formulas')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        previewActiveTab === 'formulas' ? 'bg-[#ED7D31] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ⚡ Exam Formulas ({generatedNotesPreview.examFormulas.length})
                    </button>
                    <button
                      onClick={() => setPreviewActiveTab('exam_qa')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        previewActiveTab === 'exam_qa' ? 'bg-[#ED7D31] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      🎯 High-Yield Q&A ({generatedNotesPreview.highYieldExamQA.length})
                    </button>
                    <button
                      onClick={() => setPreviewActiveTab('cheatsheet')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        previewActiveTab === 'cheatsheet' ? 'bg-[#ED7D31] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      📝 1-Page Cheat Sheet
                    </button>
                  </div>

                  {/* Tab Content Display */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 min-h-[160px] text-xs space-y-3">
                    {previewActiveTab === 'concepts' && (
                      <div className="space-y-3">
                        {generatedNotesPreview.keyConcepts.map((kc, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-xs">
                            <h6 className="font-extrabold text-slate-900 text-xs">{kc.heading}</h6>
                            <p className="text-slate-600 leading-relaxed text-[11px]">{kc.summary}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {previewActiveTab === 'formulas' && (
                      <ul className="space-y-2 text-slate-700 font-mono text-[11px]">
                        {generatedNotesPreview.examFormulas.map((f, idx) => (
                          <li key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2 shadow-xs">
                            <span className="text-[#ED7D31] font-bold">⚡</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {previewActiveTab === 'exam_qa' && (
                      <div className="space-y-3">
                        {generatedNotesPreview.highYieldExamQA.map((qa, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                            <h6 className="font-extrabold text-[#ED7D31] text-xs">{qa.question}</h6>
                            <p className="text-slate-700 leading-relaxed text-[11px] font-medium">{qa.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {previewActiveTab === 'cheatsheet' && (
                      <ul className="space-y-1.5 text-slate-700 font-medium text-[11px]">
                        {generatedNotesPreview.quickCheatSheet.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ED7D31]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Simulated Institutional Email Dispatch Notification Card */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                        <Inbox className="w-4 h-4 text-indigo-600" />
                        <span>Simulated University Email Dispatch</span>
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">ISU Exchange Mailer</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1 font-mono text-[11px]">
                      <p className="text-slate-500"><strong>From:</strong> {adminUser?.name || 'Prof. Ananya Roy'} &lt;academic.notice@isu.ac.in&gt;</p>
                      <p className="text-slate-500 truncate"><strong>To:</strong> B.Tech CSE Semester 2 Cohort (42 student inboxes: `2024.xxx@isu.ac.in`)</p>
                      <p className="text-slate-900 font-bold"><strong>Subject:</strong> {generatedNotesPreview.emailSubject}</p>
                    </div>
                  </div>

                  {/* Dispatch Success Alert */}
                  {dispatchSuccessToast && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>{dispatchSuccessToast}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setBroadcastModalDoc(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Console
              </button>

              {!isGeneratingNotes && generatedNotesPreview && !dispatchSuccessToast && (
                <button
                  type="button"
                  disabled={isDispatchingEmails}
                  onClick={handleConfirmEmailBroadcast}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#ED7D31] hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isDispatchingEmails ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Dispatching Emails to 42 Students...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Broadcast Notes & Send Emails (42 Students)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

