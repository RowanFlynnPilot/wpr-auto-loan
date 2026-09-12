import { useState } from 'react';
import { PITCH, SPONSOR, SPONSOR_DISCLAIMER, SPONSOR_INQUIRY } from '../config/sponsor';
import { Methodology } from './Methodology';

const SUBJECT = encodeURIComponent('Sponsoring "What can I drive?"');

// A desktop with no mail handler does nothing when a mailto: is clicked and the
// reader concludes the link is broken, so the address is copied too.
function AdvertiseLink() {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <a
        href={`mailto:${SPONSOR_INQUIRY}?subject=${SUBJECT}`}
        onClick={() => {
          navigator.clipboard?.writeText(SPONSOR_INQUIRY).then(
            () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 3000);
            },
            () => undefined,
          );
        }}
      >
        Advertise on this tool
      </a>
      {copied && <span className="copied"> ✓ Address copied</span>}
    </>
  );
}

// The footer is where a reader decides whether to trust the numbers, so it
// carries provenance, what we are not, the sponsor's category obligations and
// how to reach the newsroom — not one compressed gray line.
export function Colophon() {
  return (
    <footer className="colophon">
      <img src={`${import.meta.env.BASE_URL}wpr-typewriter-badge.png`} alt="" width={44} height={44} />
      <div>
        <p>
          Estimates only. Your rate, fees and trade-in value are set by the lender and dealer at
          purchase. Not financial advice.
        </p>
        <p>
          {PITCH ? (
            <>
              The vehicles in this preview are sample data, not {PITCH.prospect}'s inventory. In the
              live tool the list comes from the dealer's own feed and is rebuilt daily, and the prices
              are theirs.
            </>
          ) : (
            <>
              Inventory comes from {SPONSOR.name}'s own listing feed and is rebuilt daily; the prices
              are theirs.
            </>
          )}{' '}
          Every other number here — the ceiling, each monthly payment, Wisconsin tax and fees, fuel —
          is calculated by Wausau Pilot &amp; Review.
        </p>
        <p>
          Wausau Pilot &amp; Review is not a lender, a dealer or a broker, and earns nothing from a
          sale. {SPONSOR_DISCLAIMER}
        </p>
        <p>
          <b>Wausau Pilot &amp; Review</b> · <a href="tel:+17153015539">715-301-5539</a> ·{' '}
          <AdvertiseLink />
        </p>
        <Methodology />
      </div>
    </footer>
  );
}
