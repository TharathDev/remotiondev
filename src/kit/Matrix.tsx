import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';

type Props = {
	columns: string[];
	rows: {label: string; cells: boolean[]; note?: string}[];
	from?: number;
	/** Row index to light, once `highlightFrom` has passed. */
	highlight?: number;
	highlightFrom?: number;
	accent?: string;
	/** What a true cell means — true is drawn as the bad outcome by default. */
	trueMark?: string;
	falseMark?: string;
};

/**
 * A yes/no grid — isolation levels against the anomalies they still allow.
 * Rows arrive one at a time so the narration can walk down them.
 */
export const Matrix: React.FC<Props> = ({
	columns,
	rows,
	from = 0,
	highlight,
	highlightFrom = 0,
	accent = theme.accent,
	trueMark = 'can happen',
	falseMark = 'prevented',
}) => {
	const frame = useCurrentFrame();

	return (
		<div style={{fontFamily: theme.font}}>
			<div style={{display: 'flex', borderBottom: `1px solid ${theme.faint}`, paddingBottom: 12}}>
				<div style={{width: 330}} />
				{columns.map((c) => (
					<div
						key={c}
						style={{
							flex: 1,
							fontFamily: theme.mono,
							fontSize: 20,
							letterSpacing: 2,
							textTransform: 'uppercase',
							color: theme.muted,
							textAlign: 'center',
						}}
					>
						{c}
					</div>
				))}
			</div>

			{rows.map((row, i) => {
				const enter = interpolate(frame, [from + i * 16, from + i * 16 + 16], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const lit = highlight === i && frame >= highlightFrom;

				return (
					<div
						key={row.label}
						style={{
							display: 'flex',
							alignItems: 'center',
							padding: '16px 0',
							borderBottom: '1px solid rgba(245,243,239,0.04)',
							opacity: enter,
							transform: `translateX(${interpolate(enter, [0, 1], [-20, 0])}px)`,
							background: lit ? `${accent}12` : undefined,
							borderLeft: lit ? `3px solid ${accent}` : '3px solid transparent',
							paddingLeft: 14,
							marginLeft: -17,
						}}
					>
						<div style={{width: 330}}>
							<div style={{fontSize: 26, fontWeight: 600, color: lit ? accent : theme.ink}}>
								{row.label}
							</div>
							{row.note ? (
								<div style={{fontFamily: theme.mono, fontSize: 17, color: theme.muted, marginTop: 3}}>
									{row.note}
								</div>
							) : null}
						</div>
						{row.cells.map((cell, j) => (
							<div
								key={j}
								style={{
									flex: 1,
									textAlign: 'center',
									fontFamily: theme.mono,
									fontSize: 19,
									color: cell ? theme.warn : theme.ok,
								}}
							>
								{cell ? trueMark : falseMark}
							</div>
						))}
					</div>
				);
			})}
		</div>
	);
};
