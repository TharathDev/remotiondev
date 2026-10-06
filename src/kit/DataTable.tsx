import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';

type Props = {
	columns: string[];
	rows: (string | number)[][];
	from?: number;
	/** Row indices lit with the accent, once `highlightFrom` has passed. */
	highlight?: number[];
	highlightFrom?: number;
	/** Row indices drawn as struck-through dead tuples. */
	dead?: number[];
	deadFrom?: number;
	accent?: string;
	size?: number;
	caption?: string;
};

/** A small result set or heap page. Rows arrive one at a time. */
export const DataTable: React.FC<Props> = ({
	columns,
	rows,
	from = 0,
	highlight = [],
	highlightFrom = 0,
	dead = [],
	deadFrom = 0,
	accent = theme.accent,
	size = 30,
	caption,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<div style={{fontFamily: theme.mono, fontSize: size}}>
			{caption ? (
				<div
					style={{
						fontSize: size * 0.72,
						letterSpacing: 3,
						textTransform: 'uppercase',
						color: theme.muted,
						marginBottom: 14,
					}}
				>
					{caption}
				</div>
			) : null}

			<div style={{display: 'flex', gap: 0, borderBottom: `1px solid ${theme.faint}`, paddingBottom: 10}}>
				{columns.map((col) => (
					<div
						key={col}
						style={{
							flex: 1,
							color: theme.muted,
							letterSpacing: 1.5,
							textTransform: 'uppercase',
							fontSize: size * 0.76,
							paddingRight: 18,
						}}
					>
						{col}
					</div>
				))}
			</div>

			{rows.map((row, i) => {
				const enter = spring({
					fps,
					frame: frame - from - i * 4,
					config: {damping: 18, mass: 0.5, stiffness: 130},
				});
				const isLit = highlight.includes(i) && frame >= highlightFrom;
				const isDead = dead.includes(i) && frame >= deadFrom;

				return (
					<div
						key={i}
						style={{
							display: 'flex',
							padding: '11px 0',
							borderBottom: `1px solid rgba(245,243,239,0.04)`,
							opacity: enter * (isDead ? 0.38 : 1),
							transform: `translateX(${interpolate(enter, [0, 1], [-26, 0])}px)`,
							background: isLit ? `${accent}14` : undefined,
							borderLeft: isLit ? `3px solid ${accent}` : '3px solid transparent',
							paddingLeft: 12,
							marginLeft: -15,
						}}
					>
						{row.map((cell, j) => (
							<div
								key={j}
								style={{
									flex: 1,
									color: isLit ? accent : theme.ink,
									paddingRight: 18,
									textDecoration: isDead ? 'line-through' : undefined,
								}}
							>
								{cell}
							</div>
						))}
					</div>
				);
			})}
		</div>
	);
};
