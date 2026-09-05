// Placeholder art for cards without a photo: generic side profiles in line
// art on currentColor, no brand shapes. The keys are the canonical body types
// the feed contract allows — feed/ingest.py BODIES must match this list, so a
// body this component can't draw fails the build, never a reader's page.
const PROFILES: Record<string, { outline: string; pillar: string; wheels: [number, number] }> = {
  Sedan: {
    outline: 'M8 36 L6 29 L12 26 L38 24 L50 15 L76 15 L88 24 L108 27 L114 30 L114 36',
    pillar: 'M62 15 L62 24',
    wheels: [32, 90],
  },
  SUV: {
    outline: 'M8 36 L6 27 L14 22 L36 20 L44 11 L102 11 L106 20 L112 22 L114 36',
    pillar: 'M70 11 L70 20',
    wheels: [32, 92],
  },
  Truck: {
    outline: 'M8 36 L6 28 L12 24 L38 22 L46 12 L68 12 L72 21 L76 21 L76 17 L110 17 L114 24 L114 36',
    pillar: 'M56 12 L56 22',
    wheels: [30, 94],
  },
  Hatchback: {
    outline: 'M8 36 L6 28 L12 25 L36 23 L46 14 L72 14 L94 26 L96 36',
    pillar: 'M60 14 L60 23',
    wheels: [30, 82],
  },
  Wagon: {
    outline: 'M8 36 L6 28 L12 25 L36 23 L46 14 L100 14 L106 26 L114 29 L114 36',
    pillar: 'M64 14 L64 23',
    wheels: [32, 92],
  },
  Coupe: {
    outline: 'M8 36 L6 30 L12 27 L40 25 L56 15 L80 15 L96 25 L110 28 L114 31 L114 36',
    pillar: 'M78 15 L84 24',
    wheels: [32, 90],
  },
  Convertible: {
    outline: 'M8 36 L6 30 L12 27 L40 25 L48 19 L52 25 L100 25 L110 28 L114 31 L114 36',
    pillar: 'M56 25 L56 20',
    wheels: [32, 90],
  },
  Minivan: {
    outline: 'M8 36 L6 27 L12 20 L30 12 L104 12 L110 20 L114 26 L114 36',
    pillar: 'M50 12 L50 24 M80 12 L80 24',
    wheels: [30, 92],
  },
  Van: {
    outline: 'M8 36 L6 26 L10 18 L28 10 L112 10 L114 18 L114 36',
    pillar: 'M40 10 L40 24 M78 10 L78 24',
    wheels: [30, 94],
  },
};

export const BODIES = Object.keys(PROFILES);

export function BodyIcon({ body }: { body: string }) {
  const p = PROFILES[body];
  if (!p) throw new Error(`No body silhouette for "${body}"`);
  return (
    <svg viewBox="0 0 120 48" role="img" aria-label={`${body} silhouette`}>
      <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d={p.outline} />
        <path d={p.pillar} />
        <circle cx={p.wheels[0]} cy={38} r={7} />
        <circle cx={p.wheels[1]} cy={38} r={7} />
      </g>
    </svg>
  );
}
