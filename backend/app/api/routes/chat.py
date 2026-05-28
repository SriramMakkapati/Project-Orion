from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse
from app.services.research_agent import ResearchAgentService
from app.api.deps import get_research_agent

router = APIRouter()


@router.post("/query")
async def chat_query(
    request: ChatRequest,
    agent: ResearchAgentService = Depends(get_research_agent)
):
    """Send a research query and get a response with sources."""
    result = await agent.research(request.query, request.sources)
    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        query=request.query
    )


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    agent: ResearchAgentService = Depends(get_research_agent)
):
    """Stream a research response using SSE."""
    return StreamingResponse(
        agent.research_stream(request.query, request.sources),
        media_type="text/event-stream"
    )
