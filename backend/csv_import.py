import csv
from pathlib import Path

from database import DEFAULT_DB_PATH, initialize_database, upsert_price_bars, upsert_stock
from opportunity_engine import PriceBar

REQUIRED_COLUMNS = {
    "symbol",
    "company",
    "market_index",
    "date",
    "open",
    "high",
    "low",
    "close",
    "volume",
}


def import_ohlcv_csv(csv_path: str | Path, db_path: str | Path = DEFAULT_DB_PATH) -> dict:
    initialize_database(db_path)

    grouped: dict[str, dict] = {}
    with open(csv_path, newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Missing required CSV columns: {', '.join(sorted(missing))}")

        for row in reader:
            symbol = row["symbol"].strip().upper()
            if not symbol:
                raise ValueError("CSV contains an empty symbol")

            market_index = row["market_index"].strip().upper()
            if market_index not in {"EGX30", "EGX70"}:
                raise ValueError(f"Unsupported market_index for {symbol}: {market_index}")

            bar = PriceBar(
                date=row["date"].strip(),
                open=float(row["open"]),
                high=float(row["high"]),
                low=float(row["low"]),
                close=float(row["close"]),
                volume=float(row["volume"]),
            )

            if bar.high < max(bar.open, bar.close, bar.low):
                raise ValueError(f"Invalid high value for {symbol} on {bar.date}")
            if bar.low > min(bar.open, bar.close, bar.high):
                raise ValueError(f"Invalid low value for {symbol} on {bar.date}")
            if min(bar.open, bar.high, bar.low, bar.close) <= 0 or bar.volume < 0:
                raise ValueError(f"Invalid OHLCV values for {symbol} on {bar.date}")

            bucket = grouped.setdefault(
                symbol,
                {
                    "company": row["company"].strip() or symbol,
                    "market_index": market_index,
                    "bars": [],
                },
            )
            bucket["bars"].append(bar)

    total_rows = 0
    for symbol, payload in grouped.items():
        upsert_stock(
            symbol,
            payload["company"],
            payload["market_index"],
            is_demo=False,
            db_path=db_path,
        )
        upsert_price_bars(symbol, payload["bars"], db_path=db_path)
        total_rows += len(payload["bars"])

    return {"stocks": len(grouped), "rows": total_rows}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Import daily EGX OHLCV CSV data into SQLite")
    parser.add_argument("csv_path", help="Path to CSV file")
    parser.add_argument("--db", default=str(DEFAULT_DB_PATH), help="SQLite database path")
    args = parser.parse_args()

    result = import_ohlcv_csv(args.csv_path, args.db)
    print(f"Imported {result['rows']} rows for {result['stocks']} stocks into {args.db}")
