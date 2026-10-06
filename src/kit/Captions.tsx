import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {Cue} from './narration';

/*
 * Tall enough for the longest caption plus its bottom margin, so scene content
 * can never be drawn under it:
 *
 *   3 lines x 31px x 1.35 line-height = 126
 * + 16px padding, top and bottom      =  32
 * + 48px gap to the frame edge        =  48
 *                                       206, rounded up.
 *
 * Scenes are centred in the space above this, so raising it costs every scene
 * vertical room — which is why the caption is also sized to wrap to two lines
 * for most sentences rather than three.
 */
export const CAPTION_BAND = 212;

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
					maxWidth: 1580,
					padding: '16px 30px',
					borderRadius: 14,
					background: 'rgba(10,10,15,0.72)',
					border: `1px solid ${theme.faint}`,
					fontFamily: theme.font,
					fontSize: 31,
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
