import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {accent as accentPulse} from './motion';

type Props = {
	children: React.ReactNode;
	from?: number;
	accent?: string;
	size?: number;
	label?: string;
};

/** A one-line annotation with a leading accent rule. */
export const Callout: React.FC<Props> = ({
	children,
	from = 0,
	accent = theme.accent,
	size = 34,
	label,
}) => {
	const frame = useCurrentFrame();
	const enter = interpolate(frame, [from, from + 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'flex-start',
				gap: 18,
				opacity: enter,
				transform: `translateX(${
					interpolate(enter, [0, 1], [-20, 0]) + accentPulse(frame, from, 6)
				}px)`,
			}}
		>
			<div style={{width: 3, alignSelf: 'stretch', background: accent, borderRadius: 2, flexShrink: 0}} />
			<div>
				{label ? (
					<div
						style={{
							fontFamily: theme.mono,
							fontSize: size * 0.64,
							letterSpacing: 3,
							textTransform: 'uppercase',
							color: accent,
							marginBottom: 7,
						}}
					>
						{label}
					</div>
				) : null}
				<div
					style={{
						fontFamily: theme.font,
						fontSize: size,
						fontWeight: 400,
						color: theme.ink,
						lineHeight: 1.45,
						maxWidth: 760,
					}}
				>
					{children}
				</div>
			</div>
		</div>
	);
};
