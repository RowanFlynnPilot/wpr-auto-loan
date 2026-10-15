// What a vehicle burns. Set by ingest from the feed's own label; the fuel
// line prices each one at its own rate.
export type Fuel = 'Gasoline' | 'Diesel' | 'Hybrid' | 'Plug-in hybrid' | 'Electric';

export interface Vehicle {
  stock: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  body: string;
  price: number;
  mileage: number;
  fuel: Fuel;
  /** For an electric, MPGe. */
  mpgCity: number;
  mpgHwy: number;
  drivetrain: string;
  exteriorColor: string;
  features: string[];
  photoUrl: string;
  vdpUrl: string;
}

export interface Inventory {
  generatedAt: string;
  vehicles: Vehicle[];
}
