import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { saveUserData, loadUserData, saveFocusSettings } from './services/dataService';
import { useFocusTimer } from './hooks/useFocusTimer';

import LandingPage from './components/LandingPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import NotesManager from './components/NotesManager';
import SyllabusTracker from './components/SyllabusTracker';
import ExamPlanner from './components/ExamPlanner';
import AICoach from './components/AICoach';
import FocusMode from './components/FocusMode';
import AuthModal from './components/AuthModal';
import { ViewState, Subject, Note, SyllabusItem, Exam, FocusSession, FocusSettings } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('roncate_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // App Data State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

  // Global Focus Timer Hook
  const defaultFocusSettings: FocusSettings = {
    timerDuration: 25,
    mode: 'countdown',
    punishments: { audio: true, penaltyTime: true, blurScreen: true, popupWarning: true },
    autoPause: true
  };

  const focusTimer = useFocusTimer(defaultFocusSettings, (session) => {
    // When session completes, add to list
    setFocusSessions(prev => [session, ...prev]);
  });

  // Apply Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('roncate_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('roncate_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Auth Listener & Data Loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // 1. Fetch Profile
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setUserProfile(docSnap.data());

          // 2. Fetch User Data from Firestore
          const data = await loadUserData(currentUser.uid);
          setSubjects(data.subjects || []);
          setNotes(data.notes || []);
          setSyllabus(data.syllabus || []);
          setExams(data.exams || []);
          setFocusSessions(data.focusSessions || []);
          if (data.focusSettings) {
             focusTimer.setSettings(data.focusSettings);
          }
          setDataLoaded(true);
          setView('dashboard');
        } catch (error) {
          console.error("Error init user:", error);
        }
      } else {
        setUserProfile(null);
        setView('landing');
        setDataLoaded(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Data Persistence (Sync to Firestore on Change) ---
  
  useEffect(() => {
    if (user && dataLoaded) saveUserData(user.uid, "subjects", subjects);
  }, [subjects, user, dataLoaded]);

  useEffect(() => {
    if (user && dataLoaded) saveUserData(user.uid, "syllabus", syllabus);
  }, [syllabus, user, dataLoaded]);

  useEffect(() => {
    if (user && dataLoaded) saveUserData(user.uid, "exams", exams);
  }, [exams, user, dataLoaded]);

  useEffect(() => {
    if (user && dataLoaded) saveUserData(user.uid, "focusSessions", focusSessions);
  }, [focusSessions, user, dataLoaded]);

  // Notes can be heavy, but for this simpler implementation we sync the array.
  // In a pro app, you'd sync individual notes.
  useEffect(() => {
    if (user && dataLoaded) saveUserData(user.uid, "notes", notes);
  }, [notes, user, dataLoaded]);

  useEffect(() => {
     if (user && dataLoaded) saveFocusSettings(user.uid, focusTimer.settings);
  }, [focusTimer.settings, user, dataLoaded]);


  const handleLogout = async () => {
    await signOut(auth);
    setView('landing');
  };

  if (authLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  if (!user || view === 'landing') {
    return (
      <>
        <LandingPage 
          onOpenAuth={() => setShowAuthModal(true)} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(profile) => setUserProfile(profile)}
        />
      </>
    );
  }

  return (
    <Layout 
        currentView={view} 
        setView={setView} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        focusActive={focusTimer.isActive}
        focusPaused={focusTimer.isPaused}
        focusTime={focusTimer.settings.mode === 'countdown' ? focusTimer.timeLeft : focusTimer.elapsedTime}
    >
      <div className={`${focusTimer.isBlurred ? 'blur-md pointer-events-none' : ''} transition-all duration-300`}>
          {view === 'dashboard' && (
            <div className="mb-6">
              {userProfile && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-lg mb-6 flex items-center justify-between">
                  <div>
                      <h3 className="font-bold text-indigo-900 dark:text-indigo-200">
                        Welcome, {userProfile.name}
                      </h3>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">
                        {userProfile.userType === 'school' 
                          ? `Student • Class ${userProfile.standard}`
                          : `${userProfile.collegeName} • ${userProfile.branch} • Year ${userProfile.year}`
                        }
                      </p>
                  </div>
                  <button onClick={handleLogout} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                    Log Out
                  </button>
                </div>
              )}
              <Dashboard 
                subjects={subjects} 
                syllabus={syllabus} 
                exams={exams}
                notes={notes}
              />
            </div>
          )}
          {view === 'focus' && (
            <FocusMode 
              sessions={focusSessions}
              timer={focusTimer}
            />
          )}
          {view === 'syllabus' && (
            <SyllabusTracker 
              subjects={subjects} 
              syllabus={syllabus} 
              setSubjects={setSubjects} 
              setSyllabus={setSyllabus} 
            />
          )}
          {view === 'notes' && (
            <NotesManager 
              subjects={subjects} 
              notes={notes} 
              setNotes={setNotes} 
            />
          )}
          {view === 'exams' && (
            <ExamPlanner 
              exams={exams} 
              subjects={subjects} 
              setExams={setExams} 
            />
          )}
          {view === 'ai-coach' && (
            <AICoach 
              syllabus={syllabus} 
              exams={exams} 
            />
          )}
      </div>

      {/* Global Punishment Overlays */}
      {focusTimer.showWarning && (
          <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-2 font-bold text-lg border-2 border-white">
             DON'T GET DISTRACTED!
          </div>
       )}
    </Layout>
  );
};

export default App;
