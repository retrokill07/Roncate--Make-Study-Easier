import React, { useState, useRef } from 'react';
import { Note, Subject } from '../types';
import { PlusIcon, TrashIcon, UploadIcon, NoteIcon } from './Icons';

interface NotesManagerProps {
  subjects: Subject[];
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const NotesManager: React.FC<NotesManagerProps> = ({ subjects, notes, setNotes }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || '');
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNote = () => {
    setEditingNote({
      id: crypto.randomUUID(),
      subjectId: selectedSubject,
      title: '',
      content: '',
      images: [],
      lastModified: Date.now()
    });
  };

  const handleSaveNote = () => {
    if (!editingNote || !editingNote.title) return;
    
    setNotes(prev => {
      const existingIndex = prev.findIndex(n => n.id === editingNote.id);
      const newNote = editingNote as Note;
      newNote.lastModified = Date.now();

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newNote;
        return updated;
      }
      return [newNote, ...prev];
    });
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (editingNote?.id === id) setEditingNote(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingNote) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditingNote({
          ...editingNote,
          images: [...(editingNote.images || []), base64String]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredNotes = notes.filter(n => n.subjectId === selectedSubject);

  if (subjects.length === 0) {
    return <div className="text-center p-10 text-slate-500 dark:text-slate-400">Please add subjects in the Syllabus section first.</div>;
  }

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6">
      {/* Sidebar List */}
      <div className="w-1/3 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 mb-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          >
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button 
            onClick={handleCreateNote}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <PlusIcon className="w-4 h-4" /> New Note
          </button>
        </div>
        <div className="overflow-y-auto flex-grow p-2 space-y-2">
          {filteredNotes.length === 0 && <div className="text-center text-slate-400 dark:text-slate-500 mt-4 text-sm">No notes found.</div>}
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              onClick={() => setEditingNote(note)}
              className={`p-3 rounded-lg cursor-pointer transition ${
                editingNote?.id === note.id 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 border' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
              }`}
            >
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{note.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{note.content || 'No content'}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{new Date(note.lastModified).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-grow bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden transition-colors">
        {editingNote ? (
          <>
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
               <input 
                 type="text" 
                 value={editingNote.title} 
                 onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                 placeholder="Note Title..."
                 className="text-xl font-bold text-slate-800 dark:text-white outline-none w-full bg-transparent placeholder-slate-400 dark:placeholder-slate-500"
               />
               <div className="flex gap-2">
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                   title="Upload Image"
                 >
                   <UploadIcon className="w-5 h-5" />
                 </button>
                 <input 
                   type="file" 
                   hidden 
                   ref={fileInputRef} 
                   accept="image/*"
                   onChange={handleImageUpload}
                 />
                 <button 
                   onClick={() => handleDeleteNote(editingNote.id!)}
                   className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                 >
                   <TrashIcon className="w-5 h-5" />
                 </button>
               </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              <textarea 
                className="w-full h-64 p-2 outline-none resize-none text-slate-700 dark:text-slate-300 leading-relaxed bg-transparent placeholder-slate-400 dark:placeholder-slate-600"
                placeholder="Start typing your notes here..."
                value={editingNote.content}
                onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
              />
              
              {editingNote.images && editingNote.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  {editingNote.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="Note attachment" className="rounded-lg shadow-sm border border-slate-200 dark:border-slate-600" />
                      <button 
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        onClick={() => {
                          const newImages = editingNote.images?.filter((_, i) => i !== idx);
                          setEditingNote({...editingNote, images: newImages});
                        }}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button 
                onClick={handleSaveNote}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Save Note
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <NoteIcon className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a note or create a new one to start writing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesManager;