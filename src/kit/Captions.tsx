import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {Cue} from './narration';

export const CAPTION_BAND = 168;

/** The narration line currently being spoken, shown in the lower band. */
export const Captions: React.FC<{lines: Cue[]}> = ({lines}) => {
	const frame = useCurrentFrame();
	const index = lines.findIndex((line) => frame >= line.from && frame < line.from + line.frames);

	if (index === -1) {
		return null;
	}

	const line = lines[index];
	const fade = interpolate(
		frame,
		[line.from, line.from + 6, line.from + line.frames - 6, line.from + line.frames],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: 48,
				display: 'flex',
				justifyContent: 'center',
				opacity: fade,
			}}
		>
			<div
				style={{
					maxWidth: 1480,
					padding: '16px 30px',
					borderRadius: 14,
					background: 'rgba(10,10,15,0.72)',
					border: `1px solid ${theme.faint}`,
					fontFamily: theme.font,
					fontSize: 33,
					fontWeight: 500,
					lineHeight: 1.35,
					color: theme.ink,
					textAlign: 'center',
				}}
			>
				{line.text}
			</div>
		</div>
	);
};
