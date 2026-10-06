import React from 'react';
import {Composition} from 'remotion';
import {MyComp, TOTAL_DURATION} from './MyComp';
import {EPISODES} from './series/registry';

/**
 * Every composition renders at 1920x1080 / 30fps, so the episode MP4s can be
 * concatenated without re-encoding.
 */
export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="MyComp"
				component={MyComp}
				durationInFrames={TOTAL_DURATION}
				width={1920}
				height={1080}
				fps={30}
				defaultProps={{}}
			/>

			{EPISODES.map((episode) => (
				<Composition
					key={episode.id}
					id={episode.id}
					component={episode.component}
					durationInFrames={episode.durationInFrames}
					width={1920}
					height={1080}
					fps={30}
					defaultProps={{}}
				/>
			))}
		</>
	);
};
