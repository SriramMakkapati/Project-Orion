from app.core.rag_engine import RAGEngine


async def vector_search(query: str, top_k: int = 5) -> str:
    """Search the vector database and return formatted results."""
    engine = RAGEngine()
    results = engine.similarity_search(query, k=top_k)

    if not results:
        return "No relevant documents found."

    formatted = []
    for i, (doc, score) in enumerate(results, 1):
        formatted.append(
            f"[{i}] (score: {score:.3f})\n"
            f"Source: {doc.metadata.get('filename', 'unknown')}\n"
            f"Content: {doc.page_content[:500]}"
        )
    return "\n\n---\n\n".join(formatted)
