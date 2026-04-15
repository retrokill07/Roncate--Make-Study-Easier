import React from 'react';
import { Logo, BrainIcon, NoteIcon, CalendarIcon, SunIcon, MoonIcon } from './Icons';

interface LandingPageProps {
  onOpenAuth: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, isDarkMode, toggleDarkMode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 flex flex-col transition-colors duration-200">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-2xl text-slate-800 dark:text-white">
          <Logo />
          <span>Roncate</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
             {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
          <button 
            onClick={onOpenAuth}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition"
          >
            Login
          </button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto space-y-8 py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Master your studies with <span className="text-indigo-600 dark:text-indigo-400">Adaptive Intelligence</span>
        </h1>
        
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Roncate isn't just a note-taking app. It tracks your syllabus, plans your exams, and uses AI to adapt your study schedule based on your progress.
        </p>

        <button 
          onClick={onOpenAuth}
          className="bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-xl transition transform hover:-translate-y-1"
        >
          Start Learning Now
        </button>

        <div className="grid md:grid-cols-3 gap-8 mt-16 w-full">
          <FeatureCard 
            icon={<BrainIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />}
            title="Adaptive Learning"
            description="Our AI analyzes your progress to suggest what to study next."
          />
          <FeatureCard 
            icon={<NoteIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />}
            title="Smart Notes"
            description="Organize subject-wise notes and attach images directly."
          />
          <FeatureCard 
            icon={<CalendarIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />}
            title="Exam Planner"
            description="Visualize your exam timeline and syllabus coverage."
          />
        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 dark:text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} Roncate Education. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900 transition">
    <div className="bg-indigo-50 dark:bg-slate-700 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
      {icon}
    </div>
    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400">{description}</p>
  </div>
);

export default LandingPage;