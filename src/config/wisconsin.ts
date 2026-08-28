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
