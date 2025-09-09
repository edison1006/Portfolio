from pydantic import BaseModel, Field
from typing import List, Optional

class IngestReq(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None

class AskReq(BaseModel):
    query: str

class Cite(BaseModel):
    snippet: str
    source: str

class AskResp(BaseModel):
    answer: str
    citations: List[Cite] = Field(default_factory=list)

class GeneratePostReq(BaseModel):
    topic: str
    platform: str = "LinkedIn"
    tone: str = "professional"
    length: str = "short"

class GeneratePostResp(BaseModel):
    content: str

class MeetingReq(BaseModel):
    text: str

class MeetingResp(BaseModel):
    summary: str
    actions: List[str]

class FAQ(BaseModel):
    id: int
    question: str
    answer: str
    approved: bool

class FAQCreate(BaseModel):
    question: str
    answer: str

class FAQApproveReq(BaseModel):
    id: int
    approved: bool = True
