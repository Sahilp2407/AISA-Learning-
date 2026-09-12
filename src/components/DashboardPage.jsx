import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RotateCcw
} from 'lucide-react';

// Complete University Engineering Curriculum Data by Semester
const SEMESTERS_DATA = [
  {
    id: 1,
    name: 'Semester 1',
    code: 'SEM-01',
    subjectCount: 8,
    progress: 0,
    color: 'from-amber-500/20 to-orange-500/10',
    subjects: [
      { id: 'cs101', name: 'Computer Science Foundations & Society - Law and Ethics - IT', code: 'CS101', units: 5, category: 'Core CS', desc: 'Ethics, digital law, societal impact and computing history.' },
      { id: 'cs102', name: 'SoftSkills - Communication Skills & Problem Solving', code: 'CS102', units: 4, category: 'Professional', desc: 'Technical articulation, active listening and structured analysis.' },
      { id: 'cs103', name: 'Mathematics', code: 'CS103', units: 5, category: 'Maths', desc: 'Set theory, propositional logic, differential calculus and matrices.' },
      { id: 'cs104', name: 'Git & GitHub Linkedin', code: 'CS104', units: 3, category: 'Tools', desc: 'Version control branching, open-source workflow and profile building.' },
      { id: 'cs105', name: 'Scratch Programming', code: 'CS105', units: 3, category: 'Foundations', desc: 'Event-driven visual logic, state variables and basic algorithms.' },
      { id: 'cs106', name: 'Python', code: 'CS106', units: 5, category: 'Programming', desc: 'Data structures, OOP, file handling, libraries and unit tests.' },
      { id: 'cs107', name: 'No Code Platform & Google Sheet', code: 'CS107', units: 3, category: 'Tools', desc: 'App automation, complex formulas, pivot models and data pipelines.' },
      { id: 'cs108', name: 'C++', code: 'CS108', units: 5, category: 'Programming', desc: 'Pointers, memory layout, classes, templates and STL containers.' }
    ]
  },
  {
    id: 2,
    name: 'Semester 2',
    code: 'SEM-02',
    subjectCount: 11,
    progress: 15,
    color: 'from-orange-500/20 to-amber-500/10',
    subjects: [
      { id: 'cs201', name: 'Java Programming', code: 'CS201', units: 5, category: 'Programming', desc: 'OOP, JVM internals, multithreading, concurrency and streams.' },
      { id: 'cs202', name: 'Computer Networking', code: 'CS202', units: 5, category: 'Core CS', desc: 'OSI layers, TCP/IP, routing algorithms, DNS, HTTP/3 and sockets.' },
      { id: 'cs203', name: 'Data Structures and Algorithm - I', code: 'CS203', units: 5, category: 'Core CS', desc: 'Arrays, linked lists, stacks, queues, hash maps and trees.' },
      { id: 'cs204', name: 'DBMS - SQL', code: 'CS204', units: 5, category: 'Core CS', desc: 'ER diagrams, SQL queries, normalization 3NF/BCNF, ACID & indexing.' },
      { id: 'cs205', name: 'HTML 5', code: 'CS205', units: 4, category: 'Web', desc: 'Accessible semantic structure, media APIs and canvas elements.' },
      { id: 'cs206', name: 'CSS 3', code: 'CS206', units: 4, category: 'Web', desc: 'Flexbox, CSS Grid, custom properties, animations and media queries.' },
      { id: 'cs207', name: 'Javascript', code: 'CS207', units: 5, category: 'Web', desc: 'Closures, promises, async/await, event loop and DOM API.' },
      { id: 'cs208', name: 'Design Thinking & Prototyping + UI/UX + Figma', code: 'CS208', units: 4, category: 'Design', desc: 'User flows, wireframes, design systems and usability testing.' },
      { id: 'cs209', name: 'How Products are built + Pricing Strategies and Implementing payment stack in your applications', code: 'CS209', units: 4, category: 'Product', desc: 'Product requirements, metrics, unit economics and API monetization.' },
      { id: 'cs210', name: 'Foreign Language German A1', code: 'CS210', units: 3, category: 'Language', desc: 'Conversational grammar, technical terms and dialogue comprehension.' },
      { id: 'cs211', name: 'Sem2_Student Project Building & Evaluation', code: 'CS211', units: 5, category: 'Projects', desc: 'Full-stack end-to-end prototype development and faculty viva.' }
    ]
  },
  {
    id: 3,
    name: 'Semester 3',
    code: 'SEM-03',
    subjectCount: 6,
    progress: 0,
    color: 'from-amber-500/20 to-yellow-500/10',
    subjects: [
      { id: 'cs301', name: 'Data Structures & Algorithms - II', code: 'CS301', units: 5, category: 'Core CS', desc: 'Graphs, BFS/DFS, Dijkstra, Dynamic Programming, Trie and AVL trees.' },
      { id: 'cs302', name: 'Operating Systems & Concurrency', code: 'CS302', units: 5, category: 'Core CS', desc: 'Processes, CPU scheduling, semaphores, deadlock and virtual memory.' },
      { id: 'cs303', name: 'Computer Architecture & Organisation', code: 'CS303', units: 5, category: 'Core CS', desc: 'Instruction sets, pipelining, cache hierarchy and RISC-V.' },
      { id: 'cs304', name: 'Probability & Statistics for Engineers', code: 'CS304', units: 4, category: 'Maths', desc: 'Distributions, Bayes theorem, hypothesis testing and Markov chains.' },
      { id: 'cs305', name: 'Backend Engineering with Node.js', code: 'CS305', units: 5, category: 'Web', desc: 'REST APIs, middleware, authentication, WebSockets and security.' },
      { id: 'cs306', name: 'Software Design Patterns & Clean Code', code: 'CS306', units: 4, category: 'Core CS', desc: 'SOLID principles, Singleton, Factory, Observer and Refactoring.' }
    ]
  },
  {
    id: 4,
    name: 'Semester 4',
    code: 'SEM-04',
    subjectCount: 6,
    progress: 0,
    color: 'from-orange-500/20 to-red-500/10',
    subjects: [
      { id: 'cs401', name: 'Design & Analysis of Algorithms', code: 'CS401', units: 5, category: 'Core CS', desc: 'Divide & conquer, greedy, NP-completeness and amortized analysis.' },
      { id: 'cs402', name: 'Theory of Computation & Automata', code: 'CS402', units: 5, category: 'Core CS', desc: 'DFA, NFA, Context-Free Grammars, Turing Machines and decidability.' },
      { id: 'cs403', name: 'Cloud Computing & Distributed Systems', code: 'CS403', units: 5, category: 'Cloud', desc: 'Microservices, Docker, Kubernetes, AWS architecture and CAP theorem.' },
      { id: 'cs404', name: 'Microprocessors & Embedded IoT', code: 'CS404', units: 4, category: 'Hardware', desc: '8086 architecture, interfacing, timers, interrupts and sensors.' },
      { id: 'cs405', name: 'Advanced React & Frontend Frameworks', code: 'CS405', units: 5, category: 'Web', desc: 'State machines, SSR, performance profiling and custom hooks.' },
      { id: 'cs406', name: 'Cybersecurity Fundamentals & Cryptography', code: 'CS406', units: 4, category: 'Security', desc: 'Symmetric/asymmetric keys, hashing, TLS and OWASP vulnerabilities.' }
    ]
  },
  {
    id: 5,
    name: 'Semester 5',
    code: 'SEM-05',
    subjectCount: 5,
    progress: 0,
    color: 'from-amber-600/20 to-orange-600/10',
    subjects: [
      { id: 'cs501', name: 'Cross Platform App Development', code: 'CS501', units: 5, category: 'Mobile', desc: 'React Native, Flutter, native device APIs, state and App Store deploy.' },
      { id: 'cs502', name: 'Machine Learning Fundamentals', code: 'CS502', units: 5, category: 'AI/ML', desc: 'Supervised/unsupervised learning, gradient descent, SVM and PCA.' },
      { id: 'cs503', name: 'Physics', code: 'CS503', units: 4, category: 'Science', desc: 'Quantum states, band theory, p-n junctions and semiconductor physics.' },
      { id: 'cs504', name: 'Chemistry', code: 'CS504', units: 4, category: 'Science', desc: 'Nanomaterials, polymers, electrochemistry and corrosion control.' },
      { id: 'cs505', name: 'Software Engineering & Project Management', code: 'CS505', units: 5, category: 'Core CS', desc: 'Scrum cycles, CI/CD pipelines, QA testing, Jira and code reviews.' }
    ]
  },
  {
    id: 6,
    name: 'Semester 6',
    code: 'SEM-06',
    subjectCount: 5,
    progress: 0,
    color: 'from-orange-500/20 to-amber-500/10',
    subjects: [
      { id: 'cs601', name: 'Deep Learning & Neural Architectures', code: 'CS601', units: 5, category: 'AI/ML', desc: 'CNNs, RNNs, Transformers, attention mechanisms and PyTorch.' },
      { id: 'cs602', name: 'Compiler Design & Code Optimization', code: 'CS602', units: 5, category: 'Core CS', desc: 'Lexical analysis, syntax parsing (LL/LR), AST and code generation.' },
      { id: 'cs603', name: 'DevOps & Site Reliability Engineering', code: 'CS603', units: 4, category: 'Cloud', desc: 'Infrastructure as Code (Terraform), monitoring, Prometheus and alerts.' },
      { id: 'cs604', name: 'Distributed Databases & Big Data', code: 'CS604', units: 5, category: 'Data', desc: 'NoSQL, Cassandra, Apache Spark, Kafka and sharding topologies.' },
      { id: 'cs605', name: 'AI Ethics & Responsible Computing', code: 'CS605', units: 3, category: 'Core CS', desc: 'Bias audit, explainable AI, GDPR compliance and model accountability.' }
    ]
  },
  {
    id: 7,
    name: 'Semester 7',
    code: 'SEM-07',
    subjectCount: 4,
    progress: 0,
    color: 'from-amber-500/20 to-yellow-500/10',
    subjects: [
      { id: 'cs701', name: 'Natural Language Processing & LLMs', code: 'CS701', units: 5, category: 'AI/ML', desc: 'Tokenization, embeddings, fine-tuning, RAG and prompt engineering.' },
      { id: 'cs702', name: 'Computer Vision & Image Processing', code: 'CS702', units: 5, category: 'AI/ML', desc: 'Filtering, edge detection, object detection (YOLO) and segmentation.' },
      { id: 'cs703', name: 'Blockchain & Decentralized Applications', code: 'CS703', units: 4, category: 'Special', desc: 'Consensus protocols, Ethereum smart contracts, Solidity and Web3.' },
      { id: 'cs704', name: 'Research Seminar & Technical Literature', code: 'CS704', units: 3, category: 'Research', desc: 'IEEE paper reading, citation synthesis and proposal drafting.' }
    ]
  },
  {
    id: 8,
    name: 'Semester 8',
    code: 'SEM-08',
    subjectCount: 2,
    progress: 0,
    color: 'from-orange-500/20 to-amber-500/10',
    subjects: [
      { id: 'cs801', name: 'Major Capstone Engineering Project', code: 'CS801', units: 10, category: 'Capstone', desc: 'Industry-grade software platform deployment, benchmarking and defense.' },
      { id: 'cs802', name: 'Industry Internship & Practicum Viva', code: 'CS802', units: 8, category: 'Industry', desc: 'Full-time industrial training report, mentor review and evaluation.' }
    ]
  }
];

