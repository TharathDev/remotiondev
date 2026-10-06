import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../components/Caption';
import {Grain} from '../components/Grain';
import {Vignette} from '../components/Vignette';
import {theme} from '../theme';

export const DETERMINISTIC_DURATION = 150;

const BAR_COUNT = 56;
const BAR_WIDTH = 14;
const BAR_GAP = 10;
const MAX_HEIGHT = 300;

/**
 * Chapter three — the verb is PROVE. The card has multiplied into a field of
 * bars whose heights are a pure function of (index, frame): no `Math.random()`,
 * no clock, so frame 97 looks the same on every machine and every re-render.
 */
export const Deterministic: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const heading = interpolate(frame, [4, 24], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const footer = interpolate(frame, [96, 118], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{backgroundColor: theme.bg}}>
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					gap: 64,
				}}
			>
				<div
					style={{
						opacity: heading,
						transform: `translateY(${interpolate(heading, [0, 1], [20, 0])}px)`,
						fontFamily: theme.font,
						fontSize: 62,
						fontWeight: 800,
						color: theme.ink,
						letterSpacing: -1.5,
						textAlign: 'center',
						maxWidth: 1250,
						lineHeight: 1.15,
					}}
				>
					Every frame is a pure function of its number
				</div>

				<div
					style={{
						display: 'flex',
						alignItems: 'flex-end',
						gap: BAR_GAP,
						height: MAX_HEIGHT,
					}}
				>
					{new Array(BAR_COUNT).fill(true).map((_, i) => {
						// Each bar gets its own amplitude from a fixed seed, and its own
						// arrival spring, so the field reads as one travelling wave.
						const amplitude = 0.35 + random(`bar-amp-${i}`) * 0.65;
						const phase = (i / BAR_COUNT) * Math.PI * 4;
						const wave = (Math.sin(frame * 0.12 - phase) + 1) / 2;

						const rise = spring({
							fps,
							frame: frame - 18 - i * 0.7,
							config: {damping: 15, mass: 0.5, stiffness: 130},
						});

						const height = Math.max(BAR_WIDTH, MAX_HEIGHT * amplitude * wave * rise);
						const hot = wave > 0.8;

						return (
							<div
								key={i}
								style={{
									width: BAR_WIDTH,
									height,
									borderRadius: BAR_WIDTH / 2,
									background: hot ? theme.accent : theme.ink,
									opacity: hot ? 1 : 0.18 + wave * 0.45,
								}}
							/>
						);
					})}
				</div>

				<div
					style={{
						opacity: footer,
						display: 'flex',
						alignItems: 'center',
						gap: 22,
					}}
				>
					<Caption size={26}>frame</Caption>
					<div
						style={{
							fontFamily: theme.mono,
							fontSize: 34,
							fontWeight: 700,
							color: theme.accent,
							fontVariantNumeric: 'tabular-nums',
						}}
					>
						{String(frame).padStart(3, '0')}
					</div>
					<Caption size={26}>renders identically, every time</Caption>
				</div>
			</AbsoluteFill>

			<Vignette strength={0.6} />
			<Grain />
		</AbsoluteFill>
	);
};
