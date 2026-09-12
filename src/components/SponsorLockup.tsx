import { SPONSOR } from '../config/sponsor';
import { preapprovalLink, trackPreapprovalClick } from '../lib/track';

// The house sponsor lockup: a white card marked on its top edge in the accent,
// the sponsor's identity on the left, what they offer in the middle, and the
// one action we're paid to drive on the right.
export function SponsorLockup() {
  const [offer, where] = splitTagline(SPONSOR.tagline);
  return (
    <div className="lockup">
      <div className="lockup-id">
        <p className="lockup-eyebrow">Presented by</p>
        {SPONSOR.logo ? (
          <img src={SPONSOR.logo} alt={SPONSOR.name} height={50} />
        ) : (
          <p className="lockup-name">{SPONSOR.name}</p>
        )}
      </div>

      <div className="lockup-offer">
        <p className="offer">{offer}</p>
        {where && <p className="where">{where}</p>}
      </div>

      <a
        className="preapproval"
        href={preapprovalLink()}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={trackPreapprovalClick}
      >
        Get pre-approved <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

// 'Used cars, trucks and SUVs — Wausau, WI' -> ['Used cars…', 'Wausau, WI']
export function splitTagline(tagline: string): [string, string | null] {
  const at = tagline.indexOf('—');
  if (at === -1) return [tagline.trim(), null];
  return [tagline.slice(0, at).trim(), tagline.slice(at + 1).trim() || null];
}
