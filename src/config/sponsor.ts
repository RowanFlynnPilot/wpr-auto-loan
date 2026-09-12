// One sponsor per deployment. Swap these when a dealer signs.
export const SPONSOR = {
  name: 'Demo Motors',
  disclosure: 'Sponsored inventory',
  // Lockup art: a logo drawn for white, ~50px tall. null falls back to the
  // name set in the display serif, which is the house fallback.
  logo: null as string | null,
  // Splits at the em-dash: what they offer reads large, where they are sits
  // small beneath it.
  tagline: 'Used cars, trucks and SUVs — Wausau, WI',
  preapprovalUrl: 'https://demo-motors.example/financing/get-preapproved',
  utmSource: 'wausaupilot',
  utmCampaign: 'what-can-i-drive',
} as const;

// Category obligations travel with the sponsor, not with the page. A dealer
// that links to its own financing is a financial-services sponsor; this line
// is the one an attorney signs off before the slot sells.
export const SPONSOR_DISCLAIMER =
  'Financing is offered by the dealer and its lenders, not by Wausau Pilot & Review. ' +
  'Approval, rate and terms depend on credit and are set at the dealership.';

// Sales contact for the placement, shown in the footer of a sponsorable surface.
export const SPONSOR_INQUIRY = 'weber.chris@wausaupilotandreview.com';
