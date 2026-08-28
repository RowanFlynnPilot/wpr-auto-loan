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
