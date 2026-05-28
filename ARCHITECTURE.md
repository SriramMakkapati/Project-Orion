# Orion — Architecture & Interview Prep

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                     │
│  React 18 · App Router · Tailwind · Zustand · SSE streaming     │
│  Theme system (dark/light/midnight) · Collapsible sidebar       │
│  Chat history (localStorage) · File upload from chat input      │
│  localhost:3000                                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP / SSE (Server-Sent Events)
┌─────────────────────▼───────────────────────────────────────────┐
│                        BACKEND (FastAPI)                         │
│  Python 3.13 · LangChain · Ollama · ChromaDB · asyncio          │
│  localhost:8000                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │ Research Agent  │  │ Document Svc   │  │  MCP Server        │ │
│  │ (orchestrator) │  │ (ingest/CRUD)  │  │  (tool registry)   │ │
│  └───────┬────────┘  └───────┬────────┘  └────────────────────┘ │
│          │                    │                                   │
│  ┌───────▼────────────────────▼──────────────────────────────┐  │
│  │              Search Service (parallel dispatch)            │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌───────────────┐       │  │
│  │  │ ChromaDB │  │ Web Search   │  │ File Reader   │       │  │
│  │  │ (vector) │  │ (DuckDuckGo) │  │ (sandboxed)   │       │  │
│  │  │ k=3 top  │  │ 6s timeout   │  │ ./data/ only  │       │  │
│  │  └──────────┘  └──────────────┘  └───────────────┘       │  │
│  │                                                            │  │
│  │  Smart routing: doc keywords → skip web, parallel via      │  │
│  │  asyncio.gather, graceful timeout fallback                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Ollama (Local LLM)                      │  │
│  │  llama3.2 (chat) · nomic-embed-text (embeddings)          │  │
│  │  localhost:11434 · CPU inference                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## RAG Pipeline

### Document Ingestion

```
User uploads file (.pdf/.docx/.txt/.md)
  ├─ via + button in chat input
  └─ via Documents page drag & drop
        │
        ▼
┌─────────────────┐
│  File saved to  │  → ./data/uploads/{uuid}.ext
│  disk (UUID)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Document       │  PyMuPDFLoader / Docx2txtLoader / TextLoader
│  Loader         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Text Splitter  │  RecursiveCharacterTextSplitter
│                 │  chunk_size=1000, overlap=200
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Embedding      │  Ollama → nomic-embed-text (768-dim)
│  Generation     │  Runs locally, zero API cost
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ChromaDB       │  Collection: "research_docs"
│  Storage        │  Persisted: ./data/chroma_db/
└─────────────────┘
```

### Query & Retrieval (Optimized)

```
User sends question
        │
        ▼
┌─────────────────────────────────────────┐
│     Smart Source Router                  │
│                                          │
│  if query mentions "document/uploaded/   │
│  summarize/explain the" →                │
│     sources = [vector_db only]           │
│  else →                                  │
│     sources = [vector_db, web_search]    │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│   asyncio.gather (parallel execution)    │
│                                          │
│  ┌─────────────┐    ┌─────────────────┐ │
│  │ ChromaDB    │    │ DuckDuckGo      │ │
│  │ top-3       │    │ (8s timeout)    │ │
│  │ similarity  │    │ graceful fail   │ │
│  └──────┬──────┘    └───────┬─────────┘ │
│         └────────┬──────────┘            │
└──────────────────┼───────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│  Context Builder                         │
│  • Max 4 sources, each trimmed to 400ch │
│  • No metadata noise in prompt          │
│  • Total context: ~1600 chars (fast)    │
└────────────────────┬─────────────────────┘
                     ▼
┌─────────────────────────────────────────┐
│  LLM (ChatOllama → llama3.2)            │
│  • Streaming via .astream()             │
│  • Token-by-token SSE to frontend       │
│  • AbortController support (stop btn)   │
└────────────────────┬─────────────────────┘
                     ▼
         SSE Response to client
         data: {"type":"sources","data":[...]}
         data: {"type":"token","data":"..."}
         data: {"type":"done"}
```

