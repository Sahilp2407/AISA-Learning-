// Shared University Engineering Curriculum Data across Student Portal & Admin Governance

export const SEMESTERS_DATA = [
  {
    id: 1,
    name: 'Semester 1',
    code: 'SEM-01',
    subjectCount: 8,
    progress: 0,
    color: 'from-amber-500/20 to-orange-500/10',
    subjects: [
      { id: 'cs101', name: 'Computer Science Foundations & Society - Law and Ethics - IT', code: 'CS101', units: 5, category: 'Core CS', desc: 'Ethics, digital law, societal impact and computing history.' },
      { id: 'cs102', name: 'SoftSkills - Communication Skills & Problem Solving', code: 'CS102', units: 4, category: 'Professional', desc: 'Technical articulation, active listening and structured analysis.' },
      { id: 'cs103', name: 'Mathematics', code: 'CS103', units: 5, category: 'Maths', desc: 'Set theory, propositional logic, differential calculus and matrices.' },
      { id: 'cs104', name: 'Git & GitHub Linkedin', code: 'CS104', units: 3, category: 'Tools', desc: 'Version control branching, open-source workflow and profile building.' },
      { id: 'cs105', name: 'Scratch Programming', code: 'CS105', units: 3, category: 'Foundations', desc: 'Event-driven visual logic, state variables and basic algorithms.' },
      { id: 'cs106', name: 'Python', code: 'CS106', units: 5, category: 'Programming', desc: 'Data structures, OOP, file handling, libraries and unit tests.' },
      { id: 'cs107', name: 'No Code Platform & Google Sheet', code: 'CS107', units: 3, category: 'Tools', desc: 'App automation, complex formulas, pivot models and data pipelines.' },
      { id: 'cs108', name: 'C++', code: 'CS108', units: 5, category: 'Programming', desc: 'Pointers, memory layout, classes, templates and STL containers.' }
    ]
  },
  {
    id: 2,
    name: 'Semester 2',
    code: 'SEM-02',
    subjectCount: 11,
    progress: 15,
    color: 'from-orange-500/20 to-amber-500/10',
    subjects: [
      { id: 'cs201', name: 'Java Programming', code: 'CS201', units: 5, category: 'Programming', desc: 'OOP, JVM internals, multithreading, concurrency and streams.' },
      { id: 'cs202', name: 'Computer Networking', code: 'CS202', units: 5, category: 'Core CS', desc: 'OSI layers, TCP/IP, routing algorithms, DNS, HTTP/3 and sockets.' },
      { id: 'cs203', name: 'Data Structures and Algorithm - I', code: 'CS203', units: 5, category: 'Core CS', desc: 'Arrays, linked lists, stacks, queues, hash maps and trees.' },
      { id: 'cs204', name: 'DBMS - SQL', code: 'CS204', units: 5, category: 'Core CS', desc: 'ER diagrams, SQL queries, normalization 3NF/BCNF, ACID & indexing.' },
      { id: 'cs205', name: 'HTML 5', code: 'CS205', units: 4, category: 'Web', desc: 'Accessible semantic structure, media APIs and canvas elements.' },
      { id: 'cs206', name: 'CSS 3', code: 'CS206', units: 4, category: 'Web', desc: 'Flexbox, CSS Grid, custom properties, animations and media queries.' },
      { id: 'cs207', name: 'Javascript', code: 'CS207', units: 5, category: 'Web', desc: 'Closures, promises, async/await, event loop and DOM API.' },
      { id: 'cs208', name: 'Design Thinking & Prototyping + UI/UX + Figma', code: 'CS208', units: 4, category: 'Design', desc: 'User flows, wireframes, design systems and usability testing.' },
      { id: 'cs209', name: 'How Products are built + Pricing Strategies and Implementing payment stack in your applications', code: 'CS209', units: 4, category: 'Product', desc: 'Product requirements, metrics, unit economics and API monetization.' },
      { id: 'cs210', name: 'Foreign Language German A1', code: 'CS210', units: 3, category: 'Language', desc: 'Conversational grammar, technical terms and dialogue comprehension.' },
      { id: 'cs211', name: 'Sem2_Student Project Building & Evaluation', code: 'CS211', units: 5, category: 'Projects', desc: 'Full-stack end-to-end prototype development and faculty viva.' }
    ]
  },
  {
    id: 3,
    name: 'Semester 3',
    code: 'SEM-03',
    subjectCount: 6,
    progress: 0,
    color: 'from-amber-500/20 to-yellow-500/10',
    subjects: [
      { id: 'cs301', name: 'Data Structures & Algorithms - II', code: 'CS301', units: 5, category: 'Core CS', desc: 'Graphs, BFS/DFS, Dijkstra, Dynamic Programming, Trie and AVL trees.' },
      { id: 'cs302', name: 'Operating Systems & Concurrency', code: 'CS302', units: 5, category: 'Core CS', desc: 'Processes, CPU scheduling, semaphores, deadlock and virtual memory.' },
      { id: 'cs303', name: 'Computer Architecture & Organisation', code: 'CS303', units: 5, category: 'Core CS', desc: 'Instruction sets, pipelining, cache hierarchy and RISC-V.' },
      { id: 'cs304', name: 'Probability & Statistics for Engineers', code: 'CS304', units: 4, category: 'Maths', desc: 'Distributions, Bayes theorem, hypothesis testing and Markov chains.' },
      { id: 'cs305', name: 'Backend Engineering with Node.js', code: 'CS305', units: 5, category: 'Web', desc: 'REST APIs, middleware, authentication, WebSockets and security.' },
      { id: 'cs306', name: 'Software Design Patterns & Clean Code', code: 'CS306', units: 4, category: 'Core CS', desc: 'SOLID principles, Singleton, Factory, Observer and Refactoring.' }
    ]
  },
  {
    id: 4,
    name: 'Semester 4',
    code: 'SEM-04',
    subjectCount: 6,
    progress: 0,
    color: 'from-orange-500/20 to-red-500/10',
    subjects: [
      { id: 'cs401', name: 'Design & Analysis of Algorithms', code: 'CS401', units: 5, category: 'Core CS', desc: 'Divide & conquer, greedy, NP-completeness and amortized analysis.' },
      { id: 'cs402', name: 'Theory of Computation & Automata', code: 'CS402', units: 5, category: 'Core CS', desc: 'DFA, NFA, Context-Free Grammars, Turing Machines and decidability.' },
      { id: 'cs403', name: 'Cloud Computing & Distributed Systems', code: 'CS403', units: 5, category: 'Cloud', desc: 'Microservices, Docker, Kubernetes, AWS architecture and CAP theorem.' },
      { id: 'cs404', name: 'Microprocessors & Embedded IoT', code: 'CS404', units: 4, category: 'Hardware', desc: '8086 architecture, interfacing, timers, interrupts and sensors.' },
      { id: 'cs405', name: 'Advanced React & Frontend Frameworks', code: 'CS405', units: 5, category: 'Web', desc: 'State machines, SSR, performance profiling and custom hooks.' },
      { id: 'cs406', name: 'Cybersecurity Fundamentals & Cryptography', code: 'CS406', units: 4, category: 'Security', desc: 'Symmetric/asymmetric keys, hashing, TLS and OWASP vulnerabilities.' }
    ]
  },
  {
    id: 5,
    name: 'Semester 5',
    code: 'SEM-05',
    subjectCount: 5,
    progress: 0,
    color: 'from-amber-600/20 to-orange-600/10',
    subjects: [
      { id: 'cs501', name: 'Cross Platform App Development', code: 'CS501', units: 5, category: 'Mobile', desc: 'React Native, Flutter, native device APIs, state and App Store deploy.' },
      { id: 'cs502', name: 'Machine Learning Fundamentals', code: 'CS502', units: 5, category: 'AI/ML', desc: 'Supervised/unsupervised learning, gradient descent, SVM and PCA.' },
      { id: 'cs503', name: 'Physics', code: 'CS503', units: 4, category: 'Science', desc: 'Quantum states, band theory, p-n junctions and semiconductor physics.' },
      { id: 'cs504', name: 'Chemistry', code: 'CS504', units: 4, category: 'Science', desc: 'Nanomaterials, polymers, electrochemistry and corrosion control.' },
      { id: 'cs505', name: 'Software Engineering & Project Management', code: 'CS505', units: 5, category: 'Core CS', desc: 'Scrum cycles, CI/CD pipelines, QA testing, Jira and code reviews.' }
    ]
  },
  {
    id: 6,
    name: 'Semester 6',
    code: 'SEM-06',
    subjectCount: 5,
    progress: 0,
    color: 'from-orange-500/20 to-amber-500/10',
    subjects: [
      { id: 'cs601', name: 'Deep Learning & Neural Architectures', code: 'CS601', units: 5, category: 'AI/ML', desc: 'CNNs, RNNs, Transformers, attention mechanisms and PyTorch.' },
      { id: 'cs602', name: 'Compiler Design & Code Optimization', code: 'CS602', units: 5, category: 'Core CS', desc: 'Lexical analysis, syntax parsing (LL/LR), AST and code generation.' },
      { id: 'cs603', name: 'DevOps & Site Reliability Engineering', code: 'CS603', units: 4, category: 'Cloud', desc: 'Infrastructure as Code (Terraform), monitoring, Prometheus and alerts.' },
      { id: 'cs604', name: 'Distributed Databases & Big Data', code: 'CS604', units: 5, category: 'Data', desc: 'NoSQL, Cassandra, Apache Spark, Kafka and sharding topologies.' },
      { id: 'cs605', name: 'AI Ethics & Responsible Computing', code: 'CS605', units: 3, category: 'Core CS', desc: 'Bias audit, explainable AI, GDPR compliance and model accountability.' }
    ]
  },
  {
    id: 7,
    name: 'Semester 7',
    code: 'SEM-07',
    subjectCount: 4,
    progress: 0,
    isLocked: true,
    lockedReason: 'Curriculum unlocks in Academic Year 4 (Odd Semester 2027–28)',
    color: 'from-amber-500/20 to-yellow-500/10',
    subjects: [
      { id: 'cs701', name: 'Natural Language Processing & LLMs', code: 'CS701', units: 5, category: 'AI/ML', desc: 'Tokenization, embeddings, fine-tuning, RAG and prompt engineering.' },
      { id: 'cs702', name: 'Computer Vision & Image Processing', code: 'CS702', units: 5, category: 'AI/ML', desc: 'Filtering, edge detection, object detection (YOLO) and segmentation.' },
      { id: 'cs703', name: 'Blockchain & Decentralized Applications', code: 'CS703', units: 4, category: 'Special', desc: 'Consensus protocols, Ethereum smart contracts, Solidity and Web3.' },
      { id: 'cs704', name: 'Research Seminar & Technical Literature', code: 'CS704', units: 3, category: 'Research', desc: 'IEEE paper reading, citation synthesis and proposal drafting.' }
    ]
  },
  {
    id: 8,
    name: 'Semester 8',
    code: 'SEM-08',
    subjectCount: 2,
    progress: 0,
    isLocked: true,
    lockedReason: 'Final term capstone & industrial internship unlocks in Academic Year 4 (Even Semester 2028)',
    color: 'from-orange-500/20 to-amber-500/10',
    subjects: [
      { id: 'cs801', name: 'Major Capstone Engineering Project', code: 'CS801', units: 10, category: 'Capstone', desc: 'Industry-grade software platform deployment, benchmarking and defense.' },
      { id: 'cs802', name: 'Industry Internship & Practicum Viva', code: 'CS802', units: 8, category: 'Industry', desc: 'Full-time industrial training report, mentor review and evaluation.' }
    ]
  }
];
