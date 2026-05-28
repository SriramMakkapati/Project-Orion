<div align="center">

# 🔮 Project Orion

### AI-Powered Multi-Source Research Agent

A full-stack RAG (Retrieval-Augmented Generation) application that combines local LLM inference, document intelligence, and web search into a seamless research experience — all running locally at zero cost.

[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-white?style=for-the-badge&logo=ollama&logoColor=black)](https://ollama.ai)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain.com)

---

<img src="https://img.shields.io/badge/Status-Active_Development-brightgreen?style=flat-square" alt="Status"/>
<img src="https://img.shields.io/badge/Cost-$0_(Fully_Local)-blue?style=flat-square" alt="Cost"/>
<img src="https://img.shields.io/badge/Privacy-100%25_Local-purple?style=flat-square" alt="Privacy"/>

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧠 **RAG Pipeline** | Upload documents → chunk → embed → retrieve → generate answers grounded in your data |
| 🌐 **Web Search** | Real-time DuckDuckGo search integration for current information |
| 🔧 **MCP Tools** | Model Context Protocol tool registry for extensible agent capabilities |
| ⚡ **Streaming** | Token-by-token SSE streaming for real-time responses |
| 🎨 **Beautiful UI** | Gemini-inspired interface with 3 themes (Dark, Light, Midnight) |
| 📁 **Document Management** | Upload, view, and delete PDFs, DOCX, TXT, and Markdown files |
| 💬 **Chat History** | Persistent conversations with rename and delete |
| 🛑 **Stop Generation** | Abort responses mid-stream with one click |
| 🔒 **Fully Local** | No API keys, no data leaves your machine, zero cost |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                      │
│         React 18 · Tailwind · Zustand · SSE                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / SSE
┌──────────────────────────▼──────────────────────────────────┐
│                    BACKEND (FastAPI)                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │Research Agent │  │Document Svc  │  │  MCP Server      │  │
│  │(orchestrator)│  │(ingest/CRUD) │  │  (tool registry) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
│         │                  │                                  │
│  ┌──────▼──────────────────▼─────────────────────────────┐  │
│  │          Search Service (parallel dispatch)            │  │
│  │   ChromaDB (vector)  ·  DuckDuckGo (web)  ·  Files    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │       Ollama — llama3.2 (chat) + nomic-embed-text     │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- [Python 3.11+](https://python.org)
- [Node.js 18+](https://nodejs.org)
- [Ollama](https://ollama.ai) installed and running

### 1. Clone the Repository

```bash
git clone https://github.com/SriramMakkapati/Project-Orion.git
cd Project-Orion
```

### 2. Pull Required Models

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python run.py
```

Backend starts at `http://localhost:8000`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:3000`

---

## 🛠️ Tech Stack

<table>
<tr>
<td><b>Layer</b></td>
<td><b>Technology</b></td>
<td><b>Purpose</b></td>
</tr>
<tr>
<td>Frontend</td>
<td>Next.js 14, React 18, Tailwind CSS</td>
<td>UI with App Router, SSE streaming</td>
</tr>
<tr>
<td>State</td>
<td>Zustand</td>
<td>Lightweight reactive state management</td>
</tr>
<tr>
<td>Backend</td>
<td>FastAPI, Python 3.13</td>
<td>Async API with streaming support</td>
</tr>
<tr>
<td>LLM</td>
<td>Ollama (llama3.2)</td>
<td>Local inference, zero cost</td>
</tr>
<tr>
<td>Embeddings</td>
<td>nomic-embed-text (768-dim)</td>
<td>Document & query vectorization</td>
</tr>
<tr>
<td>Vector DB</td>
<td>ChromaDB</td>
<td>Persistent similarity search</td>
</tr>
<tr>
<td>Orchestration</td>
<td>LangChain</td>
<td>RAG chain, prompt templates</td>
</tr>
<tr>
<td>Tools</td>
<td>FastMCP</td>
<td>Model Context Protocol tool registry</td>
</tr>
<tr>
<td>Web Search</td>
<td>httpx + BeautifulSoup</td>
<td>DuckDuckGo scraping</td>
</tr>
</table>

---

## 📂 Project Structure

```
Project-Orion/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # REST endpoints (chat, documents, sources)
│   │   ├── core/                # Config, RAG engine, MCP server
│   │   ├── services/            # Business logic (agent, search, documents)
│   │   └── tools/               # MCP tools (vector, web, file)
│   ├── data/                    # Uploads & ChromaDB persistence
│   ├── requirements.txt
│   └── run.py                   # Entry point
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages (chat, documents, sources)
│   │   ├── components/          # React components (chat, layout, documents)
│   │   ├── store/               # Zustand stores (chat, theme)
│   │   └── lib/                 # API client
│   ├── package.json
│   └── tailwind.config.js
├── ARCHITECTURE.md              # Detailed architecture & interview Q&A (local only)
└── README.md
```

---

## 🎨 Themes

Orion supports three carefully crafted themes with zero-flash switching:

| Theme | Style |
|-------|-------|
| 🌑 **Dark** | Neutral dark (#1a1a1a) — Gemini-inspired |
| ☀️ **Light** | Clean white (#ffffff) — Google-inspired |
| 🌌 **Midnight** | Deep blue-black (#0d1117) — GitHub-inspired |

---

## ⚡ Performance Optimizations

| Optimization | Result |
|-------------|--------|
| Parallel search via `asyncio.gather` | 50% faster retrieval |
| Smart routing (skip web for doc queries) | 6-10s saved |
| Context trimming (max 4 sources × 400 chars) | 60% fewer LLM tokens |
| Web search timeout (6s + 8s safety) | No indefinite hangs |
| Reduced retrieval k (5 → 3) | Faster similarity search |

**Result**: Response time reduced from 30s → 5-8s

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/stream` | Stream a research response (SSE) |
| `POST` | `/api/chat/query` | Get a complete response |
| `POST` | `/api/documents/upload` | Upload & index a document |
| `GET` | `/api/documents/` | List all indexed documents |
| `DELETE` | `/api/documents/{id}` | Delete a document |
| `GET` | `/api/sources` | List connected sources |

---

## 🔮 Roadmap

- [ ] LangGraph agent with multi-step reasoning (ReAct)
- [ ] Conversation memory (long-term ChromaDB collection)
- [ ] GPU inference support
- [ ] Redis caching layer
- [ ] Multi-model support (switch between Ollama models)
- [ ] Export conversations as PDF
- [ ] Docker Compose deployment

---

## 📖 Documentation

For detailed architecture diagrams, data flow explanations, and interview-ready Q&A — see `ARCHITECTURE.md` (kept locally, not in repo).

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with 💜 by [Sriram Makkapati](https://github.com/SriramMakkapati)**

*Orion — Your local AI research companion*

</div>
