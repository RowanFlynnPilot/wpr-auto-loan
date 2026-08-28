import { extraPayment, termComparison, type LoanInputs } from '../lib/loan';
import { dollars } from '../lib/format';

interface Props {
  inputs: LoanInputs;
  price: number;
  onSelectTerm: (termMonths: number) => void;
}

export function TermTable({ inputs, price, onSelectTerm }: Props) {
  const rows = termComparison(price, inputs);
  const shortest = rows[0];
  const boost = extraPayment(price, inputs, 25);
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
            <tr
              key={r.termMonths}
              className={r.termMonths === inputs.termMonths ? 'chosen' : ''}
              tabIndex={0}
              aria-selected={r.termMonths === inputs.termMonths}
              onClick={() => onSelectTerm(r.termMonths)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTerm(r.termMonths);
                }
              }}
            >
              <td>{r.termMonths} months</td>
              <td className="num">{dollars(r.payment)}/mo</td>
              <td className="num">{dollars(r.totalInterest)}</td>
              <td className="num">{r === shortest ? '—' : `+${dollars(r.totalInterest - shortest.totalInterest)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">
        A longer loan lowers the payment and raises what the car costs you.
        {boost && Math.round(boost.monthsSaved) >= 1 && (
          <>
            {' '}Round the other way — $25 extra a month on the {inputs.termMonths}-month loan pays it
            off about {Math.round(boost.monthsSaved)} {Math.round(boost.monthsSaved) === 1 ? 'month' : 'months'} early
            and saves about {dollars(boost.interestSaved)} in interest.
          </>
        )}
      </p>
    </section>
  );
}
