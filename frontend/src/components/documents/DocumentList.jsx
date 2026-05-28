"use client";

import { useEffect, useState } from "react";
import { FiTrash2, FiFileText, FiFile, FiBookOpen, FiHash } from "react-icons/fi";
import { api } from "@/lib/api";

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    window.addEventListener("documents-updated", fetchDocuments);
    return () => window.removeEventListener("documents-updated", fetchDocuments);
  }, []);

  const handleDelete = async (docId) => {
    try {
      await api.deleteDocument(docId);
      fetchDocuments();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return { icon: FiBookOpen, color: '#ef4444' };
      case 'docx': return { icon: FiFileText, color: '#3b82f6' };
      case 'md': return { icon: FiHash, color: '#a855f7' };
      default: return { icon: FiFile, color: '#64748b' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--bg-surface)' }}></div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border rounded-2xl animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-primary)' }}>
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-elevated)' }}>
          <FiFileText size={24} style={{ color: 'var(--text-muted)' }} />
        </div>
        <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No documents yet</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Upload files above to build your knowledge base</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Indexed Documents</h2>
        <span className="px-2.5 py-1 text-xs font-medium rounded-lg border" style={{ background: 'var(--accent-muted)', color: 'var(--accent)', borderColor: 'var(--border-primary)' }}>
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-2">
        {documents.map((doc, index) => {
          const fileConfig = getFileIcon(doc.filename);
          const Icon = fileConfig.icon;
          return (
            <div
              key={doc.doc_id}
              className="flex items-center gap-4 border rounded-xl p-4 transition-all duration-300 hover:shadow-md animate-fade-in group"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-primary)', animationDelay: `${index * 0.05}s` }}
            >
              <div className="p-2.5 rounded-xl" style={{ background: `${fileConfig.color}15` }}>
                <Icon style={{ color: fileConfig.color }} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{doc.filename}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{doc.chunks} chunks indexed</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                  <span className="text-xs text-emerald-400 font-medium">Ready</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.doc_id)}
                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/10"
                style={{ color: 'var(--text-muted)' }}
              >
                <FiTrash2 size={15} className="hover:text-red-400" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
