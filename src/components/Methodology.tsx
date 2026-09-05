import { SPONSOR } from '../config/sponsor';
import { COUNTY_MEDIAN_HOUSEHOLD_INCOME, FUEL, WISCONSIN } from '../config/wisconsin';
import { cents, count, dollars, percent } from '../lib/format';
import { purchaseFees } from '../lib/loan';

// Every number the tool assumes, with its source, read from the same config
// the math uses — so this disclosure can never disagree with the computation.
export function Methodology() {
  const w = WISCONSIN;
  return (
    <details className="method">
      <summary>How we figure this</summary>
      <ul>
        <li>
          <b>Your ceiling.</b> Your share of income is the payment; we back-solve the sticker price whose
          financed amount lands on it. Ten percent of gross income is a common guideline for the payment
          alone.
        </li>
        <li>
          <b>Wisconsin sales tax.</b> {percent(w.stateSalesTax)} state plus {percent(w.countySalesTax)}{' '}
          Marathon County. A trade-in's full value is credited against the taxable price.
        </li>
        <li>
          <b>Fees.</b> Title {cents(w.titleFee)} (effective Oct 1, 2025), lien {cents(w.lienFee)}, registration{' '}
          {cents(w.registrationFee)}, plate {cents(w.plateFee)}, Marathon County wheel tax{' '}
          {cents(w.countyWheelTax)} — {cents(purchaseFees())} in all. The City of Wausau has no wheel tax.
        </li>
        <li>
          <b>Payments.</b> Standard amortization at the APR you enter, computed by us for every vehicle —
          never the dealer's number.
        </li>
        <li>
          <b>Gas.</b> {count(FUEL.milesPerMonth)} miles a month (the FHWA average) at ${FUEL.gasPrice.toFixed(2)}
          /gal, the Wausau metro regular average reported by GasBuddy as of {FUEL.gasAsOf}. Combined economy
          is the EPA 55/45 city/highway blend of each vehicle's rated mpg.
        </li>
        <li>
          <b>County income.</b> Median Marathon County household income of{' '}
          {dollars(COUNTY_MEDIAN_HOUSEHOLD_INCOME)}/yr, U.S. Census Bureau ACS 2020–2024 five-year estimate,
          table B19013.
        </li>
        <li>
          <b>Inventory.</b> From {SPONSOR.name}'s listing feed. The prices are theirs; every other number is
          ours.
        </li>
      </ul>
    </details>
  );
}
