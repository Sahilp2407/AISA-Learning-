// Engineering Subject MCQs Question Bank for Unit Assessments & Cloud Tracking
// Contains standard University exam & GATE-pattern conceptual multiple choice questions

export const SUBJECT_MCQS_MAP = {
  // 1. DBMS (CS204 / CS301)
  'CS204': [
    {
      id: 'dbms-q1',
      unit: 1,
      unitTitle: 'ER Models & Relational Algebra',
      question: 'Which relational algebra operation is used to select rows from a table that satisfy a given condition?',
      options: [
        'Projection (π)',
        'Selection (σ)',
        'Join (⋈)',
        'Cartesian Product (×)'
      ],
      correctIndex: 1,
      explanation: 'The Selection operation (denoted by Greek letter σ) filters tuples (rows) that satisfy a specified predicate in relational algebra.'
    },
    {
      id: 'dbms-q2',
      unit: 2,
      unitTitle: 'SQL & Advanced Queries',
      question: 'In SQL, what is the primary difference between WHERE and HAVING clauses?',
      options: [
        'WHERE filters groups, while HAVING filters individual rows before aggregation.',
        'WHERE filters rows before aggregation, while HAVING filters groups formed by GROUP BY.',
        'WHERE cannot use comparison operators, while HAVING can.',
        'There is no functional difference; they are interchangeable keywords.'
      ],
      correctIndex: 1,
      explanation: 'WHERE filters rows prior to grouping and aggregation. HAVING filters grouped rows after the GROUP BY clause has been applied.'
    },
    {
      id: 'dbms-q3',
      unit: 3,
      unitTitle: 'Database Normalization',
      question: 'A relation R is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X → Y:',
      options: [
        'Y is a prime attribute.',
        'X is a superkey of relation R.',
        'X contains no nullable attributes.',
        'Y is a subset of X.'
      ],
      correctIndex: 1,
      explanation: 'In BCNF, for every functional dependency X → Y, X must strictly be a superkey. Unlike 3NF, BCNF does not allow Y to just be a prime attribute.'
    },
    {
      id: 'dbms-q4',
      unit: 4,
      unitTitle: 'Indexing & B+ Trees',
      question: 'Why are B+ Trees favored over balanced Binary Search Trees (AVL/Red-Black) for disk-based database indexes?',
      options: [
        'B+ Trees have higher tree height, requiring more CPU comparisons.',
        'B+ Trees store all actual records inside root nodes for instantaneous access.',
        'B+ Trees have high fan-out (node branching factor), drastically minimizing disk block I/O operations.',
        'B+ Trees eliminate the need for write-ahead logging (WAL).'
      ],
      correctIndex: 2,
      explanation: 'B+ Trees have a high branching factor (fan-out), meaning each node fits in a disk page. This reduces tree height to 3-4 levels, requiring very few disk I/Os.'
    },
    {
      id: 'dbms-q5',
      unit: 5,
      unitTitle: 'Transactions & Concurrency (ACID)',
      question: 'Under Rigorous Two-Phase Locking (Strict 2PL), when are exclusive (X) locks held by a transaction released?',
      options: [
        'Immediately after the data item is updated.',
        'At the midpoint of the shrinking phase.',
        'Only after the transaction either commits or aborts.',
        'Whenever another high-priority transaction requests a read lock.'
      ],
      correctIndex: 2,
      explanation: 'In Strict/Rigorous 2PL, all exclusive locks are held until transaction completion (commit or abort), preventing cascading rollbacks and ensuring recoverability.'
    }
  ],

  // 2. Data Structures & Algorithms (CS203)
  'CS203': [
    {
      id: 'dsa-q1',
      unit: 1,
      unitTitle: 'Asymptotic Analysis & Recurrences',
      question: 'What is the tight asymptotic time complexity of Merge Sort in the worst case, and is it an in-place sort?',
      options: [
        'O(N log N) time; in-place with O(1) auxiliary space.',
        'O(N^2) time; requires O(N) auxiliary space.',
        'O(N log N) time; not in-place, requires O(N) auxiliary memory.',
        'O(N) time; requires O(log N) auxiliary space.'
      ],
      correctIndex: 2,
      explanation: 'Standard Merge Sort runs in worst-case O(N log N) time and requires O(N) auxiliary space to merge sorted halves, making it not in-place.'
    },
    {
      id: 'dsa-q2',
      unit: 2,
      unitTitle: 'Trees & Balanced BSTs',
      question: 'In a Red-Black tree with N keys, what is the maximum possible height from the root to any leaf?',
      options: [
        'log2(N)',
        '2 * log2(N + 1)',
        'N / 2',
        'sqrt(N)'
      ],
      correctIndex: 1,
      explanation: 'The black-height property ensures no simple path from root to leaf has more than twice as many nodes as any other path. Thus height is at most 2*log2(N+1).'
    },
    {
      id: 'dsa-q3',
      unit: 3,
      unitTitle: 'Graph Algorithms',
      question: "Which algorithm finds single-source shortest paths in a directed weighted graph with arbitrary (including negative) edge weights, assuming no negative weight cycles?",
      options: [
        "Dijkstra's Algorithm",
        "Bellman-Ford Algorithm",
        "Prim's Algorithm",
        "Kruskal's Algorithm"
      ],
      correctIndex: 1,
      explanation: 'The Bellman-Ford algorithm handles graphs with negative edge weights in O(V * E) time and can also detect unreachable negative-weight cycles.'
    },
    {
      id: 'dsa-q4',
      unit: 4,
      unitTitle: 'Dynamic Programming',
      question: 'What are the two foundational structural properties a problem must exhibit to be solvable via Dynamic Programming?',
      options: [
        'Divide-and-conquer property and deterministic branching.',
        'Optimal substructure and overlapping subproblems.',
        'Greedy-choice property and matroid independence.',
        'NP-completeness and polynomial reducibility.'
      ],
      correctIndex: 1,
      explanation: 'DP applies when a problem exhibits optimal substructure (optimal solution contains optimal sub-solutions) and overlapping subproblems (subproblems are re-computed repeatedly).'
    },
    {
      id: 'dsa-q5',
      unit: 5,
      unitTitle: 'NP-Completeness & Advanced Topics',
      question: 'If a decision problem L is proven to be in NP and every problem in NP is polynomial-time reducible to L, then L is classified as:',
      options: [
        'P-Complete',
        'NP-Complete',
        'NP-Hard but not in NP',
        'Undecidable'
      ],
      correctIndex: 1,
      explanation: 'By Cook-Levin definition, a problem L is NP-Complete if: (1) L ∈ NP, and (2) for every L\' ∈ NP, L\' ≤p L (NP-Hardness).'
    }
  ],

  // 3. Operating Systems (CS308)
  'CS308': [
    {
      id: 'os-q1',
      unit: 1,
      unitTitle: 'Processes & Concurrency',
      question: 'Which of the following conditions is NOT one of the four necessary Coffman conditions for a deadlock to occur?',
      options: [
        'Mutual Exclusion',
        'Hold and Wait',
        'Preemption allowed by kernel scheduler',
        'Circular Wait'
      ],
      correctIndex: 2,
      explanation: 'The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlock cannot occur.'
    },
    {
      id: 'os-q2',
      unit: 2,
      unitTitle: 'Virtual Memory & Paging',
      question: "What anomaly states that increasing the number of physical page frames allocated to a process can actually cause MORE page faults under FIFO replacement?",
      options: [
        "Amdahl's Paradox",
        "Belady's Anomaly",
        "Thrashing Equivalence",
        "Conway's Law"
      ],
      correctIndex: 1,
      explanation: "Belady's Anomaly describes the phenomenon where increasing the page frame capacity causes an increase in page faults when using First-In-First-Out (FIFO) page replacement."
    },
    {
      id: 'os-q3',
      unit: 3,
      unitTitle: 'CPU Scheduling Algorithms',
      question: 'Which CPU scheduling algorithm achieves the minimum average waiting time for a given set of stationary processes?',
      options: [
        'Round Robin (RR)',
        'Shortest Job First (SJF) / Shortest Remaining Time First',
        'First-Come, First-Served (FCFS)',
        'Priority Scheduling without aging'
      ],
      correctIndex: 1,
      explanation: 'SJF is provably optimal with respect to minimizing average waiting time by executing shorter CPU bursts first.'
    },
    {
      id: 'os-q4',
      unit: 4,
      unitTitle: 'Storage & File Systems',
      question: 'In UNIX file systems (UFS/ext4), what data structure directly contains file metadata such as ownership, permissions, size, and pointers to disk blocks?',
      options: [
        'Superblock',
        'Inode (Index Node)',
        'Directory Entry (dentry)',
        'Master Boot Record (MBR)'
      ],
      correctIndex: 1,
      explanation: 'An inode stores all file metadata (permissions, timestamps, size, block addresses) except the filename itself, which is kept in directory entries.'
    },
    {
      id: 'os-q5',
      unit: 5,
      unitTitle: 'Synchronization & IPC',
      question: 'A counting semaphore S is initialized to 10. Then 6 P (wait) operations and 2 V (signal) operations are completed. What is the current value of S?',
      options: [
        '6',
        '4',
        '8',
        '2'
      ],
      correctIndex: 0,
      explanation: 'P(wait) decrements the semaphore; V(signal) increments it. Initial = 10; 10 - 6 + 2 = 6.'
    }
  ],

  // 4. Java Programming (CS201)
  'CS201': [
    {
      id: 'java-q1',
      unit: 1,
      unitTitle: 'OOP Fundamentals & JVM Architecture',
      question: 'Which region of the JVM memory is shared among all active threads and stores all instantiated object instances?',
      options: [
        'Java Thread Stack',
        'Heap Memory',
        'Program Counter (PC) Register',
        'Native Method Stack'
      ],
      correctIndex: 1,
      explanation: 'The JVM Heap is created upon JVM startup and shared across all threads; all class instances and arrays are allocated on the Heap.'
    },
    {
      id: 'java-q2',
      unit: 2,
      unitTitle: 'Multithreading & Concurrency',
      question: 'What is the effect of declaring a variable as `volatile` in Java?',
      options: [
        'It makes all method calls on the variable atomic.',
        'It prevents the variable from being garbage collected.',
        'It guarantees visibility of writes across threads by reading directly from main memory.',
        'It automatically synchronizes access using an intrinsic reentrant lock.'
      ],
      correctIndex: 2,
      explanation: 'The volatile keyword ensures that changes to a variable are always flushed to and read from main memory, preventing thread-local caching visibility bugs.'
    },
    {
      id: 'java-q3',
      unit: 3,
      unitTitle: 'Collections & Generics',
      question: 'What is the worst-case time complexity of retrieving an element from a standard java.util.HashMap in Java 8+ when hash collisions occur extensively?',
      options: [
        'O(N) linked list traversal',
        'O(log N) balanced tree (Red-Black tree) traversal',
        'O(1) constant time',
        'O(N log N)'
      ],
      correctIndex: 1,
      explanation: 'Java 8+ converts hash collision buckets into balanced Red-Black Trees (TreeNode) once the threshold (TREEIFY_THRESHOLD = 8) is exceeded, improving worst-case lookup from O(N) to O(log N).'
    },
    {
      id: 'java-q4',
      unit: 4,
      unitTitle: 'Streams & Functional Interfaces',
      question: 'Which of the following Java Stream operations is an intermediate, stateful operation?',
      options: [
        'filter()',
        'map()',
        'distinct()',
        'forEach()'
      ],
      correctIndex: 2,
      explanation: 'distinct() and sorted() are stateful intermediate operations because they must remember previously processed elements to produce the result.'
    },
    {
      id: 'java-q5',
      unit: 5,
      unitTitle: 'Exception Handling & Memory Management',
      question: 'Which garbage collection algorithm phase in ZGC/Shenandoah allows compaction without stopping application threads for long pauses?',
      options: [
        'Stop-the-World serial marking',
        'Concurrent marking and concurrent evacuation via load barriers',
        'Mark-Sweep-Freeze pause',
        'Generational Reference Counting'
      ],
      correctIndex: 1,
      explanation: 'Modern low-latency collectors (ZGC, Shenandoah) utilize colored pointers and concurrent load barriers to move and compact objects while application threads execute.'
    }
  ],

  // 5. Computer Networks (CS202)
  'CS202': [
    {
      id: 'cn-q1',
      unit: 1,
      unitTitle: 'OSI & TCP/IP Architecture',
      question: 'Which flags are set in the three-way handshake during the establishment of a standard TCP connection?',
      options: [
        '1: SYN, 2: SYN-ACK, 3: ACK',
        '1: ACK, 2: SYN, 3: FIN',
        '1: RST, 2: SYN-ACK, 3: PSH',
        '1: SYN, 2: ACK, 3: FIN-ACK'
      ],
      correctIndex: 0,
      explanation: 'TCP connection establishment uses a 3-way handshake: Client sends SYN, Server replies with SYN-ACK, and Client confirms with ACK.'
    },
    {
      id: 'cn-q2',
      unit: 2,
      unitTitle: 'Network Layer & Subnetting',
      question: 'How many usable host IP addresses are available in a subnet configured with CIDR prefix /28?',
      options: [
        '16',
        '14',
        '30',
        '12'
      ],
      correctIndex: 1,
      explanation: 'A /28 subnet has 32 - 28 = 4 host bits. 2^4 = 16 total IPs. Subtracting network address and broadcast address yields 16 - 2 = 14 usable host IPs.'
    },
    {
      id: 'cn-q3',
      unit: 3,
      unitTitle: 'Routing Protocols',
      question: 'Which routing protocol is an exterior gateway protocol (EGP) based on path-vector routing and is responsible for exchanging routing information between Autonomous Systems (AS) on the internet?',
      options: [
        'OSPF (Open Shortest Path First)',
        'RIP (Routing Information Protocol)',
        'BGP (Border Gateway Protocol)',
        'IS-IS'
      ],
      correctIndex: 2,
      explanation: 'BGP (Border Gateway Protocol) is the de-facto exterior gateway routing protocol connecting autonomous systems on the global Internet.'
    },
    {
      id: 'cn-q4',
      unit: 4,
      unitTitle: 'Transport Protocols & Congestion Control',
      question: 'What triggers TCP to reduce its congestion window (cwnd) to 1 Maximum Segment Size (MSS) in standard TCP Tahoe/Reno?',
      options: [
        'Receiving three duplicate ACKs',
        'Retransmission Timeout (RTO) expiration',
        'Receiving a FIN packet from receiver',
        'Flow control window size reduction'
      ],
      correctIndex: 1,
      explanation: 'A timeout (RTO) indicates severe congestion, prompting TCP to reset cwnd to 1 MSS and enter the Slow Start phase.'
    },
    {
      id: 'cn-q5',
      unit: 5,
      unitTitle: 'Application Layer & Network Security',
      question: 'In TLS/HTTPS, during which phase do the client and server establish symmetric session keys for encrypting payload data?',
      options: [
        'DNS resolution',
        'TLS Handshake',
        'TCP 3-way Handshake',
        'BGP route discovery'
      ],
      correctIndex: 1,
      explanation: 'During the TLS Handshake, asymmetric public-key cryptography (e.g. RSA or ECDHE) is used to authenticate and safely negotiate a symmetric session key (e.g. AES-GCM) for data encryption.'
    }
  ],

  // 6. Mathematics (CS103)
  'CS103': [
    {
      id: 'math-q1',
      unit: 1,
      unitTitle: 'Linear Algebra & Matrices',
      question: 'If a square matrix A has an eigenvalue λ with corresponding eigenvector v, what is an eigenvalue of A^3?',
      options: [
        '3λ',
        'λ^3',
        'λ + 3',
        '1 / λ^3'
      ],
      correctIndex: 1,
      explanation: 'If Av = λv, then A^2v = λ^2v and A^3v = λ^3v. Hence the eigenvalue corresponding to A^3 is λ^3.'
    },
    {
      id: 'math-q2',
      unit: 2,
      unitTitle: 'Calculus & Multivariable Optimization',
      question: 'At a critical point (a, b) of a function f(x, y), if the Hessian discriminant D = f_xx * f_yy - (f_xy)^2 > 0 and f_xx > 0, the point is a:',
      options: [
        'Local maximum',
        'Local minimum',
        'Saddle point',
        'Inconclusive'
      ],
      correctIndex: 1,
      explanation: 'By the Second Derivative Test for functions of two variables, D > 0 with f_xx > 0 indicates a strict local minimum.'
    },
    {
      id: 'math-q3',
      unit: 3,
      unitTitle: 'Differential Equations',
      question: 'What is the integrating factor (I.F.) for the linear first-order differential equation dy/dx + P(x)y = Q(x)?',
      options: [
        'e^(∫ P(x) dx)',
        '∫ e^(P(x)) dx',
        'e^(-∫ Q(x) dx)',
        'P(x) * Q(x)'
      ],
      correctIndex: 0,
      explanation: 'The integrating factor for dy/dx + P(x)y = Q(x) is e^(∫ P(x) dx).'
    },
    {
      id: 'math-q4',
      unit: 4,
      unitTitle: 'Probability & Statistics',
      question: 'For a Poisson distribution with parameter λ, what is the value of the variance?',
      options: [
        'λ^2',
        'λ',
        'sqrt(λ)',
        '1 / λ'
      ],
      correctIndex: 1,
      explanation: 'In a Poisson distribution, the mean and the variance are both identically equal to parameter λ.'
    },
    {
      id: 'math-q5',
      unit: 5,
      unitTitle: 'Discrete Math & Propositional Logic',
      question: 'The proposition p → q is logically equivalent to which of the following disjunctions?',
      options: [
        '¬p ∨ q',
        'p ∨ ¬q',
        '¬p ∧ ¬q',
        'p ∧ q'
      ],
      correctIndex: 0,
      explanation: 'By material implication, p → q is logically equivalent to ¬p ∨ q (if p is false or q is true).'
    }
  ]
};

