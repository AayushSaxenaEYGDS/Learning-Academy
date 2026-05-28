"""backend.py - RAG chatbot backend for Pfizer Learning Academy

Purpose:
- Provides a Python backend API for the chat feature in index.html/app.js.
- Uses the full app.js content as the source-of-truth context.
- Answers based on const values and learning academy data present in app.js.
- Maintains per-session chat memory.
- Uses a GitHub-PAT-driven placeholder LLM when `GITHUB_TOKEN` is configured.

Run:
    pip install fastapi uvicorn python-dotenv
    uvicorn backend:app --reload --host 127.0.0.1 --port 8000

Environment placeholders (.env recommended):
    GITHUB_TOKEN=ghp_... (optional, used for placeholder LLM verification)
    APP_JS_PATH=app.js

API:
    GET  /health
    GET  /context-summary
    POST /chat

Example POST /chat body:
    {
      "message": "Who is SME for ETL?",
      "session_id": "browser-user-1"
    }
"""

from __future__ import annotations

import os
import re
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from fastapi import Request

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# Using GitHub PAT based placeholder LLM instead of Bedrock/LangChain.


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pla-chat-backend")

APP_JS_PATH = Path(os.getenv("APP_JS_PATH", "app.js"))
MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "12"))

# Alternative LLM credentials (placeholder). Use GITHUB_TOKEN for now if available.
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# Persistence for pillars/topics
CONTENT_PATH = Path(__file__).parent / "content.json"


def _ensure_storage() -> None:
    if not CONTENT_PATH.exists():
        CONTENT_PATH.write_text(json.dumps({"pillars": [], "topics": []}, indent=2), encoding="utf-8")


