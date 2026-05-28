import asyncio
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings
from app.config import Settings
from app.tools.web_search import web_search

# Keywords that indicate user is asking about their own documents
_DOC_KEYWORDS = ["document", "uploaded", "file", "paper", "pdf", "summarize", "summary", "explain the"]


class SearchService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.embeddings = OllamaEmbeddings(
            base_url=settings.ollama_base_url,
            model=settings.ollama_embed_model
        )
        self.vectorstore = Chroma(
            persist_directory=settings.chroma_persist_dir,
            embedding_function=self.embeddings,
            collection_name="research_docs"
        )

    async def search_vectors(self, query: str, k: int = 3):
        """Search the local vector store."""
        results = self.vectorstore.similarity_search_with_score(query, k=k)
        return [
            {
                "content": doc.page_content[:500],
                "metadata": doc.metadata,
                "score": float(score),
                "source": "vector_db"
            }
            for doc, score in results
        ]

    async def search_web(self, query: str, num_results: int = 5):
        """Search the web for relevant content."""
        try:
            return await asyncio.wait_for(web_search(query, num_results), timeout=8.0)
        except (asyncio.TimeoutError, Exception):
            return []

    def _is_document_query(self, query: str) -> bool:
        """Check if query is specifically about uploaded documents."""
        q = query.lower()
        return any(kw in q for kw in _DOC_KEYWORDS)

    async def multi_source_search(self, query: str, sources: list[str] = None):
        """Search across multiple sources in parallel."""
        if sources is None:
            # Skip web search for document-focused queries
            if self._is_document_query(query):
                sources = ["vector_db"]
            else:
                sources = ["vector_db", "web_search"]

        tasks = []
        if "vector_db" in sources:
            tasks.append(self.search_vectors(query))
        if "web_search" in sources:
            tasks.append(self.search_web(query))

        if not tasks:
            return []

        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_results = []
        for result in results:
            if isinstance(result, list):
                all_results.extend(result)

        return all_results
