import React, { useState } from 'react';
import { Exam, Subject } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface ExamPlannerProps {
  exams: Exam[];
  subjects: Subject[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
}

const ExamPlanner: React.FC<ExamPlannerProps> = ({ exams, subjects, setExams }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');

  const handleAddExam = () => {
    if (!title || !date || !selectedSubject) return;
    const newExam: Exam = {
      id: crypto.randomUUID(),
      subjectId: selectedSubject,
      title,
      date,
      topicsToCover: []
    };
    setExams([...exams, newExam]);
    setTitle('');
    setDate('');
  };

  const deleteExam = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
  };

  const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Schedule Exam</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Title</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mid-term, Finals..."
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              />
            </div>
            <button 
              onClick={handleAddExam}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" /> Add to Schedule
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-xl text-slate-800 dark:text-white">Upcoming Exams</h3>
        {sortedExams.length === 0 && <p className="text-slate-400 dark:text-slate-500">No exams scheduled.</p>}
        {sortedExams.map(exam => {
          const daysLeft = Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          const isPast = daysLeft < 0;
          const subjectName = subjects.find(s => s.id === exam.subjectId)?.name || 'Unknown';

          return (
            <div key={exam.id} className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border ${isPast ? 'border-slate-100 dark:border-slate-700 opacity-60' : 'border-indigo-100 dark:border-slate-600'} relative group transition-colors`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-slate-800 dark:text-white">{exam.title}</h4>
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{subjectName}</span>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${daysLeft <= 3 && !isPast ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                    {isPast ? 'Done' : `${daysLeft} days`}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{new Date(exam.date).toLocaleDateString()}</div>
                </div>
              </div>
              <button 
                onClick={() => deleteExam(exam.id)}
                className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamPlanner;