"use client";

import { useState, useRef, useEffect } from "react";
import { FiArrowUp, FiSquare, FiPlus } from "react-icons/fi";
import { api } from "@/lib/api";

export default function ChatInput({ onSend, disabled, onStop }) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        await api.uploadDocument(formData);
        window.dispatchEvent(new Event("documents-updated"));
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="px-4 pb-4 pt-2" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        <div
          className={`relative flex items-end gap-2 border rounded-2xl transition-all duration-200 px-2 ${isFocused ? 'ring-1' : ''}`}
          style={{
            background: 'var(--bg-surface)',
            borderColor: isFocused ? 'var(--text-muted)' : 'var(--border-primary)',
            ringColor: 'var(--text-muted)',
          }}
        >
          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-shrink-0 mb-2.5 mt-2.5 flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 hover:opacity-80 disabled:opacity-40"
            style={{ color: 'var(--text-muted)' }}
            title="Upload document"
          >
            <FiPlus size={18} className={uploading ? 'animate-spin' : ''} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask anything..."
            disabled={disabled}
            rows={1}
            className="flex-1 py-3 bg-transparent text-sm resize-none focus:outline-none disabled:opacity-50 leading-relaxed"
            style={{ color: 'var(--text-primary)', maxHeight: '160px' }}
          />

          {/* Stop or Send button */}
          {disabled ? (
            <button
              type="button"
              onClick={onStop}
              className="flex-shrink-0 mb-2.5 flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors duration-150"
              title="Stop generating"
            >
              <FiSquare size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="flex-shrink-0 mb-2.5 flex items-center justify-center w-8 h-8 rounded-lg text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 active:scale-90"
              style={{ background: input.trim() ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              <FiArrowUp size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