def load_content() -> dict:
    _ensure_storage()
    try:
        with CONTENT_PATH.open("r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return {"pillars": [], "topics": []}


def save_content(data: dict) -> None:
    tmp = CONTENT_PATH.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.flush()
        os.fsync(fh.fileno())
    tmp.replace(CONTENT_PATH)


def make_id(title: str) -> str:
    return title.strip().lower().replace(" ", "-").replace("/", "-").replace("\\", "-")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message from chat UI")
    session_id: str = Field(default="default", description="Unique browser/user/session id")
    mode: Optional[str] = Field(default="chat", description="Mode: 'chat' or 'assessment'")


class ChatResponse(BaseModel):
    response: str
    session_id: str
    sources_used: List[str] = []


class ResetRequest(BaseModel):
    session_id: str = "default"


app = FastAPI(
    title="Pfizer Learning Academy Chat Backend",
    description="RAG backend over app.js const values with GitHub-PAT placeholder LLM and session memory.",
    version="1.0.0",
)

# Open CORS for local frontend development. Restrict origins before production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory chat history. For production, replace with Redis/DynamoDB/Postgres.
CHAT_MEMORY: Dict[str, List[Dict[str, str]]] = {}

# Global RAG objects initialized on startup.
APP_JS_TEXT = ""
VECTOR_STORE = None
LLM = None
STRUCTURED_CONTEXT: Dict[str, Any] = {}
GITHUB_USER: Optional[str] = None
# In-memory storage for generated assessments per session
ASSESSMENTS: Dict[str, Dict[str, Any]] = {}


class SimpleGitHubLLM:
    """Placeholder LLM that uses a GitHub PAT for minimal verification.

    Behavior:
    - If messages include `mode: 'assessment'`, generate a small templated
      multiple-choice assessment (5 questions) derived from the user's prompt.
    - Otherwise behave as a conversational assistant and echo/answer based on
      the last user message.
    """
    def __init__(self, token: str):
        self.token = token

    def invoke(self, messages: List[Any]) -> Any:
        # messages expected as list of dicts with keys: role, content, optional mode
        mode = 'chat'
        last_user = None
        for m in reversed(messages):
            if isinstance(m, dict) and m.get('mode'):
                mode = m.get('mode')
            if isinstance(m, dict) and m.get('role') == 'user' and m.get('content'):
                last_user = m.get('content')
                break

        if mode == 'assessment':
            topic = (last_user or 'General Topic')[:120]
            questions = []
            import random
            for i in range(1, 11):
                correct = f"Correct statement about {topic} (Answer {i})"
                wrong1 = f"Incorrect option A for {topic} ({i})"
                wrong2 = f"Incorrect option B for {topic} ({i})"
                wrong3 = f"Incorrect option C for {topic} ({i})"
                options = [correct, wrong1, wrong2, wrong3]
                random.shuffle(options)
                questions.append({
                    'question': f'Question {i}: Choose the most accurate statement about {topic}.',
                    'options': options,
                    'correct': options.index(correct)
                })

            payload = {
                'type': 'assessment',
                'topic': topic,
                'questions': questions
            }
            from types import SimpleNamespace
            return SimpleNamespace(content=json.dumps(payload))

        # Chat mode: simple friendly echo with guidance
        resp = (
            "[GitHub-PAT-LLM placeholder assistant]\n\n"
            "I am responding using the configured GitHub PAT as a placeholder LLM. "
        )
        if last_user:
            resp += f"You asked: {last_user}\n\nHere's a concise answer based on available app.js data (if present)."
        else:
            resp += "No user message found."

        from types import SimpleNamespace
        return SimpleNamespace(content=resp)


class OpenAIWithTokenLLM:
    """Simple OpenAI Chat Completions client using the provided token.

    Expects `messages` as a list of dicts: {role, content}.
    """
    def __init__(self, token: str, model: str = "gpt-3.5-turbo"):
        self.token = token
        self.model = model

    def invoke(self, messages: List[Dict[str, Any]]) -> Any:
        import urllib.request as _ur
        import urllib.error as _ue

        url = "https://api.openai.com/v1/chat/completions"
        payload = {"model": self.model, "messages": messages, "temperature": 0.2, "max_tokens": 800}
        data = json.dumps(payload).encode("utf-8")
        req = _ur.Request(url, data=data, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("User-Agent", "pla-backend")
        try:
            with _ur.urlopen(req, timeout=20) as resp:
                resp_data = json.load(resp)
                # navigate to choices[0].message.content
                choices = resp_data.get("choices") or []
                if choices:
                    msg = choices[0].get("message") or {}
                    content = msg.get("content") or msg.get("text") or ""
                else:
                    content = resp_data.get("text") or json.dumps(resp_data)
                from types import SimpleNamespace
                return SimpleNamespace(content=content)
        except _ue.HTTPError as exc:
            body = exc.read().decode("utf-8") if hasattr(exc, 'read') else ''
            raise RuntimeError(f"OpenAI API HTTPError: {exc.code} {exc.reason} {body}")
        except Exception as exc:
            raise


def read_app_js() -> str:
    """Read the current app.js file as the complete knowledge source."""
    if not APP_JS_PATH.exists():
        raise FileNotFoundError(f"Could not find app.js at: {APP_JS_PATH.resolve()}")
    return APP_JS_PATH.read_text(encoding="utf-8", errors="ignore")


def extract_js_array_block(js_text: str, const_name: str) -> Optional[str]:
    """Extract a top-level JS const array block as text without requiring JS execution."""
    pattern = re.compile(rf"const\s+{re.escape(const_name)}\s*=\s*\[", re.MULTILINE)
    match = pattern.search(js_text)
    if not match:
        return None
    start = match.end() - 1
    depth = 0
    for i in range(start, len(js_text)):
        char = js_text[i]
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return js_text[start : i + 1]
    return None


def extract_js_object_block(js_text: str, const_name: str) -> Optional[str]:
    """Extract a top-level JS const object block as text without requiring JS execution."""
    pattern = re.compile(rf"const\s+{re.escape(const_name)}\s*=\s*{{", re.MULTILINE)
    match = pattern.search(js_text)
    if not match:
        return None
    start = match.end() - 1
    depth = 0
    in_string: Optional[str] = None
    escaped = False
    for i in range(start, len(js_text)):
        char = js_text[i]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == in_string:
                in_string = None
            continue
        if char in ["'", '"', "`"]:
            in_string = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return js_text[start : i + 1]
    return None


def build_structured_context(js_text: str) -> Dict[str, Any]:
    """Create a lightweight text summary of the app.js constants and chat behavior."""
    pillars_block = extract_js_array_block(js_text, "pillars") or ""
    topics_block = extract_js_array_block(js_text, "topics") or ""
    chat_responses_block = extract_js_object_block(js_text, "chatResponses") or ""

    return {
        "source_file": str(APP_JS_PATH),
        "pillars_const": pillars_block,
        "topics_const": topics_block,
        "chatResponses_const": chat_responses_block,
        "important_functions": [
            "sendChatMessage currently uses getStaticResponse(message).",
            "getStaticResponse loops through chatResponses keywords and returns default if no keyword matches.",
            "Chat UI elements are chatInterface, chatMessages, chatInputField.",
            "No frontend changes are included in this backend-only file.",
        ],
    }


def make_documents(js_text: str) -> List[Any]:
    """Split app.js into chunks and add special const blocks as high-priority docs."""
    docs = []
    structured = build_structured_context(js_text)

    priority_sections = {
        "pillars_const": structured["pillars_const"],
        "topics_const": structured["topics_const"],
        "chatResponses_const": structured["chatResponses_const"],
        "full_app_js": js_text,
    }

    if Document is None:
        return []

    for name, content in priority_sections.items():
        if content:
            docs.append(Document(page_content=content, metadata={"source": "app.js", "section": name}))

    if RecursiveCharacterTextSplitter is not None:
        splitter = RecursiveCharacterTextSplitter(chunk_size=1600, chunk_overlap=250)
        docs = splitter.split_documents(docs)

    return docs


def initialize_llm_and_rag() -> None:
    """Initialize LLM placeholder and load app.js context."""
    global APP_JS_TEXT, VECTOR_STORE, LLM, STRUCTURED_CONTEXT, GITHUB_USER

    APP_JS_TEXT = read_app_js()
    STRUCTURED_CONTEXT = build_structured_context(APP_JS_TEXT)
    VECTOR_STORE = None

    if GITHUB_TOKEN:
        # Prefer using OpenAI-compatible API with the provided token. If that
        # fails, fall back to the SimpleGitHubLLM placeholder.
        OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        try:
            LLM = OpenAIWithTokenLLM(GITHUB_TOKEN, model=OPENAI_MODEL)
            # quick test invocation to ensure token works
            test_msg = [{"role": "system", "content": "Say hi"}, {"role": "user", "content": "Hello"}]
            _ = LLM.invoke(test_msg)
            logger.info("Configured OpenAI-compatible LLM with provided token and model=%s", OPENAI_MODEL)
        except Exception as exc:
            logger.warning("OpenAI call with provided token failed: %s — falling back to placeholder LLM.", exc)
            LLM = SimpleGitHubLLM(GITHUB_TOKEN)
        # Try to verify token by fetching the authenticated user
        try:
            import urllib.request as _ur
            req = _ur.Request("https://api.github.com/user", headers={"Authorization": f"token {GITHUB_TOKEN}", "User-Agent": "pla-backend"})
            with _ur.urlopen(req, timeout=5) as resp:
                data = json.load(resp)
                GITHUB_USER = data.get("login")
                logger.info("Verified GitHub token for user: %s", GITHUB_USER)
        except Exception as exc:
            logger.warning("Could not verify GitHub token: %s", exc)
    else:
        LLM = None
        logger.info("No GITHUB_TOKEN configured; LLM disabled.")


@app.on_event("startup")
def startup_event() -> None:
    try:
        initialize_llm_and_rag()
    except Exception as exc:
        logger.exception("Startup initialization failed: %s", exc)


def get_session_history(session_id: str) -> List[Dict[str, str]]:
    return CHAT_MEMORY.setdefault(session_id, [])


def append_history(session_id: str, role: str, content: str) -> None:
    history = get_session_history(session_id)
    history.append({"role": role, "content": content})
    if len(history) > MAX_HISTORY_MESSAGES:
        CHAT_MEMORY[session_id] = history[-MAX_HISTORY_MESSAGES:]


def retrieve_context(question: str) -> List[str]:
    """Retrieve RAG chunks. If vector store unavailable, return concise const blocks and full JS."""
    if VECTOR_STORE is not None:
        try:
            docs = VECTOR_STORE.similarity_search(question, k=5)
            return [f"[section={d.metadata.get('section')}]\n{d.page_content}" for d in docs]
        except Exception as exc:
            logger.warning("Similarity search failed, using fallback context: %s", exc)

    fallback_parts = []
    for key in ["pillars_const", "topics_const", "chatResponses_const"]:
        value = STRUCTURED_CONTEXT.get(key)
        if value:
            fallback_parts.append(f"[{key}]\n{value}")
    # User explicitly asked to provide entire JS to the LLM. Keep it as fallback context.
    if APP_JS_TEXT:
        fallback_parts.append(f"[full_app_js]\n{APP_JS_TEXT}")
    return fallback_parts


def build_messages(session_id: str, question: str, context_chunks: List[str], mode: str = "chat") -> List[Dict[str, Any]]:
    """Build a simple list-of-dicts message payload for the LLM.

    Returns messages with roles: system, user, assistant and an optional mode key.
    """
    history = get_session_history(session_id)
    context_text = "\n\n---\n\n".join(context_chunks)

    system_prompt = (
        "You are Pfizer Learning Assistant for the Pfizer Learning Academy web app.\n"
        "Answer ONLY using the provided app.js context, especially const values such as pillars, topics, sops, materials, chatResponses, and relevant functions.\n"
        "If the answer is not present in app.js, say that it is not available in the current Learning Academy data.\n"
    )

    messages: List[Dict[str, Any]] = [{"role": "system", "content": system_prompt, "context": context_text}]
    for item in history[-MAX_HISTORY_MESSAGES:]:
        messages.append({"role": item["role"], "content": item["content"]})
    messages.append({"role": "user", "content": question, "mode": mode})
    return messages


def simple_fallback_answer(question: str) -> str:
    """Rule-based response if no LLM is configured."""
    q = question.lower()
    ctx = STRUCTURED_CONTEXT
    if "etl" in q:
        return "ETL is one of the Business Pillars. Its SME is Arjun Agarwal, arjun.agarwal@pfizer.com, Senior Risk Consulting. Topics include ETL Fundamentals, ETL SOPs, ETL Validation, and ETL Materials."
    if "ai" in q or "ml" in q or "agent" in q:
        return "AI/ML & Agents is one of the Business Pillars. Its SME is Avinash Kumar, avinash.kumar@pfizer.com, Senior Risk Consulting. Topics include Intro to AI, AI SOPs, AI Validation Checklist, and AI Materials."
    if "validation" in q:
        return "Validation is one of the Business Pillars. Its SME is Aayush Saxena, aayush.saxena@pfizer.com, Senior Risk Consulting. Topics include Validation Basics, Validation SOPs, Validation Checklist, and Validation Guide."
    if "btq" in q:
        return "BTQ is one of the Business Pillars. Its SME is Aniruddha Desai, aniruddha.desai@pfizer.com, Operations & Technology Lead. Topics include BTQ Overview, BTQ SOPs, Quality Assurance, and Technology Integration."
    if "pillar" in q or "pillars" in q:
        return "The current app.js defines 4 Business Pillars: AI/ML & Agents, ETL, Validation, and BTQ."
    return "I can help with the Learning Academy data currently defined in app.js: AI/ML & Agents, ETL, Validation, BTQ, their SMEs, topics, SOPs, and materials. Configure a GITHUB_TOKEN to enable LLM responses."


@app.get("/api/content")
def api_get_content() -> Dict[str, Any]:
    """Return persisted pillars/topics from backend/content.json"""
    data = load_content()
    return data


class AssessmentGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    session_id: Optional[str] = Field(default="default")


class AssessmentScoreRequest(BaseModel):
    session_id: str = Field(default="default")
    answers: List[int] = Field(..., description="List of selected option indices for each question")


def _extract_json(text: str) -> Any:
    # Try direct JSON parse first
    try:
        return json.loads(text)
    except Exception:
        pass
    # Fallback: find first {...} block
    import re
    m = re.search(r"\{[\s\S]*\}", text)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            pass
    raise ValueError("Could not parse JSON from LLM response")


@app.post("/api/assess/generate")
def api_generate_assessment(req: AssessmentGenerateRequest) -> Dict[str, Any]:
    topic = req.topic.strip()
    session_id = (req.session_id or "default").strip() or "default"

    # Build a clear instruction for the LLM to emit strict JSON
    system = {
        "role": "system",
        "content": (
            "You are an exam generator. Output EXACTLY valid JSON with the structure: {\"topic\": str, \"questions\": [ {\"question\": str, \"options\": [str,...], \"correct\": index}, ... ] }"
        ),
    }
    user = {"role": "user", "content": f"Generate 10 multiple-choice questions (4 options each) about: {topic}."}

    try:
        if LLM is None:
            raise RuntimeError("No LLM configured")
        resp = LLM.invoke([system, user])
        raw = getattr(resp, "content", str(resp))
        payload = _extract_json(raw)
    except Exception as exc:
        logger.warning("LLM generate failed: %s; using fallback generator", exc)
        # Fallback to placeholder generator
        fallback = SimpleGitHubLLM(GITHUB_TOKEN or "")
        resp = fallback.invoke([{"role": "user", "content": topic, "mode": "assessment"}])
        raw = getattr(resp, "content", str(resp))
        payload = _extract_json(raw)

    # Normalize payload and store correct answers server-side
    questions = payload.get("questions") if isinstance(payload, dict) else None
    if not questions or not isinstance(questions, list):
        raise HTTPException(status_code=502, detail="Invalid assessment payload from LLM")

    # store full questions including 'correct' in ASSESSMENTS
    ASSESSMENTS[session_id] = {"topic": payload.get("topic", topic), "questions": questions}

    # Return questions without correct answers to the client
    client_questions = []
    for q in questions:
        client_questions.append({"question": q.get("question"), "options": q.get("options")})

    return {"topic": payload.get("topic", topic), "questions": client_questions, "session_id": session_id}


@app.post("/api/assess/score")
def api_score_assessment(req: AssessmentScoreRequest) -> Dict[str, Any]:
    session_id = (req.session_id or "default").strip() or "default"
    stored = ASSESSMENTS.get(session_id)
    if not stored:
        raise HTTPException(status_code=404, detail="No assessment found for session_id")

    questions = stored.get("questions", [])
    if len(req.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Number of answers does not match number of questions")

    correct_indices = [int(q.get("correct", -1)) for q in questions]
    score = 0
    per_question = []
    for provided, correct in zip(req.answers, correct_indices):
        ok = (int(provided) == int(correct))
        per_question.append(bool(ok))
        if ok:
            score += 1

    return {"score": score, "total": len(questions), "per_question": per_question, "correct_answers": correct_indices}


@app.post("/api/add-pillar")
async def api_add_pillar(req: Request) -> Any:
    try:
        payload = await req.json()
    except Exception as exc:
        logger.exception("Failed to parse JSON for add-pillar: %s", exc)
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    if not payload:
        raise HTTPException(status_code=400, detail="Missing JSON body")

    logger.info("API add-pillar payload: %s", payload)

    title = payload.get("title")
    smeName = payload.get("smeName")
    smeEmail = payload.get("smeEmail")
    smeRole = payload.get("smeRole")

    if not title or not smeName or not smeEmail or not smeRole:
        raise HTTPException(status_code=400, detail="Required fields: title, smeName, smeEmail, smeRole")

    try:
        data = load_content()
        pid = payload.get("id") or make_id(title)

        for p in data.get("pillars", []):
            if p.get("id") == pid or p.get("title", "").strip().lower() == title.strip().lower():
                raise HTTPException(status_code=409, detail="Pillar already exists")

        new_pillar = {
            "id": pid,
            "title": title,
            "description": payload.get("description", f"{title} enterprise learning and capability pillar."),
            "smeName": smeName,
            "smeEmail": smeEmail,
            "smeRole": smeRole,
            "topics": payload.get("topics", []),
            "sops": payload.get("sops", []),
            "materials": payload.get("materials", []),
        }

        data.setdefault("pillars", []).append(new_pillar)
        save_content(data)
        logger.info("Pillar saved: %s", new_pillar.get("id"))
        return {"status": "ok", "pillar": new_pillar}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to save pillar: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save pillar")


@app.post("/api/add-topic")
async def api_add_topic(req: Request) -> Any:
    try:
        payload = await req.json()
    except Exception as exc:
        logger.exception("Failed to parse JSON for add-topic: %s", exc)
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    if not payload:
        raise HTTPException(status_code=400, detail="Missing JSON body")

    logger.info("API add-topic payload: %s", payload)

    title = payload.get("title")
    pillarId = payload.get("pillarId")
    description = payload.get("description", "Detailed SME-driven learning content")
    content = payload.get("content", "")

    if not title or not pillarId:
        raise HTTPException(status_code=400, detail="Required fields: title, pillarId")

    try:
        data = load_content()
        tid = payload.get("id") or make_id(title)

        for t in data.get("topics", []):
            if t.get("id") == tid or t.get("title", "").strip().lower() == title.strip().lower():
                raise HTTPException(status_code=409, detail="Topic already exists")

        new_topic = {
            "id": tid,
            "title": title,
            "pillarId": pillarId,
            "description": description,
            "content": content,
        }

        data.setdefault("topics", []).append(new_topic)

        for p in data.get("pillars", []):
            if p.get("id") == pillarId:
                p.setdefault("topics", []).append(new_topic)
                break

        save_content(data)
        logger.info("Topic saved: %s", new_topic.get("id"))
        return {"status": "ok", "topic": new_topic}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to save topic: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save topic")


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "app_js_loaded": bool(APP_JS_TEXT),
        "app_js_path": str(APP_JS_PATH),
        "llm_configured": LLM is not None,
        "rag_vector_store_ready": VECTOR_STORE is not None,
        "github_token_present": bool(GITHUB_TOKEN),
        "github_user": GITHUB_USER,
    }


@app.get("/context-summary")
def context_summary() -> Dict[str, Any]:
    if not APP_JS_TEXT:
        raise HTTPException(status_code=500, detail="app.js not loaded")
    return {
        "source_file": STRUCTURED_CONTEXT.get("source_file"),
        "has_pillars_const": bool(STRUCTURED_CONTEXT.get("pillars_const")),
        "has_topics_const": bool(STRUCTURED_CONTEXT.get("topics_const")),
        "has_chatResponses_const": bool(STRUCTURED_CONTEXT.get("chatResponses_const")),
        "app_js_characters": len(APP_JS_TEXT),
        "important_functions": STRUCTURED_CONTEXT.get("important_functions", []),
    }


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    message = req.message.strip()
    session_id = req.session_id.strip() or "default"
    mode = (req.mode or "chat").strip().lower()

    if not APP_JS_TEXT:
        raise HTTPException(status_code=500, detail="app.js was not loaded. Check APP_JS_PATH.")

    append_history(session_id, "user", message)
    context_chunks = retrieve_context(message)

    if LLM is None:
        answer = simple_fallback_answer(message)
        append_history(session_id, "assistant", answer)
        return ChatResponse(response=answer, session_id=session_id, sources_used=["app.js:fallback"])

    try:
        messages = build_messages(session_id, message, context_chunks, mode=mode)
        result = LLM.invoke(messages)
        answer = getattr(result, "content", str(result)).strip()
        # If assessment mode, result.content may be JSON
        if mode == 'assessment':
            # return JSON as string so frontend can parse it if needed
            pass
    except Exception as exc:
        logger.exception("LLM invocation failed: %s", exc)
        answer = f"LLM error: {simple_fallback_answer(message)}"

    append_history(session_id, "assistant", answer)
    sources = ["app.js"]
    if VECTOR_STORE is not None:
        sources.append("app.js:RAG-vector-chunks")
    else:
        sources.append("app.js:full-context-fallback")
    return ChatResponse(response=answer, session_id=session_id, sources_used=sources)


@app.post("/reset")
def reset_memory(req: ResetRequest) -> Dict[str, str]:
    CHAT_MEMORY.pop(req.session_id, None)
    return {"status": "reset", "session_id": req.session_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
