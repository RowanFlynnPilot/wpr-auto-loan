import { termComparison, type LoanInputs } from '../lib/loan';
import { dollars } from '../lib/format';

interface Props {
  inputs: LoanInputs;
  price: number;
}

export function TermTable({ inputs, price }: Props) {
  const rows = termComparison(price, inputs);
  const shortest = rows[0];
  return (
    <section className="terms">
      <h2>The same {dollars(price)} car, four ways</h2>
      <table>
        <thead>
          <tr>
            <th>Term</th>
            <th>Payment</th>
            <th>Total interest</th>
            <th>Extra vs. {shortest.termMonths} months</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.termMonths} className={r.termMonths === inputs.termMonths ? 'chosen' : ''}>
              <td>{r.termMonths} months</td>
              <td className="num">{dollars(r.payment)}/mo</td>
              <td className="num">{dollars(r.totalInterest)}</td>
              <td className="num">{r === shortest ? '—' : `+${dollars(r.totalInterest - shortest.totalInterest)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">A longer loan lowers the payment and raises what the car costs you.</p>
    </section>
  );
}
