
from __future__ import annotations

import json
import os
import urllib.request
import urllib.error
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sympy import python

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")

class ChatRequest(BaseModel):
    message: str

class AssessmentRequest(BaseModel):
    topic: str

def github_chat(messages):

    if not GITHUB_TOKEN:
        raise HTTPException(status_code=500, detail="Missing GITHUB_TOKEN")

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1500
    }

    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        "https://models.github.ai/inference/chat/completions",
        data=data,
        method="POST"
    )

    req.add_header("Authorization", f"Bearer {GITHUB_TOKEN}")
    req.add_header("Content-Type", "application/json")

 
    try:

        with urllib.request.urlopen(req, timeout=60) as response:

            raw = response.read().decode("utf-8")

            print("RAW API RESPONSE:")
            print(raw)

            result = json.loads(raw)

            return result["choices"][0]["message"]["content"]

    except urllib.error.HTTPError as e:

        body = e.read().decode()

        print("HTTP ERROR:")
        print(body)

        raise HTTPException(status_code=500, detail=body)

    except Exception as e:

        print("GENERAL ERROR:")
        print(str(e))

        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    return {"status": "running"}

@app.get("/health")
def health():
    return { "status": "healthy" }

@app.get("/api/content") 
def content():
    return { "pillars": [], "topics": [] }

@app.post("/chat")
def chat(req: ChatRequest):

    response = github_chat([
        {
            "role": "system",
            "content": "You are a helpful AI learning assistant."
        },
        {
            "role": "user",
            "content": req.message
        }
    ])
    print("RAW LLM RESPONSE:", response)

    return {
        "success": True, 
        "message": response
    }

@app.post("/assessment/generate")
def assessment(req: AssessmentRequest):

    prompt = f'''
Generate exactly 10 MCQ questions on: {req.topic}

Return ONLY valid JSON in this format:

{{
  "questions": [
    {{
      "question": "...",
      "options": ["A","B","C","D"],
      "correct": 0
    }}
  ]
}}

No markdown.
'''

    response = github_chat([
        {
            "role": "system",
            "content": "Return strict JSON only."
        },
        {
            "role": "user",
            "content": prompt
        }
    ])

    cleaned = response.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1]
    if "```" in cleaned:
        cleaned = cleaned.split("```")[0]

    cleaned = cleaned.strip()

    data = json.loads(cleaned)

    return {
        "success": True,
        "questions": data["questions"]
    }
