import MainLayout from "@/components/layout/MainLayout";
import { FiFileText, FiGlobe, FiFolder, FiCheck, FiZap } from "react-icons/fi";

const sources = [
  {
    id: "vector_db",
    name: "Document Store",
    type: "vector",
    icon: "FiFileText",
    desc: "Semantic search across uploaded documents using vector embeddings",
    details: "ChromaDB + nomic-embed-text",
    accent: "#6366f1",
  },
  {
    id: "web_search",
    name: "Web Search",
    type: "web",
    icon: "FiGlobe",
    desc: "Real-time web search via DuckDuckGo for up-to-date information",
    details: "DuckDuckGo HTML API",
    accent: "#10b981",
  },
  {
    id: "file_system",
    name: "Local Files",
    type: "file",
    icon: "FiFolder",
    desc: "Read and analyze files from the local data directory",
    details: "Sandboxed file access",
    accent: "#f59e0b",
  },
];

const iconMap = { FiFileText, FiGlobe, FiFolder };

export default function SourcesPage() {
  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Connected Sources</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>These are the data sources the research agent queries to answer your questions.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { value: "3", label: "Active Sources" },
            { value: "100%", label: "Uptime", color: "#10b981" },
            { value: "Local", label: "All Processing", color: "var(--accent)" },
          ].map((stat, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 text-center animate-fade-in-scale"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-primary)', animationDelay: `${i * 0.1}s` }}
            >
              <p className="text-2xl font-bold" style={{ color: stat.color || 'var(--text-primary)' }}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Source cards */}
        <div className="space-y-4">
          {sources.map((source, index) => {
            const Icon = iconMap[source.icon];
            return (
              <div
                key={source.id}
                className="border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg animate-slide-up group"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-primary)', animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: `${source.accent}15` }}>
                    <Icon size={22} style={{ color: source.accent }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{source.name}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border" style={{ background: `${source.accent}15`, color: source.accent, borderColor: `${source.accent}30` }}>
                        {source.type}
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{source.desc}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{source.details}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <FiCheck size={12} className="text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Connected</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info box */}
        <div className="mt-8 p-4 border rounded-xl flex items-start gap-3 animate-fade-in" style={{ background: 'var(--accent-muted)', borderColor: 'var(--border-primary)' }}>
          <FiZap style={{ color: 'var(--accent)' }} className="mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>MCP-Powered Tool Use</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Each source is exposed as an MCP tool. The AI agent automatically decides which sources to query based on your question.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
