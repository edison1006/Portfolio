from fastapi import APIRouter
from ..models.schemas import AskReq, AskResp, Cite
from ..services import store
from ..services.llm import generate_answer

router = APIRouter(tags=["ask"])

@router.post("/ask", response_model=AskResp)
def ask(payload: AskReq):
    ctx = store.search(payload.query, k=4)
    context_text = "\n\n".join([d["text"] for d in ctx])
    prompt = (
        "Answer using ONLY the context. If not found in context, say you don't have that information.\n\n"
        f"Context:\n{context_text}\n\nQuestion: {payload.query}\nAnswer:"
    )
    draft = generate_answer(prompt)
    citations = [Cite(snippet=d["text"][:120] + ("..." if len(d["text"])>120 else ""), source=d["source"]) for d in ctx]
    return AskResp(answer=draft, citations=citations)
