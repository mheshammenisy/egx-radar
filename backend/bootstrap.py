from database import DEFAULT_DB_PATH, initialize_database, list_stocks, upsert_price_bars, upsert_stock
from demo_market_data import DEMO_SECURITIES


def ensure_demo_seed(db_path=DEFAULT_DB_PATH) -> None:
    """Keep the local prototype usable until real CSV/API data are loaded.

    Demo OHLCV is written into SQLite, so the application and opportunity engine
    exercise the same storage path that real imported data will use later.
    """
    initialize_database(db_path)
    if list_stocks(db_path):
        return

    for security in DEMO_SECURITIES:
        upsert_stock(
            security["symbol"],
            security["company"],
            security["demoIndex"],
            is_demo=True,
            db_path=db_path,
        )
        upsert_price_bars(security["symbol"], security["bars"], db_path=db_path)
