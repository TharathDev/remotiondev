import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';

type Props = {
	columns?: number;
	rows?: number;
	/** Indices of pages already resident in the cache. */
	cached: number[];
	/** The page the executor asks for. */
	wanted: number;
	/** Frame the request lands. */
	requestFrom: number;
	accent?: string;
};

/**
 * A buffer pool as a grid of pages: filled squares are resident, the outlined
 * one is the page the executor just asked for.
 */
export const PageGrid: React.FC<Props> = ({
	columns = 10,
	rows = 5,
	cached,
	wanted,
	requestFrom,
	accent = theme.accent,
}) => {
	const frame = useCurrentFrame();
	const total = columns * rows;
	const hit = cached.includes(wanted);

	const ask = interpolate(frame, [requestFrom, requestFrom + 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const pulse = 0.55 + 0.45 * Math.sin((frame - requestFrom) * 0.25);

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: `repeat(${columns}, 52px)`,
				gap: 10,
			}}
		>
			{new Array(total).fill(true).map((_, i) => {
				const resident = cached.includes(i);
				const isWanted = i === wanted;
				const color = hit ? theme.ok : theme.warn;

				return (
					<div
						key={i}
						style={{
							width: 52,
							height: 40,
							borderRadius: 7,
							background: resident ? 'rgba(245,243,239,0.12)' : 'rgba(245,243,239,0.03)',
							border: isWanted
								? `2px solid ${color}`
								: `1px solid ${resident ? theme.faint : 'rgba(245,243,239,0.05)'}`,
							boxShadow: isWanted && ask > 0 ? `0 0 ${22 * pulse * ask}px ${color}` : undefined,
							opacity: isWanted ? 1 : resident ? 1 : 0.5,
						}}
					/>
				);
			})}
		</div>
	);
};
