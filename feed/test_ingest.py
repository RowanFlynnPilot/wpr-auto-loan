"""Feed contract tests: python -m unittest discover -s feed

Each case writes a small CSV in the feed's column shape and checks that
ingest either parses it or refuses it for the stated reason.
"""
import csv
import tempfile
import unittest
from pathlib import Path

from ingest import FEED_COLUMNS, load_feed

GOOD = {
    "stock_number": "T100", "vin": "1HGCM82633A004352", "year": "2022", "make": "Honda",
    "model": "Civic", "trim": "Sport", "body_style": "Sedan", "selling_price": "21500",
    "mileage": "18000", "city_mpg": "30", "highway_mpg": "37", "drivetrain": "FWD",
    "exterior_color": "Blue", "features": "Backup camera|Apple CarPlay", "photo_url": "",
    "vdp_url": "https://dealer.example/inventory/T100",
}


class IngestTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.dir.cleanup()

    def feed(self, *rows, columns=None):
        path = Path(self.dir.name) / "feed.csv"
        columns = columns or list(FEED_COLUMNS.values())
        with path.open("w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
            w.writeheader()
            w.writerows(rows)
        return path

    def test_parses_a_good_row(self):
        [v] = load_feed(self.feed(GOOD))
        self.assertEqual(v["stock"], "T100")
        self.assertEqual(v["price"], 21500)
        self.assertEqual(v["features"], ["Backup camera", "Apple CarPlay"])

    def test_missing_column_fails(self):
        cols = [c for c in FEED_COLUMNS.values() if c != "city_mpg"]
        with self.assertRaisesRegex(KeyError, "city_mpg"):
            load_feed(self.feed(GOOD, columns=cols))

    def test_empty_feed_fails(self):
        with self.assertRaisesRegex(ValueError, "no vehicles"):
            load_feed(self.feed())

    def test_non_positive_price_fails(self):
        with self.assertRaisesRegex(ValueError, "non-positive price"):
            load_feed(self.feed({**GOOD, "selling_price": "0"}))

    def test_vdp_must_be_https_url(self):
        for bad in ("http://dealer.example/x", "https://", "dealer.example/x"):
            with self.subTest(bad=bad), self.assertRaisesRegex(ValueError, "vdp_url"):
                load_feed(self.feed({**GOOD, "vdp_url": bad}))

    def test_photo_https_or_empty(self):
        load_feed(self.feed({**GOOD, "photo_url": "https://cdn.example/t100.jpg"}))
        with self.assertRaisesRegex(ValueError, "photo_url"):
            load_feed(self.feed({**GOOD, "photo_url": "http://cdn.example/t100.jpg"}))

    def test_body_aliases_normalize(self):
        [v] = load_feed(self.feed({**GOOD, "body_style": "Sport Utility"}))
        self.assertEqual(v["body"], "SUV")

    def test_unknown_body_fails(self):
        with self.assertRaisesRegex(ValueError, "unknown body 'Blimp'"):
            load_feed(self.feed({**GOOD, "body_style": "Blimp"}))

    def test_zero_mpg_fails(self):
        with self.assertRaisesRegex(ValueError, "mpg must be positive"):
            load_feed(self.feed({**GOOD, "city_mpg": "0"}))

    def test_duplicate_stock_fails(self):
        with self.assertRaisesRegex(ValueError, "duplicate stock number T100"):
            load_feed(self.feed(GOOD, {**GOOD, "vin": "1HGCM82633A004353"}))


if __name__ == "__main__":
    unittest.main()
