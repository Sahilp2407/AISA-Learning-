import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AdminLoginPage from './components/AdminLoginPage';
import DashboardPage from './components/DashboardPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import ExamHallPage from './components/ExamHallPage';
import { UNIVERSITY_EXAMS_DATA } from './data/examPapersData';
import { 
  getSavedExamLocks, 
  saveExamLocks, 
  getActiveExamLockSummary, 
  evaluateLockTiming,
  getTodayDateString,
  getTimeString
} from './services/examLockService';
import { logOut } from './firebase';

export default function App() {
  // Screen state: 'landing' | 'login' | 'admin_login' | 'dashboard' | 'admin_dashboard' | 'exam_hall'
  const [currentScreen, setCurrentScreen] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlScreen = urlParams.get('screen');
        if (urlScreen && ['dashboard', 'admin_dashboard', 'landing', 'login'].includes(urlScreen)) {
          return urlScreen;
        }
        const saved = localStorage.getItem('aisa_screen');
        if (saved && ['dashboard', 'admin_dashboard'].includes(saved)) {
          return saved;
        }
      }
    } catch (e) {}
    return 'landing';
  });
  const [activeExamPaper, setActiveExamPaper] = useState(UNIVERSITY_EXAMS_DATA[0]);

  // Ensure Light theme is permanently active
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      if (document.body) document.body.classList.remove('dark');
    }
    try {
      localStorage.removeItem('aisa_theme');
    } catch (e) {}
  }, []);

  // Student user state
  const [user, setUser] = useState({
    name: 'Aditi Sharma',
    studentId: '22BCS10492',
    email: 'aditi.sharma@univ.edu',
    programme: 'B.Tech Computer Science & Engineering',
    academicYear: '3rd Year (Semester VI)',
    enrolledCourse: 'Database Management Systems (CS301)',
  });

  // Faculty Admin user state
  const [adminUser, setAdminUser] = useState({
    name: 'Dr. Rajesh Kumar',
    role: 'Department Chair & Senior Faculty Admin',
    facultyId: 'FAC-8092',
    department: 'Computer Science & Engineering',
    email: 'rajesh.kumar@univ.edu',
  });

  // Exam Locks State synchronized across Student and Teacher Admin
  const [examLocks, setExamLocks] = useState(() => getSavedExamLocks());
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Real-time 1-second ticker to re-evaluate 30-min pre-exam and 30-min post-exam windows
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleStorageUpdate = () => {
      setExamLocks(getSavedExamLocks());
    };

    window.addEventListener('aisa_locks_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('aisa_locks_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Compute active exam lock status
  const lockSummary = getActiveExamLockSummary(examLocks, currentTime);
  const isExamMode = lockSummary.hasActiveLock;
  const activeExamLock = lockSummary.activeLock;
  const activeExamTiming = lockSummary.timing;

  // Toggle or override exam lock status from Admin
  const handleToggleExamLock = (id) => {
    setExamLocks((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const timing = evaluateLockTiming(item, currentTime);
          const newOverride = timing.isLocked ? 'unlocked' : 'locked';
          return {
            ...item,
            manualOverride: newOverride,
            status: newOverride === 'locked' ? 'Active' : 'Inactive'
          };
        }
        return item;
      });
      saveExamLocks(updated);
      return updated;
    });
  };

  // Add new scheduled exam lock with date & time
  const handleAddExamLock = (newLock) => {
    setExamLocks((prev) => {
      const updated = [newLock, ...prev];
      saveExamLocks(updated);
      return updated;
    });
  };

  // Delete exam lock
  const handleDeleteExamLock = (id) => {
    setExamLocks((prev) => {
      const updated = prev.filter(item => item.id !== id);
      saveExamLocks(updated);
      return updated;
    });
  };

  // End all active lockouts immediately (releases student portal)
  const handleEndAllLockouts = () => {
    setExamLocks((prev) => {
      const updated = prev.map((item) => {
        const timing = evaluateLockTiming(item, currentTime);
        if (timing.isLocked) {
          return {
            ...item,
            manualOverride: 'unlocked',
            status: 'Inactive'
          };
        }
        return item;
      });
      saveExamLocks(updated);
      return updated;
    });
  };

  // Trigger Instant Demo Lockout with 1 click for teacher demo
  const handleInstantDemoLock = (courseName = 'DBMS - SQL (CS204)') => {
    const now = new Date();
    // Configure an active exam window right now (e.g. started 10m ago, ends in 50m)
    const demoStart = new Date(now.getTime() - 10 * 60 * 1000);
    const demoEnd = new Date(now.getTime() + 50 * 60 * 1000);
    const demoLock = {
      id: `lock-instant-demo-${Date.now()}`,
      course: courseName,
      semester: 'Semester 2',
      date: getTodayDateString(0),
      startTime: getTimeString(demoStart),
      endTime: getTimeString(demoEnd),
      status: 'Active',
      manualOverride: 'locked',
      lockedQueries: 0,
      department: 'Computer Science & Engineering'
    };

    setExamLocks((prev) => {
      // Deactivate any previous instant locks and prepend new active demo lock
      const filtered = prev.filter(l => !l.id.startsWith('lock-instant-demo'));
      const updated = [demoLock, ...filtered];
      saveExamLocks(updated);
      return updated;
    });
  };

  // Scroll to top smoothly when switching screens
  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
    try {
      localStorage.setItem('aisa_screen', screen);
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    handleNavigate('dashboard');
  };

  const handleAdminLoginSuccess = (adminData) => {
    setAdminUser(adminData);
    handleNavigate('admin_dashboard');
  };

  const handleLaunchExam = (examPaper) => {
    setActiveExamPaper(examPaper || UNIVERSITY_EXAMS_DATA[0]);
    handleNavigate('exam_hall');
  };

  const handleLogout = async () => {
    await logOut();
    try {
      localStorage.removeItem('aisa_screen');
    } catch (e) {}
    handleNavigate('landing');
  };

  // Page Transition Variants
  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } 
    },
    exit: { 
      opacity: 0, 
      y: -12, 
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } 
    },
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-charcoal flex flex-col font-sans selection:bg-gold-200 selection:text-charcoal relative">
      {/* Top thin gold scroll progress bar */}
      <ScrollProgress />

      {/* Persistent App Header / Navbar (only on Landing Page) */}
      {currentScreen === 'landing' && (
        <Navbar
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* Animated Screen Outlet */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentScreen === 'landing' && (
            <motion.div
              key="landing"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <LandingPage 
                onNavigate={handleNavigate} 
              />
            </motion.div>
          )}

          {currentScreen === 'login' && (
            <motion.div
              key="login"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onBack={() => handleNavigate('landing')}
              />
            </motion.div>
          )}

          {currentScreen === 'admin_login' && (
            <motion.div
              key="admin_login"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <AdminLoginPage
                onAdminLoginSuccess={handleAdminLoginSuccess}
                onBack={() => handleNavigate('landing')}
              />
            </motion.div>
          )}

          {currentScreen === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <DashboardPage
                user={user}
                isExamMode={isExamMode}
                activeExamLock={activeExamLock}
                activeExamTiming={activeExamTiming}
                currentTime={currentTime}
                examLocks={examLocks}
                onLogout={handleLogout}
                onEnterExamHall={handleLaunchExam}
                onBack={() => handleNavigate('landing')}
              />
            </motion.div>
          )}

          {currentScreen === 'exam_hall' && (
            <motion.div
              key="exam_hall"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <ExamHallPage
                exam={activeExamPaper}
                studentUser={user}
                onExitExam={() => handleNavigate('dashboard')}
              />
            </motion.div>
          )}

          {currentScreen === 'admin_dashboard' && (
            <motion.div
              key="admin_dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <AdminDashboardPage
                adminUser={adminUser}
                examLocks={examLocks}
                currentTime={currentTime}
                onToggleExamLock={handleToggleExamLock}
                onAddExamLock={handleAddExamLock}
                onDeleteExamLock={handleDeleteExamLock}
                onEndAllLockouts={handleEndAllLockouts}
                onInstantDemoLock={handleInstantDemoLock}
                onLogout={handleLogout}
                onBack={() => handleNavigate('landing')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
