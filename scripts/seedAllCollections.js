import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { STUDENTS_DATA, FACULTY_DATA } from '../src/data/studentsData.js';

const firebaseConfig = {
  apiKey: "AIzaSyBD5vOmwZ_ZzYNkhpVGDSnBljEYmL3lMvM",
  authDomain: "student-assistant-platform.firebaseapp.com",
  projectId: "student-assistant-platform",
  storageBucket: "student-assistant-platform.firebasestorage.app",
  messagingSenderId: "303035525851",
  appId: "1:303035525851:web:4679707cc4edefc111bafe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedAllEnterpriseCollections() {
  console.log('🚀 Seeding Full Enterprise Collections for AISA Platform...');

  // 1. STUDENTS COLLECTION ('students')
  console.log('\n👨‍🎓 1. Seeding Student Directory (`students` collection)...');
  const sampleStudents = STUDENTS_DATA.slice(0, 15);
  for (const s of sampleStudents) {
    await setDoc(doc(db, 'students', s.rollNo), {
      rollNo: s.rollNo,
      name: s.name,
      email: s.email,
      department: s.department,
      semester: s.semester,
      batchYear: s.batchYear,
      completionRate: s.completionRate,
      avgTestScore: s.avgTestScore,
      attendance: s.attendance,
      quiz1Score: s.quiz1Score,
      midtermScore: s.midtermScore,
      labScore: s.labScore,
      performanceStatus: s.performanceStatus,
      aiQueriesCount: s.aiQueriesCount,
      flaggedQueries: s.flaggedQueries,
      enrolledSubjects: s.enrolledSubjects,
      lastSyncedAt: serverTimestamp()
    });
    console.log(`  ✔ Seeded Student: ${s.name} (${s.rollNo}) - Status: ${s.performanceStatus}`);
  }

  // 2. FACULTY DIRECTORY ('faculty')
  console.log('\n👨‍🏫 2. Seeding Faculty Directory (`faculty` collection)...');
  for (const f of FACULTY_DATA) {
    await setDoc(doc(db, 'faculty', f.empId), {
      empId: f.empId,
      name: f.name,
      designation: f.designation,
      department: f.department,
      email: f.email,
      cabin: f.cabin,
      assignedCourses: f.assignedCourses,
      role: f.role,
      permissions: f.permissions,
      status: f.status,
      lastActive: serverTimestamp()
    });
    console.log(`  ✔ Seeded Faculty: ${f.name} (${f.designation}) - ${f.cabin}`);
  }

  // 3. ACADEMIC INTEGRITY FORENSIC LOGS ('academic_integrity_logs')
  console.log('\n🛡️ 3. Seeding Anti-Cheating Forensic Logs (`academic_integrity_logs` collection)...');
  const integrityLogs = [
    {
      studentId: 'ISU-2024-0108',
      studentName: 'Rohan Mehra',
      studentEmail: '2024.armaanm@isu.ac.in',
      courseCode: 'CS204',
      courseName: 'DBMS - SQL & Relational Architecture',
      examWindow: 'Mid-Term Examination 2026',
      attemptedPrompt: 'Write complete SQL solution for question 3 query optimization problem',
      violationType: 'Direct Exam Query During Lockdown Buffer',
      actionTaken: 'BLOCKED_AND_AUDITED',
      severity: 'CRITICAL',
      clientIP: '192.168.1.142',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      status: 'Proctor Notified'
    },
    {
      studentId: 'ISU-2025-0123',
      studentName: 'Vikram Joshi',
      studentEmail: '2025.vyoms@isu.ac.in',
      courseCode: 'CS308',
      courseName: 'Operating Systems',
      examWindow: 'Continuous Assessment Test 2',
      attemptedPrompt: 'Solve Coffman deadlock condition numerical and provide answer key',
      violationType: 'Attempted Solution Leak Bypass',
      actionTaken: 'BLOCKED_BY_SOCRATIC_GUARDRAIL',
      severity: 'HIGH',
      clientIP: '192.168.1.189',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'Logged'
    },
    {
      studentId: 'ISU-2024-0103',
      studentName: 'Aachal Deshmukh',
      studentEmail: '2024.aachald@isu.ac.in',
      courseCode: 'CS203',
      courseName: 'Data Structures and Algorithms',
      examWindow: 'Surprise Lab Practical Assessment',
      attemptedPrompt: 'Generate C++ code for Red-Black tree deletion fixup without explanation',
      violationType: 'Spoon-Feeding Code Extraction During Test',
      actionTaken: 'CONVERTED_TO_SOCRATIC_HINT',
      severity: 'MEDIUM',
      clientIP: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Apple Silicon)',
      status: 'Resolved'
    }
  ];

  for (const log of integrityLogs) {
    const docRef = await addDoc(collection(db, 'academic_integrity_logs'), {
      ...log,
      incidentTimestamp: serverTimestamp(),
      recordedAt: new Date().toISOString()
    });
    console.log(`  ✔ Recorded Integrity Incident: ${log.studentName} (${log.violationType}) -> ID: ${docRef.id}`);
  }

  // 4. CHAT SESSIONS ('chat_sessions')
  console.log('\n💬 4. Seeding Cloud Socratic Chat Sessions (`chat_sessions` collection)...');
  const chatSessions = [
    {
      sessionId: 'session-aditi-dbms-bplus',
      studentName: 'Avinash Siva',
      studentEmail: '2024.avnsiva@isu.ac.in',
      courseCode: 'CS204',
      courseName: 'DBMS - SQL',
      topic: 'B+ Trees Fan-Out & Disk Block Optimization',
      modelUsed: 'gemini-flash-latest',
      totalTokens: 1420,
      conversation: [
        {
          role: 'user',
          text: 'Why do database engines use B+ Trees instead of Binary Search Trees for disk storage?',
          timestamp: '2026-09-22T08:15:00Z'
        },
        {
          role: 'model',
          text: 'Great question! Let\'s think about hardware: When data is stored on disk, reading a block takes milliseconds, whereas CPU comparisons take nanoseconds.\n\nIf we used a Binary Search Tree with 1,000,000 records, its height would be around log2(1,000,000) ≈ 20 levels. That could require up to 20 separate disk I/O operations!\n\nNow consider: What if each node could hold hundreds of keys instead of just two? How would that change the tree height?',
          timestamp: '2026-09-22T08:15:02Z'
        },
        {
          role: 'user',
          text: 'The height would shrink to 3 or 4 levels, so only 3 or 4 disk reads!',
          timestamp: '2026-09-22T08:15:40Z'
        },
        {
          role: 'model',
          text: 'Exactly right! That high branching factor is called **fan-out**. B+ Trees maximize fan-out so a node fits exactly into a disk page block (e.g. 4KB or 8KB). Additionally, all leaf nodes are linked sequentially, making range queries (`WHERE age BETWEEN 20 AND 30`) super fast.',
          timestamp: '2026-09-22T08:15:43Z'
        }
      ]
    },
    {
      sessionId: 'session-aaryan-dsa-dp',
      studentName: 'Aaryan Kapoor',
      studentEmail: '2025.aaryank@isu.ac.in',
      courseCode: 'CS203',
      courseName: 'Data Structures and Algorithms',
      topic: 'Dynamic Programming vs Divide and Conquer',
      modelUsed: 'gemini-flash-latest',
      totalTokens: 980,
      conversation: [
        {
          role: 'user',
          text: 'How do I know whether a problem should be solved by Divide & Conquer or Dynamic Programming?',
          timestamp: '2026-09-22T08:20:10Z'
        },
        {
          role: 'model',
          text: 'Both techniques break a complex problem down into subproblems. Here is the key distinction:\n\n1. **Divide and Conquer** (like Merge Sort) divides problems into *independent, disjoint* subproblems that do not repeat.\n2. **Dynamic Programming** is needed when subproblems **overlap**—meaning the exact same subproblem is solved over and over again.\n\nCan you think of a classic recursive problem where overlapping subproblems cause an exponential explosion?',
          timestamp: '2026-09-22T08:20:12Z'
        }
      ]
    }
  ];

  for (const cs of chatSessions) {
    await setDoc(doc(db, 'chat_sessions', cs.sessionId), {
      ...cs,
      createdAt: serverTimestamp()
    });
    console.log(`  ✔ Seeded Chat Session: ${cs.topic} (${cs.studentName})`);
  }

  // 5. FACULTY REVISION BROADCASTS ('faculty_broadcasts')
  console.log('\n📢 5. Seeding Faculty Revision Broadcasts (`faculty_broadcasts` collection)...');
  const broadcasts = [
    {
      broadcastId: 'broadcast-cs204-u3',
      courseCode: 'CS204',
      courseName: 'DBMS - SQL & Relational Architecture',
      unitNumber: 3,
      title: 'Unit 3 Master Study Guide: 1NF, 2NF, 3NF & BCNF Decomposition Proofs',
      targetSemester: 'Semester 2',
      publishedBy: 'Prof. Ananya Roy',
      resourceType: 'AI Generated Revision Kit',
      tags: ['Normalization', 'Lossless Join', 'Dependency Preservation'],
      summaryPreview: 'Complete guide on loss-less decomposition, finding minimal covers, and proving BCNF violations with sample candidate key schema problems.'
    },
    {
      broadcastId: 'broadcast-cs308-u4',
      courseCode: 'CS308',
      courseName: 'Operating Systems & Concurrency',
      unitNumber: 4,
      title: 'Unit 4 Exam Blueprint: Virtual Memory Paging, TLB Hit Ratios & Inverted Page Tables',
      targetSemester: 'Semester 4',
      publishedBy: 'Dr. Vikramaditya Sen',
      resourceType: 'Faculty Approved Notes',
      tags: ['Virtual Memory', 'TLB', 'Page Faults', 'LRU Approximation'],
      summaryPreview: 'Detailed mathematical derivations for Effective Memory Access Time (EMAT) and two-level paging address translation.'
    }
  ];

  for (const b of broadcasts) {
    await setDoc(doc(db, 'faculty_broadcasts', b.broadcastId), {
      ...b,
      publishedAt: serverTimestamp()
    });
    console.log(`  ✔ Seeded Faculty Broadcast: ${b.title}`);
  }

  // 6. AI MODEL FEEDBACK & QUALITY RATINGS ('ai_model_feedback')
  console.log('\n👍 6. Seeding AI Model Feedback & RLHF Metrics (`ai_model_feedback` collection)...');
  const feedbacks = [
    {
      studentName: 'Avinash Siva',
      studentEmail: '2024.avnsiva@isu.ac.in',
      courseCode: 'CS204',
      topic: 'B+ Trees Indexing',
      modelUsed: 'gemini-flash-latest',
      rating: 'thumbs_up',
      feedbackCategory: 'Pedagogical Clarity',
      comment: 'The analogy of disk page block and hardware latency helped me understand fan-out instantly.',
      latencyMs: 620
    },
    {
      studentName: 'Aaryan Kapoor',
      studentEmail: '2025.aaryank@isu.ac.in',
      courseCode: 'CS203',
      topic: 'Dynamic Programming Memoization',
      modelUsed: 'gemini-flash-latest',
      rating: 'thumbs_up',
      feedbackCategory: 'Accurate Proof',
      comment: 'Did not give direct code right away, guided me to find the recurrence relation.',
      latencyMs: 540
    },
    {
      studentName: 'Aachal Deshmukh',
      studentEmail: '2024.aachald@isu.ac.in',
      courseCode: 'CS204',
      topic: 'Strict 2PL Recovery',
      modelUsed: 'gemini-2.5-flash',
      rating: 'thumbs_down',
      feedbackCategory: 'Needs More Textbook Citations',
      comment: 'Needed specific page citation from Korth 7th edition for rigorous proof.',
      latencyMs: 810
    }
  ];

  for (const fb of feedbacks) {
    const docRef = await addDoc(collection(db, 'ai_model_feedback'), {
      ...fb,
      submittedAt: serverTimestamp()
    });
    console.log(`  ✔ Seeded AI Feedback Rating: ${fb.topic} (${fb.rating}) -> ID: ${docRef.id}`);
  }

  console.log('\n🌟 ALL 6 ENTERPRISE COLLECTIONS SEEDED SUCCESSFULLY INTO FIRESTORE!');
}

seedAllEnterpriseCollections().catch(err => {
  console.error('Fatal Seeding Error:', err);
  process.exit(1);
});
