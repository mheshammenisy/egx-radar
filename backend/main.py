import os
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

IndexName = Literal["EGX30", "EGX70", "EGX100"]
StateName = Literal[
    "Accumulating",
    "Breakout Preparation",
    "Neutral",
    "Distribution",
]
DemoIndexName = Literal["EGX30", "EGX70"]


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


app = FastAPI(
    title="EGX Opportunity Radar API",
    version="0.1.0",
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

# Prototype-only records. Every value below is illustrative demo data and must
# be replaced by a licensed/reliable market-data source before public launch.
DEMO_STOCKS = [
    Stock(
        symbol="COMI",
        company="Commercial Intl Bank",
        state="Accumulating",
        score=92,
        volumeRatio=2.84,
        price=76.40,
        change=3.18,
        demoIndex="EGX30",
    ),
    Stock(
        symbol="SWDY",
        company="Elsewedy Electric",
        state="Accumulating",
        score=87,
        volumeRatio=2.31,
        price=63.18,
        change=2.46,
        demoIndex="EGX30",
    ),
    Stock(
        symbol="TMGH",
        company="Talaat Moustafa Group",
        state="Breakout Preparation",
        score=79,
        volumeRatio=1.92,
        price=58.72,
        change=1.27,
        demoIndex="EGX30",
    ),
    Stock(
        symbol="FWRY",
        company="Fawry",
        state="Breakout Preparation",
        score=73,
        volumeRatio=1.68,
        price=6.41,
        change=0.94,
        demoIndex="EGX70",
    ),
    Stock(
        symbol="EAST",
        company="Eastern Company",
        state="Neutral",
        score=64,
        volumeRatio=1.36,
        price=25.06,
        change=-0.38,
        demoIndex="EGX70",
    ),
    Stock(
        symbol="ORAS",
        company="Orascom Construction",
        state="Distribution",
        score=58,
        volumeRatio=1.14,
        price=311.20,
        change=-1.12,
        demoIndex="EGX70",
    ),
]


@app.get("/")
def root():
    return {
        "message": "EGX Opportunity Radar backend is running",
        "dataMode": "demo",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "dataMode": "demo",
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
