import React from 'react';
import {Composition} from 'remotion';
import {MyComp, TOTAL_DURATION} from './MyComp';

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
		</>
	);
};
