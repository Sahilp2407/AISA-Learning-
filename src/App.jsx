import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import { logOut } from './firebase';

export default function App() {
  // Screen state: 'landing' | 'login' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('landing');

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

  // In-memory student user state (No localStorage/sessionStorage as specified)
  const [user, setUser] = useState({
    name: 'Aditi Sharma',
    studentId: '22BCS10492',
    email: 'aditi.sharma@univ.edu',
    programme: 'B.Tech Computer Science & Engineering',
    academicYear: '3rd Year (Semester VI)',
    enrolledCourse: 'Database Management Systems (CS301)',
  });

  // Working Exam Mode simulation state
  const [isExamMode, setIsExamMode] = useState(false);

  // Scroll to top smoothly when switching screens
  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    handleNavigate('dashboard');
  };

  const handleLogout = async () => {
    await logOut();
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
                setIsExamMode={setIsExamMode}
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
