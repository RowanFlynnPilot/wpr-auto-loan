// Purchase-time taxes and fees for a financed passenger vehicle
// kept in Marathon County. Update when the DMV schedule changes.
export const WISCONSIN = {
  stateSalesTax: 0.05,
  countySalesTax: 0.005, // Marathon County 0.5%
  titleFee: 214.5,       // effective Oct 1, 2025
  lienFee: 10,           // added when a lender is recorded on the title
  registrationFee: 85,   // annual, passenger auto
  plateFee: 6,
  countyWheelTax: 25,    // Marathon County; City of Wausau has none
} as const;

// Seeds for the per-vehicle fuel line. Combined economy uses the EPA 55/45
// city/highway blend on the feed's own mpg numbers.
export const FUEL = {
  gasPrice: 3.83,      // $/gal regular, Wausau metro average — GasBuddy via WPR's gas-prices tracker, Aug 28 2026
  milesPerMonth: 1100, // ~13,200 mi/yr, FHWA average annual miles per driver
} as const;

// Context, not seeding: Marathon County median household income, ACS 5-year
// 2020-2024 table B19013. Same figure wpr-finance-tools carries (verified:false
// there — editor sign-off before real launch).
export const COUNTY_MEDIAN_HOUSEHOLD_INCOME = 77_884;
