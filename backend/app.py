from __future__ import annotations

from datetime import datetime
from functools import lru_cache
from typing import Dict, List

import pandas as pd
import yfinance as yf
from flask import Flask, jsonify, request
from flask_cors import CORS

from nifty50 import NIFTY_50_TICKERS

app = Flask(__name__)
CORS(app)

YEARS = [1, 3, 5]


def parse_selected_date(date_value: str | None) -> pd.Timestamp:
    if not date_value:
        return pd.Timestamp.utcnow().normalize()
    try:
        return pd.Timestamp(datetime.strptime(date_value, "%Y-%m-%d")).normalize()
    except ValueError:
        return pd.Timestamp.utcnow().normalize()


@lru_cache(maxsize=64)
def download_history(ticker: str) -> pd.DataFrame:
    history = yf.Ticker(ticker).history(period="max", auto_adjust=False, actions=True)
    if history.empty:
        return history
    history.index = history.index.tz_localize(None)
    history = history.sort_index()
    return history


def value_at_or_before(history: pd.DataFrame, date: pd.Timestamp, adjusted: bool) -> float | None:
    idx = history.index.searchsorted(date, side="right") - 1
    if idx < 0:
        return None
    col = "Adj Close" if adjusted else "Close"
    value = history.iloc[idx][col]
    return float(value) if pd.notna(value) else None


def compute_returns(ticker: str, selected_date: pd.Timestamp, adjusted: bool) -> Dict[str, float | None]:
    history = download_history(ticker)
    if history.empty:
        return {f"{year}y": None for year in YEARS}

    end_price = value_at_or_before(history, selected_date, adjusted)
    if end_price is None or end_price <= 0:
        return {f"{year}y": None for year in YEARS}

    returns = {}
    for year in YEARS:
        start_date = selected_date - pd.DateOffset(years=year)
        start_price = value_at_or_before(history, start_date, adjusted)
        key = f"{year}y"
        if start_price is None or start_price <= 0:
            returns[key] = None
        else:
            returns[key] = round(((end_price / start_price) - 1) * 100, 2)
    return returns


@app.get("/api/screener")
def screener():
    selected_date = parse_selected_date(request.args.get("date"))
    adjusted = request.args.get("adjusted", "false").lower() == "true"

    rows: List[dict] = []
    for ticker in NIFTY_50_TICKERS:
        stock = yf.Ticker(ticker)
        info = stock.fast_info if hasattr(stock, "fast_info") else {}
        returns = compute_returns(ticker, selected_date, adjusted)
        rows.append(
            {
                "ticker": ticker,
                "name": info.get("shortName", ticker),
                "currency": info.get("currency", "INR"),
                "returns": returns,
            }
        )

    return jsonify(
        {
            "as_of": selected_date.strftime("%Y-%m-%d"),
            "adjusted": adjusted,
            "count": len(rows),
            "data": rows,
        }
    )


@app.get("/api/stocks/<ticker>/history")
def stock_history(ticker: str):
    period = request.args.get("period", "5y")
    adjusted = request.args.get("adjusted", "false").lower() == "true"

    history = yf.Ticker(ticker).history(period=period, auto_adjust=False)
    history.index = history.index.tz_localize(None)
    col = "Adj Close" if adjusted else "Close"

    points = [
        {"date": idx.strftime("%Y-%m-%d"), "price": round(float(row[col]), 2)}
        for idx, row in history.iterrows()
        if pd.notna(row[col])
    ]

    return jsonify({"ticker": ticker, "adjusted": adjusted, "period": period, "prices": points})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
