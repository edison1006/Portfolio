from fastapi import APIRouter
from ..models.schemas import GeneratePostReq, GeneratePostResp
from ..services.llm import generate_social

router = APIRouter(tags=["generate_post"])

@router.post("/generate_post", response_model=GeneratePostResp)
def generate_post(payload: GeneratePostReq):
    content = generate_social(payload.topic, payload.platform, payload.tone, payload.length)
    return GeneratePostResp(content=content)
