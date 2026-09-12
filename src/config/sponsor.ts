export interface Sponsor {
  name: string;
  disclosure: string;
  /** Logo drawn for white, ~50px tall. null falls back to the name in Fraunces. */
  logo: string | null;
  /** Splits at the em-dash: what they offer large, where they are small beneath. */
  tagline: string;
  preapprovalUrl: string;
  /** Set when we have no per-vehicle URLs: every card links to their lot instead. */
  inventoryUrl: string | null;
  utmSource: string;
  utmCampaign: string;
}

// The signed sponsor for this deployment. Swap these when a dealer signs.
const SPONSORED: Sponsor = {
  name: 'Demo Motors',
  disclosure: 'Sponsored inventory',
  logo: null,
  tagline: 'Used cars, trucks and SUVs — Wausau, WI',
  preapprovalUrl: 'https://demo-motors.example/financing/get-preapproved',
  inventoryUrl: null,
  utmSource: 'wausaupilot',
  utmCampaign: 'what-can-i-drive',
};

export interface Pitch {
  /** Who this preview was prepared for, named on the ribbon. */
  prospect: string;
  /** Built by feed/generate_demo.py from this prospect's own franchise mix. */
  inventoryFile: string;
  sponsor: Sponsor;
}

// Pitch previews put a prospect's own name on the live tool for a sales call.
// A preview is never the default: a reader with no parameter never sees one,
// and the ribbon says on its face that it is a proposal, not a sponsorship,
// and that the vehicles are sample data rather than the dealer's real lot.
const PITCHES: Record<string, Pitch> = {
  brickners: {
    prospect: "Brickner's of Wausau",
    inventoryFile: 'inventory.brickners.json',
    sponsor: {
      name: "Brickner's of Wausau",
      disclosure: 'Sponsored inventory',
      logo: null,
      tagline: 'Chrysler, Dodge, Jeep, Ram and FIAT — 2525 Grand Ave, Wausau',
      preapprovalUrl: 'https://www.bricknersofwausau.net/finance-application/',
      inventoryUrl: 'https://www.bricknersofwausau.net/search/used-wausau-wi/?cy=54403&tp=used',
      utmSource: 'wausaupilot',
      utmCampaign: 'what-can-i-drive',
    },
  },
};

export function resolvePitch(search: string): Pitch | null {
  const key = new URLSearchParams(search).get('pitch');
  if (key === null) return null;
  const pitch = PITCHES[key];
  if (pitch === undefined) {
    console.error(`No pitch preview named "${key}"; showing the live sponsor.`);
    return null;
  }
  return pitch;
}

export const PITCH = typeof window === 'undefined' ? null : resolvePitch(window.location.search);
export const SPONSOR: Sponsor = PITCH?.sponsor ?? SPONSORED;

// Category obligations travel with the sponsor, not with the page. A dealer
// that links to its own financing is a financial-services sponsor; this line
// is the one an attorney signs off before the slot sells.
export const SPONSOR_DISCLAIMER =
  'Financing is offered by the dealer and its lenders, not by Wausau Pilot & Review. ' +
  'Approval, rate and terms depend on credit and are set at the dealership.';

// Sales contact for the placement, shown in the footer of a sponsorable surface.
export const SPONSOR_INQUIRY = 'weber.chris@wausaupilotandreview.com';
