import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

/** A faint technical grid. Drifts very slowly so the ground is never dead. */
export const Grid: React.FC<{size?: number; opacity?: number}> = ({size = 64, opacity = 0.035}) => {
	const frame = useCurrentFrame();
	const shift = interpolate(frame, [0, 900], [0, size], {extrapolateRight: 'extend'}) % size;

	return (
		<AbsoluteFill
			style={{
				opacity,
				backgroundImage: `linear-gradient(rgba(245,243,239,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,243,239,1) 1px, transparent 1px)`,
				backgroundSize: `${size}px ${size}px`,
				backgroundPosition: `${shift}px ${shift}px`,
			}}
		/>
	);
};
