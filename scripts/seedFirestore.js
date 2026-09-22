import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

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

async function seedDatabase() {
  console.log('🚀 Starting Cloud Firestore Seeding for project: student-assistant-platform...');

  // 1. SEED COURSES & MODULES ('courses')
  console.log('\n📚 1. Seeding Courses & Modules collection...');
  const courses = [
    {
      code: 'CS204',
      name: 'Database Management Systems (DBMS - SQL)',
      semester: 'Semester 2',
      credits: 5,
      department: 'Computer Science & Engineering',
      unitsCount: 5,
      units: [
        'Unit 1: ER Modeling, Relational Algebra & Calculus',
        'Unit 2: SQL Advanced Queries, Triggers & Views',
        'Unit 3: Relational Database Design & Normalization (1NF to BCNF)',
        'Unit 4: Storage Structure, File Organization, Indexing & B+ Trees',
        'Unit 5: Transaction Management, Concurrency Control (2PL) & Recovery'
      ],
      instructor: 'Prof. Ananya Roy',
      status: 'Active'
    },
    {
      code: 'CS203',
      name: 'Data Structures and Algorithms - I',
      semester: 'Semester 2',
      credits: 5,
      department: 'Computer Science & Engineering',
      unitsCount: 5,
      units: [
        'Unit 1: Asymptotic Complexity & Recurrence Relations',
        'Unit 2: Linear Data Structures: Stacks, Queues, Linked Lists',
        'Unit 3: Binary Trees, AVL Trees, Red-Black Trees & Heaps',
        'Unit 4: Graph Traversals (BFS/DFS), Shortest Paths (Dijkstra, Bellman-Ford)',
        'Unit 5: Dynamic Programming & Greedy Strategies'
      ],
      instructor: 'Dr. Rajesh Sharma (HOD)',
      status: 'Active'
    },
    {
      code: 'CS308',
      name: 'Operating Systems',
      semester: 'Semester 4',
      credits: 5,
      department: 'Computer Science & Engineering',
      unitsCount: 5,
      units: [
        'Unit 1: OS Architecture, System Calls, Process Management & IPC',
        'Unit 2: CPU Scheduling Algorithms (FCFS, SJF, RR) & Multithreading',
        'Unit 3: Process Synchronization, Semaphores & Deadlock (Coffman Conditions)',
        'Unit 4: Memory Management, Virtual Memory, Paging & Page Replacement (LRU, FIFO)',
        'Unit 5: File Systems, Inodes, Disk Scheduling & Mass-Storage Structure'
      ],
      instructor: 'Dr. Vikramaditya Sen',
      status: 'Active'
    },
    {
      code: 'CS201',
      name: 'Java Programming',
      semester: 'Semester 2',
      credits: 5,
      department: 'Computer Science & Engineering',
      unitsCount: 5,
      units: [
        'Unit 1: JVM Architecture, Bytecode, OOP Foundations & Classpath',
        'Unit 2: Exception Handling, Interfaces, Abstract Classes & Generics',
        'Unit 3: Multithreading, Thread Synchronization, Locks & Volatile',
        'Unit 4: Collections Framework (ArrayList, HashMap, Red-Black Treeify)',
        'Unit 5: Java 8+ Functional Interfaces, Lambda Expressions & Streams API'
      ],
      instructor: 'Prof. Rohit Verma',
      status: 'Active'
    },
    {
      code: 'CS202',
      name: 'Computer Networks',
      semester: 'Semester 2',
      credits: 5,
      department: 'Computer Science & Engineering',
      unitsCount: 5,
      units: [
        'Unit 1: OSI 7-Layer & TCP/IP Reference Architectures, Physical Layer',
        'Unit 2: Data Link Protocols, Framing, Error Detection (CRC) & Sliding Window',
        'Unit 3: Network Layer, IPv4/IPv6 Addressing, Subnetting & Routing (OSPF, BGP)',
        'Unit 4: Transport Layer, TCP 3-Way Handshake, Flow Control & Congestion Control',
        'Unit 5: Application Layer Protocols: HTTP/3, DNS, TLS Handshake & Security'
      ],
      instructor: 'Dr. Meenakshi Sundaram',
      status: 'Active'
    }
  ];

  for (const c of courses) {
    await setDoc(doc(db, 'courses', c.code), {
      ...c,
      updatedAt: serverTimestamp()
    });
    console.log(`  ✔ Seeded Course: ${c.code} - ${c.name}`);
  }

  // 2. SEED REAL STUDENT QUIZ SUBMISSIONS ('quiz_submissions')
  console.log('\n🎯 2. Seeding Student Quiz Submissions collection...');
  const submissions = [
    {
      studentId: '22BCS10492',
      studentName: 'Aditi Sharma',
      studentEmail: 'aditi.sharma@univ.edu',
      department: 'Computer Science & Engineering',
      semester: 'Semester 2',
      courseCode: 'CS204',
      courseName: 'Database Management Systems (DBMS - SQL)',
      unitNumber: 3,
      unitTitle: 'Database Normalization (3NF & BCNF)',
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      status: 'Distinction',
      timeSpentSeconds: 142,
      answers: [
        { q: 'Selection operation in relational algebra', isCorrect: true, chosen: 'Selection (σ)' },
        { q: 'WHERE vs HAVING clause difference', isCorrect: true, chosen: 'WHERE before aggregation, HAVING on GROUP BY' },
        { q: 'BCNF condition for X -> Y', isCorrect: true, chosen: 'X must be a superkey' },
        { q: 'Why B+ Trees for disk indexes', isCorrect: true, chosen: 'High fan-out minimizing block I/O' },
        { q: 'Strict 2PL lock release phase', isCorrect: true, chosen: 'Held until commit or abort' }
      ]
    },
    {
      studentId: '22BCS10492',
      studentName: 'Aditi Sharma',
      studentEmail: 'aditi.sharma@univ.edu',
      department: 'Computer Science & Engineering',
      semester: 'Semester 2',
      courseCode: 'CS203',
      courseName: 'Data Structures and Algorithms - I',
      unitNumber: 4,
      unitTitle: 'Dynamic Programming & Graph Algorithms',
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      status: 'Distinction',
      timeSpentSeconds: 175,
      answers: [
        { q: 'Merge sort worst case time & space', isCorrect: true, chosen: 'O(N log N) time; requires O(N) space' },
        { q: 'Red-Black tree maximum height', isCorrect: true, chosen: '2 * log2(N + 1)' },
        { q: 'Shortest path with negative edge weights', isCorrect: true, chosen: 'Bellman-Ford Algorithm' },
        { q: 'Properties for Dynamic Programming', isCorrect: true, chosen: 'Optimal substructure and overlapping subproblems' },
        { q: 'Classification of problem reducible from NP', isCorrect: false, chosen: 'P-Complete' }
      ]
    },
    {
      studentId: '22BCS10408',
      studentName: 'Rohan Mehra',
      studentEmail: 'rohan.mehra@univ.edu',
      department: 'Computer Science & Engineering',
      semester: 'Semester 2',
      courseCode: 'CS204',
      courseName: 'Database Management Systems (DBMS - SQL)',
      unitNumber: 4,
      unitTitle: 'Storage, Indexing & B+ Trees',
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      status: 'Distinction',
      timeSpentSeconds: 190
    },
    {
      studentId: '22BCS10415',
      studentName: 'Sneha Patel',
      studentEmail: 'sneha.patel@univ.edu',
      department: 'Computer Science & Engineering',
      semester: 'Semester 2',
      courseCode: 'CS201',
      courseName: 'Java Programming',
      unitNumber: 2,
      unitTitle: 'Multithreading & JVM Architecture',
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      status: 'Distinction',
      timeSpentSeconds: 120
    },
    {
      studentId: '22BCS10423',
      studentName: 'Vikram Joshi',
      studentEmail: 'vikram.joshi@univ.edu',
      department: 'Computer Science & Engineering',
      semester: 'Semester 2',
      courseCode: 'CS308',
      courseName: 'Operating Systems',
      unitNumber: 1,
      unitTitle: 'Processes, Concurrency & Deadlocks',
      score: 3,
      totalQuestions: 5,
      percentage: 60,
      status: 'Passed',
      timeSpentSeconds: 210
    }
  ];

  for (const s of submissions) {
    const docRef = await addDoc(collection(db, 'quiz_submissions'), {
      ...s,
      submittedAt: serverTimestamp(),
      createdAtLocal: new Date().toISOString()
    });
    console.log(`  ✔ Recorded Quiz Submission: ${s.studentName} (${s.courseCode} - ${s.score}/${s.totalQuestions}) -> ID: ${docRef.id}`);
  }

  // 3. SEED FACULTY ESCALATION DOUBTS ('doubts_escalated')
  console.log('\n👩‍🏫 3. Seeding Faculty Doubts Escalation collection...');
  const doubts = [
    {
      studentName: 'Aditi Sharma',
      studentRoll: '22BCS10492',
      studentEmail: 'aditi.sharma@univ.edu',
      courseCode: 'CS204',
      courseName: 'DBMS - SQL',
      unit: 'Unit 3: Normalization',
      question: 'Why is BCNF strictly stronger than 3NF, and what is an example where a relation is in 3NF but not in BCNF?',
      aiResponse: 'BCNF requires every determinant to be a superkey. In 3NF, if X -> Y is a dependency, either X is a superkey OR Y is a prime attribute. In relations with overlapping candidate keys, 3NF may still permit redundancy.',
      studentNote: 'Professor, I need a concrete schema example (like Student-Advisor) to understand why 3NF allows redundancy while BCNF removes it.',
      status: 'resolved',
      facultyReply: 'Excellent query Aditi. Consider R(Student, Subject, Advisor) where (Student, Subject) is key and Advisor -> Subject holds. It is in 3NF because Subject is prime, but not BCNF because Advisor is not superkey. See Unit 3 slides page 24.',
      resolvedBy: 'Prof. Ananya Roy',
      verifiedBadge: true
    },
    {
      studentName: 'Rohan Mehra',
      studentRoll: '22BCS10408',
      studentEmail: 'rohan.mehra@univ.edu',
      courseCode: 'CS203',
      courseName: 'Data Structures and Algorithms',
      unit: 'Unit 4: Graph Traversals',
      question: 'Can Dijkstra algorithm work with negative edge weights if there are no negative cycles?',
      aiResponse: 'Dijkstra assumes optimal subpaths can be greedily finalized once popped from priority queue. With negative edges, this greedy property fails, potentially giving incorrect shortest distances.',
      studentNote: 'Can you demonstrate the counter-example graph with 3 vertices where Dijkstra gives the wrong shortest path?',
      status: 'pending',
      facultyReply: null,
      resolvedBy: null,
      verifiedBadge: false
    }
  ];

  for (const d of doubts) {
    const docRef = await addDoc(collection(db, 'doubts_escalated'), {
      ...d,
      timestamp: serverTimestamp()
    });
    console.log(`  ✔ Created Doubt Flag: ${d.courseCode} for ${d.studentName} -> ID: ${docRef.id}`);
  }

  // 4. SEED EXAM LOCK SCHEDULES ('exam_locks')
  console.log('\n🔒 4. Seeding Exam Lockouts collection...');
  const now = new Date();
  const examLocks = [
    {
      course: 'DBMS - SQL (CS204)',
      courseCode: 'CS204',
      semester: 'Semester 2',
      department: 'Computer Science & Engineering',
      date: now.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '13:00',
      status: 'Scheduled',
      manualOverride: 'normal',
      lockedQueries: 14,
      bufferMinutes: 30
    },
    {
      course: 'Data Structures & Algorithms (CS203)',
      courseCode: 'CS203',
      semester: 'Semester 2',
      department: 'Computer Science & Engineering',
      date: now.toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '17:00',
      status: 'Scheduled',
      manualOverride: 'normal',
      lockedQueries: 0,
      bufferMinutes: 30
    }
  ];

  for (const l of examLocks) {
    const docRef = await addDoc(collection(db, 'exam_locks'), {
      ...l,
      createdAt: serverTimestamp()
    });
    console.log(`  ✔ Created Exam Lock Schedule: ${l.course} -> ID: ${docRef.id}`);
  }

  console.log('\n✨ ALL COLLECTIONS SUCCESSFULLY SEEDED INTO CLOUD FIRESTORE!');
}

seedDatabase().catch(err => {
  console.error('Fatal Seeding Error:', err);
  process.exit(1);
});
