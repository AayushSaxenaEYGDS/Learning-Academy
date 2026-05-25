"""
backend.py - RAG chatbot backend for Pfizer Learning Academy

Purpose:
- Provides a Python backend API for the existing chat feature in index.html/app.js.
- Does NOT require any frontend file changes yet.
- Uses the full app.js content as the source-of-truth context.
- Answers based on const values and learning academy data present in app.js.
- Maintains per-session chat memory.
- Uses AWS Bedrock via LangChain when configured.

Run:
    pip install fastapi uvicorn python-dotenv langchain langchain-aws langchain-community boto3 faiss-cpu
    uvicorn backend:app --reload --host 127.0.0.1 --port 8000

Environment placeholders (.env recommended):
    AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
    AWS_SESSION_TOKEN=OPTIONAL_IF_USING_TEMP_CREDS
    AWS_REGION=us-east-1
    BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
    BEDROCK_EMBED_MODEL_ID=amazon.titan-embed-text-v2:0
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

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# LangChain / AWS Bedrock imports are optional at import time so the server can
# still start and return helpful errors if dependencies/credentials are missing.
try:
    from langchain_aws import ChatBedrock, BedrockEmbeddings
    from langchain_community.vectorstores import FAISS
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_core.documents import Document
    from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
except Exception:  # pragma: no cover
    ChatBedrock = None
    BedrockEmbeddings = None
    FAISS = None
    RecursiveCharacterTextSplitter = None
    Document = None
    HumanMessage = None
    AIMessage = None
    SystemMessage = None


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pla-chat-backend")

APP_JS_PATH = Path(os.getenv("APP_JS_PATH", "app.js"))
AWS_REGION = os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
BEDROCK_EMBED_MODEL_ID = os.getenv("BEDROCK_EMBED_MODEL_ID", "amazon.titan-embed-text-v2:0")
MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "12"))


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message from chat UI")
    session_id: str = Field(default="default", description="Unique browser/user/session id")


class ChatResponse(BaseModel):
    response: str
    session_id: str
    sources_used: List[str] = []


class ResetRequest(BaseModel):
    session_id: str = "default"


app = FastAPI(
    title="Pfizer Learning Academy Chat Backend",
    description="RAG backend over app.js const values with Bedrock LLM and session memory.",
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
    """Initialize Bedrock chat model and vector search."""
    global APP_JS_TEXT, VECTOR_STORE, LLM, STRUCTURED_CONTEXT

    APP_JS_TEXT = read_app_js()
    STRUCTURED_CONTEXT = build_structured_context(APP_JS_TEXT)

    if ChatBedrock is None:
        logger.warning("LangChain Bedrock dependencies are not installed. Install langchain-aws etc.")
        return

    LLM = ChatBedrock(
        model_id=BEDROCK_MODEL_ID,
        region_name=AWS_REGION,
        model_kwargs={
            "temperature": 0.2,
            "max_tokens": 800,
        },
    )

    if BedrockEmbeddings is None or FAISS is None:
        logger.warning("Vector dependencies unavailable. RAG vector store not initialized.")
        return

    try:
        embeddings = BedrockEmbeddings(model_id=BEDROCK_EMBED_MODEL_ID, region_name=AWS_REGION)
        docs = make_documents(APP_JS_TEXT)
        VECTOR_STORE = FAISS.from_documents(docs, embeddings) if docs else None
        logger.info("RAG initialized with %s chunks from app.js", len(docs))
    except Exception as exc:
        # If embeddings are not available, the backend can still pass full app.js to the LLM.
        VECTOR_STORE = None
        logger.warning("Vector store initialization failed; falling back to full-context prompt. Error: %s", exc)


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


def build_messages(session_id: str, question: str, context_chunks: List[str]) -> List[Any]:
    history = get_session_history(session_id)
    context_text = "\n\n---\n\n".join(context_chunks)

    system_prompt = f"""
You are Pfizer Learning Assistant for the Pfizer Learning Academy web app.

SOURCE OF TRUTH:
- Answer ONLY using the provided app.js context, especially const values such as pillars, topics, sops, materials, chatResponses, and relevant functions.
- The user asked that the LLM receives the entire JS and responds based on const values. Treat app.js as authoritative.
- If the answer is not present in app.js, say that it is not available in the current Learning Academy data.
- Do not invent SMEs, emails, topics, SOPs, or materials.
- Keep answers concise, helpful, and suitable for the existing chat widget.
- If a user asks follow-up questions like "what about its SME?", use chat memory to resolve the previous topic/pillar.

APP.JS CONTEXT:
{context_text}
""".strip()

    messages: List[Any] = [SystemMessage(content=system_prompt)]
    for item in history[-MAX_HISTORY_MESSAGES:]:
        if item["role"] == "user":
            messages.append(HumanMessage(content=item["content"]))
        elif item["role"] == "assistant":
            messages.append(AIMessage(content=item["content"]))
    messages.append(HumanMessage(content=question))
    return messages


def simple_fallback_answer(question: str) -> str:
    """Rule-based response if Bedrock/LangChain is not configured yet."""
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
    return "I can help with the Learning Academy data currently defined in app.js: AI/ML & Agents, ETL, Validation, BTQ, their SMEs, topics, SOPs, and materials. Configure AWS Bedrock credentials to enable full RAG responses."


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "app_js_loaded": bool(APP_JS_TEXT),
        "app_js_path": str(APP_JS_PATH),
        "llm_configured": LLM is not None,
        "rag_vector_store_ready": VECTOR_STORE is not None,
        "bedrock_model_id": BEDROCK_MODEL_ID,
        "bedrock_embed_model_id": BEDROCK_EMBED_MODEL_ID,
        "aws_region": AWS_REGION,
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

    if not APP_JS_TEXT:
        raise HTTPException(status_code=500, detail="app.js was not loaded. Check APP_JS_PATH.")

    append_history(session_id, "user", message)
    context_chunks = retrieve_context(message)

    if LLM is None or HumanMessage is None:
        answer = simple_fallback_answer(message)
        append_history(session_id, "assistant", answer)
        return ChatResponse(response=answer, session_id=session_id, sources_used=["app.js:fallback"])

    try:
        messages = build_messages(session_id, message, context_chunks)
        result = LLM.invoke(messages)
        answer = getattr(result, "content", str(result)).strip()
    except Exception as exc:
        logger.exception("Bedrock invocation failed: %s", exc)
        answer = (
            "I could not reach the Bedrock LLM right now. "
            "Please check AWS credentials, region, model access, and dependencies. "
            f"Fallback answer: {simple_fallback_answer(message)}"
        )

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
    uvicorn.run("backend:app", host="127.0.0.1", port=8000, reload=True)
