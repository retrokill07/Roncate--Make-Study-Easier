import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Subject, SyllabusItem, Exam, Note } from '../types';

interface DashboardProps {
  subjects: Subject[];
  syllabus: SyllabusItem[];
  exams: Exam[];
  notes: Note[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ subjects, syllabus, exams, notes }) => {
  // Calculate progress data
  const completedTopics = syllabus.filter(i => i.completed).length;
  const totalTopics = syllabus.length;
  const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const data = [
    { name: 'Completed', value: completedTopics },
    { name: 'Remaining', value: totalTopics - completedTopics },
  ];

  // Get nearest exam
  const sortedExams = [...exams]
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nearestExam = sortedExams[0];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome back, Student</h2>
        <p className="text-slate-500 dark:text-slate-400">Here is an overview of your learning progress.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center col-span-1 transition-colors">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 w-full mb-2">Syllabus Completion</h3>
          <div className="h-48 w-full">
            {totalTopics === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">No syllabus data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#334155'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="text-center mt-2">
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{progressPercentage}%</span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">Total Coverage</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-md">
            <h4 className="text-indigo-100 font-medium mb-1">Nearest Exam</h4>
            {nearestExam ? (
              <>
                <div className="text-2xl font-bold">{nearestExam.title}</div>
                <div className="text-indigo-100 mt-2 text-sm bg-white/20 inline-block px-2 py-1 rounded">
                  {new Date(nearestExam.date).toLocaleDateString()}
                </div>
              </>
            ) : (
              <div className="text-xl font-semibold opacity-80">No exams scheduled</div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <h4 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Notes</h4>
            <div className="text-4xl font-bold text-slate-800 dark:text-white">{notes.length}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Across {subjects.length} subjects</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm col-span-2 transition-colors">
            <h4 className="text-slate-700 dark:text-slate-200 font-bold mb-4">Study Pattern Suggestion</h4>
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {progressPercentage < 50 
                    ? "You are in the early stages. Focus on understanding core concepts rather than memorizing. Try to cover 2-3 topics daily." 
                    : "Great progress! Start interweaving revision sessions with new topics. Focus on practice tests for completed subjects."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Subject Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map((sub) => {
             const subTopics = syllabus.filter(s => s.subjectId === sub.id);
             const subCompleted = subTopics.filter(s => s.completed).length;
             const pct = subTopics.length ? Math.round((subCompleted / subTopics.length) * 100) : 0;
             
             return (
               <div key={sub.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{sub.name}</span>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{pct}%</span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                   <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%`}}
                   ></div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;