import React from 'react';
import { Logo, DashboardIcon, NoteIcon, ListIcon, CalendarIcon, BrainIcon, SunIcon, MoonIcon, ClockIcon } from './Icons';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  focusActive?: boolean;
  focusPaused?: boolean;
  focusTime?: number;
}

const Layout: React.FC<LayoutProps> = ({ 
    currentView, setView, children, isDarkMode, toggleDarkMode,
    focusActive, focusPaused, focusTime 
}) => {
  const NavItem = ({ view, label, icon }: { view: ViewState, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition font-medium ${
        currentView === view 
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const formatTime = (seconds?: number) => {
      if (typeof seconds !== 'number') return '--:--';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 fixed h-full z-10 hidden md:flex flex-col transition-colors duration-200">
        <div className="p-6 flex items-center gap-2 font-bold text-2xl text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800">
          <Logo />
          <span>Roncate</span>
        </div>
        
        <nav className="p-4 flex-grow overflow-y-auto">
          <NavItem view="dashboard" label="Dashboard" icon={<DashboardIcon className="w-5 h-5"/>} />
          <div className="my-4 border-t border-slate-100 dark:border-slate-800"></div>
          
          <div className="relative">
              <NavItem view="focus" label="Focus Mode" icon={<ClockIcon className="w-5 h-5"/>} />
              {focusActive && (
                  <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-xs font-bold px-2 py-1 rounded-full ${focusPaused ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700 animate-pulse'}`}>
                      {formatTime(focusTime)}
                  </div>
              )}
          </div>

          <NavItem view="syllabus" label="Syllabus" icon={<ListIcon className="w-5 h-5"/>} />
          <NavItem view="notes" label="My Notes" icon={<NoteIcon className="w-5 h-5"/>} />
          <NavItem view="exams" label="Exam Planner" icon={<CalendarIcon className="w-5 h-5"/>} />
          <div className="my-4 border-t border-slate-100 dark:border-slate-800"></div>
          <NavItem view="ai-coach" label="AI Coach" icon={<BrainIcon className="w-5 h-5"/>} />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            <span className="font-medium text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
            <h5 className="font-bold text-sm mb-1">Stay Focused</h5>
            <p className="text-xs text-indigo-100">Consistency is the key to mastery.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
           <div className="flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-white">
            <Logo /> Roncate
           </div>
           <div className="flex items-center gap-3">
             <button 
               onClick={toggleDarkMode}
               className="p-2 text-slate-600 dark:text-slate-300 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
             >
               {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
             </button>
             <select 
               value={currentView} 
               onChange={(e) => setView(e.target.value as ViewState)}
               className="bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-800 dark:text-white p-2 rounded-lg outline-none"
             >
               <option value="dashboard">Dashboard</option>
               <option value="focus">Focus Mode</option>
               <option value="syllabus">Syllabus</option>
               <option value="notes">Notes</option>
               <option value="exams">Exams</option>
               <option value="ai-coach">AI Coach</option>
             </select>
           </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
