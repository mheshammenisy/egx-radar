import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterable, Iterator

from opportunity_engine import PriceBar

DEFAULT_DB_PATH = Path(__file__).resolve().parent / "data" / "egx_radar.db"


def connect(db_path: str | Path = DEFAULT_DB_PATH) -> sqlite3.Connection:
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


@contextmanager
def database_session(
    db_path: str | Path = DEFAULT_DB_PATH,
) -> Iterator[sqlite3.Connection]:
    """Yield a SQLite connection and always close it afterwards.

    sqlite3.Connection's own context manager commits or rolls back, but it does
    not close the connection. Explicit closing is required on Windows so test
    databases can be deleted immediately after use.
    """
    connection = connect(db_path)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database(db_path: str | Path = DEFAULT_DB_PATH) -> None:
    with database_session(db_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS stocks (
                symbol TEXT PRIMARY KEY,
                company TEXT NOT NULL,
                market_index TEXT NOT NULL CHECK (market_index IN ('EGX30', 'EGX70')),
                is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1))
            );

            CREATE TABLE IF NOT EXISTS daily_prices (
                symbol TEXT NOT NULL,
                trade_date TEXT NOT NULL,
                open REAL NOT NULL CHECK (open > 0),
                high REAL NOT NULL CHECK (high > 0),
                low REAL NOT NULL CHECK (low > 0),
                close REAL NOT NULL CHECK (close > 0),
                volume REAL NOT NULL CHECK (volume >= 0),
                PRIMARY KEY (symbol, trade_date),
                FOREIGN KEY (symbol) REFERENCES stocks(symbol) ON DELETE CASCADE,
                CHECK (high >= low),
                CHECK (high >= open),
                CHECK (high >= close),
                CHECK (low <= open),
                CHECK (low <= close)
            );

            CREATE INDEX IF NOT EXISTS idx_daily_prices_symbol_date
            ON daily_prices(symbol, trade_date);
            """
        )


def upsert_stock(
    symbol: str,
    company: str,
    market_index: str,
    is_demo: bool = False,
    db_path: str | Path = DEFAULT_DB_PATH,
) -> None:
    with database_session(db_path) as connection:
        connection.execute(
            """
            INSERT INTO stocks(symbol, company, market_index, is_demo)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(symbol) DO UPDATE SET
                company = excluded.company,
                market_index = excluded.market_index,
                is_demo = excluded.is_demo
            """,
            (symbol.upper(), company, market_index, int(is_demo)),
        )


def upsert_price_bars(
    symbol: str,
    bars: Iterable[PriceBar],
    db_path: str | Path = DEFAULT_DB_PATH,
) -> None:
    rows = [
        (
            symbol.upper(),
            bar.date,
            bar.open,
            bar.high,
            bar.low,
            bar.close,
            bar.volume,
        )
        for bar in bars
    ]
    if not rows:
        return

    with database_session(db_path) as connection:
        connection.executemany(
            """
            INSERT INTO daily_prices(symbol, trade_date, open, high, low, close, volume)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(symbol, trade_date) DO UPDATE SET
                open = excluded.open,
                high = excluded.high,
                low = excluded.low,
                close = excluded.close,
                volume = excluded.volume
            """,
            rows,
        )


def list_stocks(db_path: str | Path = DEFAULT_DB_PATH) -> list[dict]:
    with database_session(db_path) as connection:
        rows = connection.execute(
            "SELECT symbol, company, market_index, is_demo FROM stocks ORDER BY symbol"
        ).fetchall()
    return [dict(row) for row in rows]


def get_stock_record(symbol: str, db_path: str | Path = DEFAULT_DB_PATH) -> dict | None:
    with database_session(db_path) as connection:
        row = connection.execute(
            "SELECT symbol, company, market_index, is_demo FROM stocks WHERE symbol = ?",
            (symbol.upper(),),
        ).fetchone()
    return dict(row) if row else None


def get_price_bars(
    symbol: str,
    db_path: str | Path = DEFAULT_DB_PATH,
    limit: int | None = None,
) -> list[PriceBar]:
    sql = """
        SELECT trade_date, open, high, low, close, volume
        FROM daily_prices
        WHERE symbol = ?
        ORDER BY trade_date ASC
    """
    params: tuple[object, ...] = (symbol.upper(),)

    if limit is not None:
        sql = """
            SELECT trade_date, open, high, low, close, volume
            FROM (
                SELECT trade_date, open, high, low, close, volume
                FROM daily_prices
                WHERE symbol = ?
                ORDER BY trade_date DESC
                LIMIT ?
            )
            ORDER BY trade_date ASC
        """
        params = (symbol.upper(), limit)

    with database_session(db_path) as connection:
        rows = connection.execute(sql, params).fetchall()

    return [
        PriceBar(
            date=row["trade_date"],
            open=row["open"],
            high=row["high"],
            low=row["low"],
            close=row["close"],
            volume=row["volume"],
        )
        for row in rows
    ]


def count_prices(symbol: str, db_path: str | Path = DEFAULT_DB_PATH) -> int:
    with database_session(db_path) as connection:
        row = connection.execute(
            "SELECT COUNT(*) AS n FROM daily_prices WHERE symbol = ?",
            (symbol.upper(),),
        ).fetchone()
    return int(row["n"])
