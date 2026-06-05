
from __future__ import annotations

import json
import os
import urllib.request
import urllib.error
import base64
import logging
from datetime import datetime
import requests
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
GITHUB_OWNER = os.getenv("GITHUB_OWNER", "")
GITHUB_REPO = os.getenv("GITHUB_REPO", "")
GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")

# Configure a module-level logger for reporting sync status
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4.1-mini")

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
    # master topic repository: store only a lightweight reference to avoid
    # duplicating large topic content. Full topic details remain under the
    # pillar's `topics` array.
    topic_ref = {
        "id": topic["id"],
        "title": topic["title"],
        "pillarId": topic["pillarId"]
    }

    # Avoid duplicate refs
    if not any(t.get("id") == topic_ref["id"] for t in data.get("topics", [])):
        data.setdefault("topics", []).append(topic_ref)
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

BACKEND_CONTENT_FILE = os.path.join(os.path.dirname(__file__), "content.json")
ROOT_CONTENT_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "content.json"))
# Use a single root-level `content.json` to avoid duplicate files between
# the project root and the `backend/` directory. This ensures all reads/writes
# operate on the same file and the service will load the authoritative data
# from the project root on restart/deploy.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONTENT_FILE = os.path.join(PROJECT_ROOT, "content.json")

# If a legacy backend/content.json exists but the root content.json does not,
# migrate the legacy file so the service reads/writes the single root file.
def ensure_content_file_migration():
    try:
        if not os.path.exists(CONTENT_FILE) and os.path.exists(BACKEND_CONTENT_FILE):
            with open(BACKEND_CONTENT_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            # Write migrated content to the root-level content.json
            with open(CONTENT_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            logger.info(f"Migrated content from {BACKEND_CONTENT_FILE} to {CONTENT_FILE}")
    except Exception as e:
        logger.error(f"Failed migrating legacy content.json: {e}")

ensure_content_file_migration()

# Normalize topics storage so that full topic details live only under their
# respective pillar objects. The top-level `topics` array will be kept as a
# lightweight list of references (id, title, pillarId) to avoid duplicating
# large content blobs and keep the file size smaller.
def normalize_topics_storage():
    try:
        data = load_content()

        pillars = data.get("pillars", [])

        # If there are no pillars, nothing to normalize.
        if not pillars:
            return

        # Build reference list from pillar-contained topics
        topics_refs = []
        seen = set()
        for p in pillars:
            for t in p.get("topics", []):
                tid = t.get("id")
                if not tid:
                    continue
                if tid in seen:
                    continue
                seen.add(tid)
                topics_refs.append({
                    "id": t.get("id"),
                    "title": t.get("title"),
                    "pillarId": t.get("pillarId")
                })

        # Decide if an update is necessary: length or ids differ, or top-level
        # topics currently store full content fields.
        existing_topics = data.get("topics", [])
        need_update = False

        if len(existing_topics) != len(topics_refs):
            need_update = True
        else:
            existing_ids = [t.get("id") for t in existing_topics]
            ref_ids = [t.get("id") for t in topics_refs]
            if existing_ids != ref_ids:
                need_update = True
            else:
                # If any existing topic appears to include the full content,
                # we'll normalize to references.
                for t in existing_topics:
                    if "content" in t or "description" in t:
                        need_update = True
                        break

        if need_update:
            data["topics"] = topics_refs
            # Persist the normalized file locally. We do NOT call the GitHub
            # sync here to avoid creating commits during startup/migration.
            save_content(data)
            logger.info("Normalized topics: top-level topics converted to references from pillars")

    except Exception as e:
        logger.error(f"Failed to normalize topics storage: {e}")


normalize_topics_storage()

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


# GitHub synchronization helper
def sync_content_to_github(data):
    """
    Sync the local `content.json` data to the configured GitHub repository

    Steps:
    - Read the current file SHA from the GitHub Contents API (if it exists)
    - Base64-encode the updated JSON content
    - PUT the new content to `/content.json` with a timestamped commit message
    - Log success or errors. This function raises no exceptions to callers
      so that local save remains authoritative even if sync fails.
    """

    # Ensure required env vars are present
    if not (GITHUB_TOKEN and GITHUB_OWNER and GITHUB_REPO):
        logger.error("GitHub sync skipped: missing GITHUB_TOKEN/OWNER/REPO")
        return

    api_url = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/content.json"
    params = {"ref": GITHUB_BRANCH} if GITHUB_BRANCH else {}

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
    }

    # Prepare the file content
    content_str = json.dumps(data, indent=2)
    content_b64 = base64.b64encode(content_str.encode("utf-8")).decode("utf-8")

    try:
        # Try to get existing file to obtain the current SHA
        resp = requests.get(api_url, headers=headers, params=params, timeout=15)

        if resp.status_code == 200:
            resp_json = resp.json()
            sha = resp_json.get("sha")
        elif resp.status_code == 404:
            # File does not exist yet in repo; will create it (no sha)
            sha = None
        else:
            # Unexpected response; log and abort sync
            logger.error(f"GitHub sync failed fetching file: {resp.status_code} {resp.text}")
            return

        commit_message = f"Update content.json via backend sync at {datetime.utcnow().isoformat()}Z"

        payload = {
            "message": commit_message,
            "content": content_b64,
            "branch": GITHUB_BRANCH
        }

        if sha:
            payload["sha"] = sha

        put_resp = requests.put(api_url, headers=headers, json=payload, timeout=15)

        if put_resp.status_code in (200, 201):
            logger.info("Content synced to GitHub successfully")
        else:
            logger.error(f"GitHub sync failed: {put_resp.status_code} {put_resp.text}")

    except Exception as e:
        # Do not raise - local save should be considered authoritative.
        logger.error(f"GitHub sync failed: {str(e)}")


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

    # Attempt to sync the updated content to GitHub. Failure should not
    # prevent a successful API response — local save is authoritative.
    try:
        sync_content_to_github(data)
    except Exception as e:
        logger.error(f"GitHub sync failed after add_pillar: {e}")

    return {
        "success": True
    }

###### Add Topic Endpoint
@app.post("/api/add-topic")
def add_topic(req: TopicRequest):

    data = load_content()

    topic = {
        "id": req.id,
        "title": req.title,
        "pillarId": req.pillarId,
        "description": req.description,
        "content": req.content
    }
    print("TOPIC RECEIVED", req.dict())

    # master topic repository
    # data["topics"].append(topic)

    # pillar mapping
    pillar = next(
        (
            p for p in data["pillars"]
            if p["id"] == req.pillarId
        ),
        None
    )

    if not pillar:
        raise HTTPException(
            status_code=404,
            detail="Pillar not found"
        )
    pillar["topics"].append(topic)

    # Keep top-level `topics` as lightweight references (id, title, pillarId)
    topic_ref = {"id": topic["id"], "title": topic["title"], "pillarId": topic["pillarId"]}
    if not any(t.get("id") == topic_ref["id"] for t in data.get("topics", [])):
        data.setdefault("topics", []).append(topic_ref)

    save_content(data)
    try:
        sync_content_to_github(data)
    except Exception as e:
        logger.error(f"GitHub sync failed after add_topic: {e}")
    print("AFTER SAVE", data)
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

    save_content(data)

    try:
        sync_content_to_github(data)
    except Exception as e:
        logger.error(f"GitHub sync failed after delete_pillar: {e}")

    return {
        "success": True,
        "message": "Pillar deleted"
    }


#### Delete Topic API
@app.delete("/api/delete-topic/{topic_id}")
def delete_topic(topic_id: str):

    data = load_content()

    topic_found = False

    for pillar in data["pillars"]:

        pillar["topics"] = [
            t for t in pillar.get("topics", [])
            if not (
                t.get("id") == topic_id
                and (topic_found := True)
            )
        ]

    if not topic_found:
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    save_content(data)

    try:
        sync_content_to_github(data)
    except Exception as e:
        logger.error(
            f"GitHub sync failed after delete_topic: {e}"
        )

    return {
        "success": True,
        "message": "Topic deleted"
    }