---

## MCP (Model Context Protocol)

Defined via `fastmcp` in `backend/app/core/mcp_server.py`:

| Tool | Function | Description |
|------|----------|-------------|
| `search_documents` | Vector similarity search | Queries ChromaDB embeddings |
| `search_web` | Web search | DuckDuckGo HTML scraping |
| `read_file` | Local file reader | Sandboxed to `./data/` directory |

**Status**: Tools are registered and functional. The REST API calls the same underlying functions directly (SearchService). The MCP transport layer is ready for mounting — enables future integration with MCP-compatible clients (Claude Desktop, custom agents).

---

## Vector Database (ChromaDB)

| Property | Value |
|----------|-------|
| Storage | Persistent on disk |
| Location | `./data/chroma_db/` |
| Collection | `research_docs` |
| Embedding | `nomic-embed-text` (768-dim) |
| Similarity | Cosine (default) |
| Retrieval | Top-3, content capped at 500 chars |
| Delete | `where={"doc_id": id}` filter |

---

## Frontend Architecture

| Feature | Implementation |
|---------|---------------|
| State | Zustand (chatStore, themeStore) |
| Themes | CSS custom properties, 3 themes, flash-free via inline script |
| Chat history | localStorage, auto-save after each response, 50 max |
| Streaming | Fetch + ReadableStream → SSE parsing |
| Stop generation | AbortController on fetch signal |
| Upload | + button in chat input, file picker, calls /api/documents/upload |
| Sidebar | Collapsible (64px ↔ 240px), chat history list, delete per chat |
| Hydration-safe | Store hydrates from localStorage only after mount |

---

## File Structure

```
backend/
├── main.py                          # FastAPI app, CORS, router mounting
├── app/
│   ├── api/routes/
│   │   ├── chat.py                  # /api/chat/query, /api/chat/stream
│   │   ├── documents.py             # /api/documents/upload, list, delete
│   │   └── sources.py               # /api/sources (static list)
│   ├── core/
│   │   ├── config.py                # Settings from .env
│   │   ├── rag_engine.py            # ChromaDB + embedding init
│   │   └── mcp_server.py            # FastMCP tool definitions
│   ├── services/
│   │   ├── research_agent.py        # Orchestrator: search → LLM → stream
│   │   ├── document_service.py      # File ingest, chunking, CRUD
│   │   ├── search_service.py        # Parallel multi-source search
│   │   └── embedding_service.py     # OllamaEmbeddings wrapper
│   └── tools/
│       ├── vector_search.py         # ChromaDB query wrapper
│       ├── web_search.py            # DuckDuckGo scraper (6s timeout)
│       └── file_reader.py           # Sandboxed file reader
└── data/
    ├── uploads/                     # Uploaded documents
    └── chroma_db/                   # Vector DB persistence

frontend/
├── src/
│   ├── app/
│   │   ├── layout.js               # Root layout, theme init script
│   │   ├── globals.css             # Theme vars, animations, scrollbar
│   │   ├── page.js                 # Chat page (main)
│   │   ├── documents/page.js       # Document management
│   │   └── sources/page.js         # Connected sources view
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.jsx      # Message list, scroll, loading
│   │   │   ├── ChatInput.jsx       # Textarea, +upload, stop btn
│   │   │   ├── MessageBubble.jsx   # User/AI message rendering
│   │   │   └── SourceCard.jsx      # Cited source display
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx      # Shell: sidebar + content
│   │   │   └── Sidebar.jsx         # Nav, history, themes, collapse
│   │   └── documents/
│   │       ├── FileUpload.jsx      # Drag & drop uploader
│   │       └── DocumentList.jsx    # Indexed docs with delete
│   ├── store/
│   │   ├── chatStore.js            # Messages, history, streaming
│   │   └── themeStore.js           # Theme persistence
│   └── lib/
│       └── api.js                  # Axios + fetch API client
```

---

---

# Interview Questions & Answers

## RAG (Retrieval-Augmented Generation)

### Q1: What is RAG and why use it instead of fine-tuning?

