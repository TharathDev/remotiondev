import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';

const TILE = 512;

/**
 * Film grain, as a pre-baked noise tile scrolled a prime number of pixels every
 * other frame. It shimmers like real grain and is deterministic, because the
 * offset is derived from the frame number.
 *
 * The obvious implementation — an SVG feTurbulence over the whole frame — looks
 * no better and cost roughly 75% of this project's total render time, so it is
 * not worth it.
 */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
	const frame = useCurrentFrame();
	const step = Math.floor(frame / 2);
	const x = (step * 137) % TILE;
	const y = (step * 219) % TILE;

	return (
		<AbsoluteFill
			style={{
				opacity,
				mixBlendMode: 'overlay',
				backgroundImage: `url(${staticFile('grain.png')})`,
				backgroundRepeat: 'repeat',
				backgroundPosition: `${x}px ${y}px`,
			}}
		/>
	);
};
