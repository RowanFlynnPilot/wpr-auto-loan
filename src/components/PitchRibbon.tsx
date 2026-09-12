import { PITCH, SPONSOR_INQUIRY } from '../config/sponsor';

const SUBJECT = encodeURIComponent('"What can I drive?" — sponsorship');

// A forwarded preview link has to explain itself before anything else on the
// page does: who it was prepared for, that it is a proposal rather than a live
// sponsorship, and that the lot below is sample data.
export function PitchRibbon() {
  if (PITCH === null) return null;
  return (
    <aside className="pitch">
      <p>
        <b>Preview prepared for {PITCH.prospect}.</b> This is a proposal from Wausau Pilot &amp;
        Review, not a live sponsorship. The vehicles below are sample data — not {PITCH.prospect}
        &rsquo;s inventory, and not their prices.
      </p>
      <a href={`mailto:${SPONSOR_INQUIRY}?subject=${SUBJECT}`}>Talk to us about this placement</a>
    </aside>
  );
}