**A:** RAG augments an LLM's knowledge by retrieving relevant documents at query time and injecting them into the prompt context. vs fine-tuning:

| | RAG | Fine-tuning |
|--|-----|-------------|
| Data freshness | Real-time (add/remove docs anytime) | Static (retrain needed) |
| Cost | Low (no training compute) | High (GPU hours) |
| Hallucination | Reduced (grounded in sources) | Still possible |
| Transparency | Can cite sources | Black box |
| Setup | Vector DB + retrieval pipeline | Training infrastructure |

In this project, I chose RAG because users upload documents dynamically — fine-tuning would require retraining on each upload.

---

### Q2: Explain the chunking strategy. Why chunk_size=1000 and overlap=200?

**A:** 
- **chunk_size=1000**: Balances context density with retrieval precision. Too large (5000+) → retrieves irrelevant text alongside relevant. Too small (100) → loses context.
- **overlap=200**: Ensures sentences split across chunk boundaries are captured in at least one chunk. 20% overlap is standard.
- **RecursiveCharacterTextSplitter**: Splits on paragraph → newline → sentence → word boundaries progressively, preserving semantic units.

**Trade-off**: Smaller chunks = more precise retrieval but need more k results. Larger chunks = more context per result but may include noise.

---

### Q3: How do you handle the "lost in the middle" problem?

**A:** LLMs tend to focus on the beginning and end of context, ignoring middle content. Solutions:
1. **Limit sources** (I use top-3 instead of top-10)
2. **Trim each source** (400 chars max — only the most relevant portion)
3. **Reranking** (cross-encoder to reorder by relevance — not implemented here but ideal for production)
4. **Map-reduce** (summarize each source independently, then combine)

---

### Q4: What embedding model did you use and why?

**A:** `nomic-embed-text` (768 dimensions) via Ollama:
- **Runs locally** — zero cost, no API keys, data stays private
- **768-dim** — good balance of quality vs speed (vs 1536 for OpenAI)
- **MTEB performance** — competitive with commercial embeddings for retrieval tasks
- For production: I'd consider `text-embedding-3-small` (OpenAI) or `bge-large-en-v1.5` for better accuracy.

---

### Q5: How do you evaluate RAG quality?

**A:** Key metrics:
- **Retrieval**: Hit rate (is the answer in retrieved docs?), MRR (Mean Reciprocal Rank)
- **Generation**: Faithfulness (does answer match sources?), Answer relevancy, Hallucination rate
- **Tools**: RAGAS framework, LangSmith tracing, manual eval sets
- **In this project**: I'd add logging of retrieval scores and user feedback (thumbs up/down) as a baseline.

---

## MCP (Model Context Protocol)

### Q6: What is MCP and how does it differ from function calling?

**A:** MCP is an open protocol (by Anthropic) that standardizes how AI models discover and invoke external tools/resources.

| | MCP | Function Calling (OpenAI) |
|--|-----|--------------------------|
| Standard | Open protocol, vendor-neutral | Proprietary per provider |
| Discovery | Dynamic — client discovers tools at runtime | Static — defined in API call |
| Transport | SSE, stdio, HTTP | Part of chat completion API |
| Scope | Tools + Resources + Prompts | Tools only |
| Interop | Any MCP client ↔ any MCP server | Locked to one LLM provider |

In this project, I registered MCP tools (`search_documents`, `search_web`, `read_file`) that any MCP-compatible client can discover and invoke.

---

### Q7: How are MCP tools defined in your project?

**A:**
```python
from fastmcp import FastMCP

mcp = FastMCP("Research Agent MCP Server")

@mcp.tool()
async def search_documents(query: str, top_k: int = 3):
    """Search uploaded documents using semantic similarity."""
    # ChromaDB vector search
    ...

@mcp.tool()
async def search_web(query: str, num_results: int = 5):
    """Search the web for current information."""
    # DuckDuckGo scraping
    ...
```

Each tool has a name, typed parameters, and a docstring that becomes its description. MCP clients use this metadata to decide which tool to call.

---

