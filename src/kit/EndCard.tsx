import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {Callout} from './Callout';
import {SceneFrame} from './SceneFrame';

type Props = {
	/** The two or three sentences this episode wants the viewer to keep. */
	takeaways: string[];
	next?: string;
};

/** The closing card every episode shares: what to remember, and what is next. */
export const EndCard: React.FC<Props> = ({takeaways, next}) => {
	const frame = useCurrentFrame();

	const heading = interpolate(frame, [4, 22], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const nextIn = interpolate(frame, [30 + takeaways.length * 14, 50 + takeaways.length * 14], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<SceneFrame>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 34, width: 1120}}>
					<div
						style={{
							opacity: heading,
							transform: `translateY(${interpolate(heading, [0, 1], [18, 0])}px)`,
							fontFamily: theme.font,
							fontSize: 54,
							fontWeight: 800,
							color: theme.ink,
							letterSpacing: -1,
						}}
					>
						What to remember
					</div>

					{takeaways.map((line, i) => (
						<Callout key={i} from={20 + i * 14} size={32}>
							{line}
						</Callout>
					))}

					{next ? (
						<div
							style={{
								marginTop: 18,
								opacity: nextIn,
								fontFamily: theme.mono,
								fontSize: 24,
								letterSpacing: 3,
								textTransform: 'uppercase',
								color: theme.muted,
							}}
						>
							Next <span style={{color: theme.accent}}>→</span> {next}
						</div>
					) : null}
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};
