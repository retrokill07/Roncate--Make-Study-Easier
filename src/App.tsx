
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
  const [permissionError, setPermissionError] = useState(false);

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
      if (currentUser) {
        setUser(currentUser);
        // Switch view IMMEDIATELY so user is never stuck
        if (view === 'landing') setView('dashboard');
        
        try {
          // 1. Fetch Profile
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setUserProfile(docSnap.data());

          // 2. Fetch User Data
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
          setPermissionError(false);
        } catch (error) {
          console.error("Error loading user data (Check Firebase Rules):", error);
          if (error instanceof Error && error.message.includes('insufficient permissions')) {
            setPermissionError(true);
          }
          // Still mark as loaded to allow the app to function with local state
          setDataLoaded(true);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setView('landing');
        setDataLoaded(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Data Persistence ---
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
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 animate-pulse">Syncing your progress...</p>
      </div>
    );
  }

  // Final rendering condition: Show landing ONLY if we definitely have no user
  if (!user || view === 'landing') {
    return (
      <>
        <LandingPage 
          user={user}
          onOpenAuth={() => setShowAuthModal(true)} 
          onGoToDashboard={() => setView('dashboard')}
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(profile) => {
            // Force manual update to bypass any observer lag
            setUser(auth.currentUser);
            setUserProfile(profile);
            setView('dashboard'); 
          }}
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
          {permissionError && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg mb-6 flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Database Permissions Required
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Your data isn't syncing because Firestore Security Rules are not set up. 
                Please go to your Firebase Console and update your Rules tab with the provided configuration.
              </p>
            </div>
          )}
          {view === 'dashboard' && (
            <div className="mb-6">
              {userProfile && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-lg mb-6 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-4">
                    {userProfile.photoURL && (
                      <img 
                        src={userProfile.photoURL} 
                        alt={userProfile.name} 
                        className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-700 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                        <h3 className="font-bold text-indigo-900 dark:text-indigo-200 text-lg">
                          Welcome, {userProfile.name}
                        </h3>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                          {userProfile.userType === 'school' 
                            ? `Student • Class ${userProfile.standard}`
                            : `${userProfile.collegeName} • ${userProfile.branch} • Year ${userProfile.year}`
                          }
                        </p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="px-4 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all">
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
          {view === 'focus' && <FocusMode sessions={focusSessions} timer={focusTimer} />}
          {view === 'syllabus' && <SyllabusTracker subjects={subjects} syllabus={syllabus} setSubjects={setSubjects} setSyllabus={setSyllabus} />}
          {view === 'notes' && <NotesManager subjects={subjects} notes={notes} setNotes={setNotes} />}
          {view === 'exams' && <ExamPlanner exams={exams} subjects={subjects} setExams={setExams} />}
          {view === 'ai-coach' && <AICoach syllabus={syllabus} exams={exams} />}
      </div>

      {focusTimer.showWarning && (
          <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-2 font-bold text-lg border-2 border-white">
             DON'T GET DISTRACTED!
          </div>
       )}
    </Layout>
  );
};

export default App;