### Q8: How would you make the agent truly agentic (multi-step reasoning)?

**A:** Currently it's single-pass (retrieve → generate). To make it agentic:
1. **Tool-calling loop**: LLM decides which tools to call, examines results, decides if more info needed
2. **ReAct pattern**: Thought → Action → Observation → repeat until answer found
3. **LangGraph**: Define a state machine with nodes (search, analyze, synthesize) and conditional edges
4. **Implementation**: Replace the single chain with a LangGraph agent that has ChromaDB, web search, and file reader as bound tools

---

## GenAI & LLMs

### Q9: Why use Ollama + llama3.2 instead of OpenAI?

**A:**
- **Zero cost** — no API bills, unlimited queries
- **Data privacy** — nothing leaves the machine (important for sensitive documents)
- **Offline capable** — works without internet
- **Trade-off**: Slower (CPU inference ~4s for short answers) and less capable than GPT-4. For production, I'd use a GPU or switch to a cloud API with caching.

---

### Q10: Explain streaming. Why SSE instead of WebSocket?

**A:** 
- **SSE (Server-Sent Events)**: Unidirectional (server → client), built on HTTP, auto-reconnect, simpler
- **WebSocket**: Bidirectional, persistent connection, more complex
- **Why SSE**: Chat streaming is unidirectional — the server sends tokens, client just receives. No need for bidirectional communication. SSE works through proxies/CDNs, requires no special server config.

Implementation:
```python
# Backend: FastAPI StreamingResponse
async def research_stream(query):
    yield f"data: {json.dumps({'type': 'sources', 'data': results})}\n\n"
    async for chunk in chain.astream({...}):
        yield f"data: {json.dumps({'type': 'token', 'data': chunk})}\n\n"

# Frontend: ReadableStream parsing
const reader = response.body.getReader();
while (true) {
    const { done, value } = await reader.read();
    // parse SSE lines, update UI per token
}
```

---

### Q11: How do you handle hallucination?

**A:**
1. **Grounding**: Provide retrieved sources in prompt, instruct "only use provided context"
2. **Source citation**: LLM must reference which source supports each claim
3. **Confidence signals**: If sources conflict or are irrelevant, LLM says so
4. **Temperature=0**: Deterministic outputs for factual questions
5. **Post-processing**: Verify claims against sources (RAGAS faithfulness metric)

---

## Frontend & Full Stack

### Q12: Why Zustand over Redux or Context?

**A:**
- **Zustand**: Minimal boilerplate, no providers needed, works outside React components, built-in selectors, 1KB
- **Redux**: Overkill for this scale, too much ceremony (actions, reducers, thunks)
- **Context**: Re-renders entire tree on state change, no middleware, not suitable for frequent updates (streaming tokens)

Key pattern used: `useChatStore((s) => s.messages)` — only re-renders when `messages` changes.

---

### Q13: How did you handle hydration errors with localStorage?

**A:** Server renders with empty state → client reads localStorage → mismatch → hydration error.

**Fix**: Initialize store with empty `history: []`, add a `hydrate()` method that reads localStorage, call it in `useEffect` (client-only). Both server and client render identical initial HTML.

```javascript
// Store
history: [],  // NOT loadHistory() — that causes mismatch
hydrate: () => set({ history: loadHistory() }),

// Layout (useEffect = client only)
useEffect(() => { hydrate(); }, []);
```

---

### Q14: How does the theme system work without flash?

**A:**
1. `layout.js` has an **inline script** (runs before paint) that reads `localStorage.theme` and sets `data-theme` on `<html>`
2. CSS uses custom properties: `var(--bg-primary)`, `var(--text-primary)`, etc.
3. Three theme definitions in CSS (`:root/dark`, `[data-theme="light"]`, `[data-theme="midnight"]`)
4. No flash because the script runs synchronously before first render
5. `suppressHydrationWarning` on `<html>` since the attribute differs from server default

---

### Q15: Why did you implement AbortController for stop generation?

