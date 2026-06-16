# Customer Segmentation Dashboard (B2B)

A full-stack application migrating a Python/Streamlit data analysis dashboard into a robust FastAPI backend and React/Vite frontend.

## Prerequisites
- Python 3.9+
- Node.js 18+

## Quickstart

### 1. Backend Setup
The backend powers the in-memory pandas computations, filtering, scoring, and data aggregation.

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn main:app --reload
