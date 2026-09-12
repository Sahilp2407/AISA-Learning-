import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Flag, 
  ShieldAlert, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  AlertTriangle,
  Lightbulb,
  CornerDownLeft,
  Copy,
  Check
} from 'lucide-react';

export default function ChatAssistantModal({ isOpen, onClose, user, isExamMode }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${user?.name || 'Student'}! I'm your syllabus-aligned academic assistant for **${user?.enrolledCourse || 'Database Management Systems (CS301)'}**. What concepts or problem-solving areas would you like to explore today?`,
      timestamp: 'Just now',
      flagged: false,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reportingMsgId, setReportingMsgId] = useState(null);
  const [reportReason, setReportReason] = useState('Factually inaccurate');
  const [reportFeedback, setReportFeedback] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const quickPrompts = [
    'Explain B+ Trees vs B-Trees with index lookup complexity',
    'What is the difference between 3NF and BCNF normalization?',
    'Walk me through ACID properties in DBMS transactions',
    'How do clustered indexes affect query latency?',
  ];

  const handleSend = (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : inputValue;
    if (!query.trim()) return;

    if (isExamMode) {
      setToastMessage('⚠️ AI Assistance is restricted during active exam windows.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Generate context-aware academic response
    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('b+ tree') || lower.includes('b-tree') || lower.includes('tree')) {
        reply = `B-Trees vs. B+ Trees in DBMS Indexing:\n\n1. Data Pointers:\n- B-Tree: Pointers to actual records exist in both internal nodes and leaf nodes.\n- B+ Tree: Internal nodes only store key values; all data pointers and records reside in the leaf nodes.\n\n2. Range Queries & Traversal:\n- B+ Tree: Leaf nodes are connected as a doubly linked list, making range scans very fast.\n- B-Tree: Requires in-order tree traversal.\n\n3. Storage Efficiency:\n- B+ Tree internal nodes are smaller, meaning higher fan-out per disk block and fewer disk I/O operations.`;
      } else if (lower.includes('3nf') || lower.includes('bcnf') || lower.includes('normalization')) {
        reply = `Third Normal Form (3NF) vs Boyce-Codd Normal Form (BCNF):\n\n1. 3NF Rule: For every functional dependency X -> Y, either X is a Super Key, OR Y is a Prime Attribute.\n\n2. BCNF Rule (Stricter): For every functional dependency X -> Y, X must be a Super Key.\n\n3. Key Insight: Every relation in BCNF is in 3NF, but not every 3NF relation satisfies BCNF.`;
      } else if (lower.includes('acid') || lower.includes('transaction')) {
        reply = `ACID Properties of Database Transactions:\n\n- Atomicity: All operations complete or none do ("All or Nothing"), managed via Write-Ahead Logging (WAL).\n- Consistency: Transactions transition database from one valid state to another.\n- Isolation: Concurrent transactions execute without mutual interference using 2PL locking.\n- Durability: Once committed, updates persist permanently even across system crashes.`;
      } else {
        reply = `Academic Breakdown: ${query}\n\nHere is a structured explanation based on standard course syllabus guidelines:\n\n1. Core Concept: In the context of ${user?.enrolledCourse || 'Computer Science'}, this topic focuses on system performance and state consistency.\n2. Theoretical Formulation: Key theorems emphasize optimal space/time complexity.\n3. Practical Application: Applied in production storage engines and query optimizers.\n\nReference: Database System Concepts (7th Edition).`;
      }

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        flagged: false,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1100);
  };

  const handleFlagSubmit = () => {
    if (!reportingMsgId) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === reportingMsgId ? { ...msg, flagged: true, flagReason: reportReason } : msg
      )
    );

    setToastMessage('✅ Response flagged and submitted to faculty audit review queue.');
    setTimeout(() => setToastMessage(null), 3500);

    setReportingMsgId(null);
    setReportFeedback('');
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-ghost w-full max-w-4xl h-[90vh] max-h-[780px] rounded-3xl border border-borderLight shadow-soft-lg flex flex-col overflow-hidden relative"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-wheat-100/80 border-b border-borderLight flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-wheat-400 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-charcoal" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-charcoal">
                  AISA Academic Tutor
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gold/30 text-charcoal border border-gold/40">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-gold-700" /> Active Session
                </span>
              </div>
              <p className="text-xs text-charcoal-muted">
                Context: <span className="font-semibold text-charcoal">{user?.enrolledCourse || 'Database Management Systems'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-ghost hover:bg-wheat-200 border border-borderLight flex items-center justify-center text-charcoal-muted hover:text-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-gold"
            aria-label="Close Assistant Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Exam Mode Alert in Chat (if active) */}
        {isExamMode && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between text-xs text-alertSoft">
            <div className="flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 text-alertSoft flex-shrink-0" />
              <span>
                <strong>Academic Lockout Active:</strong> Questions cannot be submitted during scheduled exam windows.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-alertSoft text-ghost font-bold text-[10px]">
              RESTRICTED
            </span>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-charcoal text-ghost px-4 py-2 rounded-xl text-xs shadow-lg border border-wheat-400 flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-charcoal" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-gold-500 to-gold text-charcoal rounded-br-none shadow-sm font-medium'
                      : 'bg-wheat-50/80 text-charcoal border border-borderLight rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-charcoal text-sm">
                    {msg.text}
                  </div>
                </div>

                {/* Message Meta & Responsible AI Reporting Button */}
                <div
                  className={`flex items-center gap-3 text-[11px] text-charcoal-muted px-1 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {msg.sender === 'assistant' && (
                    <>
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="hover:text-charcoal inline-flex items-center gap-1 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-successSoft" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>

                      {msg.flagged ? (
                        <span className="inline-flex items-center gap-1 text-alertSoft font-medium bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <Flag className="w-3 h-3 text-alertSoft" /> Flagged for review
                        </span>
                      ) : (
                        <button
                          onClick={() => setReportingMsgId(msg.id)}
                          className="hover:text-alertSoft inline-flex items-center gap-1 transition-colors text-charcoal-muted hover:underline"
                          title="Report inaccurate or hallucinated answer"
                        >
                          <Flag className="w-3 h-3" /> Flag Inaccurate Answer
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-wheat-200 border border-borderLight flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-charcoal" />
                </div>
              )}
            </div>
          ))}

          {/* Assistant typing indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-charcoal animate-pulse" />
              </div>
              <div className="bg-wheat-50 p-3 rounded-2xl border border-borderLight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gold-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-gold-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-gold-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-charcoal-muted ml-1">Formulating syllabus guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {!isExamMode && (
          <div className="px-6 py-2 bg-ghost border-t border-borderLight/60 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-charcoal-muted flex items-center gap-1 flex-shrink-0 font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-gold-600" /> Prompts:
            </span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap px-2.5 py-1 bg-wheat-100 hover:bg-wheat-200 text-charcoal rounded-lg border border-borderLight transition-colors flex-shrink-0"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="p-4 sm:p-6 bg-ghost border-t border-borderLight">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              disabled={isExamMode || isTyping}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isExamMode
                  ? '🔒 AI assistance is paused during exam mode simulation.'
                  : 'Ask a course question (e.g. BCNF vs 3NF, B+ Trees, ACID)...'
              }
              className={`flex-1 px-4 py-3.5 rounded-xl text-sm border focus:outline-none transition-all ${
                isExamMode
                  ? 'bg-red-50/50 text-charcoal-muted border-red-200 cursor-not-allowed'
                  : 'bg-wheat-50 text-charcoal border-borderLight focus:ring-2 focus:ring-gold focus:border-transparent'
              }`}
            />
            <button
              type="submit"
              disabled={isExamMode || isTyping || !inputValue.trim()}
              className={`px-5 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border ${
                !isExamMode && inputValue.trim() && !isTyping
                  ? 'gold-button border-gold-600/30 cursor-pointer'
                  : 'bg-wheat-200/80 text-charcoal-muted border-borderLight cursor-not-allowed opacity-75'
              }`}
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-charcoal-muted">
            <span>AISA AI responses are academic study aids. Always refer to official course slides.</span>
            <span className="font-semibold text-charcoal flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-successSoft" /> Model: AISA-Socratic-v2
            </span>
          </div>
        </div>

        {/* Responsible AI Flag Report Modal Subview */}
        {reportingMsgId && (
          <div className="absolute inset-0 z-40 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-ghost rounded-2xl p-6 max-w-md w-full border border-borderLight shadow-soft-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-alertSoft">
                    <Flag className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-charcoal">
                    Report Inaccurate AI Output
                  </h4>
                </div>
                <button
                  onClick={() => setReportingMsgId(null)}
                  className="text-charcoal-muted hover:text-charcoal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                Thank you for practicing responsible AI usage. Submitted feedback is cataloged to prevent hallucinations and improve university tutoring quality.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-charcoal">
                  Primary Issue Category:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-wheat-50 border border-borderLight rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="Factually inaccurate">Factually inaccurate</option>
                  <option value="Not aligned with syllabus">Not aligned with syllabus / textbook</option>
                  <option value="Hallucinated equation or citation">Hallucinated equation or citation</option>
                  <option value="Unclear / ambiguous explanation">Unclear / ambiguous explanation</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-charcoal">
                  Additional Notes (Optional):
                </label>
                <textarea
                  value={reportFeedback}
                  onChange={(e) => setReportFeedback(e.target.value)}
                  placeholder="Describe what was incorrect or how it should be explained..."
                  rows={3}
                  className="w-full p-3 bg-wheat-50 border border-borderLight rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setReportingMsgId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-muted hover:text-charcoal bg-wheat-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlagSubmit}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-ghost bg-alertSoft hover:bg-alertSoft/90 shadow-sm transition-colors"
                >
                  Submit Flag Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
