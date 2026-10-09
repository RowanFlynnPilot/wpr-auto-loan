"""Turn a captured dealer-listing snapshot into a feed CSV.

    python feed/build_listings.py feed/brickners_listings.json feed/brickners.csv

Used for interim pitch previews, where we have a prospect's real public
listings but no feed access yet. The output goes through ingest.py like any
other feed, so the same contract applies and a bad row still fails the build.

What the snapshot cannot give us, and what we do about it. Nothing is
papered over: a listing that would need an invented number is dropped and
named at build time instead.

* Dealer listings publish one combined MPG, not the city/highway pair a feed
  carries. Writing the combined figure into both columns is exact — the EPA
  55/45 blend of x and x is x — and the card labels it "combined".
* Some rows have no fuel economy, some no published price ("call"), and an
  electric vehicle's figure is MPGe, which the gas line cannot use. Those
  are dropped, each with its reason printed.
* Body style is the dealer's own facet label (`bd`), mapped below onto the
  feed's canonical bodies. An unknown label fails here, not on a reader's page.
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

# The dealer's body-style facets, as their site labels them. Checked against
# the vehicles under each label at the Oct 2026 capture: every "Passenger Van"
# is a Pacifica, Voyager or Grand Caravan; the one "4 DOOR WAGON" is a Jeep
# Renegade and the one "4-DOOR" a Wrangler. Re-check those two on recapture.
BODIES = {
    "Sport Utility": "SUV",
    "SUV": "SUV",
    "4 DOOR WAGON": "SUV",
    "4-DOOR": "SUV",
    "Sedan": "Sedan",
    "Coupe": "Coupe",
    "Wagon": "Wagon",
    "Passenger Van": "Minivan",
    "Cargo Van": "Van",
    "Crew Cab": "Truck",
    "Double Cab": "Truck",
    "Extended Cab": "Truck",
    "Mega Cab": "Truck",
    "Quad Cab": "Truck",
    "Regular Cab": "Truck",
    "Supercrew": "Truck",
    "4 Door Cab; Crew; Short Bed": "Truck",
}


def page_url(v: dict) -> str:
    return v["url"] if v["url"].startswith("https://") else SITE + v["url"]


def body(v: dict) -> str:
    try:
        return BODIES[v["bd"]]
    except KeyError:
        raise ValueError(f"unknown body label {v['bd']!r} on {v['sku']}; add it to BODIES") from None


def reason_to_drop(v: dict) -> str | None:
    if not v["px"]:
        return "no published price"
    if v.get("fuel") == "Electric":
        return "electric; the gas line needs MPGe handling first"
    if not v["mpg"]:
        return "no fuel economy published"
    return None


def to_row(v: dict) -> dict:
    mpg = v["mpg"]
    return {
        "stock_number": v["sku"],
        "vin": v["vin"],
        "year": v["yr"],
        "make": v["mk"],
        "model": v["md"],
        "trim": v["tr"],
        "body_style": body(v),
        "selling_price": v["px"],
        "mileage": v["mi"],
        # Same value in both columns: the combined figure the dealer published.
        "city_mpg": mpg,
        "highway_mpg": mpg,
        "drivetrain": v["dr"],
        "exterior_color": v["col"],
        "features": "|".join(v["ft"]),
        "photo_url": v["img"],
        "vdp_url": page_url(v),
    }


def main() -> None:
    snapshot = Path(sys.argv[1])
    out = Path(sys.argv[2])
    data = json.loads(snapshot.read_text(encoding="utf-8"))
    listings = data["listings"]

    kept, dropped = [], []
    for v in listings:
        why = reason_to_drop(v)
        (dropped if why else kept).append((v, why))
    if not kept:
        raise ValueError(f"{snapshot}: no listing can be shown")

    rows = [to_row(v) for v, _ in kept]
    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(rows)

    print(f"wrote {len(rows)} of {len(listings)} listings to {out} (captured {data['capturedAt']})")
    for v, why in dropped:
        print(f"  dropped {v['sku']} {v['yr']} {v['mk']} {v['md']}: {why}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"build_listings failed: {e}", file=sys.stderr)
        sys.exit(1)
