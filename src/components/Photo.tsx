import { useState } from 'react';
import type { Vehicle } from '../types';
import { BodyIcon } from './BodyIcon';

interface Props {
  vehicle: Vehicle;
  width: number;
  height: number;
  loading?: 'lazy' | 'eager';
}

// A vehicle's photo over a cream ground that carries its body silhouette, so
// a lazy photo arriving reads as a reveal rather than a white box filling
// in. No photo at all, or one the dealer's CDN has since dropped (listings
// outlive their photos: a sold car's image is deleted while a snapshot still
// names it), is the same ground with the silhouette drawn full — never a
// broken-image icon on a sponsor's card. Key this by stock where one
// instance shows many vehicles, so one vehicle's state doesn't bleed into
// the next.
export function Photo({ vehicle: v, width, height, loading }: Props) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const blank = v.photoUrl === '' || state === 'failed';
  if (blank) {
    return (
      <div className="photo photo-blank" aria-hidden="true">
        <BodyIcon body={v.body} />
        <span>{v.make}</span>
      </div>
    );
  }
  return (
    <div className={`photo ${state}`}>
      <BodyIcon body={v.body} />
      <img
        src={v.photoUrl}
        alt={`${v.year} ${v.make} ${v.model}`}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        // A cached photo can be complete before the load listener is attached.
        ref={(el) => {
          if (el !== null && el.complete && el.naturalWidth > 0) setState('loaded');
        }}
        onLoad={() => setState('loaded')}
        onError={() => {
          console.error(`Photo did not load for ${v.stock}: ${v.photoUrl}`);
          setState('failed');
        }}
      />
    </div>
  );
}
