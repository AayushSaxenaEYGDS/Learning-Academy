
from __future__ import annotations

import json
import os
import urllib.request
import urllib.error
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

class PillarRequest(BaseModel):
    id: str
    title: str
    description: str
    smeName: str
    smeEmail: str
    smeRole: str
    topics: list = []
    sops: list = []
    materials: list = []


class TopicRequest(BaseModel):
    id: str
    title: str
    pillarId: str
    description: str = ""
    content: str = ""

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

CONTENT_FILE = os.path.join(
    os.path.dirname(__file__),
    "content.json"
)

def load_content():
    if not os.path.exists(CONTENT_FILE):
        return {
            "pillars": [],
            "topics": []
        }

    with open(CONTENT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_content(data):
    with open(CONTENT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


@app.get("/")
def root():
    return {"status": "running"}

@app.get("/health")
def health():
    return { "status": "healthy" }

@app.get("/api/content")
def content():
    return load_content()

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

###### Add Pillar Endpoint
@app.post("/api/add-pillar")
def add_pillar(req: PillarRequest):

    data = load_content()

    for pillar in data["pillars"]:
        if pillar["id"] == req.id:
            raise HTTPException(
                status_code=400,
                detail="Pillar already exists"
            )

    data["pillars"].append(req.dict())

    save_content(data)

    return {
        "success": True
    }

###### Add Topic Endpoint
@app.post("/api/add-topic")
def add_topic(req: TopicRequest):

    data = load_content()

    topic = req.dict()

    data["topics"].append(topic)

    for pillar in data["pillars"]:

        if pillar["id"] == req.pillarId:

            pillar.setdefault("topics", [])

            pillar["topics"].append({
                "id": req.id,
                "title": req.title,
                "description": req.description,
                "content": req.content
            })

            break

    save_content(data)

    return {
        "success": True
    }


##### Delete Pillar API
@app.delete("/api/delete-pillar/{pillar_id}")
def delete_pillar(pillar_id: str):

    data = load_content()

    pillar_exists = False

    updated_pillars = []

    for pillar in data["pillars"]:
        if pillar["id"] == pillar_id:
            pillar_exists = True
        else:
            updated_pillars.append(pillar)

    if not pillar_exists:
        raise HTTPException(
            status_code=404,
            detail="Pillar not found"
        )

    # remove pillar

    data["pillars"] = updated_pillars

    # remove all topics belonging to pillar

    data["topics"] = [
        topic
        for topic in data["topics"]
        if topic.get("pillarId") != pillar_id
    ]

    save_content(data)

    return {
        "success": True,
        "message": "Pillar deleted"
    }


#### Delete Topic API
@app.delete("/api/delete-topic/{topic_id}")
def delete_topic(topic_id: str):

    data = load_content()

    topic_found = False
    pillar_id = None

    remaining_topics = []

    for topic in data["topics"]:

        if topic["id"] == topic_id:

            topic_found = True
            pillar_id = topic["pillarId"]

        else:
            remaining_topics.append(topic)

    if not topic_found:

        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    data["topics"] = remaining_topics

    # remove topic from pillar object

    for pillar in data["pillars"]:

        if pillar["id"] == pillar_id:

            pillar["topics"] = [

                t for t in pillar.get("topics", [])

                if t["id"] != topic_id
            ]

            break

    save_content(data)

    return {
        "success": True,
        "message": "Topic deleted"
    }