// Fallback dynamic MCQ generator for any subject
export function getSubjectMcqs(subjectCode, subjectName = 'Engineering Subject') {
  const code = (subjectCode || '').toUpperCase().trim();
  
  // Check exact code or prefix
  if (SUBJECT_MCQS_MAP[code]) {
    return SUBJECT_MCQS_MAP[code];
  }

  // Fallback conceptual assessment generator
  return [
    {
      id: `${code.toLowerCase()}-q1`,
      unit: 1,
      unitTitle: 'Fundamental Principles & Architecture',
      question: `In ${subjectName} (${code}), what is the primary architectural principle governing Unit 1 foundational analysis?`,
      options: [
        'Modular decomposition and separation of concerns',
        'Unconstrained global state mutation',
        'Bypassing abstraction barriers for raw I/O',
        'Eliminating deterministic verification'
      ],
      correctIndex: 0,
      explanation: `Unit 1 in ${subjectName} establishes foundational modularity and clear system contracts.`
    },
    {
      id: `${code.toLowerCase()}-q2`,
      unit: 2,
      unitTitle: 'Core Formulations & Derivations',
      question: `When analyzing asymptotic boundary conditions in ${subjectName}, which property ensures optimal state preservation?`,
      options: [
        'Convergence under monotonic transformation',
        'Linear divergence across arbitrary intervals',
        'Stochastic drift without invariant checks',
        'Ignoring boundary constraint validation'
      ],
      correctIndex: 0,
      explanation: `Mathematical rigor in ${subjectName} relies on bounded convergence under standard transformation theorems.`
    },
    {
      id: `${code.toLowerCase()}-q3`,
      unit: 3,
      unitTitle: 'Algorithmic Execution & Pipeline Design',
      question: `In modern engineering practice for ${subjectName}, why are pipelined execution workflows favored over monolithic sequences?`,
      options: [
        'They minimize idle processing latency through concurrency',
        'They double the total memory footprint without speedup',
        'They eliminate testing requirements completely',
        'They prevent hardware acceleration'
      ],
      correctIndex: 0,
      explanation: 'Pipelining overlaps independent execution stages, increasing throughput and system utilization.'
    },
    {
      id: `${code.toLowerCase()}-q4`,
      unit: 4,
      unitTitle: 'Optimization & Fault Tolerance',
      question: `How does fault tolerance contribute to high availability in ${subjectName} deployment systems?`,
      options: [
        'By providing automated failover and graceful degradation under partial faults',
        'By assuming hardware never encounters thermal throttling',
        'By disabling error logging to preserve disk space',
        'By crashing the entire system on first exception'
      ],
      correctIndex: 0,
      explanation: 'Resilient engineering architectures ensure graceful degradation and self-healing under component failure.'
    },
    {
      id: `${code.toLowerCase()}-q5`,
      unit: 5,
      unitTitle: 'Advanced Verification & Industry Standards',
      question: `Which validation methodology is considered authoritative for proving correctness in ${subjectName}?`,
      options: [
        'Empirical benchmarking combined with formal mathematical proof',
        'Informal visual inspection without unit testing',
        'Deploying to production without staging verification',
        'Guessing parameter values empirically'
      ],
      correctIndex: 0,
      explanation: 'Production readiness requires comprehensive empirical test suites backed by formal mathematical invariants.'
    }
  ];
}
