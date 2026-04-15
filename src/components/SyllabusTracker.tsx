import React, { useState } from 'react';
import { Subject, SyllabusItem } from '../types';
import { parseSyllabusFromText } from '../services/aiService';
import { PlusIcon, TrashIcon, BrainIcon } from './Icons';

interface SyllabusTrackerProps {
  subjects: Subject[];
  syllabus: SyllabusItem[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  setSyllabus: React.Dispatch<React.SetStateAction<SyllabusItem[]>>;
}

const SyllabusTracker: React.FC<SyllabusTrackerProps> = ({ subjects, syllabus, setSubjects, setSyllabus }) => {
  const [newSubject, setNewSubject] = useState('');
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(subjects[0]?.id || null);
  const [rawSyllabusText, setRawSyllabusText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [parseFeedback, setParseFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    const subject: Subject = {
      id: crypto.randomUUID(),
      name: newSubject,
      color: '#6366f1' // Default color
    };
    setSubjects([...subjects, subject]);
    setNewSubject('');
    if (!activeSubjectId) setActiveSubjectId(subject.id);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setSyllabus(syllabus.filter(s => s.subjectId !== id));
    if (activeSubjectId === id) setActiveSubjectId(subjects[0]?.id || null);
  };

  const handleParse = async () => {
    if (!rawSyllabusText.trim() || !activeSubjectId) return;
    setIsParsing(true);
    setParseFeedback(null);
    try {
        const parsedItems = await parseSyllabusFromText(rawSyllabusText, activeSubjectId);
        if (parsedItems.length > 0) {
            const newItems: SyllabusItem[] = parsedItems.map(p => ({
                id: crypto.randomUUID(),
                subjectId: activeSubjectId,
                topic: p.topic || 'Untitled Topic',
                difficulty: (p.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
                completed: false
            }));
            setSyllabus([...syllabus, ...newItems]);
            setRawSyllabusText('');
            setParseFeedback({ type: 'success', message: `Successfully added ${newItems.length} topics!` });
        } else {
             setParseFeedback({ type: 'error', message: 'Could not extract topics. Please check your API key.' });
        }
    } catch (e) {
        setParseFeedback({ type: 'error', message: 'An error occurred during parsing.' });
    } finally {
        setIsParsing(false);
    }
  };

  const handleAddTopic = () => {
     if (!newTopic.trim() || !activeSubjectId) return;
     const item: SyllabusItem = {
         id: crypto.randomUUID(),
         subjectId: activeSubjectId,
         topic: newTopic,
         difficulty: 'Medium',
         completed: false
     };
     setSyllabus([...syllabus, item]);
     setNewTopic('');
  };

  const toggleCompletion = (id: string) => {
      setSyllabus(syllabus.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };
  
  const deleteTopic = (id: string) => {
      setSyllabus(syllabus.filter(item => item.id !== id));
  };

  const activeSubject = subjects.find(s => s.id === activeSubjectId);
  const currentTopics = syllabus.filter(s => s.subjectId === activeSubjectId);

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6">
      {/* Subject List Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
           <div className="flex gap-2">
             <input 
               value={newSubject}
               onChange={(e) => setNewSubject(e.target.value)}
               placeholder="New Subject"
               className="w-full text-sm p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
             />
             <button onClick={handleAddSubject} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
               <PlusIcon className="w-4 h-4" />
             </button>
           </div>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {subjects.map(subject => (
            <div 
              key={subject.id} 
              onClick={() => setActiveSubjectId(subject.id)}
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition ${
                activeSubjectId === subject.id 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span>{subject.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.id); }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden transition-colors">
         {activeSubject ? (
           <>
             {/* Header */}
             <div className="p-6 border-b border-slate-100 dark:border-slate-800">
               <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{activeSubject.name} Syllabus</h2>
               
               {/* AI Parser Input */}
               <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                   <BrainIcon className="w-4 h-4 text-indigo-500" />
                   AI Syllabus Parser (Llama 3.1)
                 </label>
                 <div className="flex gap-3">
                   <textarea
                     value={rawSyllabusText}
                     onChange={(e) => setRawSyllabusText(e.target.value)}
                     placeholder="Paste your syllabus text here (e.g., from PDF course guide)..."
                     className="flex-grow h-20 p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white resize-none"
                   />
                   <button 
                     onClick={handleParse}
                     disabled={isParsing || !rawSyllabusText}
                     className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                   >
                     {isParsing ? 'Parsing...' : 'Auto Extract'}
                   </button>
                 </div>
                 {parseFeedback && (
                    <div className={`mt-2 text-sm ${parseFeedback.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {parseFeedback.message}
                    </div>
                 )}
               </div>
             </div>

             {/* Topic List */}
             <div className="flex-grow overflow-y-auto p-6">
                <div className="mb-4 flex gap-2">
                    <input 
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Add a topic manually..."
                      className="flex-grow p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                    />
                    <button onClick={handleAddTopic} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">Add</button>
                </div>

                <div className="space-y-2">
                  {currentTopics.length === 0 && (
                      <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                          No topics yet. Paste syllabus text above or add manually.
                      </div>
                  )}
                  {currentTopics.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition">
                      <input 
                        type="checkbox" 
                        checked={item.completed}
                        onChange={() => toggleCompletion(item.id)}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className={`flex-grow ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.topic}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium 
                        ${item.difficulty === 'Hard' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 
                          item.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 
                          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                        {item.difficulty}
                      </span>
                      <button onClick={() => deleteTopic(item.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400">
                          <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
             </div>
           </>
         ) : (
           <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
             Select or create a subject to manage syllabus.
           </div>
         )}
      </div>
    </div>
  );
};

export default SyllabusTracker;