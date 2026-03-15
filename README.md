# Nifty 50 Self Screener

A full-stack stock screener with:
- **Frontend:** React + Vite
- **Backend:** Python Flask + yfinance

## Features
- Nifty 50 stock list
- 1-year / 3-year / 5-year return as of selected date
- Toggle for dividend-adjusted return (using adjusted close)
- Sort by return columns
- Click any stock to open a details page with line chart

## Run backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend runs at `http://localhost:8000`.

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.
