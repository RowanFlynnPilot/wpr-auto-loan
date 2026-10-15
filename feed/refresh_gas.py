"""Refresh FUEL.gasPrice, FUEL.dieselPrice and FUEL.gasAsOf in
src/config/wisconsin.ts from the WPR gas-prices tracker's published JSON
(Wausau metro averages, GasBuddy).

    python feed/refresh_gas.py

Run by hand when the seed drifts, or by the weekly fuel-refresh workflow,
then commit. Deliberately not part of the build, which stays network-free; a
missing or malformed feed fails loudly. The last line printed is a one-line
summary the workflow uses as its commit message.
"""
import json
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

URL = "https://rowanflynnpilot.github.io/wpr-gas-prices/gas_prices.json"
CONFIG = Path(__file__).parent.parent / "src" / "config" / "wisconsin.ts"
FIELDS = {
    "gasPrice": ("regular", re.compile(r"gasPrice: [\d.]+,")),
    "dieselPrice": ("diesel", re.compile(r"dieselPrice: [\d.]+,")),
}
AS_OF = re.compile(r"gasAsOf: '[^']*',")


def main() -> None:
    with urllib.request.urlopen(URL, timeout=20) as r:
        data = json.load(r)
    wausau = data["metros"]["Wausau"]["current_avg"]
    d = datetime.strptime(data["price_date"], "%m/%d/%y")
    stamp = f"{d:%b} {d.day} {d.year}"
    src = CONFIG.read_text(encoding="utf-8")
    prices = {}
    for field, (grade, pattern) in FIELDS.items():
        price = round(float(wausau[grade]), 2)
        if not 1 < price < 12:
            raise ValueError(f"implausible Wausau {grade} price {price}")
        src, n = pattern.subn(f"{field}: {price:.2f},", src)
        if n != 1:
            raise ValueError(f"expected one {field} in {CONFIG}, found {n}")
        prices[grade] = price
    src, n = AS_OF.subn(f"gasAsOf: '{stamp}',", src)
    if n != 1:
        raise ValueError(f"expected one gasAsOf in {CONFIG}, found {n}")
    CONFIG.write_text(src, encoding="utf-8")
    print(f"regular ${prices['regular']:.2f}, diesel ${prices['diesel']:.2f} as of {stamp}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"refresh failed: {e}", file=sys.stderr)
        sys.exit(1)
