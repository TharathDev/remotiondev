import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Grain} from '../components/Grain';
import {Vignette} from '../components/Vignette';
import {Grid} from './Grid';
import {theme} from '../theme';

type Props = {
	children: React.ReactNode;
	/** Small label in the top-left, e.g. "02 · PARSE". */
	chapter?: string;
	/** Step counter in the top-right, e.g. "Stage 2 of 5". */
	step?: string;
	grid?: boolean;
};

/**
 * The shared ground for every scene in the series: background, grid, episode
 * chrome, vignette and grain. Scenes supply only their own content, which is
 * what keeps each episode file short.
 */
export const SceneFrame: React.FC<Props> = ({children, chapter, step, grid = true}) => {
	const frame = useCurrentFrame();
	const chrome = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{backgroundColor: theme.bg}}>
			{grid ? <Grid /> : null}

			{chapter || step ? (
				<AbsoluteFill style={{opacity: chrome * 0.75}}>
					{chapter ? (
						<div
							style={{
								position: 'absolute',
								top: 54,
								left: 72,
								fontFamily: theme.mono,
								fontSize: 20,
								letterSpacing: 4,
								color: theme.muted,
								textTransform: 'uppercase',
							}}
						>
							{chapter}
						</div>
					) : null}
					{step ? (
						<div
							style={{
								position: 'absolute',
								top: 54,
								right: 72,
								fontFamily: theme.mono,
								fontSize: 20,
								letterSpacing: 4,
								color: theme.muted,
								textTransform: 'uppercase',
							}}
						>
							{step}
						</div>
					) : null}
				</AbsoluteFill>
			) : null}

			{children}

			<Vignette strength={0.55} />
			<Grain opacity={0.05} />
		</AbsoluteFill>
	);
};
