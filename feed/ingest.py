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
    if v["price"] <= 0:
        raise ValueError(f"line {line}: non-positive price for stock {v['stock']}")
    if not v["vdpUrl"].startswith("https://"):
        raise ValueError(f"line {line}: vdp_url must be https for stock {v['stock']}")
    return v


def main() -> None:
    feed_path = Path(os.environ["FEED_PATH"])
    with feed_path.open(newline="") as f:
        reader = csv.DictReader(f)
        missing = set(FEED_COLUMNS.values()) - set(reader.fieldnames or [])
        if missing:
            raise KeyError(f"feed is missing columns: {sorted(missing)}")
        vehicles = [parse_row(row, n) for n, row in enumerate(reader, start=2)]
    if not vehicles:
        raise ValueError("feed contained no vehicles")
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
