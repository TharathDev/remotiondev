import {interpolate, random} from 'remotion';

/**
 * Idle motion. A presenter who stands perfectly still reads as frozen, and so
 * does a diagram: a box that snaps into place and then never moves again stops
 * looking alive. These give every element a slow, tiny drift of its own, seeded
 * per element so neighbours never move in lockstep, and deterministic because
 * it is all a function of the frame.
 *
 * Amplitudes are deliberately small — a couple of pixels. This should be felt
 * rather than noticed.
 */
export const idleY = (frame: number, seed: string, amplitude = 2.4): number => {
	const phase = random(`idle-y-${seed}`) * Math.PI * 2;
	const speed = 0.012 + random(`idle-sy-${seed}`) * 0.008;
	return Math.sin(frame * speed + phase) * amplitude;
};

export const idleX = (frame: number, seed: string, amplitude = 1.6): number => {
	const phase = random(`idle-x-${seed}`) * Math.PI * 2;
	const speed = 0.009 + random(`idle-sx-${seed}`) * 0.007;
	return Math.cos(frame * speed + phase) * amplitude;
};

/**
 * A short lift when a point is made: the visual equivalent of raising a hand on
 * a key word. Returns 0 outside the window, peaking just after `at`.
 */
export const accent = (frame: number, at: number, strength = 1): number => {
	const t = frame - at;
	if (t < 0 || t > 26) {
		return 0;
	}
	return interpolate(t, [0, 7, 26], [0, strength, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

/**
 * A slow push on the whole scene, like a camera easing in. Gives a static
 * layout somewhere to go across a long narration.
 */
export const drift = (frame: number, duration: number, amount = 0.018): number =>
	1 + interpolate(frame, [0, duration], [0, amount], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
