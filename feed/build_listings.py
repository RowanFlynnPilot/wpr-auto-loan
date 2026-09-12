"""Turn a captured dealer-listing snapshot into a feed CSV.

    python feed/build_listings.py feed/brickners_listings.json feed/brickners.csv

Used for interim pitch previews, where we have a prospect's real public
listings but no feed access yet. The output goes through ingest.py like any
other feed, so the same contract applies and a bad row still fails the build.

Two things the snapshot cannot give us, and what we do about them:

* Dealer listings publish one combined MPG, not the city/highway pair a feed
  carries. Writing the combined figure into both columns is exact — the EPA
  55/45 blend of x and x is x — and the card labels it "combined" rather than
  claiming two separate ratings.
* Some rows have no fuel economy at all. Those are dropped and named, not
  filled in with a guess: inventing a number the dealer never published is
  how a demo becomes a lie.
"""
import csv
import json
import sys
from pathlib import Path

SITE = "https://www.bricknersofwausau.net"

COLUMNS = [
    "stock_number", "vin", "year", "make", "model", "trim", "body_style",
    "selling_price", "mileage", "city_mpg", "highway_mpg", "drivetrain",
    "exterior_color", "features", "photo_url", "vdp_url",
]


def to_row(v: dict) -> dict:
    mpg = v["mpg"]
    return {
        "stock_number": v["sku"],
        "vin": v["vin"],
        "year": v["yr"],
        "make": v["mk"],
        "model": v["md"],
        "trim": v["tr"],
        "body_style": v["body"],
        "selling_price": v["px"],
        "mileage": v["mi"],
        # Same value in both columns: the combined figure the dealer published.
        "city_mpg": mpg,
        "highway_mpg": mpg,
        "drivetrain": v["dr"],
        "exterior_color": v["col"],
        "features": "|".join(v["ft"]),
        "photo_url": v["img"],
        "vdp_url": v["url"] if v["url"].startswith("https://") else SITE + v["url"],
    }


def main() -> None:
    snapshot = Path(sys.argv[1])
    out = Path(sys.argv[2])
    data = json.loads(snapshot.read_text(encoding="utf-8"))
    listings = data["listings"]

    kept = [v for v in listings if v["mpg"]]
    dropped = [v for v in listings if not v["mpg"]]
    if not kept:
        raise ValueError(f"{snapshot}: no listing carries fuel economy")

    rows = [to_row(v) for v in kept]
    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(rows)

    print(f"wrote {len(rows)} listings to {out} (captured {data['capturedAt']})")
    for v in dropped:
        print(f"  dropped {v['sku']} {v['yr']} {v['mk']} {v['md']}: no fuel economy published")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"build_listings failed: {e}", file=sys.stderr)
        sys.exit(1)
