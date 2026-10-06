import React from 'react';
import {AbsoluteFill} from 'remotion';

/** Darkens the corners so the eye stays in the middle third. */
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.7}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,${strength}) 100%)`,
		}}
	/>
);
