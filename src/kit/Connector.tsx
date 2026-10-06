import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';

type Props = {
	/** Frame the line finishes drawing by. */
	from?: number;
	/** Frame a packet starts travelling along the line. */
	travel?: number;
	length?: number;
	accent?: string;
	/**
	 * 'right' for a left-to-right pipeline, 'up' for the pull direction in a
	 * volcano-model plan tree, where rows travel from the scan up to the client.
	 */
	axis?: 'right' | 'up';
};

/** The line between two stages, with a packet that carries rows along it. */
export const Connector: React.FC<Props> = ({
	from = 0,
	travel,
	length = 72,
	accent = theme.accent,
	axis = 'right',
}) => {
	const frame = useCurrentFrame();
	const vertical = axis === 'up';

	const draw = interpolate(frame, [from, from + 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const packet =
		travel === undefined
			? null
			: interpolate(frame, [travel, travel + 14], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});

	const packetVisible = packet !== null && packet > 0 && packet < 1;
	const drawn = length * draw;
	// Vertical lines are drawn and travelled bottom-up.
	const packetOffset = (length - 12) * (packet ?? 0);

	return (
		<div
			style={{
				position: 'relative',
				width: vertical ? 14 : length,
				height: vertical ? length : 14,
				flexShrink: 0,
				alignSelf: vertical ? 'center' : undefined,
			}}
		>
			<div
				style={{
					position: 'absolute',
					...(vertical
						? {left: 6, bottom: 0, width: 2, height: drawn}
						: {top: 6, left: 0, height: 2, width: drawn}),
					background: theme.faint,
				}}
			/>

			{/* Arrowhead, pointing the way the rows move. */}
			<div
				style={{
					position: 'absolute',
					opacity: draw,
					width: 0,
					height: 0,
					...(vertical
						? {
								left: 1,
								bottom: drawn - 7,
								borderLeft: '6px solid transparent',
								borderRight: '6px solid transparent',
								borderBottom: `8px solid ${theme.faint}`,
							}
						: {
								top: 1,
								left: drawn - 7,
								borderTop: '6px solid transparent',
								borderBottom: '6px solid transparent',
								borderLeft: `8px solid ${theme.faint}`,
							}),
				}}
			/>

			{packetVisible ? (
				<div
					style={{
						position: 'absolute',
						width: 12,
						height: 12,
						borderRadius: '50%',
						background: accent,
						boxShadow: `0 0 18px ${accent}`,
						...(vertical ? {left: 1, bottom: packetOffset} : {top: 1, left: packetOffset}),
					}}
				/>
			) : null}
		</div>
	);
};
