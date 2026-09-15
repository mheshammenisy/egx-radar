from __future__ import annotations

import argparse
from pathlib import Path
from typing import Callable

from database import (
    DEFAULT_DB_PATH,
    initialize_database,
    list_stocks,
    replace_price_bars,
    upsert_stock,
)
from opportunity_engine import PriceBar

YAHOO_SUFFIX = ".CA"


def yahoo_symbol(symbol: str) -> str:
    return f"{symbol.strip().upper()}{YAHOO_SUFFIX}"


def _download_history(yahoo_ticker: str, period: str = "1y"):
    try:
        import yfinance as yf
    except ImportError as exc:
        raise RuntimeError(
            "yfinance is not installed. Run: pip install -r requirements.txt"
        ) from exc

    return yf.Ticker(yahoo_ticker).history(
        period=period,
        interval="1d",
        auto_adjust=False,
        actions=False,
    )


def dataframe_to_bars(history) -> list[PriceBar]:
    if history is None or getattr(history, "empty", True):
        return []

    bars: list[PriceBar] = []
    for timestamp, row in history.iterrows():
        values = {
            "open": row.get("Open"),
            "high": row.get("High"),
            "low": row.get("Low"),
            "close": row.get("Close"),
            "volume": row.get("Volume"),
        }
        if any(value is None for value in values.values()):
            continue
        if any(value != value for value in values.values()):  # NaN check
            continue

        open_price = float(values["open"])
        high = float(values["high"])
        low = float(values["low"])
        close = float(values["close"])
        volume = float(values["volume"])

        if min(open_price, high, low, close) <= 0 or volume < 0:
            continue
        if high < max(open_price, close, low) or low > min(open_price, close, high):
            continue

        date_value = timestamp.date().isoformat() if hasattr(timestamp, "date") else str(timestamp)[:10]
        bars.append(
            PriceBar(
                date=date_value,
                open=open_price,
                high=high,
                low=low,
                close=close,
                volume=volume,
            )
        )

    return bars


def import_symbol_from_yahoo(
    symbol: str,
    company: str,
    market_index: str,
    period: str = "1y",
    db_path: str | Path = DEFAULT_DB_PATH,
    downloader: Callable | None = None,
) -> dict:
    initialize_database(db_path)
    ticker = yahoo_symbol(symbol)
    fetch = downloader or _download_history
    history = fetch(ticker, period)
    bars = dataframe_to_bars(history)

    if len(bars) < 21:
        return {
            "symbol": symbol.upper(),
            "yahoo_symbol": ticker,
            "status": "skipped",
            "rows": len(bars),
            "reason": "fewer than 21 usable daily bars",
        }

    upsert_stock(
        symbol,
        company,
        market_index,
        is_demo=False,
        db_path=db_path,
    )
    replace_price_bars(symbol, bars, db_path=db_path)

    return {
        "symbol": symbol.upper(),
        "yahoo_symbol": ticker,
        "status": "imported",
        "rows": len(bars),
        "first_date": bars[0].date,
        "last_date": bars[-1].date,
    }


def import_existing_stocks_from_yahoo(
    period: str = "1y",
    db_path: str | Path = DEFAULT_DB_PATH,
    downloader: Callable | None = None,
) -> list[dict]:
    initialize_database(db_path)
    records = list_stocks(db_path)
    results: list[dict] = []

    for record in records:
        try:
            result = import_symbol_from_yahoo(
                record["symbol"],
                record["company"],
                record["market_index"],
                period=period,
                db_path=db_path,
                downloader=downloader,
            )
        except Exception as exc:
            result = {
                "symbol": record["symbol"],
                "yahoo_symbol": yahoo_symbol(record["symbol"]),
                "status": "error",
                "rows": 0,
                "reason": str(exc),
            }
        results.append(result)

    return results


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import daily EGX OHLCV from Yahoo Finance into SQLite for development/testing"
    )
    parser.add_argument("--period", default="1y", help="Yahoo history period, e.g. 6mo, 1y, 2y")
    parser.add_argument("--db", default=str(DEFAULT_DB_PATH), help="SQLite database path")
    args = parser.parse_args()

    results = import_existing_stocks_from_yahoo(period=args.period, db_path=args.db)
    for result in results:
        if result["status"] == "imported":
            print(
                f"{result['symbol']}: imported {result['rows']} rows "
                f"({result['first_date']} to {result['last_date']})"
            )
        else:
            print(
                f"{result['symbol']}: {result['status']} "
                f"({result.get('reason', 'unknown reason')})"
            )


if __name__ == "__main__":
    main()
