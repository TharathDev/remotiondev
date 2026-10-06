import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {KineticText} from '../components/KineticText';
import {StarField} from '../components/StarField';
import {engines, theme} from '../theme';
import {Badge} from './Badge';
import {SceneFrame} from './SceneFrame';

type Props = {
	/** Zero-padded episode number, e.g. "03". */
	number: string;
	title: string;
	subtitle: string;
	/** Which part of the series this episode belongs to. */
	part?: string;
	/**
	 * Three short phrases naming what the episode covers, shown as the greeting
	 * is spoken. Telling the viewer where they are going is what buys their
	 * attention for the next ninety seconds.
	 */
	agenda?: string[];
	/** Frame the agenda starts arriving on, so it can land with the narration. */
	agendaFrom?: number;
	narration?: {episode: string; scene: string};
};

/** The opening card every episode shares. */
export const TitleCard: React.FC<Props> = ({
	number,
	title,
	subtitle,
	part,
	agenda,
	agendaFrom = 60,
	narration,
}) => {
	const frame = useCurrentFrame();

	const rule = interpolate(frame, [10, 34], [0, 520], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const tail = interpolate(frame, [46, 66], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<SceneFrame grid={false} narration={narration}>
			<StarField seed={`title-${number}`} count={60} drift={50} />

			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<div
						style={{
							height: 46,
							display: 'flex',
							alignItems: 'center',
							gap: 16,
							fontFamily: theme.mono,
							fontSize: 22,
							letterSpacing: 6,
							textTransform: 'uppercase',
							color: theme.muted,
							opacity: interpolate(frame, [0, 18], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					>
						<span style={{color: theme.accent, fontWeight: 700}}>{number}</span>
						{part ? <span>· {part}</span> : null}
					</div>

					<div style={{height: 150, display: 'flex', alignItems: 'flex-end'}}>
						<KineticText text={title} delay={16} stagger={2} size={112} letterSpacing={-4} />
					</div>

					<div style={{height: 54, display: 'flex', alignItems: 'center'}}>
						<div style={{width: rule, height: 5, borderRadius: 3, background: theme.accent}} />
					</div>

					<div
						style={{
							height: 48,
							display: 'flex',
							alignItems: 'center',
							opacity: tail,
							fontFamily: theme.font,
							fontSize: 31,
							color: theme.muted,
						}}
					>
						{subtitle}
					</div>

					{agenda && agenda.length > 0 ? (
						<div
							style={{
								height: 150,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								gap: 16,
								minWidth: 680,
							}}
						>
							{agenda.map((item, i) => {
								const show = interpolate(
									frame,
									[agendaFrom + i * 14, agendaFrom + i * 14 + 16],
									[0, 1],
									{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
								);
								return (
									<div
										key={i}
										style={{
											display: 'flex',
											alignItems: 'baseline',
											gap: 18,
											opacity: show,
											transform: `translateX(${interpolate(show, [0, 1], [-22, 0])}px)`,
										}}
									>
										<span
											style={{
												fontFamily: theme.mono,
												fontSize: 20,
												fontWeight: 700,
												color: theme.accent,
												letterSpacing: 2,
											}}
										>
											{String(i + 1).padStart(2, '0')}
										</span>
										<span
											style={{
												fontFamily: theme.font,
												fontSize: 30,
												fontWeight: 500,
												color: theme.ink,
											}}
										>
											{item}
										</span>
									</div>
								);
							})}
						</div>
					) : null}

					<div
						style={{
							height: 70,
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							opacity: tail,
						}}
					>
						<Badge engine={engines.mysql} size={38} />
						<Badge engine={engines.postgres} size={38} />
					</div>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};