export default function DashboardPage({ user, isExamMode, setIsExamMode, onLogout }) {
  // Navigation step state: 'semesters' | 'subjects' | 'subject_detail'
  const [currentStep, setCurrentStep] = useState('semesters');
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS_DATA[1]); // Default Sem 2
  const [selectedSubject, setSelectedSubject] = useState(SEMESTERS_DATA[1].subjects[3]); // Default DBMS
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Right sidebar chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello Sahil! I am your Syllabus-Grounded Academic Tutor. Ask me any conceptual question or derivation from your enrolled courses.',
      time: 'Just now',
      citations: ['Syllabus Ref: Semester 2 Units']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatTab, setActiveChatTab] = useState('course'); // 'course' | 'global'

  // Flag modal state
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('Citation Verification Needed');
  const [flaggedSuccess, setFlaggedSuccess] = useState(false);

  // Navigate to subjects list
  const handleSelectSemester = (sem) => {
    setSelectedSemester(sem);
    setCurrentStep('subjects');
    setSearchQuery('');
    setCategoryFilter('All');
  };

  // Navigate to subject detail
  const handleSelectSubject = (subj) => {
    setSelectedSubject(subj);
    setCurrentStep('subject_detail');
  };

  // Quick prompt trigger to Chat Drawer (Clean text without raw markdown asterisks)
  const handleAskAI = (promptText) => {
    setIsChatOpen(true);
    if (!promptText) return;

    if (isExamMode) return;

    const newMsg = { sender: 'user', text: promptText, time: 'Just now' };
    setChatMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      let cleanResponse = `Here is the structured explanation for "${promptText}":\n\n1. Core Principle: In ${selectedSubject?.name || 'Computer Science'}, this topic forms the foundation of syllabus Unit 3.\n\n2. Textbook Derivation: Concepts are broken down step-by-step to build conceptual clarity without direct homework copying.\n\n3. Key Reference: Check chapter 4 in your university reference textbook for the complete mathematical proof.`;

      if (promptText.toLowerCase().includes('3nf') || promptText.toLowerCase().includes('bcnf')) {
        cleanResponse = `Here is the Socratic explanation for 3NF vs BCNF:\n\n1. Third Normal Form (3NF):\nEvery functional dependency X -> Y must satisfy: X is a Super Key, or Y is a Prime Attribute.\n\n2. Boyce-Codd Normal Form (BCNF):\nEvery functional dependency X -> Y requires X to be a Super Key (no prime attribute exception).\n\n3. Key Insight: BCNF eliminates all redundancy based on functional dependencies, while 3NF preserves dependencies.`;
      } else if (promptText.toLowerCase().includes('b+ tree') || promptText.toLowerCase().includes('tree')) {
        cleanResponse = `Here is the explanation for B+ Tree Indexing:\n\n1. Data Pointers:\nIn B+ Trees, all actual data pointers reside solely in leaf nodes, while internal nodes only store search keys.\n\n2. Range Queries:\nLeaf nodes are linked together as a doubly linked list, making range scans very fast and efficient.\n\n3. Disk Performance:\nSmaller internal keys allow higher fanout per disk block, resulting in fewer I/O operations.`;
      } else if (promptText.toLowerCase().includes('acid') || promptText.toLowerCase().includes('2pl')) {
        cleanResponse = `Here is the explanation for ACID & 2PL Concurrency:\n\n1. Atomicity: All operations complete or none do, managed through Write-Ahead Logging (WAL).\n\n2. Consistency: Database transitions between valid states conforming to integrity constraints.\n\n3. Isolation & 2PL: Two-Phase Locking ensures transactions acquire all locks before releasing any, guaranteeing serializability.\n\n4. Durability: Committed updates persist permanently across crashes.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: cleanResponse,
          time: 'Just now',
          citations: [`Course Ref: ${selectedSubject?.code || 'CS204'} · Syllabus Unit 3`]
        }
      ]);
    }, 850);
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
        
        {/* Top App Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-borderLight px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-charcoal truncate">
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

          {/* Right Controls: Exam Mode Simulation Switch & Chat Toggle */}
          <div className="flex items-center gap-3">
            {/* Exam Simulation Status Badge / Switch */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all ${
              isExamMode 
                ? 'bg-red-50 border-red-200 text-alertSoft' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
              <span className="hidden md:inline font-bold">
                {isExamMode ? 'Exam Lockout' : 'AI Active'}
              </span>
              <button
                onClick={() => setIsExamMode(!isExamMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ml-1 focus:outline-none ${
                  isExamMode ? 'bg-alertSoft' : 'bg-emerald-500'
                }`}
                title="Toggle Exam Mode Simulation"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                    isExamMode ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Toggle AI Tutor Drawer Button */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
                isChatOpen
                  ? 'bg-[#ED7D31] text-white border-[#ED7D31]'
                  : 'bg-white hover:bg-stone-50 text-charcoal border-borderLight'
              }`}
            >
              <Bot className="w-4 h-4 text-current" />
              <span className="hidden sm:inline">AI Tutor</span>
            </button>
          </div>
        </header>

        {/* Dynamic Main Workspace Container */}
        <main className="p-6 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto space-y-6">
          
          {/* ================= STEP 1: ALL SEMESTERS (LMS Grid) ================= */}
          {currentStep === 'semesters' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              {/* Header Title & Count */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div>
                  <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
                    B.Tech CSE Curriculum (2024–28)
                  </h1>
                  <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
                    Select your semester to access course syllabus units, textbook proofs, and Socratic AI tutoring.
                  </p>
                </div>

                <span className="self-start sm:self-auto text-xs font-bold bg-white px-3 py-1.5 rounded-xl border border-borderLight text-charcoal shadow-xs">
                  8 Total Semesters
                </span>
              </div>

              {/* Semesters Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {SEMESTERS_DATA.map((sem) => (
                  <div
                    key={sem.id}
                    onClick={() => handleSelectSemester(sem)}
                    className="group bg-white rounded-3xl p-6 border border-[#E8E5DD] shadow-sm hover:shadow-xl hover:border-[#ED7D31] transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                  >
                    {/* Top Accent Band */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ED7D31] to-amber-400 opacity-80 group-hover:opacity-100 transition-opacity" />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono font-bold text-[#ED7D31] bg-[#ED7D31]/10 px-2.5 py-1 rounded-full border border-[#ED7D31]/20">
                          {sem.code}
                        </span>
                        <span className="text-xs text-charcoal-muted font-semibold bg-stone-100 px-2.5 py-0.5 rounded-lg">
                          {sem.subjectCount} Subjects
                        </span>
                      </div>

                      <h3 className="font-sans text-xl font-extrabold text-charcoal group-hover:text-[#ED7D31] transition-colors mb-2">
                        {sem.id}. {sem.name}
                      </h3>

                      <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2 mb-6">
                        {sem.subjects.map(s => s.name).slice(0, 3).join(', ')}...
                      </p>
                    </div>

                    {/* Progress Bar & CTA */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-charcoal-muted font-medium">Syllabus Completion</span>
                        <span className="font-bold text-charcoal">{sem.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden mb-4">
                        <div 
                          className="h-full bg-gradient-to-r from-[#ED7D31] to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(sem.progress, 6)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-[#ED7D31] group-hover:translate-x-1 transition-transform">
                        <span>Open Semester Subjects</span>
                        <ArrowRight className="w-4 h-4" />
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

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-charcoal">
                        <BookOpen className="w-4 h-4 text-[#ED7D31]" />
                        <span>{subj.units} Units</span>
                      </div>

                      <span className="text-[#ED7D31] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Explore Syllabus →
                      </span>
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

                  {/* Ask AI Trigger */}
                  <button
                    onClick={() => handleAskAI(`Give me a high-yield summary of ${selectedSubject.name}`)}
                    className="gold-button px-6 py-3.5 rounded-2xl text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer self-start lg:self-center"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Launch AI Socratic Tutor</span>
                  </button>
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

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFlagModalOpen(true)}
                  className="p-1.5 rounded-lg text-charcoal-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Flag for Faculty Review"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Exam Locked Notice if exam is active */}
            {isExamMode ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-red-50/50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-alertSoft flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-serif font-bold text-base text-alertSoft">
                  AI Assistance Locked
                </h4>
                <p className="text-xs text-charcoal-muted leading-relaxed max-w-xs">
                  A scheduled exam window is currently simulated. Direct querying and answers are locked to enforce institutional honor codes.
                </p>
                <button
                  onClick={() => setIsExamMode(false)}
                  className="text-xs font-bold text-[#ED7D31] hover:underline cursor-pointer"
                >
                  Turn off simulation to test chat
                </button>
              </div>
            ) : (
              /* Chat Messages Feed */
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed text-left whitespace-pre-line shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#ED7D31] text-white rounded-br-sm'
                          : 'bg-stone-100 text-charcoal border border-borderLight rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.citations && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#ED7D31] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-successSoft" />
                        <span>{msg.citations[0]}</span>
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
                <h3 className="font-sans font-bold text-lg text-charcoal">
                  Responsible AI Audit Flag
                </h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Flag an inaccurate response or textbook ambiguity for faculty review.
                </p>

                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-borderLight text-xs bg-stone-50 text-charcoal font-medium"
                >
                  <option>Citation Verification Needed</option>
                  <option>Ambiguous Mathematical Proof</option>
                  <option>Out of Syllabus Content</option>
                  <option>Hallucinated Reference</option>
                </select>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setFlagModalOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-borderLight text-xs font-semibold text-charcoal hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setFlaggedSuccess(true)}
                    className="gold-button w-1/2 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Submit Flag
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}
