import { db, auth } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Subject, Note, SyllabusItem, Exam, FocusSession, FocusSettings } from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to save a specific collection of data for a user
export const saveUserData = async (userId: string, collectionName: string, data: any[]) => {
  const path = `users/${userId}/userData/${collectionName}`;
  try {
    await setDoc(doc(db, "users", userId, "userData", collectionName), {
      items: data,
      lastUpdated: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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

  const basePath = `users/${userId}/userData`;

  try {
    // Load Subjects
    const subSnap = await getDoc(doc(db, basePath, "subjects"));
    if (subSnap.exists()) data.subjects = subSnap.data().items;

    // Load Syllabus
    const sylSnap = await getDoc(doc(db, basePath, "syllabus"));
    if (sylSnap.exists()) data.syllabus = sylSnap.data().items;

    // Load Exams
    const examSnap = await getDoc(doc(db, basePath, "exams"));
    if (examSnap.exists()) data.exams = examSnap.data().items;

    // Load Notes
    const noteSnap = await getDoc(doc(db, basePath, "notes"));
    if (noteSnap.exists()) data.notes = noteSnap.data().items;

    // Load Sessions
    const sessSnap = await getDoc(doc(db, basePath, "focusSessions"));
    if (sessSnap.exists()) data.focusSessions = sessSnap.data().items;

    // Load Settings
    const setSnap = await getDoc(doc(db, basePath, "focusSettings"));
    if (setSnap.exists()) data.focusSettings = setSnap.data() as FocusSettings;

  } catch (error) {
    handleFirestoreError(error, OperationType.GET, basePath);
  }

  return data;
};

export const saveFocusSettings = async (userId: string, settings: FocusSettings) => {
    const path = `users/${userId}/userData/focusSettings`;
    try {
        await setDoc(doc(db, "users", userId, "userData", "focusSettings"), settings);
    } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
    }
}
