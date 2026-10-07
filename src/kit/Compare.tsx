import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
	left: React.ReactNode;
	right: React.ReactNode;
	/** Frame each side is narrated, so the pair knows which arrives alone. */
	leftFrom: number;
	rightFrom: number;
	/** Width of one panel, for the centring offset. */
	width?: number;
	gap?: number;
};

/**
 * A two-up comparison that centres whichever side arrives first.
 *
 * Both slots are laid out from the start so the row never jumps when the second
 * panel appears — but that leaves the first one sitting off-centre with an empty
 * half-frame beside it for as long as it is alone, which reads as a mistake
 * rather than a choice. This slides the row so the early panel is centred, then
 * eases it into the two-up position as the other is introduced, which also
 * marks the transition between the two halves of the scene.
 */
export const Compare: React.FC<Props> = ({
	left,
	right,
	leftFrom,
	rightFrom,
	width = 640,
	gap = 38,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const second = Math.max(leftFrom, rightFrom);
	const leftIsFirst = leftFrom <= rightFrom;
	const offset = (width + gap) / 2;

	const paired = spring({
		fps,
		frame: frame - (second - 26),
		config: {damping: 20, mass: 1, stiffness: 70},
	});

	// Shift right to centre a lone left panel, left to centre a lone right one.
	const shift = interpolate(paired, [0, 1], [leftIsFirst ? offset : -offset, 0]);

	return (
		<div style={{display: 'flex', gap, transform: `translateX(${shift}px)`}}>
			{left}
			{right}
		</div>
	);
};
