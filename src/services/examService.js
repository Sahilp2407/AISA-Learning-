// Official Examination Cloud Service for AISA Platform
// Persists proctored exam submissions, section scores, and question logs to Cloud Firestore ('exam_attempts')

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  push, 
  set, 
  get, 
  child 
} from 'firebase/database';
import { db, rtdb } from '../firebase';

const LOCAL_EXAM_STORAGE_KEY = 'aisa_student_exam_attempts';

// Helper to remove undefined values for Firebase Realtime Database
function cleanForRTDB(obj) {
  return JSON.parse(JSON.stringify(obj, (k, v) => (v === undefined ? null : v)));
}

// Helper to sanitize Firebase RTDB keys (prohibits ., #, $, /, [, ])
function sanitizeRTDBKey(key) {
  return String(key || 'unknown').replace(/[.#$/[\]]/g, '_');
}

/**
 * Submit and Grade Complete University Examination Paper
 */
export async function submitExamAttempt(payload) {
  const {
    exam,
    studentUser,
    mcqAnswers = {},
    matchAnswers = {},
    assertionAnswers = {},
    timeTakenSeconds = 0,
    tabSwitchViolations = 0
  } = payload;

  let totalMarksObtained = 0;
  const maxMarks = exam.totalMarks || 30;

  // 1. Grade Section A (MCQs)
  const secA = exam.sections.find(s => s.type === 'mcq');
  let secAMarks = 0;
  const gradedSecA = (secA?.questions || []).map((q, idx) => {
    const chosen = mcqAnswers[q.id];
    const isCorrect = chosen === q.correctIndex;
    const marksAwarded = isCorrect ? q.marks : 0;
    secAMarks += marksAwarded;
    return {
      id: q.id,
      index: idx + 1,
      type: 'mcq',
      question: q.question,
      chosenIndex: chosen !== undefined ? chosen : -1,
      chosenText: chosen !== undefined ? q.options[chosen] : 'Not Answered',
      correctIndex: q.correctIndex,
      correctText: q.options[q.correctIndex],
      isCorrect,
      marksAwarded,
      maxMarks: q.marks,
      explanation: q.explanation
    };
  });

  // 2. Grade Section B (Match the Following)
  const secB = exam.sections.find(s => s.type === 'match');
  let secBMarks = 0;
  const gradedSecB = (secB?.questions || []).map((mq, idx) => {
    const userPairs = matchAnswers[mq.id] || {};
    let matchedCorrectCount = 0;
    const pairAnalysis = Object.keys(mq.correctPairs).map(leftId => {
      const targetRight = mq.correctPairs[leftId];
      const userRight = userPairs[leftId];
      const isPairCorrect = userRight === targetRight;
      if (isPairCorrect) matchedCorrectCount++;

      const leftObj = mq.leftItems.find(l => l.id === leftId);
      const rightObj = mq.rightItems.find(r => r.id === userRight);
      const correctRightObj = mq.rightItems.find(r => r.id === targetRight);

      return {
        leftId,
        leftText: leftObj?.text || leftId,
        userMatchedRightId: userRight || null,
        userMatchedRightText: rightObj?.text || 'Unmatched',
        correctRightId: targetRight,
        correctRightText: correctRightObj?.text || targetRight,
        isCorrect: isPairCorrect
      };
    });

    const marksPerPair = mq.marks / Object.keys(mq.correctPairs).length;
    const awardedMarks = Math.round(matchedCorrectCount * marksPerPair * 10) / 10;
    secBMarks += awardedMarks;

    return {
      id: mq.id,
      index: idx + 1,
      type: 'match',
      title: mq.title,
      pairAnalysis,
      matchedCorrectCount,
      totalPairs: Object.keys(mq.correctPairs).length,
      marksAwarded: awardedMarks,
      maxMarks: mq.marks,
      explanation: mq.explanation
    };
  });

  // 3. Grade Section C (Assertion & Reasoning)
  const secC = exam.sections.find(s => s.type === 'assertion');
  let secCMarks = 0;
  const gradedSecC = (secC?.questions || []).map((q, idx) => {
    const chosen = assertionAnswers[q.id];
    const isCorrect = chosen === q.correctIndex;
    const marksAwarded = isCorrect ? q.marks : 0;
    secCMarks += marksAwarded;
    return {
      id: q.id,
      index: idx + 1,
      type: 'assertion',
      assertion: q.assertion,
      reason: q.reason,
      chosenIndex: chosen !== undefined ? chosen : -1,
      chosenText: chosen !== undefined ? q.options[chosen] : 'Not Answered',
      correctIndex: q.correctIndex,
      correctText: q.options[q.correctIndex],
      isCorrect,
      marksAwarded,
      maxMarks: q.marks,
      explanation: q.explanation
    };
  });

  totalMarksObtained = Math.round((secAMarks + secBMarks + secCMarks) * 10) / 10;
  const percentage = Math.round((totalMarksObtained / maxMarks) * 100);

  // Compute Letter Grade
  let grade = 'F';
  let status = 'Failed';
  if (percentage >= 90) {
    grade = 'A+';
    status = 'Passed with High Distinction';
  } else if (percentage >= 80) {
    grade = 'A';
    status = 'Passed with Distinction';
  } else if (percentage >= 70) {
    grade = 'B+';
    status = 'Passed (First Class)';
  } else if (percentage >= 55) {
    grade = 'B';
    status = 'Passed (Second Class)';
  } else if (percentage >= exam.passingMarks / maxMarks * 100) {
    grade = 'C';
    status = 'Passed';
  }

  // Construct official record
  const submissionRecord = {
    examId: exam.id,
    examTitle: exam.title,
    courseCode: exam.code,
    courseName: exam.name,
    semester: exam.semester,
    studentId: studentUser?.studentId || studentUser?.rollNo || '22BCS10492',
    studentName: studentUser?.name || 'Aditi Sharma',
    studentEmail: studentUser?.email || 'aditi.sharma@univ.edu',
    department: studentUser?.department || 'Computer Science & Engineering',
    totalMarks: maxMarks,
    scoreObtained: totalMarksObtained,
    percentage,
    grade,
    status,
    sectionBreakdown: {
      sectionA: { title: 'Section A (MCQs)', marks: secAMarks, max: 12 },
      sectionB: { title: 'Section B (Match Following)', marks: secBMarks, max: 10 },
      sectionC: { title: 'Section C (Assertion Reasoning)', marks: secCMarks, max: 8 }
    },
    gradedSecA,
    gradedSecB,
    gradedSecC,
    timeTakenSeconds,
    tabSwitchViolations,
    createdAtLocal: new Date().toISOString()
  };

  // 1. Save to Firebase Realtime Database (Primary store for student exam answers)
  let rtdbKey = null;
  const safeStudentId = sanitizeRTDBKey(submissionRecord.studentId);
  const safeExamId = sanitizeRTDBKey(submissionRecord.examId);

  try {
    const submissionsRef = ref(rtdb, 'exam_submissions');
    const newSubmissionRef = push(submissionsRef);
    rtdbKey = newSubmissionRef.key || `exam-${Date.now()}`;

    const rtdbPayload = cleanForRTDB({
      ...submissionRecord,
      id: rtdbKey,
      // Store raw student answers directly for instant inspection
      rawStudentAnswers: {
        mcqAnswers,
        matchAnswers,
        assertionAnswers
      },
      databaseSource: 'Firebase Realtime Database',
      submittedAtIso: new Date().toISOString(),
      submittedAtTimestamp: Date.now()
    });

    // Write to /exam_submissions/{id}
    await set(newSubmissionRef, rtdbPayload);

    // Also write to /student_exam_answers/{studentId}/{examId} for fast student-specific lookups
    const studentExamRef = ref(rtdb, `student_exam_answers/${safeStudentId}/${safeExamId}`);
    await set(studentExamRef, rtdbPayload);

    console.log('✅ Student exam answers saved to Firebase Realtime Database with ID:', rtdbKey);

    // Save to local mirror for instant retrieval
    saveExamAttemptLocal({ ...rtdbPayload, isCloud: true, isRealtimeDB: true });

    // Optional Firestore mirror (non-blocking)
    try {
      await addDoc(collection(db, 'exam_attempts'), {
        ...submissionRecord,
        rtdbKey,
        submittedAt: serverTimestamp()
      });
    } catch (fsErr) {
      console.info('Firestore mirror skipped/optional:', fsErr.message);
    }

    return {
      success: true,
      id: rtdbKey,
      isCloud: true,
      isRealtimeDB: true,
      data: rtdbPayload
    };
  } catch (rtdbErr) {
    console.warn('⚠️ Firebase Realtime Database write error, falling back:', rtdbErr);

    // Try Firestore fallback
    try {
      const docRef = await addDoc(collection(db, 'exam_attempts'), {
        ...submissionRecord,
        submittedAt: serverTimestamp()
      });
      saveExamAttemptLocal({ ...submissionRecord, id: docRef.id, isCloud: true });
      return {
        success: true,
        id: docRef.id,
        isCloud: true,
        data: submissionRecord
      };
    } catch (fsErr) {
      const fallbackId = `exam-attempt-${Date.now()}`;
      const fallbackRecord = { ...submissionRecord, id: fallbackId, isCloud: false };
      saveExamAttemptLocal(fallbackRecord);
      return {
        success: true,
        id: fallbackId,
        isCloud: false,
        errorNote: rtdbErr.message,
        data: fallbackRecord
      };
    }
  }
}

/**
 * Fetch past exam attempts for a student
 */
export async function fetchStudentExamAttempts(studentEmail = 'aditi.sharma@univ.edu', studentId = '22BCS10492') {
  const cloudAttempts = [];
  const safeStudentId = sanitizeRTDBKey(studentId);

  // 1. Try reading from Firebase Realtime Database
  try {
    const studentSubRef = ref(rtdb, `student_exam_answers/${safeStudentId}`);
    const snapshot = await get(studentSubRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach(k => {
        const item = data[k];
        if (item) {
          cloudAttempts.push({
            ...item,
            isCloud: true,
            isRealtimeDB: true,
            submittedAtFormatted: item.submittedAtIso ? new Date(item.submittedAtIso).toLocaleString() : new Date().toLocaleString()
          });
        }
      });
    }
  } catch (rtdbErr) {
    console.info('RTDB student_exam_answers read note:', rtdbErr.message);
  }

  // Also query master exam_submissions from Realtime Database if empty
  if (cloudAttempts.length === 0) {
    try {
      const allSubRef = ref(rtdb, 'exam_submissions');
      const snap = await get(allSubRef);
      if (snap.exists()) {
        const data = snap.val();
        Object.keys(data).forEach(k => {
          const item = data[k];
          if (item && (item.studentEmail === studentEmail || item.studentId === studentId)) {
            cloudAttempts.push({
              ...item,
              isCloud: true,
              isRealtimeDB: true,
              submittedAtFormatted: item.submittedAtIso ? new Date(item.submittedAtIso).toLocaleString() : new Date().toLocaleString()
            });
          }
        });
      }
    } catch (e) {
      console.info('RTDB exam_submissions read note:', e.message);
    }
  }

  // Also check Firestore for historical attempts
  try {
    const q = query(
      collection(db, 'exam_attempts'),
      where('studentEmail', '==', studentEmail)
    );
    const snapshot = await getDocs(q);
    const existingIds = new Set(cloudAttempts.map(c => c.id));
    snapshot.forEach(docSnap => {
      if (!existingIds.has(docSnap.id)) {
        const d = docSnap.data();
        cloudAttempts.push({
          id: docSnap.id,
          ...d,
          isCloud: true,
          submittedAtFormatted: d.submittedAt?.toDate ? d.submittedAt.toDate().toLocaleString() : new Date(d.createdAtLocal).toLocaleString()
        });
      }
    });
  } catch (err) {
    console.warn('Could not load exam attempts from Firestore:', err);
  }

  // Merge with local storage mirror
  const localAttempts = getExamAttemptsLocal().filter(a => a.studentEmail === studentEmail);
  const cloudIds = new Set(cloudAttempts.map(c => c.id));
  const merged = [...cloudAttempts];

  for (const loc of localAttempts) {
    if (!cloudIds.has(loc.id)) {
      merged.push({
        ...loc,
        submittedAtFormatted: new Date(loc.createdAtLocal).toLocaleString()
      });
    }
  }

  return merged.sort((a, b) => new Date(b.createdAtLocal || 0) - new Date(a.createdAtLocal || 0));
}

/**
 * Fetch all exam attempts across college (For Admin Examination Roster)
 */
export async function fetchAllExamAttempts() {
  const all = [];
  const seenIds = new Set();

  // 1. Fetch from Firebase Realtime Database (Primary)
  try {
    const submissionsRef = ref(rtdb, 'exam_submissions');
    const snap = await get(submissionsRef);
    if (snap.exists()) {
      const data = snap.val();
      Object.keys(data).forEach(k => {
        const item = data[k];
        const recordId = item?.id || k;
        if (item && !seenIds.has(recordId)) {
          seenIds.add(recordId);
          all.push({
            id: recordId,
            ...item,
            isCloud: true,
            isRealtimeDB: true,
            submittedAtFormatted: item.submittedAtIso ? new Date(item.submittedAtIso).toLocaleString() : new Date().toLocaleString()
          });
        }
      });
    }
  } catch (e) {
    console.info('RTDB fetchAllExamAttempts note:', e.message);
  }

  // 2. Fetch from Firestore for any historical records
  try {
    const snapshot = await getDocs(collection(db, 'exam_attempts'));
    snapshot.forEach(docSnap => {
      if (!seenIds.has(docSnap.id)) {
        seenIds.add(docSnap.id);
        const d = docSnap.data();
        all.push({
          id: docSnap.id,
          ...d,
          isCloud: true,
          submittedAtFormatted: d.submittedAt?.toDate ? d.submittedAt.toDate().toLocaleString() : new Date(d.createdAtLocal).toLocaleString()
        });
      }
    });
  } catch (err) {
    console.warn('Could not query all exam attempts from Firestore:', err);
  }

  // Merge local
  const localList = getExamAttemptsLocal();
  for (const loc of localList) {
    if (!seenIds.has(loc.id)) {
      seenIds.add(loc.id);
      all.push({
        ...loc,
        submittedAtFormatted: new Date(loc.createdAtLocal).toLocaleString()
      });
    }
  }

  return all.sort((a, b) => new Date(b.createdAtLocal || 0) - new Date(a.createdAtLocal || 0));
}

// Local storage helper
function getExamAttemptsLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_EXAM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveExamAttemptLocal(record) {
  try {
    const list = getExamAttemptsLocal();
    const updated = [record, ...list.filter(item => item.id !== record.id)].slice(0, 30);
    localStorage.setItem(LOCAL_EXAM_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving local exam attempt:', e);
  }
}
