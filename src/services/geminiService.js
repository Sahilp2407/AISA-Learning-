const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Get active Gemini API Key from localStorage, env variable, or default key
 */
export function getGeminiApiKey() {
  const customKey = localStorage.getItem('aisa_gemini_key');
  if (customKey && customKey.trim().length > 5) {
    return customKey.trim();
  }
  if (import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY.trim()) {
    return import.meta.env.VITE_GEMINI_API_KEY.trim();
  }
  return DEFAULT_GEMINI_KEY;
}

/**
 * Save custom Gemini API Key
 */
export function setGeminiApiKey(key) {
  if (key) {
    localStorage.setItem('aisa_gemini_key', key.trim());
  } else {
    localStorage.removeItem('aisa_gemini_key');
  }
}

/**
 * Generate syllabus-grounded academic AI response using Gemini API
 * @param {Object} params
 * @param {string} params.prompt - User query
 * @param {Object} params.courseContext - Course, Semester, Subject, Unit details
 * @param {Array} params.history - Previous chat history
 * @returns {Promise<{text: string, citations: string[], isMock?: boolean}>}
 */
export async function generateSocraticResponse({ prompt, courseContext = {}, history = [] }) {
  const apiKey = getGeminiApiKey();

  // Prepare system instructions for concise professional academic tutoring
  const courseInfo = courseContext.subjectName 
    ? `${courseContext.subjectName} (${courseContext.subjectCode || 'Course'}) - ${courseContext.semesterName || 'Curriculum'}`
    : 'Computer Science & Engineering Curriculum';

  const systemInstruction = `You are AISA (AI-Powered Student Assistant), an expert academic tutor for university engineering students.
Current Academic Context: ${courseInfo}.

Rules & Guidelines:
1. Provide SHORT, CRISP, HIGH-IMPACT academic answers. Avoid long conversational intro fluff or filler.
2. Structure the response cleanly matching modern ChatGPT / Claude academic tutor style:
   - **Concept**: 1-2 sentence core definition.
   - **Key Points**: 2-3 precise bullet points using standard "- " markdown list items.
   - **Example / Code**: If code or query is relevant, ALWAYS wrap in fenced code blocks with language identifier (e.g. \`\`\`sql ... \`\`\`).
   - **Takeaway**: 1 short exam or interview revision line.
3. Use standard mathematical and logical symbols directly (e.g., ≥, ≤, ≠, ∑, ∩, ∪, →) instead of raw LaTeX backslash commands.
4. DO NOT use emojis or decorative symbols (such as 📌, 🧠, 💻, ⚡, ❓).
5. Maintain a clean, professional, textbook-grade pedagogical tone.`;

  // Format context history into Gemini prompt structure
  const formattedContents = [];

  // Add relevant past messages (up to last 4)
  const recentHistory = history.slice(-4);
  recentHistory.forEach(msg => {
    formattedContents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  });

  // Current prompt with academic system context prefix if new session
  const userTextWithContext = history.length <= 1 
    ? `[Academic Context: ${courseInfo}]\nStudent Question: ${prompt}`
    : prompt;

  formattedContents.push({
    role: 'user',
    parts: [{ text: userTextWithContext }]
  });

  // Candidate Gemini models for automatic fallback
  const models = [
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.5-pro'
  ];

  let lastError = null;

  for (const modelName of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: formattedContents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${response.status} from ${modelName}`);
      }

      const data = await response.json();
      const candidateParts = data?.candidates?.[0]?.content?.parts || [];
      const generatedText = candidateParts.map(p => p.text || '').join('').trim();

      if (generatedText) {
        return {
          text: generatedText,
          citations: [`Syllabus Ref: ${courseContext.subjectName || 'B.Tech CSE'} Units`],
          isMock: false
        };
      }
    } catch (err) {
      console.warn(`Gemini API model ${modelName} failed:`, err);
      lastError = err;
    }
  }

  // Fallback if API key has quota issues or offline network
  console.error('Gemini API Error, utilizing fallback academic generator:', lastError);
  return generateAcademicFallback(prompt, courseContext);
}

/**
 * Short & Crisp Academic Fallback Generator
 */
function generateAcademicFallback(prompt, courseContext) {
  const query = prompt.toLowerCase();
  const subject = courseContext.subjectName || 'DBMS & Algorithms';

  let responseText = '';
  if (query.includes('tree') || query.includes('b+')) {
    responseText = `**Concept**: B+ Trees store data record pointers exclusively in leaf nodes, whereas B-Trees store data pointers in both internal and leaf nodes.

**Key Differences**:
- **Internal Nodes**: Store search keys only, maximizing node fan-out and reducing tree height.
- **Range Queries**: Leaf nodes form a doubly linked list, making sequential range scans very fast.
- **Disk I/O**: Fewer disk reads required per query compared to B-Trees.

**Takeaway**: InnoDB and major RDBMS storage engines use B+ Trees for fast disk index traversal.`;
  } else if (query.includes('3nf') || query.includes('bcnf') || query.includes('normal')) {
    responseText = `**Concept**: Normalization reduces data redundancy. BCNF is a stricter version of 3NF.

**Key Differences**:
- **3NF**: For dependency X -> Y, X must be a Super Key OR Y must be a Prime Attribute.
- **BCNF**: For dependency X -> Y, X MUST be a Super Key (no prime attribute exception).

**Takeaway**: Every relation in BCNF is in 3NF, but not all 3NF relations satisfy BCNF.`;
  } else {
    responseText = `**Concept**: ${prompt} is a core topic in ${subject} focusing on efficiency and system reliability.

**Key Points**:
- **Theoretical Basis**: Optimizes computational time O(f(n)) and memory overhead O(g(n)).
- **Application**: Applied directly in database query planning, memory scheduling, and production backends.

**Takeaway**: Essential concept for university semester exams and technical interviews.`;
  }

  return {
    text: responseText,
    citations: [`Syllabus Ref: ${subject}`],
    isMock: true
  };
}
