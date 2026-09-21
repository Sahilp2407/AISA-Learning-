// Firebase Cloud Firestore Service for Course Curriculum & Student Quiz Assessment Submissions
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { SEMESTERS_DATA } from '../data/curriculumData';

const LOCAL_QUIZ_STORAGE_KEY = 'aisa_local_quiz_submissions';

/**
 * Save student quiz assessment results to Cloud Firestore ('quiz_submissions' collection)
 */
export async function saveQuizSubmission(submissionData) {
  const payload = {
    studentId: submissionData.studentId || '22BCS10492',
    studentName: submissionData.studentName || 'Aditi Sharma',
    studentEmail: submissionData.studentEmail || 'aditi.sharma@univ.edu',
    department: submissionData.department || 'Computer Science & Engineering',
    semester: submissionData.semester || 'Semester 2',
    courseCode: submissionData.courseCode,
    courseName: submissionData.courseName,
    unitNumber: submissionData.unitNumber || 1,
    unitTitle: submissionData.unitTitle || 'Unit Assessment',
    score: submissionData.score,
    totalQuestions: submissionData.totalQuestions,
    percentage: Math.round((submissionData.score / submissionData.totalQuestions) * 100),
    status: (submissionData.score / submissionData.totalQuestions) >= 0.8 
      ? 'Distinction' 
      : (submissionData.score / submissionData.totalQuestions) >= 0.5 
        ? 'Passed' 
        : 'Needs Improvement',
    timeSpentSeconds: submissionData.timeSpentSeconds || 60,
    answers: submissionData.answers || [],
    createdAtLocal: new Date().toISOString()
  };

  // Try Firestore Cloud write
  try {
    const docRef = await addDoc(collection(db, 'quiz_submissions'), {
      ...payload,
      submittedAt: serverTimestamp()
    });

    console.log('✅ Quiz submission saved to Cloud Firestore with ID:', docRef.id);
    
    // Also save in local fallback mirror
    saveToLocalMirror({ ...payload, id: docRef.id, isCloud: true });

    return {
      success: true,
      id: docRef.id,
      isCloud: true,
      data: payload
    };
  } catch (cloudErr) {
    console.warn('⚠️ Cloud Firestore write failed (offline or security rules). Using local persistent store:', cloudErr);
    
    // Fallback locally
    const fallbackId = `local-sub-${Date.now()}`;
    const localRecord = { ...payload, id: fallbackId, isCloud: false, submittedAt: new Date().toISOString() };
    saveToLocalMirror(localRecord);

    return {
      success: true,
      id: fallbackId,
      isCloud: false,
      errorNote: cloudErr.message,
      data: localRecord
    };
  }
}

/**
 * Fetch all assessment submissions for a specific student
 */
export async function fetchStudentSubmissions(studentEmail = 'aditi.sharma@univ.edu') {
  let cloudResults = [];

  try {
    const q = query(
      collection(db, 'quiz_submissions'),
      where('studentEmail', '==', studentEmail)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      cloudResults.push({
        id: docSnap.id,
        ...d,
        isCloud: true,
        // normalize timestamp
        submittedAtStr: d.submittedAt?.toDate ? d.submittedAt.toDate().toLocaleString() : d.createdAtLocal
      });
    });
  } catch (err) {
    console.warn('Unable to query Firestore for student submissions:', err);
  }

  // Merge with local mirror to guarantee no lost attempts
  const localList = getLocalMirror().filter(item => item.studentEmail === studentEmail);
  const cloudIds = new Set(cloudResults.map(r => r.id));
  const merged = [...cloudResults];

  for (const localItem of localList) {
    if (!cloudIds.has(localItem.id)) {
      merged.push({
        ...localItem,
        submittedAtStr: new Date(localItem.createdAtLocal).toLocaleString()
      });
    }
  }

  // Sort descending by date
  return merged.sort((a, b) => new Date(b.createdAtLocal || 0) - new Date(a.createdAtLocal || 0));
}

/**
 * Fetch all quiz submissions across the university (for Faculty & Admin Portal)
 */
export async function fetchAllSubmissions() {
  const allResults = [];

  try {
    const querySnapshot = await getDocs(collection(db, 'quiz_submissions'));
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      allResults.push({
        id: docSnap.id,
        ...d,
        isCloud: true,
        submittedAtStr: d.submittedAt?.toDate ? d.submittedAt.toDate().toLocaleString() : d.createdAtLocal
      });
    });
  } catch (err) {
    console.warn('Unable to query all Firestore submissions:', err);
  }

  // Merge local mirror
  const localList = getLocalMirror();
  const cloudIds = new Set(allResults.map(r => r.id));
  for (const item of localList) {
    if (!cloudIds.has(item.id)) {
      allResults.push({
        ...item,
        submittedAtStr: new Date(item.createdAtLocal).toLocaleString()
      });
    }
  }

  return allResults.sort((a, b) => new Date(b.createdAtLocal || 0) - new Date(a.createdAtLocal || 0));
}

/**
 * Sync entire Curriculum Courses & Modules into Cloud Firestore ('courses' collection)
 * This directly populates the user's Firebase Console with rich course taxonomy!
 */
export async function syncCurriculumToFirestore() {
  let syncedCount = 0;
  const errors = [];

  for (const sem of SEMESTERS_DATA) {
    for (const sub of sem.subjects) {
      try {
        const courseDocRef = doc(db, 'courses', sub.code);
        await setDoc(courseDocRef, {
          code: sub.code,
          name: sub.name,
          semesterId: sem.id,
          semesterName: sem.name,
          semesterCode: sem.code,
          category: sub.category,
          unitsCount: sub.units,
          description: sub.desc || '',
          lastSyncedAt: serverTimestamp()
        }, { merge: true });

        syncedCount++;
      } catch (err) {
        console.warn(`Failed to sync course ${sub.code} to Firestore:`, err);
        errors.push(sub.code);
      }
    }
  }

  return {
    totalSynced: syncedCount,
    failedCodes: errors,
    success: syncedCount > 0
  };
}

// Helpers for localStorage caching & resilient offline UX
function getLocalMirror() {
  try {
    const raw = localStorage.getItem(LOCAL_QUIZ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveToLocalMirror(record) {
  try {
    const current = getLocalMirror();
    const updated = [record, ...current.filter(i => i.id !== record.id)].slice(0, 50);
    localStorage.setItem(LOCAL_QUIZ_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local storage error:', e);
  }
}
