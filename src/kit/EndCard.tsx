import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {Callout} from './Callout';
import {cue, track} from './narration';
import {SceneFrame} from './SceneFrame';

type Props = {
	/** The two or three sentences this episode wants the viewer to keep. */
	takeaways: string[];
	next?: string;
	narration?: {episode: string; scene: string};
};

/**
 * The closing card every episode shares. When narration is attached, each
 * takeaway appears on the frame its own sentence is spoken — the script's
 * closing lines and this list are written to mirror each other.
 */
export const EndCard: React.FC<Props> = ({takeaways, next, narration}) => {
	const frame = useCurrentFrame();
	const lines = narration ? track(narration.episode, narration.scene)?.lines : undefined;

	const takeawayAt = (i: number) =>
		narration && lines && i < lines.length ? cue(narration.episode, narration.scene, i) : 20 + i * 14;

	// The "next" line rides the last narration line, which is the hand-off.
	const nextAt =
		narration && lines && lines.length > takeaways.length
			? cue(narration.episode, narration.scene, lines.length - 1)
			: 30 + takeaways.length * 14;

	const heading = interpolate(frame, [4, 22], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const nextIn = interpolate(frame, [nextAt, nextAt + 18], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<SceneFrame narration={narration}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 34, width: 1180}}>
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
						<Callout key={i} from={takeawayAt(i)} size={36}>
							{line}
						</Callout>
					))}

					{next ? (
						<div
							style={{
								marginTop: 18,
								opacity: nextIn,
								fontFamily: theme.mono,
								fontSize: 26,
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
