import { useState } from 'react';
import type { Vehicle } from '../types';
import { BodyIcon } from './BodyIcon';

interface Props {
  vehicle: Vehicle;
  width: number;
  height: number;
  loading?: 'lazy' | 'eager';
}

// A vehicle's photo, or its body silhouette when there is none — including
// when the dealer's CDN has since dropped it. Listings outlive their photos:
// a sold car's image is deleted while a snapshot still names it, and a
// broken-image icon on a sponsor's card is the one thing worse than no photo.
// Key this by stock where one instance shows many vehicles, so a failed
// photo doesn't blank the next.
export function Photo({ vehicle: v, width, height, loading }: Props) {
  const [failed, setFailed] = useState(false);
  if (v.photoUrl === '' || failed) {
    return (
      <div className="photo-blank" aria-hidden="true">
        <BodyIcon body={v.body} />
        <span>{v.make}</span>
      </div>
    );
  }
  return (
    <img
      src={v.photoUrl}
      alt={`${v.year} ${v.make} ${v.model}`}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onError={() => {
        console.error(`Photo did not load for ${v.stock}: ${v.photoUrl}`);
        setFailed(true);
      }}
    />
  );
}
