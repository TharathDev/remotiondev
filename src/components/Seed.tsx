import React from 'react';
import {theme} from '../theme';

type Props = {
	width: number;
	height: number;
	/** Corner rounding in percent: 50 is a pill or a circle, 0 is a hard square. */
	radius?: number;
	rotation?: number;
	color?: string;
	glow?: number;
	opacity?: number;
};

/**
 * The one object that travels through the whole film: it opens as a dot,
 * stretches into a rule, multiplies into bars, and closes as a dot again.
 */
export const Seed: React.FC<Props> = ({
	width,
	height,
	radius = 50,
	rotation = 0,
	color = theme.accent,
	glow = 40,
	opacity = 1,
}) => (
	<div
		style={{
			width,
			height,
			borderRadius: `${radius}%`,
			background: color,
			transform: `rotate(${rotation}deg)`,
			boxShadow: glow > 0 ? `0 0 ${glow}px ${color}55` : undefined,
			opacity,
		}}
	/>
);
