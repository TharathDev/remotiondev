import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';

type Props = {
	text: string;
	/** Frames to wait before the first letter moves. */
	delay?: number;
	/** Frames between consecutive letters. */
	stagger?: number;
	size?: number;
	weight?: number;
	color?: string;
	letterSpacing?: number;
	/** Letters rise from this many pixels below their resting line. */
	rise?: number;
};

/**
 * Type that arrives one letter at a time. Each letter is its own spring, offset
 * by `stagger`, which is what gives the word its wave.
 */
export const KineticText: React.FC<Props> = ({
	text,
	delay = 0,
	stagger = 2,
	size = 150,
	weight = 900,
	color = theme.ink,
	letterSpacing = -6,
	rise = 90,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<div
			style={{
				display: 'flex',
				fontFamily: theme.font,
				fontSize: size,
				fontWeight: weight,
				color,
				letterSpacing,
				lineHeight: 1,
				whiteSpace: 'pre',
			}}
		>
			{text.split('').map((char, i) => {
				const progress = spring({
					fps,
					frame: frame - delay - i * stagger,
					config: {damping: 14, mass: 0.6, stiffness: 120},
				});

				const y = interpolate(progress, [0, 1], [rise, 0]);
				const blur = interpolate(progress, [0, 0.6, 1], [7, 1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});

				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							transform: `translateY(${y}px)`,
							opacity: progress,
							filter: `blur(${blur}px)`,
						}}
					>
						{char}
					</span>
				);
			})}
		</div>
	);
};
