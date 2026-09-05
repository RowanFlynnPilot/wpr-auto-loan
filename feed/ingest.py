"""Ingest a dealer inventory CSV into public/inventory.json.

FEED_PATH env var points at the CSV. The feed's column names are mapped
in FEED_COLUMNS; every mapped column must be present and every row must
parse, otherwise this exits non-zero and the build fails.
"""
import csv
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

# our field -> feed column. Edit this line-for-line when a real feed arrives.
FEED_COLUMNS = {
    "stock": "stock_number",
    "vin": "vin",
    "year": "year",
    "make": "make",
    "model": "model",
    "trim": "trim",
    "body": "body_style",
    "price": "selling_price",
    "mileage": "mileage",
    "mpgCity": "city_mpg",
    "mpgHwy": "highway_mpg",
    "drivetrain": "drivetrain",
    "exteriorColor": "exterior_color",
    "features": "features",
    "photoUrl": "photo_url",
    "vdpUrl": "vdp_url",
}
INT_FIELDS = {"year", "price", "mileage", "mpgCity", "mpgHwy"}
FEATURE_SEPARATOR = "|"

# Canonical body types. Must match BODIES in src/components/BodyIcon.tsx —
# the app throws on a body it can't draw, so an unknown one fails here, at
# build time, never on a reader's page.
BODIES = {"Sedan", "SUV", "Truck", "Hatchback", "Wagon", "Coupe", "Convertible", "Minivan", "Van"}
# feed body label -> canonical. Extend line-for-line when a real feed arrives.
BODY_ALIASES = {
    "Sport Utility": "SUV",
    "Sport Utility Vehicle": "SUV",
    "Crossover": "SUV",
    "Pickup": "Truck",
    "Pickup Truck": "Truck",
    "Station Wagon": "Wagon",
    "Mini-van": "Minivan",
    "Mini Van": "Minivan",
    "Cargo Van": "Van",
    "Passenger Van": "Van",
}

OUT = Path(__file__).parent.parent / "public" / "inventory.json"


def parse_row(raw: dict, line: int) -> dict:
    v = {}
    for field, col in FEED_COLUMNS.items():
        value = raw[col].strip()
        if field in INT_FIELDS:
            v[field] = int(float(value))
        elif field == "features":
            v[field] = [f.strip() for f in value.split(FEATURE_SEPARATOR) if f.strip()]
        else:
            v[field] = value
    v["body"] = BODY_ALIASES.get(v["body"], v["body"])
    if v["body"] not in BODIES:
        raise ValueError(f"line {line}: unknown body {raw[FEED_COLUMNS['body']]!r} for stock {v['stock']}; add it to BODY_ALIASES")
    if v["price"] <= 0:
        raise ValueError(f"line {line}: non-positive price for stock {v['stock']}")
    # The fuel line divides by mpg. EVs need MPGe handling before they can ship.
    if v["mpgCity"] <= 0 or v["mpgHwy"] <= 0:
        raise ValueError(f"line {line}: mpg must be positive for stock {v['stock']}")
    if not is_https(v["vdpUrl"]):
        raise ValueError(f"line {line}: vdp_url must be an https URL for stock {v['stock']}")
    # An http photo is mixed content on the https embed: a broken image, silently.
    if v["photoUrl"] and not is_https(v["photoUrl"]):
        raise ValueError(f"line {line}: photo_url must be https or empty for stock {v['stock']}")
    return v


def is_https(url: str) -> bool:
    parts = urlsplit(url)
    return parts.scheme == "https" and bool(parts.netloc)


def load_feed(feed_path: Path) -> list:
    with feed_path.open(newline="") as f:
        reader = csv.DictReader(f)
        missing = set(FEED_COLUMNS.values()) - set(reader.fieldnames or [])
        if missing:
            raise KeyError(f"feed is missing columns: {sorted(missing)}")
        vehicles = [parse_row(row, n) for n, row in enumerate(reader, start=2)]
    if not vehicles:
        raise ValueError("feed contained no vehicles")
    seen = set()
    for v in vehicles:
        if v["stock"] in seen:
            raise ValueError(f"duplicate stock number {v['stock']}")
        seen.add(v["stock"])
    return vehicles


def main() -> None:
    vehicles = load_feed(Path(os.environ["FEED_PATH"]))
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps({
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "vehicles": vehicles,
    }, indent=1))
    print(f"wrote {len(vehicles)} vehicles to {OUT}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # surface the reason, then fail the build
        print(f"ingest failed: {e}", file=sys.stderr)
        sys.exit(1)
