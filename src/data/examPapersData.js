// Official University Examination Papers Dataset
// Supports Multi-Format Assessment: MCQs, Interactive Match the Following, and Assertion & Reasoning

export const UNIVERSITY_EXAMS_DATA = [
  {
    id: 'exam-cs204-midterm',
    code: 'CS204',
    name: 'DBMS - SQL & Relational Architecture',
    title: 'Mid-Term Theory & Applied Examination 2026',
    department: 'Computer Science & Engineering',
    semester: 'Semester 2',
    durationMinutes: 20,
    totalMarks: 30,
    passingMarks: 12,
    instructions: [
      'This examination contains 3 Sections: Section A (MCQs), Section B (Match the Following), and Section C (Assertion & Reasoning).',
      'Anti-Cheating Honor Guard is active: Switching tabs, minimizing the browser window, or unauthorized navigation will be logged as an integrity violation.',
      'Each question carries indicated marks. There is no negative marking.',
      'All responses are automatically synchronized and graded with Cloud Firestore.'
    ],
    sections: [
      {
        id: 'sec-a',
        title: 'Section A: Multiple Choice Conceptual Problems',
        description: 'Choose the single best answer for each problem. (4 Marks each = 12 Marks)',
        type: 'mcq',
        questions: [
          {
            id: 'dbms-ex-q1',
            type: 'mcq',
            marks: 4,
            question: 'Consider a relation R(A, B, C, D) with functional dependencies {AB → C, C → D, D → A}. Which of the following is NOT a candidate key for R?',
            options: [
              'AB',
              'BC',
              'BD',
              'CD'
            ],
            correctIndex: 3,
            explanation: '(AB)+ = ABCD, (BC)+ = BC->D->A = BCDA, (BD)+ = BD->A->C = BDAC. However, (CD)+ = CDA, which cannot determine attribute B. Therefore, CD is not a candidate key.'
          },
          {
            id: 'dbms-ex-q2',
            type: 'mcq',
            marks: 4,
            question: 'In a B+ Tree of order p (maximum pointer capacity per internal node), if the tree has height h = 3 and root is at level 1, what is the maximum number of leaf nodes possible?',
            options: [
              'p^2',
              'p^3',
              '(p - 1)^3',
              '2 * p^2'
            ],
            correctIndex: 0,
            explanation: 'At level 1 (root), there are at most p child pointers. At level 2, each can point to p nodes. Thus at level 3 (leaf level), the maximum number of leaf nodes is p * p = p^2.'
          },
          {
            id: 'dbms-ex-q3',
            type: 'mcq',
            marks: 4,
            question: 'Under the Strict Two-Phase Locking (Strict 2PL) protocol, which of the following guarantees is provided that Basic 2PL does NOT strictly guarantee?',
            options: [
              'Freedom from Deadlocks',
              'Freedom from Cascading Rollbacks (Strict Schedules)',
              'Maximum Concurrency Throughput',
              'Elimination of Starvation'
            ],
            correctIndex: 1,
            explanation: 'Strict 2PL holds all Exclusive (X) locks until transaction completion (commit or abort), ensuring that no other transaction can read uncommitted data, thus guaranteeing strict and cascade-free recoverability.'
          }
        ]
      },
      {
        id: 'sec-b',
        title: 'Section B: Match the Following (Relational Core)',
        description: 'Match items from Column A to their corresponding counterpart in Column B. (2 Marks per pair = 10 Marks)',
        type: 'match',
        questions: [
          {
            id: 'dbms-match-q1',
            type: 'match',
            title: 'Match Database Normal Forms to Their Primary Addressed Anomaly',
            marks: 10,
            leftItems: [
              { id: 'L1', text: '1NF (First Normal Form)' },
              { id: 'L2', text: '2NF (Second Normal Form)' },
              { id: 'L3', text: '3NF (Third Normal Form)' },
              { id: 'L4', text: 'BCNF (Boyce-Codd NF)' },
              { id: 'L5', text: '4NF (Fourth Normal Form)' }
            ],
            rightItems: [
              { id: 'R1', text: 'Eliminates Multivalued Dependencies (MVDs)' },
              { id: 'R2', text: 'Eliminates Non-trivial Functional Dependencies where determinant is not superkey' },
              { id: 'R3', text: 'Eliminates Transitive Dependencies on candidate keys' },
              { id: 'R4', text: 'Eliminates Partial Functional Dependencies on composite keys' },
              { id: 'R5', text: 'Eliminates Repeating Groups and Non-Atomic multivalued attributes' }
            ],
            // Correct mapping: L1 -> R5, L2 -> R4, L3 -> R3, L4 -> R2, L5 -> R1
            correctPairs: {
              'L1': 'R5',
              'L2': 'R4',
              'L3': 'R3',
              'L4': 'R2',
              'L5': 'R1'
            },
            explanation: '1NF mandates atomicity (R5); 2NF removes partial dependency on composite keys (R4); 3NF removes transitive dependencies (R3); BCNF ensures every determinant is a superkey (R2); 4NF eliminates independent multivalued dependencies (R1).'
          }
        ]
      },
      {
        id: 'sec-c',
        title: 'Section C: Assertion & Reasoning Evaluation',
        description: 'Evaluate the logical relationship between Assertion (A) and Reason (R). (4 Marks each = 8 Marks)',
        type: 'assertion',
        questions: [
          {
            id: 'dbms-as-q1',
            type: 'assertion',
            marks: 4,
            assertion: 'Every relation in BCNF is guaranteed to be in 3NF, but the converse is not necessarily true.',
            reason: 'BCNF does not allow the condition where the dependent attribute Y is prime when determinant X is not a superkey.',
            options: [
              'Both (A) and (R) are true, and (R) is the correct explanation of (A).',
              'Both (A) and (R) are true, but (R) is NOT the correct explanation of (A).',
              '(A) is true, but (R) is false.',
              '(A) is false, but (R) is true.'
            ],
            correctIndex: 0,
            explanation: 'BCNF is strictly stronger than 3NF because 3NF allows X -> Y if Y is prime even if X is not a superkey. BCNF disallows this exemption. Hence both are true and R explains A.'
          },
          {
            id: 'dbms-as-q2',
            type: 'assertion',
            marks: 4,
            assertion: 'In Write-Ahead Logging (WAL), log records must be flushed to non-volatile disk before corresponding dirty buffer database pages are written to disk.',
            reason: 'If a crash occurs before the dirty page reaches disk, the undo-redo recovery manager requires the log to reconstruct or roll back the uncommitted transaction state.',
            options: [
              'Both (A) and (R) are true, and (R) is the correct explanation of (A).',
              'Both (A) and (R) are true, but (R) is NOT the correct explanation of (A).',
              '(A) is true, but (R) is false.',
              '(A) is false, but (R) is true.'
            ],
            correctIndex: 0,
            explanation: 'The fundamental rule of WAL is that the log record for an update must hit disk before the data page itself does, ensuring the Atomicity and Durability properties of ACID.'
          }
        ]
      }
    ]
  },

  // 2. Data Structures & Algorithms Exam (CS203)
  {
    id: 'exam-cs203-midterm',
    code: 'CS203',
    name: 'Data Structures and Algorithms - I',
    title: 'Mid-Term Applied Theoretical Examination 2026',
    department: 'Computer Science & Engineering',
    semester: 'Semester 2',
    durationMinutes: 20,
    totalMarks: 30,
    passingMarks: 12,
    instructions: [
      'Sections: Section A (MCQs), Section B (Match the Following), Section C (Assertion & Reasoning).',
      'Automated anti-cheating proctoring is enabled.',
      'Total Marks: 30. Pass criteria: 40%.'
    ],
    sections: [
      {
        id: 'sec-a',
        title: 'Section A: Asymptotic & Graph MCQs',
        description: 'Choose the correct answer. (4 Marks each = 12 Marks)',
        type: 'mcq',
        questions: [
          {
            id: 'dsa-ex-q1',
            type: 'mcq',
            marks: 4,
            question: 'What is the worst-case number of rotations required during an insertion into an AVL tree of N nodes?',
            options: [
              'At most 2 rotations (Single or Double rotation)',
              'O(log N) rotations up to the root',
              'O(N) rotations in unbalanced subtrees',
              '1 rotation for every level'
            ],
            correctIndex: 0,
            explanation: 'In an AVL tree, insertion requires at most 1 single or 1 double rotation (at most 2 pointer adjustments) to restore the balance factor of the whole tree.'
          },
          {
            id: 'dsa-ex-q2',
            type: 'mcq',
            marks: 4,
            question: 'Which graph traversal algorithm uses a FIFO Queue data structure and can find the shortest path in an unweighted graph in O(V + E) time?',
            options: [
              'Depth-First Search (DFS)',
              'Breadth-First Search (BFS)',
              'Topological Sort with Tarjan',
              'Bellman-Ford Relaxation'
            ],
            correctIndex: 1,
            explanation: 'BFS explores level-by-level using a FIFO queue, guaranteeing shortest path distances in unweighted graphs in linear O(V + E) time.'
          },
          {
            id: 'dsa-ex-q3',
            type: 'mcq',
            marks: 4,
            question: 'In the 0/1 Knapsack problem with N items and capacity W, what is the time complexity of the standard dynamic programming tabulation approach?',
            options: [
              'O(N * W) (Pseudo-polynomial time)',
              'O(2^N) (Strict polynomial time)',
              'O(N log W)',
              'O(N + W)'
            ],
            correctIndex: 0,
            explanation: 'The DP algorithm fills a table of size (N+1) x (W+1). Its time complexity is O(N * W), which is pseudo-polynomial because W depends on the numeric input value.'
          }
        ]
      },
      {
        id: 'sec-b',
        title: 'Section B: Match the Following (Algorithm Design Paradigm)',
        description: 'Match each standard algorithm to its underlying algorithmic paradigm. (2 Marks per pair = 10 Marks)',
        type: 'match',
        questions: [
          {
            id: 'dsa-match-q1',
            type: 'match',
            title: 'Match Classic Algorithms to Their Algorithmic Design Strategy',
            marks: 10,
            leftItems: [
              { id: 'L1', text: "Kruskal's Minimum Spanning Tree" },
              { id: 'L2', text: 'Merge Sort' },
              { id: 'L3', text: 'Floyd-Warshall All-Pairs Shortest Path' },
              { id: 'L4', text: 'N-Queens Placement' },
              { id: 'L5', text: 'Binary Search in Sorted Array' }
            ],
            rightItems: [
              { id: 'R1', text: 'Divide and Conquer' },
              { id: 'R2', text: 'Greedy Approach with Disjoint Sets' },
              { id: 'R3', text: 'Dynamic Programming (All-Pairs Tabulation)' },
              { id: 'R4', text: 'Backtracking with State Space Pruning' },
              { id: 'R5', text: 'Decrease and Conquer / Binary Pruning' }
            ],
            correctPairs: {
              'L1': 'R2',
              'L2': 'R1',
              'L3': 'R3',
              'L4': 'R4',
              'L5': 'R5'
            },
            explanation: "Kruskal's uses Greedy (R2); Merge Sort uses Divide & Conquer (R1); Floyd-Warshall is DP (R3); N-Queens is Backtracking (R4); Binary Search is Decrease & Conquer (R5)."
          }
        ]
      },
      {
        id: 'sec-c',
        title: 'Section C: Assertion & Reasoning (Computational Complexity)',
        description: 'Analyze the mathematical statements. (4 Marks each = 8 Marks)',
        type: 'assertion',
        questions: [
          {
            id: 'dsa-as-q1',
            type: 'assertion',
            marks: 4,
            assertion: 'QuickSort has an average-case time complexity of O(N log N), but its worst-case time complexity is O(N^2).',
            reason: 'When the partition algorithm repeatedly chooses the smallest or largest element as pivot (e.g. in already sorted arrays without randomization), the recurrence degenerates to T(N) = T(N-1) + O(N).',
            options: [
              'Both (A) and (R) are true, and (R) is the correct explanation of (A).',
              'Both (A) and (R) are true, but (R) is NOT the correct explanation of (A).',
              '(A) is true, but (R) is false.',
              '(A) is false, but (R) is true.'
            ],
            correctIndex: 0,
            explanation: 'QuickSort worst-case occurs under unbalanced partitions, producing an O(N^2) summation sequence 1+2+...+N.'
          },
          {
            id: 'dsa-as-q2',
            type: 'assertion',
            marks: 4,
            assertion: 'A binary heap cannot support searching for an arbitrary key in O(log N) time without secondary indexing structures.',
            reason: 'Binary heaps only guarantee partial ordering (parent >= child for Max-Heap), which lacks the total order property of Binary Search Trees.',
            options: [
              'Both (A) and (R) are true, and (R) is the correct explanation of (A).',
              'Both (A) and (R) are true, but (R) is NOT the correct explanation of (A).',
              '(A) is true, but (R) is false.',
              '(A) is false, but (R) is true.'
            ],
            correctIndex: 0,
            explanation: 'Because heaps do not maintain total left-to-right order, an arbitrary search requires O(N) traversal of the underlying array.'
          }
        ]
      }
    ]
  }
];

export function getExamPaperById(examId) {
  return UNIVERSITY_EXAMS_DATA.find(e => e.id === examId) || UNIVERSITY_EXAMS_DATA[0];
}
