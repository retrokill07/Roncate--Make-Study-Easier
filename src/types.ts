export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  images: string[]; // Base64 strings
  lastModified: number;
}

export interface SyllabusItem {
  id: string;
  subjectId: string;
  topic: string;
  completed: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Exam {
  id: string;
  subjectId: string;
  date: string; // ISO string
  title: string;
  topicsToCover: string[];
}

export interface AIStudyAdvice {
  message: string;
  generatedAt: number;
  priorityTopics: string[];
}

export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  distractionCount: number;
  focusScore: number; // 0-100
}

export interface FocusSettings {
  timerDuration: number; // in minutes
  mode: 'countdown' | 'countup';
  punishments: {
    audio: boolean;
    penaltyTime: boolean; // Add +1 min on distraction
    blurScreen: boolean;
    popupWarning: boolean;
  };
  autoPause: boolean;
}

export type ViewState = 'landing' | 'dashboard' | 'notes' | 'syllabus' | 'exams' | 'ai-coach' | 'focus';