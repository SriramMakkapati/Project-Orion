import os


async def read_local_file(file_path: str) -> str:
    """Read a local file's content safely."""
    # Prevent path traversal
    abs_path = os.path.abspath(file_path)
    allowed_dir = os.path.abspath("./data")

    if not abs_path.startswith(allowed_dir):
        return "Error: Access denied. Can only read files within the data directory."

    if not os.path.exists(abs_path):
        return f"Error: File not found: {file_path}"

    try:
        with open(abs_path, "r", encoding="utf-8") as f:
            content = f.read()
        # Limit content length
        if len(content) > 10000:
            content = content[:10000] + "\n... [truncated]"
        return content
    except Exception as e:
        return f"Error reading file: {str(e)}"
