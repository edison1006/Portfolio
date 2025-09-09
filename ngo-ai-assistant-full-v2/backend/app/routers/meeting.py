from fastapi import APIRouter
from ..models.schemas import MeetingReq, MeetingResp
from ..services.llm import summarize_meeting

router = APIRouter(tags=["meeting"])

@router.post("/meeting/summarize", response_model=MeetingResp)
def summarize(payload: MeetingReq):
    summary, actions = summarize_meeting(payload.text)
    return MeetingResp(summary=summary, actions=actions)
