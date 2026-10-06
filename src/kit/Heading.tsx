import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';

/** The scene headline. Every scene in the series opens with one. */
export const Heading: React.FC<{children: React.ReactNode; size?: number}> = ({
	children,
	size = 52,
}) => {
	const frame = useCurrentFrame();
	const enter = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				opacity: enter,
				transform: `translateY(${interpolate(enter, [0, 1], [-14, 0])}px)`,
				fontFamily: theme.font,
				fontSize: size,
				fontWeight: 800,
				color: theme.ink,
				letterSpacing: -1,
				textAlign: 'center',
				maxWidth: 1480,
			}}
		>
			{children}
		</div>
	);
};
