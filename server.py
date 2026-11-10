"""
FastAPI layer for the AI Video Assistant.

Place this file in the project root, next to main.py.
It only IMPORTS and CALLS your existing functions - nothing in core/ or utils/ is changed.

Run:  uvicorn server:app --reload --port 8000
"""
from dotenv import load_dotenv

load_dotenv()  # MUST run before core/ imports (transcriber reads SARVAM_API_KEY at import time)

import os
import time
import uuid
import threading
import traceback
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from utils.audio_processor import process_input
from core.transcriber import transcribe_all
from core.summarizer import summarize, generate_title
from core.extractor import (
    extract_action_items,
    extract_key_decisions,
    extract_questions,
)
from core.rag_engine import build_rag_chain, ask_question

UPLOAD_DIR = os.path.join("downloads", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Same steps, same order as main.run_pipeline - split out so the UI can show progress.
STAGES = [
    {"key": "audio", "label": "Preparing audio"},
    {"key": "transcribe", "label": "Transcribing speech"},
    {"key": "summary", "label": "Writing title and summary"},
    {"key": "insights", "label": "Finding action items, decisions and questions"},
    {"key": "index", "label": "Building the search index"},
]

app = FastAPI(title="AI Video Assistant API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

JOBS: dict[str, dict] = {}
RAG_CHAINS: dict[str, object] = {}
_lock = threading.Lock()
# Whisper + embeddings are heavy: process one video at a time, queue the rest.
_executor = ThreadPoolExecutor(max_workers=1)


def _set(job_id: str, **fields):
    with _lock:
        JOBS[job_id].update(fields)


def _run_job(job_id: str, source: str, language: str):
    try:
        _set(job_id, status="running", stage_index=0)
        chunks = process_input(source)

        _set(job_id, stage_index=1)
        transcript = transcribe_all(chunks, language)

        _set(job_id, stage_index=2)
        title = generate_title(transcript)
        summary = summarize(transcript)

        _set(job_id, stage_index=3)
        action_items = extract_action_items(transcript)
        decisions = extract_key_decisions(transcript)
        questions = extract_questions(transcript)

        _set(job_id, stage_index=4)
        RAG_CHAINS[job_id] = build_rag_chain(transcript)

        _set(
            job_id,
            status="done",
            stage_index=len(STAGES),
            title=title,
            result={
                "title": title,
                "transcript": transcript,
                "summary": summary,
                "action_items": action_items,
                "key_decisions": decisions,
                "open_questions": questions,
            },
        )
    except Exception as e:  # surfaced in the UI
        traceback.print_exc()
        _set(job_id, status="error", error=f"{type(e).__name__}: {e}")


def _public(job: dict, full: bool = True) -> dict:
    data = {k: v for k, v in job.items() if k != "result"}
    data["stages"] = STAGES
    if full:
        data["result"] = job.get("result")
    return data


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/jobs")
def list_jobs():
    with _lock:
        jobs = sorted(JOBS.values(), key=lambda j: j["created_at"], reverse=True)
        return [_public(j, full=False) for j in jobs]


@app.post("/api/jobs")
def create_job(
    language: str = Form("english"),
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    language = language.lower()
    if language not in ("english", "hinglish"):
        raise HTTPException(400, "language must be 'english' or 'hinglish'")

    if file is not None and file.filename:
        safe_name = os.path.basename(file.filename)
        source = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex[:8]}_{safe_name}")
        with open(source, "wb") as out:
            while chunk := file.file.read(1024 * 1024):
                out.write(chunk)
        label = safe_name
    elif url and url.strip().startswith(("http://", "https://")):
        source = url.strip()
        label = source
    else:
        raise HTTPException(400, "Provide a YouTube URL (http/https) or upload a file.")

    job_id = uuid.uuid4().hex[:12]
    with _lock:
        JOBS[job_id] = {
            "id": job_id,
            "status": "queued",
            "stage_index": 0,
            "language": language,
            "source_label": label,
            "title": None,
            "error": None,
            "created_at": time.time(),
            "result": None,
        }
    _executor.submit(_run_job, job_id, source, language)
    return {"id": job_id}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    with _lock:
        job = JOBS.get(job_id)
        if not job:
            raise HTTPException(404, "Job not found")
        return _public(job)


@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: str):
    with _lock:
        if JOBS.pop(job_id, None) is None:
            raise HTTPException(404, "Job not found")
    RAG_CHAINS.pop(job_id, None)
    return {"ok": True}


class ChatRequest(BaseModel):
    question: str


# Plain `def` -> FastAPI runs it in a worker thread, so the blocking LLM call doesn't stall the server.
@app.post("/api/jobs/{job_id}/chat")
def chat(job_id: str, body: ChatRequest):
    chain = RAG_CHAINS.get(job_id)
    if chain is None:
        raise HTTPException(404, "This session has no chat index (still processing, or the server restarted).")
    question = body.question.strip()
    if not question:
        raise HTTPException(400, "Question is empty")
    return {"answer": ask_question(chain, question)}
