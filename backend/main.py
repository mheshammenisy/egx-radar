import os
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from demo_market_data import DEMO_SECURITIES
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
    isDemo: bool = True
    why: list[str]
    trigger: str
    invalidation: str
    metrics: MetricsModel


app = FastAPI(
    title="EGX Opportunity Radar API",
    version="0.2.0",
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


def _build_demo_stock(security: dict) -> Stock:
    bars = security["bars"]
    result = analyze_opportunity(bars)
    latest = bars[-1]
    previous = bars[-2]
    daily_change = ((latest.close - previous.close) / previous.close) * 100

    return Stock(
        symbol=security["symbol"],
        company=security["company"],
        state=result.state,
        score=result.score,
        volumeRatio=result.metrics.relative_volume,
        price=latest.close,
        change=round(daily_change, 2),
        demoIndex=security["demoIndex"],
        why=result.why,
        trigger=result.trigger,
        invalidation=result.invalidation,
        metrics=_metrics_model(result.metrics),
    )


DEMO_STOCKS = [_build_demo_stock(security) for security in DEMO_SECURITIES]


@app.get("/")
def root():
    return {
        "message": "EGX Opportunity Radar backend is running",
        "dataMode": "demo",
        "engineMode": "deterministic-v1",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "dataMode": "demo",
        "engineMode": "deterministic-v1",
    }


@app.get("/stocks", response_model=list[Stock])
def get_stocks(index: IndexName = "EGX100"):
    if index == "EGX100":
        return DEMO_STOCKS

    return [stock for stock in DEMO_STOCKS if stock.demoIndex == index]


@app.get("/stocks/{symbol}", response_model=Stock)
def get_stock(symbol: str):
    normalized_symbol = symbol.upper()

    for stock in DEMO_STOCKS:
        if stock.symbol == normalized_symbol:
            return stock

    raise HTTPException(
        status_code=404,
        detail="Stock not found",
    )
