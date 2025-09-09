from fastapi import APIRouter
from ..models.schemas import IngestReq
from ..services import store
import httpx
from bs4 import BeautifulSoup

router = APIRouter(tags=["ingest"])

def fetch_url_text(url: str) -> str:
    try:
        r = httpx.get(url, timeout=10.0)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        # drop scripts/styles
        for s in soup(["script", "style"]):
            s.extract()
        text = soup.get_text(separator=" ")
        return " ".join(text.split())
    except Exception as e:
        return f"(Failed to fetch content: {e})"

@router.post("/ingest")
def ingest(payload: IngestReq):
    count = 0
    if payload.text:
        store.add(payload.text, source="manual")
        count += 1
    if payload.url:
        text = fetch_url_text(payload.url)
        store.add(text, source=payload.url)
        count += 1
    return {"ingested": count}
