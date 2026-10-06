import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';

/**
 * Film grain. The noise is reseeded every other frame so it shimmers, but the
 * seed is derived from the frame number, which keeps the render deterministic.
 */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
	const frame = useCurrentFrame();
	const seed = Math.floor(frame / 2);
	const baseFrequency = 0.75 + random(`grain-${seed}`) * 0.08;
	const filterId = `grain-filter-${seed}`;

	return (
		<AbsoluteFill style={{opacity, mixBlendMode: 'overlay'}}>
			<svg width="100%" height="100%">
				<filter id={filterId}>
					<feTurbulence
						type="fractalNoise"
						baseFrequency={baseFrequency}
						numOctaves={3}
						seed={seed}
					/>
				</filter>
				<rect width="100%" height="100%" filter={`url(#${filterId})`} />
			</svg>
		</AbsoluteFill>
	);
};
