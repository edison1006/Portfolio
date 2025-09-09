from fastapi import APIRouter, HTTPException, Query
from typing import List
from ..models.schemas import FAQ, FAQCreate, FAQApproveReq
from ..db import get_conn

router = APIRouter(tags=["faqs"], prefix="/faqs")

@router.get("", response_model=List[FAQ])
def list_faqs(approved: bool | None = Query(None)):
    conn = get_conn()
    cur = conn.cursor()
    if approved is None:
        cur.execute("SELECT id, question, answer, approved FROM faqs ORDER BY created_at DESC")
    else:
        cur.execute("SELECT id, question, answer, approved FROM faqs WHERE approved=? ORDER BY created_at DESC", (1 if approved else 0,))
    rows = cur.fetchall()
    conn.close()
    return [FAQ(id=r["id"], question=r["question"], answer=r["answer"], approved=bool(r["approved"])) for r in rows]

@router.post("/propose", response_model=FAQ)
def propose_faq(payload: FAQCreate):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO faqs (question, answer, approved) VALUES (?, ?, 0)", (payload.question, payload.answer))
    conn.commit()
    faq_id = cur.lastrowid
    conn.close()
    return FAQ(id=faq_id, question=payload.question, answer=payload.answer, approved=False)

@router.post("/approve", response_model=FAQ)
def approve_faq(payload: FAQApproveReq):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE faqs SET approved=? WHERE id=?", (1 if payload.approved else 0, payload.id))
    conn.commit()
    cur.execute("SELECT id, question, answer, approved FROM faqs WHERE id=?", (payload.id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return FAQ(id=row["id"], question=row["question"], answer=row["answer"], approved=bool(row["approved"]))
