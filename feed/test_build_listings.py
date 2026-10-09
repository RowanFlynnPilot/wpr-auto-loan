"""Snapshot-to-feed contract: python -m unittest discover -s feed

build_listings turns a captured dealer snapshot into the feed shape. These
pin the parts that would otherwise fail on a reader's page: the dealer's
body labels map onto bodies ingest accepts, a listing that would need an
invented number is dropped with its reason, and the row shape holds.
"""
import unittest

from build_listings import BODIES, body, page_url, reason_to_drop, to_row
from ingest import BODIES as CANONICAL

V = {
    "yr": 2020, "mk": "Jeep", "md": "Cherokee", "tr": "Latitude", "bd": "Sport Utility",
    "col": "Red", "vin": "1C4PJMCB0LD000000", "sku": "T1", "px": 18500, "mi": 40000,
    "mpg": 24, "dr": "4WD", "fuel": "Gasoline", "ft": ["Bluetooth"],
    "url": "/auto/used-2020-jeep-cherokee/1/", "img": "https://img.example/x.jpg",
}


class BuildListingsTest(unittest.TestCase):
    def test_body_maps_the_dealers_facet_labels(self):
        self.assertEqual(body(V), "SUV")
        self.assertEqual(body({**V, "bd": "Passenger Van"}), "Minivan")
        self.assertEqual(body({**V, "bd": "Crew Cab"}), "Truck")

    def test_every_mapped_body_is_one_ingest_accepts(self):
        self.assertTrue(set(BODIES.values()) <= CANONICAL, set(BODIES.values()) - CANONICAL)

    def test_unknown_body_label_fails_loudly(self):
        with self.assertRaisesRegex(ValueError, "unknown body label"):
            body({**V, "bd": "Hovercraft"})

    def test_drops_name_their_reason(self):
        self.assertIsNone(reason_to_drop(V))
        self.assertIn("price", reason_to_drop({**V, "px": None}))
        self.assertIn("fuel economy", reason_to_drop({**V, "mpg": None}))
        self.assertIn("electric", reason_to_drop({**V, "fuel": "Electric", "mpg": 100}))

    def test_row_carries_combined_mpg_twice_and_an_absolute_page(self):
        row = to_row(V)
        self.assertEqual((row["city_mpg"], row["highway_mpg"]), (24, 24))
        self.assertEqual(row["vdp_url"], "https://www.bricknersofwausau.net/auto/used-2020-jeep-cherokee/1/")
        self.assertEqual(page_url({**V, "url": "https://x.example/y"}), "https://x.example/y")


if __name__ == "__main__":
    unittest.main()
