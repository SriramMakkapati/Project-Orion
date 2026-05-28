import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.services.search_service import SearchService
from app.config import Settings


RESEARCH_PROMPT = """You are a highly knowledgeable multi-source research agent. Your job is to answer the user's question accurately and comprehensively.

## Retrieved Context:
{context}

## User Question:
{question}

## Instructions:
1. If relevant sources are provided above, use them to answer and cite which sources support each claim.
2. If the sources are not relevant or say "No relevant sources found", use your own knowledge to answer the question directly.
3. Always provide a helpful, complete answer regardless of whether sources were found.
4. For general knowledge questions (facts, people, events, etc.), answer directly from your knowledge.
5. If sources conflict, note the discrepancy.
6. Format your answer with markdown for readability.

## Answer:"""


class ResearchAgentService:
    def __init__(self, llm, search_service: SearchService, settings: Settings):
        self.llm = llm
        self.search_service = search_service
        self.settings = settings
        self.prompt = ChatPromptTemplate.from_template(RESEARCH_PROMPT)
        self.chain = self.prompt | self.llm | StrOutputParser()

    async def research(self, query: str, sources: list[str] = None):
        """Perform multi-source research and generate answer."""
        search_results = await self.search_service.multi_source_search(query, sources)

        context = self._format_context(search_results)

        answer = await self.chain.ainvoke({
            "context": context,
            "question": query
        })

        return {
            "answer": answer,
            "sources": search_results
        }

    async def research_stream(self, query: str, sources: list[str] = None):
        """Stream research response using SSE."""
        search_results = await self.search_service.multi_source_search(query, sources)
        context = self._format_context(search_results)

        # Send sources first
        yield f"data: {json.dumps({'type': 'sources', 'data': search_results})}\n\n"

        # Stream the LLM response
        async for chunk in self.chain.astream({
            "context": context,
            "question": query
        }):
            yield f"data: {json.dumps({'type': 'token', 'data': chunk})}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    def _format_context(self, results: list[dict]) -> str:
        if not results:
            return "No relevant sources found."

        formatted = []
        for i, result in enumerate(results[:4], 1):
            source = result.get("source", "unknown")
            content = result.get("content", "")[:400]
            formatted.append(
                f"[Source {i} - {source}]\n"
                f"Content: {content}\n"
            )
        return "\n---\n".join(formatted)
