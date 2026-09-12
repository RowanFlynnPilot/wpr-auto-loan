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
        Review, not a live sponsorship. The vehicles below are {PITCH.prospect}&rsquo;s own published
        listings as of {PITCH.listingsAsOf} — a snapshot, not a live feed. Prices and availability
        change; confirm with the dealer.
      </p>
      <a href={`mailto:${SPONSOR_INQUIRY}?subject=${SUBJECT}`}>Talk to us about this placement</a>
    </aside>
  );
}
