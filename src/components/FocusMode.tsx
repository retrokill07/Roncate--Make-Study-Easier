import React from 'react';
import { FocusSession } from '../types';
import { PlayIcon, PauseIcon, StopIcon, SettingsIcon, ClockIcon, AlertIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface FocusModeProps {
  sessions: FocusSession[];
  timer: any; // Using the object returned by useFocusTimer
}

const FocusMode: React.FC<FocusModeProps> = ({ sessions, timer }) => {
  const [showSettings, setShowSettings] = React.useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const {
      settings, setSettings,
      isActive, isPaused,
      timeLeft, elapsedTime,
      distractions,
      handleStart, handlePause, handleStop
  } = timer;

  const displayTime = settings.mode === 'countdown' ? timeLeft : elapsedTime;

  return (
    <div className="relative transition-all duration-300">
       <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
          {/* Main Timer Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-grow flex flex-col items-center justify-center relative p-10 transition-colors">
                <div className="absolute top-6 right-6 flex gap-2">
                   <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                      <AlertIcon className="w-4 h-4" />
                      Distractions: {distractions}
                   </div>
                   <button 
                     onClick={() => setShowSettings(!showSettings)}
                     className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition text-slate-700 dark:text-slate-300"
                   >
                     <SettingsIcon className="w-5 h-5" />
                   </button>
                </div>

                <div className="text-center">
                   <h2 className="text-xl font-medium text-slate-500 dark:text-slate-400 mb-8 tracking-widest uppercase">
                     {settings.mode === 'countdown' ? 'Focus Timer' : 'Stopwatch'}
                   </h2>
                   <div className="text-9xl font-bold tabular-nums text-slate-800 dark:text-white mb-12 tracking-tight">
                     {formatTime(displayTime)}
                   </div>
                   
                   <div className="flex gap-6 justify-center">
                      {!isActive ? (
                        <button 
                          onClick={handleStart}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105"
                        >
                          <PlayIcon className="w-10 h-10" />
                        </button>
                      ) : (
                        <>
                          {isPaused ? (
                            <button 
                              onClick={handleStart}
                              className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-full shadow-lg transition"
                            >
                              <PlayIcon className="w-8 h-8" />
                            </button>
                          ) : (
                            <button 
                              onClick={handlePause}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white p-6 rounded-full shadow-lg transition"
                            >
                              <PauseIcon className="w-8 h-8" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleStop()}
                            className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-full shadow-lg transition"
                          >
                            <StopIcon className="w-8 h-8" />
                          </button>
                        </>
                      )}
                   </div>
                   {isActive && settings.mode === 'countdown' && (
                     <p className="mt-8 text-slate-400 dark:text-slate-500">
                        Goal: {settings.timerDuration} minutes
                     </p>
                   )}
                </div>
             </div>

             {/* Settings Panel (Conditional) */}
             {showSettings && (
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in transition-colors">
                  <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" /> Settings
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Duration (Minutes)</label>
                        <input 
                           type="number" 
                           value={settings.timerDuration}
                           onChange={(e) => setSettings({...settings, timerDuration: Number(e.target.value)})}
                           className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                           disabled={isActive}
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Punishments</label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200">
                           <input 
                             type="checkbox" 
                             checked={settings.punishments.audio}
                             onChange={(e) => setSettings({...settings, punishments: {...settings.punishments, audio: e.target.checked}})}
                             className="rounded text-indigo-600"
                           />
                           Motivational Audio
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200">
                           <input 
                             type="checkbox" 
                             checked={settings.punishments.penaltyTime}
                             onChange={(e) => setSettings({...settings, punishments: {...settings.punishments, penaltyTime: e.target.checked}})}
                             className="rounded text-indigo-600"
                           />
                           Timer Penalty (+1 min)
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200">
                           <input 
                             type="checkbox" 
                             checked={settings.punishments.blurScreen}
                             onChange={(e) => setSettings({...settings, punishments: {...settings.punishments, blurScreen: e.target.checked}})}
                             className="rounded text-indigo-600"
                           />
                           Blur Screen
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200">
                           <input 
                             type="checkbox" 
                             checked={settings.punishments.popupWarning}
                             onChange={(e) => setSettings({...settings, punishments: {...settings.punishments, popupWarning: e.target.checked}})}
                             className="rounded text-indigo-600"
                           />
                           Popup Warning
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200">
                           <input 
                             type="checkbox" 
                             checked={settings.autoPause}
                             onChange={(e) => setSettings({...settings, autoPause: e.target.checked})}
                             className="rounded text-indigo-600"
                           />
                           Auto-pause on tab switch
                        </label>
                     </div>
                  </div>
               </div>
             )}
          </div>

          {/* Analytics Sidebar */}
          <div className="flex flex-col gap-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                   <ClockIcon className="w-5 h-5" /> Today's Stats
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-300">Total Study Time</span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xl">
                        {sessions.reduce((acc, s) => acc + s.durationMinutes, 0)} m
                      </span>
                   </div>
                   <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-300">Total Distractions</span>
                      <span className="font-bold text-red-600 dark:text-red-400 text-xl">
                        {sessions.reduce((acc, s) => acc + s.distractionCount, 0)}
                      </span>
                   </div>
                   <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-300">Avg Focus Score</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-xl">
                        {sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.focusScore, 0) / sessions.length) : 0}
                      </span>
                   </div>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-grow transition-colors">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Recent Sessions</h3>
                <div className="h-40 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessions.slice(0, 5).reverse()}>
                      <XAxis hide />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                        cursor={{fill: 'transparent'}}
                      />
                      <Bar dataKey="durationMinutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-60 custom-scrollbar pr-2">
                   {sessions.length === 0 && <p className="text-slate-400 text-sm text-center">No sessions recorded yet.</p>}
                   {sessions.map(session => (
                      <div key={session.id} className="text-sm p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition">
                         <div>
                            <div className="font-medium text-slate-700 dark:text-slate-200">{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500">{new Date(session.startTime).toLocaleDateString()}</div>
                         </div>
                         <div className="text-right">
                            <div className="font-bold text-indigo-600 dark:text-indigo-400">{session.durationMinutes} min</div>
                            <div className={`text-xs ${session.focusScore > 80 ? 'text-green-500' : 'text-orange-500'}`}>
                               Score: {session.focusScore}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default FocusMode;
