Quick run instructions

1) Create a Python virtualenv and install dependencies

PowerShell:
```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

2) Start backend (FastAPI)
```powershell
.
# Option A (run script):
python backend\backend.py

# Option B (uvicorn):
uvicorn backend.backend:app --reload --host 127.0.0.1 --port 8000
```

3) Serve frontend (optional - you can open index.html directly)
```powershell
python -m http.server 5500
# Then open http://127.0.0.1:5500/index.html
```

4) Notes
- Backend persistence file: `backend/content.json`
- API endpoints used by UI: `GET /api/content`, `POST /api/add-pillar`, `POST /api/add-topic`
- If the frontend shows "Backend unreachable" warning, start the backend as above.

Local-only mode
- You can open `index.html` directly in the browser (no servers). In that case, new pillars/topics are saved to your browser's `localStorage` and will persist across refreshes on the same machine.
- When you later start the backend, the app will attempt to sync any locally saved pillars/topics to `backend/content.json` automatically.

Using a GitHub PAT as an LLM placeholder
- To enable the temporary GitHub-PAT-based placeholder LLM, set the `GITHUB_TOKEN` environment variable before starting the backend, or add it to a `.env` file in the `backend/` folder (the backend already loads `.env`). Example `.env` content:

```
GITHUB_TOKEN=ghp_your_generated_token_here
```

Restart the backend after adding the token. The chat endpoint will then use a small placeholder LLM (`SimpleGitHubLLM`) that indicates the token presence — replace this with a real LLM call later.
