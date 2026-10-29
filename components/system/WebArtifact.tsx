'use client';

import Image from 'next/image';
import { useEffects } from './EffectsProvider';

type Graphic = 'anarchy' | 'flames' | 'flag' | 'terminal';
type Placement = 'identity-flag' | 'drop-flames' | 'directory-computer' | 'footer-mark';
const SIZE: Record<Graphic, [number, number]> = { anarchy: [58, 58], flames: [600, 82], flag: [75, 50], terminal: [50, 39] };

/** In-flow ornaments share reserved slots. Only the divider animates. */
export default function WebArtifact({ name, placement }: { name: Graphic; placement: Placement }) {
  const { enabled } = useEffects();
  const [width, height] = SIZE[name];
  const src = name === 'flag' ? '/images/old-web/flag-transparent.png' : `/images/old-web/${name}.${enabled && name === 'flames' ? 'gif' : 'png'}`;
  return <span className={`lp-web-artifact lp-web-artifact--${placement}`} data-artifact={placement} aria-hidden="true"><Image unoptimized priority={name === 'flag'} src={src} width={width} height={height} alt="" data-old-web={name} draggable={false} /></span>;
}
