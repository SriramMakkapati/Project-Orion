"use client";

import ReactMarkdown from "react-markdown";
import { FiUser } from "react-icons/fi";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 py-4 ${isUser ? "justify-end" : ""}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: 'var(--accent-muted)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
      )}

      {/* Message content */}
      <div className={`max-w-[80%] ${isUser ? "" : "flex-1"}`}>
        {isUser ? (
          <div className="inline-block rounded-2xl rounded-br-md px-4 py-2.5" style={{ background: 'var(--message-user)' }}>
            <p className="text-sm leading-relaxed text-white whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1.5 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-1.5 prose-li:my-0.5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']"
            style={{ color: 'var(--text-primary)' }}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <FiUser size={12} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
    </div>
  );
}
