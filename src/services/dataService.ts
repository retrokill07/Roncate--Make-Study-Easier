import { db } from "./firebase";
import { doc, setDoc, getDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { Subject, Note, SyllabusItem, Exam, FocusSession, FocusSettings } from "../types";

// Helper to save a specific collection of data for a user
export const saveUserData = async (userId: string, collectionName: string, data: any[]) => {
  try {
    // For simple arrays (like syllabus/exams), we can store them in a single document 
    // or strictly as a subcollection. For scalability, we'll use a single document 
    // container for lists to avoid read quotas, or map them.
    // simpler approach for this app: Store as a JSON blob in a document named after the type
    await setDoc(doc(db, "users", userId, "userData", collectionName), {
      items: data,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error(`Error saving ${collectionName}:`, error);
  }
};

export const loadUserData = async (userId: string) => {
  const data = {
    subjects: [] as Subject[],
    notes: [] as Note[],
    syllabus: [] as SyllabusItem[],
    exams: [] as Exam[],
    focusSessions: [] as FocusSession[],
    focusSettings: null as FocusSettings | null
  };

  try {
    // Load Subjects
    const subSnap = await getDoc(doc(db, "users", userId, "userData", "subjects"));
    if (subSnap.exists()) data.subjects = subSnap.data().items;

    // Load Syllabus
    const sylSnap = await getDoc(doc(db, "users", userId, "userData", "syllabus"));
    if (sylSnap.exists()) data.syllabus = sylSnap.data().items;

    // Load Exams
    const examSnap = await getDoc(doc(db, "users", userId, "userData", "exams"));
    if (examSnap.exists()) data.exams = examSnap.data().items;

    // Load Notes
    const noteSnap = await getDoc(doc(db, "users", userId, "userData", "notes"));
    if (noteSnap.exists()) data.notes = noteSnap.data().items;

    // Load Sessions
    const sessSnap = await getDoc(doc(db, "users", userId, "userData", "focusSessions"));
    if (sessSnap.exists()) data.focusSessions = sessSnap.data().items;

    // Load Settings
    const setSnap = await getDoc(doc(db, "users", userId, "userData", "focusSettings"));
    if (setSnap.exists()) data.focusSettings = setSnap.data() as FocusSettings;

  } catch (error) {
    console.error("Error loading user data:", error);
  }

  return data;
};

export const saveFocusSettings = async (userId: string, settings: FocusSettings) => {
    try {
        await setDoc(doc(db, "users", userId, "userData", "focusSettings"), settings);
    } catch (e) {
        console.error("Error saving settings", e);
    }
}
