import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';

type Props = {
	count?: number;
	/** How far the field drifts across the whole scene, in pixels. */
	drift?: number;
	seed?: string;
};

/**
 * A parallax dust field. Positions come from `random()` with a fixed seed, so
 * every render produces the identical field — `Math.random()` is forbidden here.
 */
export const StarField: React.FC<Props> = ({count = 70, drift = 90, seed = 'dust'}) => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();

	const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill>
			{new Array(count).fill(true).map((_, i) => {
				const depth = random(`${seed}-depth-${i}`); // 0 = far, 1 = near
				const size = 1 + depth * 3;
				const x = random(`${seed}-x-${i}`) * width;
				const y = random(`${seed}-y-${i}`) * height;
				const twinkle =
					0.25 + 0.75 * Math.abs(Math.sin(frame * 0.04 + random(`${seed}-phase-${i}`) * Math.PI * 2));

				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: size,
							height: size,
							borderRadius: '50%',
							background: depth > 0.85 ? theme.accent : theme.ink,
							opacity: (0.08 + depth * 0.3) * twinkle,
							transform: `translate(${-progress * drift * depth}px, ${progress * drift * depth * 0.3}px)`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
