import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../components/Caption';
import {Grain} from '../components/Grain';
import {KineticText} from '../components/KineticText';
import {Seed} from '../components/Seed';
import {StarField} from '../components/StarField';
import {Vignette} from '../components/Vignette';
import {theme} from '../theme';

export const OUTRO_DURATION = 140;

const COLLAPSING_BARS = 14;

/** Must match the opening scene so the film closes where it started. */
const COLUMN_RISE = 95;

/**
 * Chapter four — the verb is CLOSE. The field of bars falls back into the single
 * dot the film opened on, the dot stretches into the rule one last time, and the
 * name rises off it. The film ends where it started.
 */
export const Outro: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Bars converge on the centre and hand their mass to the dot.
	const collapse = spring({fps, frame, config: {damping: 20, mass: 1, stiffness: 70}});
	const spread = (1 - collapse) * 430;
	const dot = 26 * collapse;

	// The dot stretches into the rule, exactly as it did in the opening.
	const stretch = spring({
		fps,
		frame: frame - 54,
		config: {damping: 18, mass: 0.9, stiffness: 85},
	});

	// Then the rule shuts like a blind and the film fades out.
	const close = interpolate(frame, [114, 136], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const fade = interpolate(frame, [118, OUTRO_DURATION], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const ruleWidth = interpolate(stretch, [0, 1], [dot, 460]) * (1 - close);
	const ruleHeight = interpolate(stretch, [0, 1], [dot, 7]);

	// Mirrors the opening: the column rides high while only the seed is on
	// screen, then settles as the name rises off the rule.
	const settle = spring({
		fps,
		frame: frame - 58,
		config: {damping: 20, mass: 1, stiffness: 80},
	});
	const columnY = interpolate(settle, [0, 1], [-COLUMN_RISE, 0]);

	const command = interpolate(frame, [78, 98], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{backgroundColor: theme.bg, opacity: fade}}>
			<StarField seed="outro" count={60} drift={40} />

			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						transform: `translateY(${columnY}px)`,
					}}
				>
					<div style={{height: 60}} />

					<div style={{height: 190, display: 'flex', alignItems: 'flex-end'}}>
						<KineticText text="remotiondev" delay={60} stagger={2.5} size={138} letterSpacing={-5} />
					</div>

					{/* The seed slot: bars, then dot, then rule. */}
					<div
						style={{
							height: 70,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							position: 'relative',
							width: 900,
						}}
					>
						{collapse < 0.98
							? new Array(COLLAPSING_BARS).fill(true).map((_, i) => {
									const offset = ((i - (COLLAPSING_BARS - 1) / 2) / ((COLLAPSING_BARS - 1) / 2)) * spread;
									const barHeight = (12 + random(`outro-bar-${i}`) * 42) * (1 - collapse) + 6;

									return (
										<div
											key={i}
											style={{
												position: 'absolute',
												left: `calc(50% + ${offset}px)`,
												width: 10,
												height: barHeight,
												marginLeft: -5,
												borderRadius: 5,
												background: theme.ink,
												opacity: (1 - collapse) * 0.5,
											}}
										/>
									);
								})
							: null}

						<Seed
							width={ruleWidth}
							height={ruleHeight}
							radius={50}
							glow={interpolate(stretch, [0, 1], [70, 24])}
						/>
					</div>

					<div
						style={{
							height: 60,
							display: 'flex',
							alignItems: 'center',
							opacity: command,
							transform: `translateY(${interpolate(command, [0, 1], [12, 0])}px)`,
						}}
					>
						<Caption size={26} color={theme.muted}>
							npm run studio
						</Caption>
					</div>
				</div>
			</AbsoluteFill>

			<Vignette />
			<Grain />
		</AbsoluteFill>
	);
};
