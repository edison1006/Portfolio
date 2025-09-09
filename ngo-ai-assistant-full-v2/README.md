
# Heritage Preservation NGO AI Assistant

A generic, full‑stack demo that combines **Website Development (Next.js + FastAPI)** and **AI (OpenAI + ChromaDB)**.
It provides: RAG document Q&A (with citations), social media post generator, meeting summarizer, and FAQ management.

通用的 **NGO AI 助理** 全栈示例（Next.js + FastAPI + OpenAI + ChromaDB）：支持文档问答（含引用）、社媒文案生成、会议纪要总结、FAQ 审核发布。

## Quick Start / 快速开始

### 1) Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# set your key in .env (copy from .env.example)
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

### 3) Seed Demo Data / 预置示例数据
```bash
# in project root
python backend/scripts/seed_data.py
```

### 4) Docker
```bash
docker compose -f docker/docker-compose.yml up --build
```

## Env
Backend `backend/.env`:
```
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4o-mini
CHROMA_PATH=./chroma_db
FAQ_DB_PATH=faqs.sqlite3
```

## Folders
- `frontend/` Next.js pages: `/ask`, `/ingest`, `/post`, `/meeting`, `/admin/faqs`
- `backend/` FastAPI routers: `/api/ingest`, `/api/ask`, `/api/generate_post`, `/api/meeting/summarize`, `/api/faqs`
- `docker/` Dockerfiles + compose
- `backend/scripts/seed_data.py` Seed demo documents for "Heritage Preservation NGO"
