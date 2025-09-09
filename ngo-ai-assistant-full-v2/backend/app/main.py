from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import ingest, ask, generate_post, meeting, faqs

app = FastAPI(title="Heritage NGO AI Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok"}

app.include_router(ingest.router, prefix="/api")
app.include_router(ask.router, prefix="/api")
app.include_router(generate_post.router, prefix="/api")
app.include_router(meeting.router, prefix="/api")
app.include_router(faqs.router, prefix="/api")
