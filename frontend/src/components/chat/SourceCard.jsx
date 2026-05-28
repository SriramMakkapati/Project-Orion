"use client";

import { FiFileText, FiGlobe, FiFolder, FiExternalLink } from "react-icons/fi";

export default function SourceCard({ source, index }) {
  const getSourceConfig = (type) => {
    switch (type) {
      case "web_search":
        return { icon: FiGlobe, label: "Web" };
      case "vector_db":
        return { icon: FiFileText, label: "Doc" };
      case "file_system":
        return { icon: FiFolder, label: "File" };
      default:
        return { icon: FiFileText, label: "Source" };
    }
  };

  const config = getSourceConfig(source.source);
  const Icon = config.icon;

  return (
    <div
      className="border rounded-lg p-2.5 transition-colors duration-150 hover:border-opacity-60"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
    >
      <div className="flex items-start gap-2">
        <Icon size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>
              {config.label}
            </span>
            {source.score && (
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                · {(source.score * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {source.content?.slice(0, 100)}
          </p>
          {source.metadata?.url && (
            <a
              href={source.metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] mt-1 hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              <FiExternalLink size={9} />
              {source.metadata.title?.slice(0, 30) || "View"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
