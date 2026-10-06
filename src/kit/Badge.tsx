import React from 'react';
import {Engine, theme} from '../theme';

/** The engine lettermark — "My" or "Pg" in the project's own hue. */
export const Badge: React.FC<{engine: Engine; size?: number}> = ({engine, size = 46}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: size * 0.28,
			background: engine.soft,
			border: `1px solid ${engine.edge}`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontFamily: theme.font,
			fontSize: size * 0.42,
			fontWeight: 800,
			color: engine.accent,
			flexShrink: 0,
		}}
	>
		{engine.mark}
	</div>
);
