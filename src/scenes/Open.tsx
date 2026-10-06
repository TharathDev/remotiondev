import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../components/Caption';
import {Grain} from '../components/Grain';
import {KineticText} from '../components/KineticText';
import {Seed} from '../components/Seed';
import {StarField} from '../components/StarField';
import {Vignette} from '../components/Vignette';
import {theme} from '../theme';

export const OPEN_DURATION = 150;

/**
 * Distance between the centre of the seed row and the centre of the frame, given
 * the fixed row heights below. Shifting the column by this much puts the seed
 * itself on the optical centre.
 */
const COLUMN_RISE = 95;

/**
 * Chapter one — the verb is OPEN. A dot appears, stretches into a rule, and the
 * title rises off that rule.
 */
export const Open: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// The dot arrives.
	const birth = spring({fps, frame, config: {damping: 12, mass: 0.5, stiffness: 140}});

	// Then it stretches sideways into a rule.
	const stretch = spring({
		fps,
		frame: frame - 26,
		config: {damping: 18, mass: 0.9, stiffness: 90},
	});

	const dot = 26 * birth;
	const width = interpolate(stretch, [0, 1], [dot, 900]);
	const height = interpolate(stretch, [0, 1], [dot, 7]);
	const glow = interpolate(stretch, [0, 1], [70, 24]);

	const subtitle = interpolate(frame, [84, 106], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const kicker = interpolate(frame, [12, 32], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// The column reserves a row for the title before the title exists, which
	// would leave the opening dot sitting below the optical centre. Hold the
	// column high until the title arrives, then settle it into place.
	const settle = spring({
		fps,
		frame: frame - 44,
		config: {damping: 20, mass: 1, stiffness: 80},
	});
	const columnY = interpolate(settle, [0, 1], [-COLUMN_RISE, 0]);

	return (
		<AbsoluteFill style={{backgroundColor: theme.bg}}>
			<StarField seed="open" count={80} drift={70} />

			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						transform: `translateY(${columnY}px)`,
					}}
				>
					{/* Fixed-height rows so nothing reflows as elements arrive. */}
					<div style={{height: 60, display: 'flex', alignItems: 'center'}}>
						<Caption opacity={kicker}>Remotion · React · TypeScript</Caption>
					</div>

					<div style={{height: 190, display: 'flex', alignItems: 'flex-end'}}>
						<KineticText text="VIDEO AS CODE" delay={46} stagger={2.5} size={148} />
					</div>

					<div style={{height: 70, display: 'flex', alignItems: 'center'}}>
						<Seed width={width} height={height} radius={50} glow={glow} />
					</div>

					<div
						style={{
							height: 60,
							display: 'flex',
							alignItems: 'center',
							opacity: subtitle,
							transform: `translateY(${interpolate(subtitle, [0, 1], [14, 0])}px)`,
						}}
					>
						<div
							style={{
								fontFamily: theme.font,
								fontSize: 32,
								fontWeight: 400,
								color: theme.muted,
								letterSpacing: 1,
							}}
						>
							Write a component. Render a film.
						</div>
					</div>
				</div>
			</AbsoluteFill>

			<Vignette />
			<Grain />
		</AbsoluteFill>
	);
};
