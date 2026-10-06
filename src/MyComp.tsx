import React from 'react';
import {AbsoluteFill} from 'remotion';
import {linearTiming, springTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';

import {Open, OPEN_DURATION} from './scenes/Open';
import {Primitives, PRIMITIVES_DURATION} from './scenes/Primitives';
import {Deterministic, DETERMINISTIC_DURATION} from './scenes/Deterministic';
import {Outro, OUTRO_DURATION} from './scenes/Outro';
import {theme} from './theme';

const TRANSITION = 20;

/**
 * A TransitionSeries overlaps its sequences, so the film is shorter than the sum
 * of its scenes by exactly one transition per cut. Keeping this number next to
 * the scenes means the composition duration can never drift out of sync.
 */
export const TOTAL_DURATION =
	OPEN_DURATION +
	PRIMITIVES_DURATION +
	DETERMINISTIC_DURATION +
	OUTRO_DURATION -
	3 * TRANSITION;

export const MyComp: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: theme.bg}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={OPEN_DURATION}>
					<Open />
				</TransitionSeries.Sequence>

				<TransitionSeries.Transition
					timing={springTiming({config: {damping: 200}, durationInFrames: TRANSITION})}
					presentation={fade()}
				/>

				<TransitionSeries.Sequence durationInFrames={PRIMITIVES_DURATION}>
					<Primitives />
				</TransitionSeries.Sequence>

				<TransitionSeries.Transition
					timing={linearTiming({durationInFrames: TRANSITION})}
					presentation={wipe({direction: 'from-right'})}
				/>

				<TransitionSeries.Sequence durationInFrames={DETERMINISTIC_DURATION}>
					<Deterministic />
				</TransitionSeries.Sequence>

				<TransitionSeries.Transition
					timing={springTiming({config: {damping: 200}, durationInFrames: TRANSITION})}
					presentation={fade()}
				/>

				<TransitionSeries.Sequence durationInFrames={OUTRO_DURATION}>
					<Outro />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
