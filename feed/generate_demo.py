"""Generate a synthetic dealer inventory feed for the sales demo.

Column names mirror a typical HomeNet / vAuto export so swapping in a
real feed is a column-mapping change in ingest.py, not a rebuild.
"""
import csv
import random
from pathlib import Path

SEED = 2026
COUNT = 40
OUT = Path(__file__).parent / "demo.csv"

# make, model, trim, body, drivetrain, mpg city, mpg hwy, new-ish price
CATALOG = [
    ("Toyota", "Corolla", "LE", "Sedan", "FWD", 32, 41, 24000),
    ("Toyota", "Camry", "SE", "Sedan", "FWD", 28, 39, 29500),
    ("Toyota", "RAV4", "XLE", "SUV", "AWD", 27, 34, 33500),
    ("Toyota", "Highlander", "XLE", "SUV", "AWD", 21, 28, 44000),
    ("Toyota", "Tacoma", "SR5", "Truck", "4WD", 19, 24, 40500),
    ("Honda", "Civic", "Sport", "Sedan", "FWD", 30, 37, 26000),
    ("Honda", "CR-V", "EX", "SUV", "AWD", 27, 32, 34500),
    ("Honda", "Pilot", "EX-L", "SUV", "AWD", 19, 26, 45000),
    ("Ford", "Escape", "SE", "SUV", "AWD", 26, 31, 31000),
    ("Ford", "Bronco Sport", "Big Bend", "SUV", "4WD", 25, 28, 33000),
    ("Ford", "Explorer", "XLT", "SUV", "4WD", 20, 27, 43000),
    ("Ford", "Maverick", "XLT", "Truck", "AWD", 22, 29, 30000),
    ("Ford", "F-150", "XLT", "Truck", "4WD", 19, 24, 52000),
    ("Chevrolet", "Trax", "LT", "SUV", "FWD", 28, 32, 24500),
    ("Chevrolet", "Equinox", "LT", "SUV", "AWD", 24, 30, 31500),
    ("Chevrolet", "Traverse", "LT", "SUV", "AWD", 19, 24, 42000),
    ("Chevrolet", "Silverado 1500", "LT", "Truck", "4WD", 17, 21, 53000),
    ("GMC", "Terrain", "SLE", "SUV", "AWD", 24, 29, 33000),
    ("GMC", "Sierra 1500", "Elevation", "Truck", "4WD", 17, 21, 55000),
    ("Ram", "1500", "Big Horn", "Truck", "4WD", 18, 23, 51000),
    ("Jeep", "Compass", "Latitude", "SUV", "4WD", 24, 32, 30000),
    ("Jeep", "Grand Cherokee", "Laredo", "SUV", "4WD", 19, 26, 42500),
    ("Jeep", "Wrangler", "Sport S", "SUV", "4WD", 20, 24, 40000),
    ("Subaru", "Impreza", "Base", "Hatchback", "AWD", 27, 34, 24500),
    ("Subaru", "Crosstrek", "Premium", "SUV", "AWD", 27, 34, 28500),
    ("Subaru", "Forester", "Premium", "SUV", "AWD", 26, 33, 32500),
    ("Subaru", "Outback", "Premium", "Wagon", "AWD", 26, 32, 34000),
    ("Hyundai", "Elantra", "SEL", "Sedan", "FWD", 32, 41, 23500),
    ("Hyundai", "Tucson", "SEL", "SUV", "AWD", 24, 30, 31000),
    ("Hyundai", "Santa Fe", "SEL", "SUV", "AWD", 20, 28, 37000),
    ("Kia", "Forte", "LXS", "Sedan", "FWD", 30, 41, 22000),
    ("Kia", "Sportage", "LX", "SUV", "AWD", 23, 28, 30000),
    ("Kia", "Telluride", "S", "SUV", "AWD", 18, 24, 41000),
    ("Nissan", "Rogue", "SV", "SUV", "AWD", 28, 35, 32000),
    ("Mazda", "CX-5", "Preferred", "SUV", "AWD", 24, 30, 32500),
    ("Mazda", "Mazda3", "Preferred", "Hatchback", "FWD", 26, 33, 27000),
]

COLORS = ["Magnetic Gray", "Super White", "Midnight Black", "Celestial Silver",
          "Ruby Flare", "Cavalry Blue", "Lunar Rock", "Oxford White", "Sandstone"]

FEATURES = ["Heated seats", "Remote start", "Apple CarPlay", "Android Auto",
            "Backup camera", "Blind-spot monitor", "Adaptive cruise", "Sunroof",
            "Tow package", "Heated steering wheel", "One owner", "Clean title"]

VIN_CHARS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"


def main() -> None:
    rng = random.Random(SEED)
    lot = CATALOG * (COUNT // len(CATALOG) + 1)
    rng.shuffle(lot)
    rows = []
    for n in range(COUNT):
        make, model, trim, body, drive, city, hwy, base = lot[n]
        year = rng.randint(2018, 2025)
        age = 2026 - year
        mileage = int(rng.uniform(8_000, 14_000) * age + rng.uniform(0, 6_000))
        price = round(base * (0.87 ** age) * rng.uniform(0.92, 1.06), -2)
        stock = f"DM{4100 + n}"
        vin = "".join(rng.choice(VIN_CHARS) for _ in range(17))
        features = "|".join(rng.sample(FEATURES, rng.randint(3, 6)))
        rows.append({
            "stock_number": stock,
            "vin": vin,
            "year": year,
            "make": make,
            "model": model,
            "trim": trim,
            "body_style": body,
            "selling_price": int(price),
            "mileage": mileage,
            "city_mpg": city,
            "highway_mpg": hwy,
            "drivetrain": drive,
            "exterior_color": rng.choice(COLORS),
            "features": features,
            "photo_url": "",
            "vdp_url": f"https://demo-motors.example/inventory/{stock}",
        })
    with OUT.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"wrote {len(rows)} vehicles to {OUT}")


if __name__ == "__main__":
    main()
