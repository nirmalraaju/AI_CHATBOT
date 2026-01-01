# Hybrid Domain Assistant

A professional, dual-engine assistant that combines a **Large Language Model** with a **Symbolic Math Engine** for 100% computational accuracy.

## 🚀 Key Features
* **Dual-Engine Routing**: Automatically detects mathematical intent vs. general engineering queries.
* **Symbolic Engine (SymPy)**: Handles calculus, algebra, and matrix operations with zero "hallucinations."
* **LLM (Gemini 2.0 Flash)**: Powered by the latest `google-genai` SDK for technical guidance.
* **Persistent Memory**: Integrated with **Supabase** to maintain context across sessions.
* **Professional UI**: A sleek, center-aligned, minimalist dark-mode interface.

## 🛠️ Tech Stack
* **Frontend**: React, React-Markdown, KaTeX (LaTeX rendering).
* **Backend**: FastAPI, SymPy, google-genai.
* **Database**: Supabase (PostgreSQL).

## 📥 Setup
1. Clone the repo: `git clone <your-repo-url>`
2. Install Python deps: `pip install -r requirements.txt`
3. Install Frontend deps: `npm install`
4. Setup `.env` with `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_KEY`.
