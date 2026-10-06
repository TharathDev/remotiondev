import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../components/Caption';
import {Grain} from '../components/Grain';
import {StarField} from '../components/StarField';
import {Vignette} from '../components/Vignette';
import {theme} from '../theme';

export const PRIMITIVES_DURATION = 150;

const CARD_WIDTH = 460;
const CARD_HEIGHT = 380;

const Card: React.FC<{
	index: number;
	label: string;
	blurb: string;
	children: React.ReactNode;
}> = ({index, label, blurb, children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const enter = spring({
		fps,
		frame: frame - 14 - index * 7,
		config: {damping: 16, mass: 0.7, stiffness: 110},
	});

	return (
		<div
			style={{
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
				borderRadius: 28,
				background: theme.bgLift,
				border: '1px solid rgba(245,243,239,0.08)',
				padding: 36,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				opacity: enter,
				transform: `translateY(${interpolate(enter, [0, 1], [70, 0])}px) scale(${interpolate(
					enter,
					[0, 1],
					[0.94, 1],
				)})`,
			}}
		>
			<Caption color={theme.accent} size={21}>
				{label}
			</Caption>

			<div
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{children}
			</div>

			<div
				style={{
					fontFamily: theme.font,
					fontSize: 24,
					fontWeight: 400,
					color: theme.muted,
					lineHeight: 1.4,
				}}
			>
				{blurb}
			</div>
		</div>
	);
};

/** Card one: the frame number itself, counting. */
const FrameReadout: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const progress = frame / durationInFrames;

	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
			<div
				style={{
					fontFamily: theme.mono,
					fontSize: 96,
					fontWeight: 700,
					color: theme.ink,
					fontVariantNumeric: 'tabular-nums',
				}}
			>
				{String(frame).padStart(3, '0')}
			</div>
			<div style={{width: 300, height: 6, borderRadius: 3, background: 'rgba(245,243,239,0.1)'}}>
				<div
					style={{
						width: `${progress * 100}%`,
						height: '100%',
						borderRadius: 3,
						background: theme.ink,
					}}
				/>
			</div>
		</div>
	);
};

/** Card two: a straight line between two values. */
const InterpolateDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const travel = 300;
	const x = interpolate(frame, [20, 110], [0, travel], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div style={{position: 'relative', width: travel + 40, height: 120}}>
			<div
				style={{
					position: 'absolute',
					top: 57,
					left: 20,
					width: travel,
					height: 2,
					background: 'rgba(245,243,239,0.14)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 57,
					left: 20,
					width: x,
					height: 2,
					background: theme.accent2,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 40,
					left: 20 + x - 18,
					width: 36,
					height: 36,
					borderRadius: '50%',
					background: theme.accent2,
					boxShadow: `0 0 28px ${theme.accent2}66`,
				}}
			/>
		</div>
	);
};

/** Card three: the same move, but with overshoot and settle. */
const SpringDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const travel = 300;

	const value = spring({
		fps,
		frame: frame - 20,
		config: {damping: 9, mass: 0.8, stiffness: 120},
	});
	const x = value * travel;

	return (
		<div style={{position: 'relative', width: travel + 40, height: 120}}>
			<div
				style={{
					position: 'absolute',
					top: 57,
					left: 20,
					width: travel,
					height: 2,
					background: 'rgba(245,243,239,0.14)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 30,
					left: 20 + travel,
					width: 2,
					height: 56,
					background: 'rgba(245,243,239,0.3)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 40,
					left: 20 + x - 18,
					width: 36,
					height: 36,
					borderRadius: '50%',
					background: theme.accent,
					boxShadow: `0 0 28px ${theme.accent}66`,
				}}
			/>
		</div>
	);
};

/**
 * Chapter two — the verb is EXPLAIN. The rule from chapter one has become three
 * cards, each running the primitive it names.
 */
export const Primitives: React.FC = () => {
	const frame = useCurrentFrame();

	const heading = interpolate(frame, [0, 18], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{backgroundColor: theme.bg}}>
			<StarField seed="primitives" count={50} drift={50} />

			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					gap: 54,
				}}
			>
				<div
					style={{
						opacity: heading,
						transform: `translateY(${interpolate(heading, [0, 1], [-18, 0])}px)`,
						fontFamily: theme.font,
						fontSize: 56,
						fontWeight: 800,
						color: theme.ink,
						letterSpacing: -1,
					}}
				>
					Three primitives, one idea
				</div>

				<div style={{display: 'flex', gap: 34}}>
					<Card index={0} label="useCurrentFrame()" blurb="Where you are in the film.">
						<FrameReadout />
					</Card>
					<Card index={1} label="interpolate()" blurb="A straight line between two values.">
						<InterpolateDemo />
					</Card>
					<Card index={2} label="spring()" blurb="The same move, with weight.">
						<SpringDemo />
					</Card>
				</div>
			</AbsoluteFill>

			<Vignette strength={0.55} />
			<Grain />
		</AbsoluteFill>
	);
};
