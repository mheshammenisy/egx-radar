import os
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from bootstrap import ensure_demo_seed
from database import DEFAULT_DB_PATH, get_price_bars, get_stock_record, list_stocks
from opportunity_engine import OpportunityMetrics, analyze_opportunity

IndexName = Literal["EGX30", "EGX70", "EGX100"]
StateName = Literal[
    "Accumulating",
    "Breakout Preparation",
    "Fresh Breakout",
    "Healthy Pullback",
    "Distribution Warning",
    "Neutral",
]
DemoIndexName = Literal["EGX30", "EGX70"]


class MetricsModel(BaseModel):
    relativeVolume: float
    trend: str
    higherLows: bool
    support: float
    resistance: float
    distanceToResistancePct: float
    closingStrength: float
    breakout: bool
    healthyPullback: bool


class Stock(BaseModel):
    symbol: str
    company: str
    state: StateName
    score: int = Field(ge=0, le=100)
    volumeRatio: float = Field(ge=0)
    price: float = Field(gt=0)
    change: float
    demoIndex: DemoIndexName
    isDemo: bool
    why: list[str]
    trigger: str
    invalidation: str
    metrics: MetricsModel


class HistoryBar(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float


app = FastAPI(
    title="EGX Opportunity Radar API",
    version="0.3.0",
)

_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
_allowed_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

ensure_demo_seed(DEFAULT_DB_PATH)


def _metrics_model(metrics: OpportunityMetrics) -> MetricsModel:
    return MetricsModel(
        relativeVolume=metrics.relative_volume,
        trend=metrics.trend,
        higherLows=metrics.higher_lows,
        support=metrics.support,
        resistance=metrics.resistance,
        distanceToResistancePct=metrics.distance_to_resistance_pct,
        closingStrength=metrics.closing_strength,
        breakout=metrics.breakout,
        healthyPullback=metrics.healthy_pullback,
    )


def _build_stock(record: dict) -> Stock:
    bars = get_price_bars(record["symbol"], DEFAULT_DB_PATH, limit=120)
    if len(bars) < 21:
        raise HTTPException(
            status_code=422,
            detail=f"{record['symbol']} needs at least 21 daily OHLCV rows",
        )

    result = analyze_opportunity(bars)
    latest = bars[-1]
    previous = bars[-2]
    daily_change = ((latest.close - previous.close) / previous.close) * 100

    return Stock(
        symbol=record["symbol"],
        company=record["company"],
        state=result.state,
        score=result.score,
        volumeRatio=result.metrics.relative_volume,
        price=latest.close,
        change=round(daily_change, 2),
        demoIndex=record["market_index"],
        isDemo=bool(record["is_demo"]),
        why=result.why,
        trigger=result.trigger,
        invalidation=result.invalidation,
        metrics=_metrics_model(result.metrics),
    )


@app.get("/")
def root():
    return {
        "message": "EGX Opportunity Radar backend is running",
        "storage": "sqlite",
        "engineMode": "deterministic-v1",
    }


@app.get("/health")
def health():
    records = list_stocks(DEFAULT_DB_PATH)
    data_mode = "demo" if records and all(bool(r["is_demo"]) for r in records) else "stored"
    return {
        "status": "ok",
        "storage": "sqlite",
        "dataMode": data_mode,
        "engineMode": "deterministic-v1",
    }


@app.get("/stocks", response_model=list[Stock])
def get_stocks(index: IndexName = "EGX100"):
    records = list_stocks(DEFAULT_DB_PATH)
    if index != "EGX100":
        records = [record for record in records if record["market_index"] == index]
    return [_build_stock(record) for record in records]


@app.get("/stocks/{symbol}", response_model=Stock)
def get_stock(symbol: str):
    record = get_stock_record(symbol, DEFAULT_DB_PATH)
    if not record:
        raise HTTPException(status_code=404, detail="Stock not found")
    return _build_stock(record)


@app.get("/stocks/{symbol}/history", response_model=list[HistoryBar])
def get_stock_history(symbol: str, limit: int = 60):
    if limit < 1 or limit > 500:
        raise HTTPException(status_code=422, detail="limit must be between 1 and 500")

    record = get_stock_record(symbol, DEFAULT_DB_PATH)
    if not record:
        raise HTTPException(status_code=404, detail="Stock not found")

    bars = get_price_bars(symbol, DEFAULT_DB_PATH, limit=limit)
    return [
        HistoryBar(
            date=bar.date,
            open=bar.open,
            high=bar.high,
            low=bar.low,
            close=bar.close,
            volume=bar.volume,
        )
        for bar in bars
    ]