**A:** Without it, the fetch request keeps consuming the SSE stream even after the user wants to stop. AbortController:
1. Sends abort signal to the fetch → closes TCP connection
2. Backend's async generator gets cancelled (no wasted LLM compute)
3. Frontend immediately sets `isLoading: false`
4. Better UX — user doesn't have to wait for a bad response to finish

---

## Agentic AI

### Q16: What's the difference between a chatbot, a RAG system, and an AI agent?

**A:**

| | Chatbot | RAG System | AI Agent |
|--|---------|-----------|----------|
| Knowledge | Training data only | Training + retrieved docs | Training + tools + memory |
| Actions | Generate text | Generate grounded text | Reason, plan, execute actions |
| Autonomy | None | None | Multi-step decision making |
| Example | GPT without context | This project (current) | AutoGPT, Devin, Claude with tools |

This project is a **RAG system with MCP tool scaffolding** — one step away from being a full agent (needs a reasoning loop).

---

### Q17: How would you add memory to make this a true agent?

**A:**
1. **Short-term**: Conversation buffer (last N messages) — already have via chat history
2. **Long-term**: Store summaries/facts in a separate ChromaDB collection, retrieve on each turn
3. **Episodic**: Save entire conversations as searchable documents
4. **Implementation**: LangGraph's `MemorySaver` checkpointer or a custom memory tool that the agent calls to store/retrieve important information

---

### Q18: Explain the ReAct (Reasoning + Acting) pattern.

**A:**
```
Thought: I need to find information about X
Action: search_documents("X")
Observation: [results from ChromaDB]
Thought: The documents mention Y but I need more detail on Z
Action: search_web("Z details")
Observation: [web results]
Thought: I now have enough info to answer
Action: Final Answer
```

The LLM alternates between reasoning (Thought) and tool use (Action), examining outputs (Observation) to decide next steps. This project does a single Action cycle — true agentic would loop until satisfied.

---

### Q19: What's the role of tool descriptions in agentic systems?

**A:** Tool descriptions are how the LLM decides **which tool to use**. They must be:
- **Precise**: "Search uploaded documents using semantic similarity" not "search stuff"
- **Scoped**: Describe what it can and cannot do
- **Typed**: Parameter types guide the LLM on what to pass

Bad description → LLM picks wrong tool → bad results. In MCP, the `docstring` of each `@mcp.tool()` function becomes its description.

---

### Q20: How do you handle tool failures gracefully in an agent?

**A:** In this project:
```python
# Web search with graceful timeout
async def search_web(self, query, num_results=5):
    try:
        return await asyncio.wait_for(web_search(query, num_results), timeout=8.0)
    except (asyncio.TimeoutError, Exception):
        return []  # Empty results, not a crash
```

For a full agent:
1. **Retry with different parameters** (e.g., rephrase search query)
2. **Fallback to alternative tool** (ChromaDB fails → try web)
3. **Inform the user** transparently ("Web search timed out, answering from documents only")
4. **Never crash** — catch exceptions at tool boundaries, return structured error

---

## System Design & Performance

### Q21: How did you optimize response latency?

**A:** Initial: 30+ seconds. After optimization: 5-8 seconds.

| Optimization | Impact |
|-------------|--------|
| Parallel search (asyncio.gather) | -50% search time |
| Skip web for doc queries (keyword detection) | -6-10s for doc questions |
| Reduce k from 5 to 3 | -40% embedding comparisons |
| Trim chunks to 400 chars in context | -60% LLM input tokens |
| Remove metadata from prompt | -20% prompt size |
| Web timeout 6s with 8s safety net | Prevents indefinite hang |

---

### Q22: How would you scale this for production?

**A:**
1. **GPU inference**: Move Ollama to GPU (10x faster) or use vLLM/TGI
2. **Caching**: Redis for query→response caching, embedding cache
3. **Async workers**: Celery for document processing (upload doesn't block)
4. **Managed vector DB**: Pinecone/Weaviate instead of local ChromaDB
5. **Rate limiting**: Token bucket on /api/chat endpoints
6. **Observability**: LangSmith for tracing, Prometheus for metrics
7. **CDN**: Next.js static export behind CloudFront
