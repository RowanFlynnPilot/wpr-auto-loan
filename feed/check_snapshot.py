"""Check a listing snapshot's URLs before showing the preview built from it.

    python feed/check_snapshot.py feed/brickners_listings.json

A snapshot is not a feed. The dealer sells the car and deletes its photos
while the listing we captured still points at them; the cards fall back to a
silhouette, but a preview full of silhouettes is a stale one. This reports
every photo and vehicle page that no longer answers and exits non-zero when
any is gone — the cue to recapture or retire the preview.

Only 404 and 410 count as gone. Dealer sites commonly sit behind a bot
challenge (Brickner's answers 403 to anything that isn't a browser), so any
other non-200 is printed as "not judged" rather than counted either way.
"""
import concurrent.futures
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

from build_listings import page_url

GONE = {404, 410}
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) wpr-auto-loan snapshot check"}


def status(url: str) -> int | str:
    req = urllib.request.Request(url, method="HEAD", headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:  # DNS, timeout, TLS
        return type(e).__name__


def main() -> int:
    snapshot = Path(sys.argv[1])
    data = json.loads(snapshot.read_text(encoding="utf-8"))
    listings = data["listings"]
    checks = [(v, "photo", v["img"]) for v in listings if v["img"]]
    checks += [(v, "page", page_url(v)) for v in listings]
    with concurrent.futures.ThreadPoolExecutor(8) as pool:
        codes = list(pool.map(lambda c: status(c[2]), checks))

    gone = {"photo": 0, "page": 0}
    unjudged: dict[tuple, int] = {}
    for (v, kind, url), code in zip(checks, codes):
        if code in GONE:
            gone[kind] += 1
            print(f"{kind} gone ({code}): {v['sku']} {v['yr']} {v['mk']} {v['md']} - {url}")
        elif code != 200:
            unjudged[(kind, code)] = unjudged.get((kind, code), 0) + 1
    for (kind, code), n in sorted(unjudged.items(), key=str):
        print(f"{n} {kind} URLs answered {code}: not judged")
    print(f"{len(listings)} listings captured {data['capturedAt']}: "
          f"{gone['photo']} photos gone, {gone['page']} pages gone")
    return 1 if gone["photo"] or gone["page"] else 0


if __name__ == "__main__":
    sys.exit(main())
