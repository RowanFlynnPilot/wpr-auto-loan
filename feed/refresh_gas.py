"""Refresh FUEL.gasPrice and FUEL.gasAsOf in src/config/wisconsin.ts from the
WPR gas-prices tracker's published JSON (Wausau metro regular average, GasBuddy).

    python feed/refresh_gas.py

Run by hand when the seed drifts, then commit. Deliberately not part of the
build, which stays network-free; a missing or malformed feed fails loudly.
"""
import json
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

URL = "https://rowanflynnpilot.github.io/wpr-gas-prices/gas_prices.json"
CONFIG = Path(__file__).parent.parent / "src" / "config" / "wisconsin.ts"
PRICE = re.compile(r"gasPrice: [\d.]+,")
AS_OF = re.compile(r"gasAsOf: '[^']*',")


def main() -> None:
    with urllib.request.urlopen(URL, timeout=20) as r:
        data = json.load(r)
    price = round(float(data["metros"]["Wausau"]["current_avg"]["regular"]), 2)
    if not 1 < price < 10:
        raise ValueError(f"implausible Wausau regular price {price}")
    d = datetime.strptime(data["price_date"], "%m/%d/%y")
    stamp = f"{d:%b} {d.day} {d.year}"
    src = CONFIG.read_text(encoding="utf-8")
    new, n1 = PRICE.subn(f"gasPrice: {price:.2f},", src)
    new, n2 = AS_OF.subn(f"gasAsOf: '{stamp}',", new)
    if (n1, n2) != (1, 1):
        raise ValueError(f"expected one gasPrice and one gasAsOf in {CONFIG}, found {n1} and {n2}")
    CONFIG.write_text(new, encoding="utf-8")
    print(f"gasPrice -> {price:.2f} ({stamp})")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"refresh failed: {e}", file=sys.stderr)
        sys.exit(1)
