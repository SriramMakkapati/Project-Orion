from fastmcp import FastMCP
from app.core.rag_engine import RAGEngine
from app.tools.web_search import web_search
from app.tools.vector_search import vector_search
from app.tools.file_reader import read_local_file

mcp = FastMCP("Research Agent MCP Server")


@mcp.tool()
async def search_documents(query: str, top_k: int = 5) -> str:
    """Search the vector database for relevant document chunks."""
    return await vector_search(query, top_k)


@mcp.tool()
async def search_web(query: str, num_results: int = 5) -> str:
    """Search the web for information on a topic."""
    return await web_search(query, num_results)


@mcp.tool()
async def read_file(file_path: str) -> str:
    """Read content from a local file."""
    return await read_local_file(file_path)


def get_mcp_server():
    return mcp
