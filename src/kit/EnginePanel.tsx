import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Engine, theme} from '../theme';
import {Badge} from './Badge';

type Props = {
	engine: Engine;
	children: React.ReactNode;
	from?: number;
	width?: number | string;
	/** Short line under the engine name, e.g. "thread per connection". */
	tagline?: string;
	minHeight?: number;
};

/** One side of a MySQL / PostgreSQL comparison, branded in the engine's hue. */
export const EnginePanel: React.FC<Props> = ({
	engine,
	children,
	from = 0,
	width = 620,
	tagline,
	minHeight,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const enter = spring({
		fps,
		frame: frame - from,
		config: {damping: 17, mass: 0.7, stiffness: 110},
	});

	return (
		<div
			style={{
				width,
				minHeight,
				background: theme.bgPanel,
				border: `1px solid ${engine.edge}`,
				borderRadius: 24,
				padding: 34,
				opacity: enter,
				transform: `translateY(${interpolate(enter, [0, 1], [52, 0])}px)`,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26}}>
				<Badge engine={engine} size={44} />
				<div>
					<div
						style={{
							fontFamily: theme.font,
							fontSize: 30,
							fontWeight: 800,
							color: engine.accent,
							letterSpacing: -0.4,
						}}
					>
						{engine.name}
					</div>
					{tagline ? (
						<div style={{fontFamily: theme.mono, fontSize: 17, color: theme.muted, marginTop: 4}}>
							{tagline}
						</div>
					) : null}
				</div>
			</div>
			<div style={{flex: 1}}>{children}</div>
		</div>
	);
};
