"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import SourceCard from "./SourceCard";
import { useChatStore } from "@/store/chatStore";
import { FiFileText } from "react-icons/fi";

export default function ChatWindow() {
  const { messages, isLoading, sendMessage, stopGeneration } = useChatStore();
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const threshold = 100;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsAtBottom(distanceFromBottom < threshold);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto select-none">
            <span className="text-6xl mb-4" role="img" aria-label="sparkles">🔮</span>
            <h1 className="text-3xl font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Hey, I'm <span style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Orion</span>
            </h1>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
              Your multi-source research companion. Ask me anything.
            </p>
          </div>
        )}

        {/* Message list */}
        <div className="max-w-3xl mx-auto space-y-1">
          {messages.map((msg, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${Math.min(index * 0.03, 0.15)}s` }}>
              <MessageBubble message={msg} />
              {msg.sources && msg.sources.length > 0 && (
                <div className="pl-11 mt-2 mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <p className="text-[11px] font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <FiFileText size={10} />
                    {msg.sources.length} source{msg.sources.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {msg.sources.slice(0, 4).map((source, i) => (
                      <SourceCard key={i} source={source} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 py-4 pl-11 animate-fade-in">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)', animation: 'typing 1.4s infinite 0s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)', animation: 'typing 1.4s infinite 0.2s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)', animation: 'typing 1.4s infinite 0.4s' }}></span>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom */}
      {!isAtBottom && messages.length > 0 && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full border shadow-lg transition-all duration-200 hover:scale-105 animate-fade-in text-xs font-medium"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
        >
          ↓ New messages
        </button>
      )}

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} onStop={stopGeneration} />
    </div>
  );
}
