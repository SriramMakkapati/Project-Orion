from app.services.research_agent import ResearchAgentService
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingService
from app.services.search_service import SearchService
from app.core.llm import get_llm
from app.config import get_settings


def get_embedding_service():
    settings = get_settings()
    return EmbeddingService(settings)


def get_search_service():
    settings = get_settings()
    return SearchService(settings)


def get_document_service():
    settings = get_settings()
    embedding_service = get_embedding_service()
    return DocumentService(settings, embedding_service)


def get_research_agent():
    settings = get_settings()
    llm = get_llm()
    search_service = get_search_service()
    return ResearchAgentService(llm, search_service, settings)
