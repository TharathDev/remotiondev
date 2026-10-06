import React from 'react';
import {theme} from '../theme';

/** Small monospaced label used for the code names on screen. */
export const Caption: React.FC<{
	children: React.ReactNode;
	color?: string;
	size?: number;
	opacity?: number;
}> = ({children, color = theme.muted, size = 24, opacity = 1}) => (
	<div
		style={{
			fontFamily: theme.mono,
			fontSize: size,
			letterSpacing: 3,
			textTransform: 'uppercase',
			color,
			opacity,
		}}
	>
		{children}
	</div>
);
