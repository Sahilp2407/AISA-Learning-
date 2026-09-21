// Central Service for Faculty AI Study Notes Generation & Student Email Broadcast
// Stores broadcasted notes in localStorage and dispatches mock institutional emails to semester cohorts

import { getTodayDateString } from './examLockService';

const NOTES_STORAGE_KEY = 'aisa_faculty_broadcast_notes';
const READ_NOTES_STORAGE_KEY = 'aisa_read_notes_by_student';

// Subject-Specific Demo PDF Catalog
export const SUBJECT_DEMO_PDFS_MAP = {
  'CS201': [
    {
      id: 'demo-cs201-1',
      name: 'CS201_Unit_2_OOP_Polymorphism_Interfaces_AbstractClasses.pdf',
      size: '2.4 MB',
      courseCode: 'CS201',
      units: 'Unit 2: Advanced OOP & Interfaces',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs201-2',
      name: 'CS201_Unit_4_Multithreading_Concurrency_Streams_JVM.pdf',
      size: '3.1 MB',
      courseCode: 'CS201',
      units: 'Unit 4: Concurrency & Streams',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ],
  'CS202': [
    {
      id: 'demo-cs202-1',
      name: 'CS202_Unit_2_OSI_TCP_IP_Protocol_Architecture.pdf',
      size: '2.7 MB',
      courseCode: 'CS202',
      units: 'Unit 2: Transport & Network Layers',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs202-2',
      name: 'CS202_Unit_4_Routing_Algorithms_BGP_OSPF_DNS.pdf',
      size: '3.5 MB',
      courseCode: 'CS202',
      units: 'Unit 4: Routing & Application Layer',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ],
  'CS203': [
    {
      id: 'demo-cs203-1',
      name: 'CS203_Unit_1_Linear_Data_Structures_Stacks_Queues.pdf',
      size: '2.2 MB',
      courseCode: 'CS203',
      units: 'Unit 1: Stacks, Queues & Linked Lists',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs203-2',
      name: 'CS203_Unit_3_Binary_Search_Trees_AVL_Rotations.pdf',
      size: '3.8 MB',
      courseCode: 'CS203',
      units: 'Unit 3: Trees, Heaps & Balancing',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ],
  'CS204': [
    {
      id: 'demo-cs204-1',
      name: 'CS204_Unit_3_Relational_Algebra_Transactions.pdf',
      size: '2.8 MB',
      courseCode: 'CS204',
      units: 'Unit 3: Transactions & 2PL',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs204-2',
      name: 'CS204_Unit_4_SQL_Optimization_Indexing_BPlusTrees.pdf',
      size: '2.1 MB',
      courseCode: 'CS204',
      units: 'Unit 4: SQL & B+ Tree Indexing',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ],
  'CS205': [
    {
      id: 'demo-cs205-1',
      name: 'CS205_Unit_1_Semantic_HTML5_Microdata_Accessibility.pdf',
      size: '1.8 MB',
      courseCode: 'CS205',
      units: 'Unit 1: Semantic Tags & ARIA',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs205-2',
      name: 'CS205_Unit_3_Canvas_API_SVG_Media_Integration.pdf',
      size: '2.6 MB',
      courseCode: 'CS205',
      units: 'Unit 3: Canvas 2D & Web Audio',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ],
  'CS206': [
    {
      id: 'demo-cs206-1',
      name: 'CS206_Unit_2_Modern_Flexbox_CSS_Grid_Animations.pdf',
      size: '2.3 MB',
      courseCode: 'CS206',
      units: 'Unit 2: Flexbox & CSS Grid Masters',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs206-2',
      name: 'CS206_Unit_4_Responsive_Layouts_Custom_Properties.pdf',
      size: '2.5 MB',
      courseCode: 'CS206',
      units: 'Unit 4: Container Queries & Variables',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ],
  'CS207': [
    {
      id: 'demo-cs207-1',
      name: 'CS207_Unit_2_Closures_Prototypes_Scoping_Chains.pdf',
      size: '2.9 MB',
      courseCode: 'CS207',
      units: 'Unit 2: Scope, Execution Context & Closures',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs207-2',
      name: 'CS207_Unit_4_AsyncAwait_EventLoop_Fetch_APIs.pdf',
      size: '3.2 MB',
      courseCode: 'CS207',
      units: 'Unit 4: Event Loop & Microtasks',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ],
  'CS208': [
    {
      id: 'demo-cs208-1',
      name: 'CS208_Unit_2_Design_Systems_Figma_Wireframes.pdf',
      size: '3.4 MB',
      courseCode: 'CS208',
      units: 'Unit 2: Design Tokens & Components',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs208-2',
      name: 'CS208_Unit_4_Nielsen_Heuristics_Usability_Testing.pdf',
      size: '2.8 MB',
      courseCode: 'CS208',
      units: 'Unit 4: 10 Usability Heuristics & A/B Testing',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ],
  'CS209': [
    {
      id: 'demo-cs209-1',
      name: 'CS209_Unit_2_Product_Roadmaps_PRD_Metrics_Funnel.pdf',
      size: '2.6 MB',
      courseCode: 'CS209',
      units: 'Unit 2: PRDs & Product Metrics',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs209-2',
      name: 'CS209_Unit_3_Unit_Economics_SaaS_Pricing_APIs.pdf',
      size: '3.1 MB',
      courseCode: 'CS209',
      units: 'Unit 3: CAC, LTV & Payment Stacks',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ],
  'CS210': [
    {
      id: 'demo-cs210-1',
      name: 'CS210_Unit_1_German_A1_Grammar_Case_System_Vocab.pdf',
      size: '1.7 MB',
      courseCode: 'CS210',
      units: 'Unit 1: Nominativ & Akkusativ Cases',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs210-2',
      name: 'CS210_Unit_3_Modal_Verbs_Sentence_Structure_V2.pdf',
      size: '2.1 MB',
      courseCode: 'CS210',
      units: 'Unit 3: Modal Verben & V2 Rule',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ],
  'CS211': [
    {
      id: 'demo-cs211-1',
      name: 'CS211_Unit_3_FullStack_Architecture_APIs_Security.pdf',
      size: '3.2 MB',
      courseCode: 'CS211',
      units: 'Unit 3: System Design & Auth JWT',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: 'demo-cs211-2',
      name: 'CS211_Unit_5_CI_CD_DevOps_Docker_Production.pdf',
      size: '3.6 MB',
      courseCode: 'CS211',
      units: 'Unit 5: Docker Containerization & CI/CD',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ]
};

// Helper: Get demo PDFs for ANY subject (returns pre-defined or dynamically constructed)
export function getDemoPDFsForSubject(subject) {
  if (!subject) return [];
  const code = subject.code;
  if (SUBJECT_DEMO_PDFS_MAP[code]) {
    return SUBJECT_DEMO_PDFS_MAP[code];
  }

  // Auto-generate realistic demo PDFs for any other subject in curriculum
  const cleanName = (subject.name || 'Course').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 32);
  return [
    {
      id: `demo-${code}-1`,
      name: `${code}_Unit_1_Foundations_${cleanName}.pdf`,
      size: '2.5 MB',
      courseCode: code,
      units: 'Unit 1: Core Theoretical Foundations',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-2)
    },
    {
      id: `demo-${code}-2`,
      name: `${code}_Unit_3_Advanced_Applications_${cleanName}.pdf`,
      size: '3.2 MB',
      courseCode: code,
      units: 'Unit 3: Practical Frameworks & Case Studies',
      status: 'Ready for AI Synthesis',
      date: getTodayDateString(-1)
    }
  ];
}

// Initial pre-seeded high-yield study notes (CS204 DBMS + CS202 Networking)
export const INITIAL_BROADCAST_NOTES = [
  {
    id: 'note-cs204-unit3',
    title: 'CS204 Unit 3: Transaction Management, ACID & 2PL Concurrency Control',
    subjectCode: 'CS204',
    subjectName: 'DBMS - SQL & Relational Architecture',
    semester: 'Semester 2',
    teacherName: 'Prof. Ananya Roy',
    teacherDesignation: 'Associate Professor & Socratic Grounding Lead',
    teacherEmail: 'ananya.roy@isu.ac.in',
    pdfSource: 'CS204_Unit_3_Relational_Algebra_Transactions.pdf',
    date: getTodayDateString(-1),
    timestamp: 'Yesterday at 4:15 PM',
    targetCohortCount: 42,
    moduleOverview: 'Comprehensive study guide covering transaction states, schedules, serializability tests, and the two-phase locking protocol (2PL) grounded in the ITM University CSE syllabus.',
    keyConcepts: [
      {
        heading: '1. ACID Properties in Relational Databases',
        summary: 'Atomicity (All or None executed via Undo log), Consistency (Database remains in valid state), Isolation (Concurrent transactions do not interfere with each other), Durability (Committed changes persist even across power loss via Redo log).'
      },
      {
        heading: '2. Conflict Serializability & Precedence Graphs',
        summary: 'A schedule is conflict serializable if it is conflict equivalent to a serial schedule. Two operations conflict if they belong to different transactions, access the same data item, and at least one is a Write operation. Cycles in the Precedence Graph indicate non-serializability.'
      },
      {
        heading: '3. Two-Phase Locking (2PL) & Deadlock Prevention',
        summary: 'Growing Phase (Locks acquired, none released) followed by Shrinking Phase (Locks released, none acquired). Strict 2PL holds exclusive locks until commit/abort to prevent cascading rollbacks.'
      }
    ],
    examFormulas: [
      'Precedence Graph Edge Condition: Ti -> Tj if Ti executes an operation that conflicts with an operation of Tj and Ti precedes Tj in the schedule.',
      'Strict 2PL Rule: Exclusive lock (X-lock) must not be released until the transaction either commits or aborts.',
      'Conservative 2PL (Static): Acquire all locks before transaction execution begins — guarantees zero deadlocks.'
    ],
    highYieldExamQA: [
      {
        question: 'Q1: Why does Strict 2PL eliminate Cascading Aborts while Basic 2PL does not?',
        answer: 'In Basic 2PL, a transaction can release an exclusive lock before committing. If transaction T2 reads dirty data written by T1 and T1 later aborts, T2 must also abort (cascading). Strict 2PL holds all exclusive locks until commit/abort, guaranteeing dirty reads never occur.'
      },
      {
        question: 'Q2: Given operations R1(X), W2(X), W1(X), determine if a conflict exists.',
        answer: 'Yes! R1(X) and W2(X) conflict because they are from different transactions, target the same item X, and one is a Write. Also, W2(X) and W1(X) conflict (Write-Write conflict).'
      }
    ],
    quickCheatSheet: [
      'ACID = Atomicity, Consistency, Isolation, Durability',
      'Conflict = Diff Trans + Same Item + At least 1 Write',
      'No Cycles in Precedence Graph = Conflict Serializable',
      'Strict 2PL = Guarantees Serializability AND prevents cascading rollbacks (PostgreSQL/MySQL standard)'
    ],
    emailSubject: '[ISU Academic] New AI Study Guide Published: CS204 Unit 3 Transactions & Concurrency',
    emailPreviewSnippet: 'Prof. Ananya Roy has published the official AI-generated study notes and midterm prep guide for CS204. Verified against ITM University Syllabus.'
  },
  {
    id: 'note-cs202-unit2',
    title: 'CS202 Unit 2: OSI vs TCP/IP Layers, Three-Way Handshake & Subnetting',
    subjectCode: 'CS202',
    subjectName: 'Computer Networking',
    semester: 'Semester 2',
    teacherName: 'Dr. Vikramaditya Mehta',
    teacherDesignation: 'Associate Professor & Networking Lab Lead',
    teacherEmail: 'vikram.mehta@isu.ac.in',
    pdfSource: 'CS202_Unit_2_OSI_TCP_IP_Protocol_Architecture.pdf',
    date: getTodayDateString(0),
    timestamp: 'Today at 10:30 AM',
    targetCohortCount: 42,
    moduleOverview: 'Synthesized high-yield guide on networking architectures, TCP 3-way handshake sequence numbers, IP address classes, CIDR subnet mask derivations, and socket multiplexing.',
    keyConcepts: [
      {
        heading: '1. OSI 7-Layer vs TCP/IP 4-Layer Architecture',
        summary: 'OSI: Physical, Data Link, Network, Transport, Session, Presentation, Application. TCP/IP collapses top 3 layers into Application layer, and bottom 2 into Network Access / Link layer.'
      },
      {
        heading: '2. TCP Three-Way Handshake & Connection Teardown',
        summary: 'SYN (Seq=x) -> SYN-ACK (Seq=y, Ack=x+1) -> ACK (Seq=x+1, Ack=y+1). Teardown uses 4-way FIN/ACK sequence with TIME_WAIT state to guarantee last ACK delivery.'
      },
      {
        heading: '3. CIDR Subnetting & Supernetting',
        summary: 'Classless Inter-Domain Routing (/24 gives 256 addresses, 254 usable hosts). Network address has host bits set to 0, Broadcast address has host bits set to 1.'
      }
    ],
    examFormulas: [
      'Usable Hosts per Subnet: N = 2^(32 - PrefixLength) - 2',
      'Bandwidth-Delay Product (BDP) = Bandwidth (bps) * Round Trip Time (seconds)',
      'Nyquist Maximum Bit Rate = 2 * Bandwidth * log2(SignalLevels)'
    ],
    highYieldExamQA: [
      {
        question: 'Q1: Why does TCP use a 3-way handshake instead of a 2-way handshake?',
        answer: 'A 2-way handshake cannot protect against delayed or duplicated duplicate SYN packets from earlier crashed connections, which could cause the receiver to open phantom connections without client agreement.'
      },
      {
        question: 'Q2: Given IP 192.168.10.45/27, find Network Address and Broadcast Address.',
        answer: 'Prefix /27 means subnet block size is 2^(32-27) = 32. Blocks: 0-31, 32-63. IP 45 falls in block 32-63. Network Address = 192.168.10.32, Broadcast Address = 192.168.10.63.'
      }
    ],
    quickCheatSheet: [
      'TCP = Connection-oriented, Reliable, Ordered, Byte-stream (HTTP, SSH, FTP)',
      'UDP = Connectionless, Fast, No retransmission (DNS, DHCP, VoIP, Video Streaming)',
      'Port 80 = HTTP, Port 443 = HTTPS, Port 53 = DNS, Port 22 = SSH'
    ],
    emailSubject: '[ISU Academic] New AI Study Guide Published: CS202 Unit 2 OSI, TCP Handshake & CIDR',
    emailPreviewSnippet: 'Dr. Vikramaditya Mehta has published official revision notes and subnet formulas for CS202 Computer Networking.'
  }
];

// Retrieve all broadcasted notes from storage
export function getSavedBroadcastNotes() {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      saveBroadcastNotes(INITIAL_BROADCAST_NOTES);
      return INITIAL_BROADCAST_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BROADCAST_NOTES;
  } catch (err) {
    console.error('Failed to parse broadcast notes:', err);
    return INITIAL_BROADCAST_NOTES;
  }
}

// Save notes to storage and emit event
export function saveBroadcastNotes(notes) {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aisa_notes_broadcasted', { detail: notes }));
    }
  } catch (err) {
    console.error('Failed to save broadcast notes:', err);
  }
}

// Publish a newly generated note
export function publishNewBroadcastNote(noteData) {
  const existing = getSavedBroadcastNotes();
  const newNote = {
    id: `note-${Date.now()}`,
    ...noteData,
    date: getTodayDateString(0),
    timestamp: 'Just now'
  };

  const updated = [newNote, ...existing];
  saveBroadcastNotes(updated);
  return newNote;
}

// Comprehensive multi-subject AI study notes generator
export function generateAIStudyNotes(docName, subject, adminUser) {
  const code = (subject?.code || '').toUpperCase();
  const sName = subject?.name || 'Computer Science Course';
  const sem = subject?.semester || 'Semester 2';
  const teacher = adminUser?.name || 'Prof. Ananya Roy';
  const email = adminUser?.email || 'ananya.roy@isu.ac.in';

  // 1. CS202: Computer Networking
  if (code.includes('CS202') || sName.toLowerCase().includes('network')) {
    return {
      title: `${code} Master Guide: OSI/TCP-IP Stack, Routing Algorithms & Socket Transport`,
      subjectCode: code,
      subjectName: sName,
      semester: sem,
      teacherName: teacher,
      teacherDesignation: 'Networking & Socratic AI Grounding Lead',
      teacherEmail: email,
      pdfSource: docName,
      targetCohortCount: 42,
      moduleOverview: `Synthesized from "${docName}". Covers OSI 7-layer vs TCP/IP models, sliding window flow control, Dijkstra link-state vs Bellman-Ford distance-vector routing, and DNS hierarchy.`,
      keyConcepts: [
        {
          heading: '1. Transport Protocols: TCP vs UDP In-Depth',
          summary: 'TCP provides reliable, ordered, connection-oriented byte stream using sliding window flow control and Reno/Cubic congestion control. UDP provides lightweight, connectionless datagram delivery with zero handshake overhead.'
        },
        {
          heading: '2. Routing Protocols & Algorithms (OSPF vs BGP)',
          summary: 'Intra-domain routing uses OSPF (Link State, Dijkstra O(V log V)) and RIP (Distance Vector, Bellman-Ford). Inter-domain routing relies on BGP (Path Vector) ensuring policy-based traffic transit across Autonomous Systems (AS).'
        },
        {
          heading: '3. Application Protocols: HTTP/1.1 vs HTTP/2 vs HTTP/3',
          summary: 'HTTP/1.1 introduced persistent connections but suffered from Head-of-Line (HoL) blocking. HTTP/2 multiplexed streams over one TCP connection. HTTP/3 moves to QUIC over UDP to eliminate transport-layer HoL blocking on packet loss.'
        }
      ],
      examFormulas: [
        'Bandwidth-Delay Product (BDP) = Bandwidth (bps) * RTT (sec)',
        'Subnet Calculation: Usable Host Addresses = 2^(32 - Prefix) - 2',
        'TCP Throughput Bound: Rate <= (1.22 * MSS) / (RTT * sqrt(p)) where p is packet loss rate'
      ],
      highYieldExamQA: [
        {
          question: 'Q1: How does TCP Congestion Control transition between Slow Start, Congestion Avoidance, and Fast Recovery?',
          answer: 'Starts in Slow Start where cwnd doubles every RTT until ssthresh is reached. Above ssthresh, it enters Congestion Avoidance (linear cwnd += 1 MSS per RTT). On 3 duplicate ACKs, ssthresh = cwnd / 2, cwnd = ssthresh + 3 MSS, and enters Fast Recovery without dropping to 1 MSS.'
        },
        {
          question: 'Q2: Explain the count-to-infinity problem in Distance Vector routing and how Split Horizon resolves it.',
          answer: 'When a link fails, nodes iterate updating distance vectors assuming alternate paths through each other, creating routing loops. Split Horizon prevents a router from advertising a route back out the same interface through which it was learned.'
        }
      ],
      quickCheatSheet: [
        'Physical Layer = Bits, Hubs, Repeaters',
        'Data Link Layer = Frames, MAC addresses, Switches (CSMA/CD on Ethernet)',
        'Network Layer = Packets, IP addresses, Routers (ICMP, ARP, OSPF, BGP)',
        'Transport Layer = Segments (TCP) / Datagrams (UDP), Port Numbers',
        'Application Layer = Messages (HTTP, DNS, TLS, SSH)'
      ],
      emailSubject: `[ISU CSE] New AI Study Guide: ${code} Computer Networking & Transport Architecture`,
      emailPreviewSnippet: `Official AI Study Guide generated from "${docName}" for ${sName}. Includes TCP flow control, subnetting math, and viva Q&A.`
    };
  }

  // 2. CS201: Java Programming
  if (code.includes('CS201') || sName.toLowerCase().includes('java')) {
    return {
      title: `${code} Revision Guide: OOP, JVM Memory Model, Multithreading & Streams`,
      subjectCode: code,
      subjectName: sName,
      semester: sem,
      teacherName: teacher,
      teacherDesignation: 'Associate Professor & Systems Lead',
      teacherEmail: email,
      pdfSource: docName,
      targetCohortCount: 42,
      moduleOverview: `Synthesized from "${docName}". High-yield summary of JVM internals (ClassLoader, Heap, Metaspace), Thread synchronization, ConcurrentHashMap, and Java 8 Streams API.`,
      keyConcepts: [
        {
          heading: '1. JVM Memory Layout & Garbage Collection',
          summary: 'Heap (Young Gen Eden/Survivor, Old Gen) stores objects; Thread Stacks store local variables and frames; Metaspace stores class metadata. G1 and ZGC garbage collectors optimize pause times via generational compaction.'
        },
        {
          heading: '2. Thread Synchronization & The Volatile Keyword',
          summary: 'The synchronized block enforces mutual exclusion using JVM object monitors (monitorenter/monitorexit). volatile guarantees visibility across CPU core caches (happens-before relationship) without acquiring locks.'
        },
        {
          heading: '3. Functional Programming & Stream Pipeline Execution',
          summary: 'Streams process collections lazily using intermediate operations (filter, map, flatMap) and terminal operations (collect, reduce). ForkJoinPool enables parallel stream processing.'
        }
      ],
      examFormulas: [
        'HashMap Bucket Index: index = (n - 1) & hash(key)',
        'Treeification Threshold: Bucket LinkedList converts to Red-Black Tree when chain length >= 8 and table capacity >= 64.',
        'Amdahl Law: Speedup = 1 / ((1 - P) + (P / N)) for multi-core scaling'
      ],
      highYieldExamQA: [
        {
          question: 'Q1: Why is String immutable in Java and how does it protect the String Constant Pool?',
          answer: 'Immutability ensures security (passing DB credentials, network sockets), thread-safety without locks, and allows the JVM to share string literals in the String Constant Pool without one thread modifying another thread reference.'
        },
        {
          question: 'Q2: Differentiate between Fail-Fast and Fail-Safe iterators with examples.',
          answer: 'Fail-Fast iterators (e.g. ArrayList, HashMap) throw ConcurrentModificationException if the collection is structurally modified during iteration by checking modCount. Fail-Safe iterators (e.g. CopyOnWriteArrayList, ConcurrentHashMap) operate on a clone or snapshot.'
        }
      ],
      quickCheatSheet: [
        'Checked Exception = Extends Exception (Compile-time forced try-catch)',
        'Unchecked Exception = Extends RuntimeException (e.g. NullPointerException)',
        'Final Variable = Constant; Final Method = Cannot be overridden; Final Class = Cannot be inherited',
        'Comparable = compareTo() in same class; Comparator = compare() in external custom class'
      ],
      emailSubject: `[ISU CSE] New AI Study Guide: ${code} Java OOP & JVM Concurrency`,
      emailPreviewSnippet: `New AI Revision Guide parsed from "${docName}" for Java Programming. High-yield interview & exam questions attached.`
    };
  }

  // 3. CS203 / CS301: Data Structures & Algorithms
  if (code.includes('CS203') || code.includes('CS301') || sName.toLowerCase().includes('data structure') || sName.toLowerCase().includes('algorithm')) {
    return {
      title: `${code} Master Guide: Trees, Balanced BSTs, Heaps & Dynamic Programming`,
      subjectCode: code,
      subjectName: sName,
      semester: sem,
      teacherName: teacher,
      teacherDesignation: 'Algorithms Lead & Grounding Expert',
      teacherEmail: email,
      pdfSource: docName,
      targetCohortCount: 42,
      moduleOverview: `Synthesized from "${docName}". Invariants, rotation derivations for AVL trees, Priority Queues with Binary Heaps, and DP tabular optimization patterns.`,
      keyConcepts: [
        {
          heading: '1. Binary Search Trees & AVL Self-Balancing',
          summary: 'BST property: Left < Root < Right. AVL trees maintain balance factor in {-1, 0, +1} using 4 rotation types: LL (single right), RR (single left), LR (left then right), RL (right then left).'
        },
        {
          heading: '2. Binary Heaps & HeapSort Mechanics',
          summary: 'Complete binary tree stored as an array: Parent(i) = (i-1)/2, Left(i) = 2i+1, Right(i) = 2i+2. Build-heap runs in O(N) linear time; Extract-Max runs in O(log N).'
        },
        {
          heading: '3. Dynamic Programming: Tabulation vs Memoization',
          summary: 'Identified by optimal substructure and overlapping subproblems. Bottom-up tabulation avoids recursion depth limits; state space compression reduces memory from O(N^2) to O(N).'
        }
      ],
      examFormulas: [
        'Master Theorem: T(n) = aT(n/b) + O(n^d). If d < log_b(a) -> O(n^(log_b a))',
        'AVL Balance Factor: BF(node) = Height(left) - Height(right)',
        'Heap Array Navigation: Child(i) = 2i+1 and 2i+2, Parent(i) = floor((i-1)/2)'
      ],
      highYieldExamQA: [
        {
          question: 'Q1: Why does QuickSort have O(N^2) worst case but is practically faster than MergeSort O(N log N)?',
          answer: 'QuickSort operates in-place with O(1) auxiliary memory and exhibits exceptional CPU cache locality. Randomized pivot selection eliminates the worst-case sorted array degeneration in practice.'
        },
        {
          question: 'Q2: Derive why building a binary heap from an unsorted array takes O(N) time instead of O(N log N).',
          answer: 'Bottom-up heapify sums height h from 0 to log N of (n / 2^(h+1)) * O(h). Using the geometric series sum(h / 2^h) = 2, the total work converges strictly to O(N).'
        }
      ],
      quickCheatSheet: [
        'Array Access = O(1), Search = O(N)',
        'Hash Table Avg = O(1) Insert/Search/Delete, Worst = O(N)',
        'Binary Search = O(log N) on sorted arrays only',
        'MergeSort = Stable, O(N log N) always, needs O(N) extra space'
      ],
      emailSubject: `[ISU CSE] New AI Study Guide: ${code} Data Structures & Algorithms`,
      emailPreviewSnippet: `High-yield AI Notes for ${sName} generated from "${docName}". AVL rotations and recurrence relations inside.`
    };
  }

  // 4. CS205 / CS206 / CS207: Web Development & JavaScript
  if (code.includes('CS205') || code.includes('CS206') || code.includes('CS207') || sName.toLowerCase().includes('javascript') || sName.toLowerCase().includes('html') || sName.toLowerCase().includes('css')) {
    return {
      title: `${code} Web Architecture Guide: DOM, Modern CSS Systems & JS Event Loop`,
      subjectCode: code,
      subjectName: sName,
      semester: sem,
      teacherName: teacher,
      teacherDesignation: 'Web Technologies Lead',
      teacherEmail: email,
      pdfSource: docName,
      targetCohortCount: 42,
      moduleOverview: `Synthesized from "${docName}". Covers Semantic Web, Flexbox/Grid layouts, JavaScript execution context, closures, Promises, and the browser render pipeline.`,
      keyConcepts: [
        {
          heading: '1. JavaScript Engine & Browser Event Loop',
          summary: 'Call Stack executes synchronous code. Asynchronous operations delegate to Web APIs. Resolved Promises queue into the Microtask Queue (processed first before render), while setTimeout/setInterval queue into the Macrotask Queue.'
        },
        {
          heading: '2. Scoping, Closures & Prototypal Inheritance',
          summary: 'Closures preserve access to outer lexical scope even after the outer function returns. Every object links to a prototype object (__proto__); prototype chaining enables method sharing without code duplication.'
        },
        {
          heading: '3. Modern CSS: Grid vs Flexbox & The Critical Render Path',
          summary: 'Flexbox is 1-dimensional (content-first rows or columns); CSS Grid is 2-dimensional (layout-first tracks). The browser render pipeline executes DOM + CSSOM -> Render Tree -> Layout (Reflow) -> Paint (Repaint) -> Composite.'
        }
      ],
      examFormulas: [
        'CSS Specificity Weight: Inline (1000) > ID (100) > Class/Attribute/Pseudo (10) > Element (1)',
        'Box Model Total Width: Width + Padding-Left + Padding-Right + Border-Left + Border-Right',
        'Promise.all vs Promise.allSettled: all rejects immediately on first failure; allSettled waits for all promises.'
      ],
      highYieldExamQA: [
        {
          question: 'Q1: Explain the difference between Debouncing and Throttling with practical use cases.',
          answer: 'Debouncing delays execution until a set delay has elapsed since the LAST event (e.g. search autocomplete input). Throttling ensures a function executes at most once every X milliseconds regardless of event frequency (e.g. scroll and resize event handlers).'
        },
        {
          question: 'Q2: Why is modifying transform and opacity GPU-accelerated while top/left causes reflow?',
          answer: 'transform and opacity are handled directly in the Compositor thread without recalculating geometry (Layout/Reflow) or repainting pixels. top and left force the CPU to recalculate element coordinates and trigger expensive layout recalculations for surrounding elements.'
        }
      ],
      quickCheatSheet: [
        'Microtasks = Promises (.then/catch), MutationObserver, queueMicrotask()',
        'Macrotasks = setTimeout, setInterval, setImmediate, I/O, UI rendering',
        '== performs type coercion; === checks value AND strict type',
        'box-sizing: border-box includes padding and border in declared dimensions'
      ],
      emailSubject: `[ISU Web Lab] New AI Study Guide: ${code} ${sName}`,
      emailPreviewSnippet: `Official AI Study Guide generated from "${docName}". Covers JS Event Loop, CSS specificity, and DOM performance.`
    };
  }

  // 5. CS208: Design Thinking & UI/UX
  if (code.includes('CS208') || sName.toLowerCase().includes('design') || sName.toLowerCase().includes('ui/ux')) {
    return {
      title: `${code} Master Guide: Design Thinking Process, Figma Systems & Usability Heuristics`,
      subjectCode: code,
      subjectName: sName,
      semester: sem,
      teacherName: teacher,
      teacherDesignation: 'HCI & UX Research Lead',
      teacherEmail: email,
      pdfSource: docName,
      targetCohortCount: 42,
      moduleOverview: `Synthesized from "${docName}". Comprehensive grounding in the 5-stage Stanford d.school Design Thinking framework, Jakob Nielsen 10 Usability Heuristics, and Figma Design Tokens.`,
      keyConcepts: [
        {
          heading: '1. Stanford 5-Stage Design Thinking Framework',
          summary: 'Empathize (Observe and engage with users), Define (Craft Point of View problem statements), Ideate (Brainstorm wide solutions without bias), Prototype (Low to high-fidelity mockups), Test (Validate with real users).'
        },
        {
          heading: '2. Jakob Nielsen 10 Usability Heuristics',
          summary: 'Core guidelines: Visibility of system status, Match between system and real world, User control and freedom (Undo), Consistency and standards, Error prevention, Recognition over recall, Flexibility of use, Aesthetic and minimalist design.'
        },
        {
          heading: '3. Design Systems & Figma Architecture',
          summary: 'Atomic Design methodology (Atoms, Molecules, Organisms, Templates, Pages). Global Design Tokens for typography scales, spacing units (8pt grid), and semantic color palettes.'
        }
      ],
      examFormulas: [
        'Fitts Law for Target Acquisition: T = a + b * log2(1 + D/W) (Larger and closer targets are faster to click)',
        'Hick Law for Decision Time: RT = b * log2(n + 1) (Decision time increases logarithmically with number of choices)',
        'WCAG AA Contrast Ratio: Minimum 4.5:1 for normal text, 3:1 for large text (18pt+)'
      ],
      highYieldExamQA: [
        {
          question: 'Q1: What is the difference between an Affordance and a Signifier in user experience design?',
          answer: 'An affordance is the actual physical or digital property that determines how an object could be used (e.g. a button can be clicked). A signifier is any perceptible cue that signals the presence of the affordance (e.g. drop shadow, rounded corners, or hover glow).'
        }
      ],
      quickCheatSheet: [
        'Lo-Fi Wireframe = Focus on content hierarchy and layout structure',
        'Hi-Fi Prototype = Interactive, polished UI with real typography and states',
        'Usability Testing = Test with 5 users discovers ~85% of usability flaws',
        '8pt Grid System = Consistent layout scaling across mobile and desktop screens'
      ],
      emailSubject: `[ISU Design] New AI Study Guide: ${code} Design Thinking & UI/UX Systems`,
      emailPreviewSnippet: `Prof. Ananya Roy released AI Study Guide for ${sName}. Includes Nielsen heuristics and UX formulas.`
    };
  }

  // 6. CS209: Product Management & SaaS Pricing
  if (code.includes('CS209') || sName.toLowerCase().includes('product') || sName.toLowerCase().includes('pricing')) {
    return {
      title: `${code} Master Guide: SaaS Unit Economics, Pricing Strategies & Payment Stacks`,
      subjectCode: code,
      subjectName: sName,
      semester: sem,
      teacherName: teacher,
      teacherDesignation: 'Product Management & Venture Lead',
      teacherEmail: email,
      pdfSource: docName,
      targetCohortCount: 42,
      moduleOverview: `Synthesized from "${docName}". Deep-dive into Product Requirements Documents (PRDs), customer acquisition funnels, SaaS metric derivations, and Stripe/Razorpay payment architecture.`,
      keyConcepts: [
        {
          heading: '1. SaaS Unit Economics: CAC, LTV & Payback Period',
          summary: 'Customer Acquisition Cost (CAC) = Total Sales & Marketing Expenses / New Customers Acquired. Customer Lifetime Value (LTV) = (ARPU * Gross Margin) / Churn Rate. A healthy venture maintains LTV/CAC ratio >= 3.0.'
        },
        {
          heading: '2. Modern Software Monetization & Pricing Models',
          summary: 'Freemium vs Reverse Trial vs Usage-Based (Consumption) pricing. Value metric alignment ensures revenue scales directly with customer usage (e.g. API calls, active seats, storage gigabytes).'
        },
        {
          heading: '3. Robust Payment Stack & Webhook Architecture',
          summary: 'Payment Intent creation, 3D Secure verification, idempotent webhook handlers to prevent double-billing on network retries, and automated subscription renewal reconciliation.'
        }
      ],
      examFormulas: [
        'LTV/CAC Benchmark Formula: LTV / CAC >= 3.0 (Under 1.0 is insolvency, over 5.0 indicates under-investing in growth)',
        'Monthly Customer Churn Rate = Lost Customers in Month / Active Customers at Month Start',
        'CAC Payback Period (Months) = CAC / (ARPU * Gross Margin %)'
      ],
      highYieldExamQA: [
        {
          question: 'Q1: Why is handling Stripe/Razorpay webhook events with Idempotency Keys critical in fintech applications?',
          answer: 'Webhooks can be delivered more than once due to transient network timeouts. If webhooks are not idempotent, a customer who purchased one plan might receive duplicate invoices, duplicate order fulfillments, or multiple debit events.'
        }
      ],
      quickCheatSheet: [
        'ARPU = Average Revenue Per User',
        'MRR = Monthly Recurring Revenue | ARR = Annual Recurring Revenue (12 * MRR)',
        'Net Revenue Retention (NRR) > 100% means existing cohort expands revenue over time',
        'North Star Metric = Single metric that captures core value delivered to customers'
      ],
      emailSubject: `[ISU Product] New AI Study Guide: ${code} Product Architecture & Unit Economics`,
      emailPreviewSnippet: `Master Guide for ${sName} synthesized from "${docName}". SaaS formulas, LTV/CAC ratios, and Stripe APIs inside.`
    };
  }

  // 7. CS210: German Language A1
  if (code.includes('CS210') || sName.toLowerCase().includes('german')) {
    return {
      title: `${code} Revision Guide: German A1 Grammar, Case System & Dialogue Essentials`,
      subjectCode: code,
      subjectName: sName,
      semester: sem,
      teacherName: teacher,
      teacherDesignation: 'Foreign Languages Lead',
      teacherEmail: email,
      pdfSource: docName,
      targetCohortCount: 42,
      moduleOverview: `Synthesized from "${docName}". Master summary of German noun genders, Nominativ vs Akkusativ, modal verbs, separable verbs (Trennbare Verben), and the V2 sentence structure rule.`,
      keyConcepts: [
        {
          heading: '1. The German Case System: Nominativ & Akkusativ',
          summary: 'Nominativ marks the subject (der, die, das, die). Akkusativ marks the direct object, causing the masculine article to shift from der -> den (ein -> einen), while feminine, neutral, and plural forms remain unchanged.'
        },
        {
          heading: '2. Verb Conjugation & The Sacred V2 Rule',
          summary: 'In standard German main clauses (Hauptsatz), the finite conjugated verb MUST ALWAYS occupy the second position (Verb 2nd). Adverbs or time phrases in position 1 trigger subject-verb inversion.'
        },
        {
          heading: '3. Modal Verbs (können, müssen, wollen, dürfen)',
          summary: 'Modal verbs conjugate in position 2, while the main action verb moves to the very end of the sentence in its infinitive form (Satzklammer structure).'
        }
      ],
      examFormulas: [
        'Akkusativ Article Rule: der -> den, ein -> einen (Only Masculine changes; die and das stay the same)',
        'V2 Word Order Formula: [Element 1: Subject or Time] + [Verb (Conjugated)] + [Subject (if inverted)] + ... + [Infinitive Verb (End)]',
        'Personal Pronouns Akkusativ: ich -> mich, du -> dich, er -> ihn, sie -> sie, es -> es, wir -> uns'
      ],
      highYieldExamQA: [
        {
          question: 'Q1: Reorder into a correct German sentence: "Ich / heute / ein Buch / lesen / möchte".',
          answer: 'Correct: "Ich möchte heute ein Buch lesen." (Modal verb "möchte" in position 2, infinitive action verb "lesen" placed at the end).'
        }
      ],
      quickCheatSheet: [
        'der (Masculine) | die (Feminine) | das (Neuter) | die (Plural)',
        'Guten Tag = Good day | Auf Wiedersehen = Goodbye | Vielen Dank = Thank you very much',
        'Verb endings: ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie/Sie -en'
      ],
      emailSubject: `[ISU Languages] New AI Study Guide: ${code} German A1 Grammar & Vocabulary`,
      emailPreviewSnippet: `German A1 revision notes generated from "${docName}". High-yield grammar rules and vocabulary cheat sheet.`
    };
  }

  // 8. CS211: Sem2 Project Building & Evaluation
  if (code.includes('CS211') || sName.toLowerCase().includes('project')) {
    return {
      title: `${code} Engineering Guide: System Architecture, Docker & Production Readiness`,
      subjectCode: code,
      subjectName: sName,
      semester: sem,
      teacherName: teacher,
      teacherDesignation: 'Project Evaluation Board Lead',
      teacherEmail: email,
      pdfSource: docName,
      targetCohortCount: 42,
      moduleOverview: `Synthesized from "${docName}". Key evaluation criteria for full-stack capstone projects: 3-tier architecture, JWT authentication, Docker containerization, CI/CD automated testing, and faculty viva questions.`,
      keyConcepts: [
        {
          heading: '1. Three-Tier Architectural Decomposition',
          summary: 'Clear separation of Presentation (React SPA), Business Logic (Express/FastAPI), and Data Persistence (PostgreSQL/MongoDB). Decoupled API contracts enable independent scaling.'
        },
        {
          heading: '2. Secure Authentication with JWT & Refresh Tokens',
          summary: 'Short-lived Access Tokens (15 min) kept in memory or httpOnly cookies, paired with database-backed revocable Refresh Tokens for silent re-authentication without vulnerability to XSS/CSRF.'
        },
        {
          heading: '3. Dockerization & Production CI/CD Pipelines',
          summary: 'Multi-stage Docker builds minimize final image footprints. GitHub Actions pipeline automates linting, unit test suites, and zero-downtime deployment.'
        }
      ],
      examFormulas: [
        'JWT Structure: Header.Payload.Signature (Base64URL encoded; Signature = HMAC-SHA256(Header + Payload, Secret))',
        'System Availability: 99.9% (Three Nines) = Maximum 8.76 hours of downtime per year',
        'Response Time Budget: < 200ms for 95th percentile (P95) API endpoints'
      ],
      highYieldExamQA: [
        {
          question: 'Q1: What are the key evaluation criteria tested during the Faculty Capstone Project Viva?',
          answer: 'Faculty test for: (1) System Architecture & Database Normalization, (2) Error handling & Edge cases, (3) Security practices (no exposed API keys, SQL injection prevention), and (4) Live demonstration of responsive CRUD features.'
        }
      ],
      quickCheatSheet: [
        'Never commit .env files to Git repository',
        'Use CORS middleware to strictly allow authorized frontend origins',
        'Index foreign key columns in SQL to accelerate join query performance',
        'Implement database connection pooling to avoid socket starvation'
      ],
      emailSubject: `[ISU Capstone] New AI Study Guide: ${code} Project Architecture & Viva Prep`,
      emailPreviewSnippet: `Capstone Project revision guide synthesized from "${docName}". Architecture patterns and viva questions inside.`
    };
  }

  // 9. Default Fallback: Intelligently ground using subject name, code, units, and description
  return {
    title: `${code} Master Study Guide: ${sName} Core Syllabus Synthesis`,
    subjectCode: code,
    subjectName: sName,
    semester: sem,
    teacherName: teacher,
    teacherDesignation: 'Curriculum & Socratic AI Grounding Lead',
    teacherEmail: email,
    pdfSource: docName,
    targetCohortCount: 42,
    moduleOverview: `Official university study guide synthesized from "${docName}". Extracted high-yield core concepts, fundamental formulas, and examination viva questions aligned with the ITM University syllabus for ${sName}.`,
    keyConcepts: [
      {
        heading: `1. Core Principles & Theoretical Foundations of ${sName}`,
        summary: `Fundamental abstractions, governing laws, and standard engineering methodologies established across the primary syllabus units of ${code}.`
      },
      {
        heading: '2. Industry Standards, Architecture & Problem Solving',
        summary: `Application of theoretical concepts to real-world software engineering, computational models, and systematic problem decomposition.`
      },
      {
        heading: '3. Performance Optimization & Best Practices',
        summary: `Critical engineering trade-offs, efficiency benchmarks, and robust fault-tolerant design rules emphasized in university examinations.`
      }
    ],
    examFormulas: [
      `${code} Core Invariant: Verified compliance with university curriculum standards`,
      `Efficiency Optimization Benchmark: Time & Space bounds within target engineering constraints`,
      `Quality Assurance Metric: 100% ground truth alignment with uploaded syllabus materials`
    ],
    highYieldExamQA: [
      {
        question: `Q1: Explain the primary objectives and practical significance of ${sName} in modern computer engineering.`,
        answer: `${sName} (${code}) provides foundational principles required to analyze, design, and implement scalable, verified computational systems following standard institutional protocols.`
      },
      {
        question: `Q2: What are the most common examination pitfalls in ${code} and how should students avoid them?`,
        answer: 'Students frequently lose marks on boundary conditions and missing derivations. Always write formal definitions, step-by-step proofs, and clean architecture diagrams before concluding answers.'
      }
    ],
    quickCheatSheet: [
      `Master Unit 1 & Unit 2 definitions for objective questions`,
      `Practice numerical problems and derivations under timed conditions`,
      `Review lecture slide diagrams and verify against textbook references`,
      `Prepare concise 2-sentence answers for viva and oral evaluations`
    ],
    emailSubject: `[ISU Academic] New AI Study Guide: ${code} ${sName}`,
    emailPreviewSnippet: `Prof. ${teacher} has released the official AI Study Notes for ${sName} generated from "${docName}".`
  };
}

// Student read/unread tracking
export function getStudentReadNotes(studentEmail = 'aditi.sharma@univ.edu') {
  try {
    const raw = localStorage.getItem(`${READ_NOTES_STORAGE_KEY}_${studentEmail}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function markNoteAsReadByStudent(noteId, studentEmail = 'aditi.sharma@univ.edu') {
  try {
    const read = getStudentReadNotes(studentEmail);
    if (!read.includes(noteId)) {
      const updated = [...read, noteId];
      localStorage.setItem(`${READ_NOTES_STORAGE_KEY}_${studentEmail}`, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aisa_notes_read_updated', { detail: updated }));
      }
    }
  } catch (e) {
    console.error('Failed to mark note as read:', e);
  }
}

