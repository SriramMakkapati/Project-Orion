import httpx
from bs4 import BeautifulSoup


async def web_search(query: str, num_results: int = 5) -> list[dict]:
    """
    Search the web using DuckDuckGo HTML (no API key needed).
    Returns a list of search result dicts.
    """
    results = []
    try:
        url = "https://html.duckduckgo.com/html/"
        async with httpx.AsyncClient(timeout=6.0, verify=False) as client:
            response = await client.post(url, data={"q": query})
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        result_links = soup.find_all("a", class_="result__a", limit=num_results)
        result_snippets = soup.find_all("a", class_="result__snippet", limit=num_results)

        for i, link in enumerate(result_links):
            title = link.get_text(strip=True)
            href = link.get("href", "")
            snippet = ""
            if i < len(result_snippets):
                snippet = result_snippets[i].get_text(strip=True)

            results.append({
                "content": f"{title}\n{snippet}",
                "metadata": {"url": href, "title": title},
                "source": "web_search"
            })
    except Exception as e:
        results.append({
            "content": f"Web search failed: {str(e)}",
            "metadata": {},
            "source": "web_search"
        })

    return results
