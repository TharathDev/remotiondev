import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';

type Props = {
	children: React.ReactNode;
	from?: number;
	width?: number | string;
	accent?: string;
	padding?: number;
	title?: string;
};

/** A card that springs in. The shared container for most scene content. */
export const Panel: React.FC<Props> = ({
	children,
	from = 0,
	width,
	accent,
	padding = 34,
	title,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const enter = spring({
		fps,
		frame: frame - from,
		config: {damping: 16, mass: 0.7, stiffness: 110},
	});

	return (
		<div
			style={{
				width,
				background: theme.bgPanel,
				border: `1px solid ${accent ? `${accent}44` : theme.faint}`,
				borderRadius: 22,
				padding,
				opacity: enter,
				transform: `translateY(${interpolate(enter, [0, 1], [48, 0])}px) scale(${interpolate(
					enter,
					[0, 1],
					[0.96, 1],
				)})`,
			}}
		>
			{title ? (
				<div
					style={{
						fontFamily: theme.mono,
						fontSize: 22,
						letterSpacing: 3,
						textTransform: 'uppercase',
						color: accent ?? theme.muted,
						marginBottom: 20,
					}}
				>
					{title}
				</div>
			) : null}
			{children}
		</div>
	);
};
