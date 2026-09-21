import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Terminal } from 'lucide-react';

export default function FormattedChatMessage({ content, isUser = false }) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

  if (isUser) {
    return <div className="leading-relaxed whitespace-pre-wrap">{content}</div>;
  }

  // Pre-process any messy LaTeX artifacts (e.g., $\ge 0$, $\ne C$, $\sum) into clean unicode symbols
  const cleanedContent = (content || '')
    .replace(/\\\$/g, '$')
    .replace(/\$\\ge\s*(\d+)\$/gi, '≥ $1')
    .replace(/\$\\le\s*(\d+)\$/gi, '≤ $1')
    .replace(/\$\\ne\s*([^$]+)\$/gi, '≠ $1')
    .replace(/\$\\sum\s*\\text\{([^}]+)\}\s*=\s*([^$]+)\$/gi, '∑ $1 = $2')
    .replace(/\$([A-Za-z0-9_]+)\$/g, '$1')
    .replace(/\*\s*\*\*/g, '* **'); // fix broken list markdown "* **Key**"

  const handleCopy = (codeText, idx) => {
    navigator.clipboard?.writeText(codeText);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <div className="prose-chat text-xs leading-relaxed text-slate-800 space-y-2.5">
      <ReactMarkdown
        components={{
          // Paragraphs
          p({ children }) {
            return <p className="leading-relaxed mb-2 last:mb-0">{children}</p>;
          },
          // Strong/Bold
          strong({ children }) {
            return <strong className="font-extrabold text-slate-900">{children}</strong>;
          },
          // Unordered list
          ul({ children }) {
            return <ul className="space-y-1.5 my-2 pl-4 list-disc marker:text-[#ED7D31]">{children}</ul>;
          },
          // Ordered list
          ol({ children }) {
            return <ol className="space-y-1.5 my-2 pl-4 list-decimal marker:font-bold marker:text-slate-600">{children}</ol>;
          },
          // List item
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          // Headings
          h1({ children }) {
            return <h4 className="font-black text-slate-950 text-sm mt-3 mb-1 border-b border-slate-200 pb-1">{children}</h4>;
          },
          h2({ children }) {
            return <h5 className="font-black text-slate-950 text-xs mt-2.5 mb-1">{children}</h5>;
          },
          h3({ children }) {
            return <h6 className="font-bold text-slate-900 text-xs mt-2 mb-1">{children}</h6>;
          },
          // Code block vs inline code
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            // Multiline Code Block
            if (!inline && (match || codeString.includes('\n'))) {
              const lang = match ? match[1] : 'code';
              return (
                <div className="my-2.5 rounded-xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-sm font-mono text-[11px]">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 text-slate-400 text-[10px] border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-[#ED7D31]" />
                      <span className="font-bold uppercase tracking-wider text-slate-300">{lang}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(codeString, codeString.length)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCodeIndex === codeString.length ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                    <code>{codeString}</code>
                  </pre>
                </div>
              );
            }

            // Inline Code Pill
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-900 font-mono text-[11px] font-semibold border border-amber-500/20" {...props}>
                {children}
              </code>
            );
          },
          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="pl-3 border-l-2 border-[#ED7D31] bg-amber-50/50 py-1 my-2 text-slate-700 italic rounded-r-lg">
                {children}
              </blockquote>
            );
          }
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}
