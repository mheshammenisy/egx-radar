import csv
import tempfile
import unittest
from pathlib import Path

from csv_import import import_ohlcv_csv
from database import (
    count_prices,
    get_price_bars,
    get_stock_record,
    initialize_database,
    upsert_price_bars,
    upsert_stock,
)
from opportunity_engine import PriceBar


class DatabaseTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db_path = Path(self.tmp.name) / "test.db"
        initialize_database(self.db_path)

    def tearDown(self):
        self.tmp.cleanup()

    def test_store_and_read_stock_history(self):
        upsert_stock("TEST", "Test Company", "EGX30", db_path=self.db_path)
        bars = [
            PriceBar("2026-01-01", 10.0, 10.8, 9.8, 10.5, 1000),
            PriceBar("2026-01-02", 10.5, 11.0, 10.2, 10.8, 1200),
        ]
        upsert_price_bars("TEST", bars, db_path=self.db_path)

        record = get_stock_record("test", self.db_path)
        loaded = get_price_bars("TEST", self.db_path)

        self.assertEqual(record["company"], "Test Company")
        self.assertEqual(len(loaded), 2)
        self.assertEqual(loaded[-1].close, 10.8)

    def test_upsert_does_not_duplicate_same_date(self):
        upsert_stock("TEST", "Test Company", "EGX30", db_path=self.db_path)
        first = PriceBar("2026-01-01", 10.0, 10.8, 9.8, 10.5, 1000)
        replacement = PriceBar("2026-01-01", 10.0, 11.0, 9.8, 10.9, 1500)
        upsert_price_bars("TEST", [first], db_path=self.db_path)
        upsert_price_bars("TEST", [replacement], db_path=self.db_path)

        self.assertEqual(count_prices("TEST", self.db_path), 1)
        self.assertEqual(get_price_bars("TEST", self.db_path)[0].close, 10.9)

    def test_csv_import(self):
        csv_path = Path(self.tmp.name) / "prices.csv"
        with csv_path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow([
                "symbol", "company", "market_index", "date",
                "open", "high", "low", "close", "volume",
            ])
            writer.writerow(["TEST", "Test Company", "EGX70", "2026-01-01", 10, 11, 9, 10.5, 1000])
            writer.writerow(["TEST", "Test Company", "EGX70", "2026-01-02", 10.5, 11.2, 10.2, 11, 1300])

        result = import_ohlcv_csv(csv_path, self.db_path)

        self.assertEqual(result, {"stocks": 1, "rows": 2})
        self.assertEqual(count_prices("TEST", self.db_path), 2)
        self.assertFalse(bool(get_stock_record("TEST", self.db_path)["is_demo"]))

    def test_limit_returns_latest_rows_in_ascending_order(self):
        upsert_stock("TEST", "Test Company", "EGX30", db_path=self.db_path)
        bars = [
            PriceBar(f"2026-01-0{i}", 10 + i, 11 + i, 9 + i, 10.5 + i, 1000 + i)
            for i in range(1, 6)
        ]
        upsert_price_bars("TEST", bars, db_path=self.db_path)

        loaded = get_price_bars("TEST", self.db_path, limit=2)

        self.assertEqual([bar.date for bar in loaded], ["2026-01-04", "2026-01-05"])


if __name__ == "__main__":
    unittest.main()
