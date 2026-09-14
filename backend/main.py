from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stocks = [
    {
        "symbol": "COMI",
        "company": "Commercial Intl Bank",
        "state": "Accumulating",
        "score": 92,
        "volumeRatio": 2.84,
        "price": 76.40,
        "change": 3.18,
    },
    {
        "symbol": "SWDY",
        "company": "Elsewedy Electric",
        "state": "Accumulating",
        "score": 87,
        "volumeRatio": 2.31,
        "price": 63.18,
        "change": 2.46,
    },
    {
        "symbol": "TMGH",
        "company": "Talaat Moustafa Group",
        "state": "Breakout Preparation",
        "score": 79,
        "volumeRatio": 1.92,
        "price": 58.72,
        "change": 1.27,
    },
    {
        "symbol": "FWRY",
        "company": "Fawry",
        "state": "Breakout Preparation",
        "score": 73,
        "volumeRatio": 1.68,
        "price": 6.41,
        "change": 0.94,
    },
    {
        "symbol": "EAST",
        "company": "Eastern Company",
        "state": "Neutral",
        "score": 64,
        "volumeRatio": 1.36,
        "price": 25.06,
        "change": -0.38,
    },
    {
        "symbol": "ORAS",
        "company": "Orascom Construction",
        "state": "Distribution",
        "score": 58,
        "volumeRatio": 1.14,
        "price": 311.20,
        "change": -1.12,
    },
]


@app.get("/")
def root():
    return {"message": "EGX Radar backend is running"}


@app.get("/stocks")
def get_stocks():
    return stocks


@app.get("/stocks/{symbol}")
def get_stock(symbol: str):
    symbol = symbol.upper()

    for stock in stocks:
        if stock["symbol"] == symbol:
            return stock

    raise HTTPException(
        status_code=404,
        detail="Stock not found",
    )