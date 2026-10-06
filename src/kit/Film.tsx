import React from 'react';
import {AbsoluteFill} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {theme} from '../theme';

export const TRANSITION = 18;

export type Scene = {
	duration: number;
	node: React.ReactNode;
};

/**
 * Total length of a film built from these scenes. A TransitionSeries overlaps
 * its sequences, so each cut costs one transition. Episodes derive their
 * `durationInFrames` from this, which means a scene can be lengthened without
 * anyone remembering to update the composition.
 */
export const filmDuration = (scenes: Scene[]): number =>
	scenes.reduce((total, scene) => total + scene.duration, 0) - (scenes.length - 1) * TRANSITION;

/**
 * Joins an episode's scenes with a consistent cut. Children are passed as a flat
 * array rather than fragments, because TransitionSeries inspects its direct
 * children and a fragment would hide the sequences from it.
 */
export const Film: React.FC<{scenes: Scene[]}> = ({scenes}) => {
	const children: React.ReactNode[] = [];

	scenes.forEach((scene, i) => {
		if (i > 0) {
			children.push(
				<TransitionSeries.Transition
					key={`transition-${i}`}
					timing={linearTiming({durationInFrames: TRANSITION})}
					presentation={fade()}
				/>,
			);
		}
		children.push(
			<TransitionSeries.Sequence key={`scene-${i}`} durationInFrames={scene.duration}>
				{scene.node}
			</TransitionSeries.Sequence>,
		);
	});

	return (
		<AbsoluteFill style={{backgroundColor: theme.bg}}>
			<TransitionSeries>{children}</TransitionSeries>
		</AbsoluteFill>
	);
};
