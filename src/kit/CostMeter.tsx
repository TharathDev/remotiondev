import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';

type Props = {
	label: string;
	/** Planner cost units — counted up, not shown instantly. */
	cost: number;
	from?: number;
	/** The largest cost on screen, so bars share a scale. */
	max: number;
	/** The plan the optimizer actually picked. */
	chosen?: boolean;
	chosenFrom?: number;
	accent?: string;
};

/** One candidate plan's cost, as a counting number and a bar on a shared scale. */
export const CostMeter: React.FC<Props> = ({
	label,
	cost,
	from = 0,
	max,
	chosen = false,
	chosenFrom = 0,
	accent = theme.accent,
}) => {
	const frame = useCurrentFrame();

	const count = interpolate(frame, [from, from + 26], [0, cost], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const bar = interpolate(frame, [from, from + 26], [0, cost / max], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const isChosen = chosen && frame >= chosenFrom;
	const color = isChosen ? theme.ok : accent;

	return (
		<div style={{width: '100%'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12}}>
				<div style={{fontFamily: theme.mono, fontSize: 28, color: isChosen ? theme.ok : theme.ink}}>
					{label}
					{isChosen ? <span style={{color: theme.ok, marginLeft: 12}}>← chosen</span> : null}
				</div>
				<div
					style={{
						fontFamily: theme.mono,
						fontSize: 36,
						fontWeight: 700,
						color,
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					{count.toFixed(2)}
				</div>
			</div>
			<div style={{height: 12, borderRadius: 6, background: 'rgba(245,243,239,0.07)', overflow: 'hidden'}}>
				<div
					style={{
						width: `${bar * 100}%`,
						height: '100%',
						borderRadius: 6,
						background: color,
						boxShadow: isChosen ? `0 0 20px ${theme.ok}66` : undefined,
					}}
				/>
			</div>
		</div>
	);
};
