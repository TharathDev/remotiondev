import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';

type Props = {
	label: string;
	sub?: string;
	/** Frame this box springs in on. */
	from?: number;
	/** While the frame is inside this window the box is lit as the active stage. */
	active?: [number, number];
	accent?: string;
	width?: number;
};

/** One box in a pipeline diagram: client, parser, planner, executor, storage. */
export const Stage: React.FC<Props> = ({
	label,
	sub,
	from = 0,
	active,
	accent = theme.accent,
	width = 230,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const enter = spring({
		fps,
		frame: frame - from,
		config: {damping: 16, mass: 0.6, stiffness: 120},
	});

	const lit = active
		? interpolate(frame, [active[0] - 4, active[0] + 4, active[1] - 4, active[1] + 6], [0, 1, 1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})
		: 0;

	return (
		<div
			style={{
				width,
				padding: '26px 22px',
				borderRadius: 18,
				background: lit > 0 ? `${accent}1A` : theme.bgLift,
				border: `1px solid ${lit > 0 ? accent : theme.faint}`,
				boxShadow: lit > 0 ? `0 0 ${34 * lit}px ${accent}44` : undefined,
				textAlign: 'center',
				opacity: enter,
				transform: `translateY(${interpolate(enter, [0, 1], [34, 0])}px) scale(${
					1 + 0.04 * lit
				})`,
				flexShrink: 0,
			}}
		>
			<div
				style={{
					fontFamily: theme.font,
					fontSize: 27,
					fontWeight: 700,
					color: lit > 0 ? accent : theme.ink,
					letterSpacing: -0.3,
				}}
			>
				{label}
			</div>
			{sub ? (
				<div
					style={{
						fontFamily: theme.mono,
						fontSize: 17,
						color: theme.muted,
						marginTop: 8,
						letterSpacing: 0.5,
					}}
				>
					{sub}
				</div>
			) : null}
		</div>
	);
};
