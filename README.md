# Asynchronous Verification Engine (AVE)

AVE is a runtime policy enforcement system for AI agents. It acts as a deterministic verification gateway between AI agents and external tools/APIs.

When an AI agent generates a tool call, AVE intercepts the call, extracts runtime parameters, resolves formal security policies, and evaluates them using the Z3 SMT Solver before deciding whether to ALLOW or BLOCK execution.

## Core Principle

```
AI Agent -> Tool Call -> AVE Gateway -> Parameter Extraction -> Policy Resolution -> Z3 Verification -> ALLOW / BLOCK -> External Tool / Violation Report -> Audit Log
```

Blocked actions are NEVER forwarded to external tools. Instead, AVE returns structured violation explanations and repair guidance for agent self-correction.

## Tech Stack

- **Backend**: FastAPI, Pydantic, Z3Py (`z3-solver`), SQLAlchemy
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Database**: Supabase PostgreSQL / SQLite
- **Formal Solver**: Z3 SMT Solver

## Running Locally

### Backend Setup
```bash
cd backend
python -m vaxis_venv .venv # optional
pip install -r requirements.txt
python -m app.main
```
The FastAPI backend runs at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The Next.js dashboard runs at `http://localhost:3000`.

### Running Tests
```bash
cd backend
pytest
```

## Features

- **Formal Policy Engine**: Mathematical constraint evaluation using Z3 Python API (no unsafe `eval()`).
- **Simulated Tool Execution**: Safe sandbox simulation for `issue_refund`, `transfer_money`, and `delete_record`.
- **Repair Guidance**: Structured actionable suggestions for blocked actions.
- **Enterprise Dark Graphite UI**: Professional security observability dashboard with real-time audit logs and live verification metrics.
