import os
from openai import OpenAI

def _client():
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

def generate_answer(prompt: str) -> str:
    client = _client()
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are an NGO website assistant. Be factual and concise."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )
    return resp.choices[0].message.content

def generate_social(topic: str, platform: str, tone: str, length: str) -> str:
    prompt = f"""Write a {tone} {length} {platform} post about:
{topic}
Structure: 1) hook, 2) brief body, 3) call-to-action with URL placeholder.
Audience: local community and volunteers.
"""
    return generate_answer(prompt)

def summarize_meeting(text: str):
    prompt = f"""Summarize the meeting in 4-6 bullets and extract 3-5 action items.
Return as two sections: 'Summary:' then 'Actions:' list.
Notes:
{text}
"""
    result = generate_answer(prompt)
    # naive split
    if "Actions:" in result:
        parts = result.split("Actions:", 1)
        summary = parts[0].strip()
        actions_lines = [l.strip("-• ").strip() for l in parts[1].splitlines() if l.strip()]
        return summary, [a for a in actions_lines if a][:5]
    return result, []
