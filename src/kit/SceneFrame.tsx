import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Grain} from '../components/Grain';
import {Vignette} from '../components/Vignette';
import {CAPTION_BAND, Captions} from './Captions';
import {Grid} from './Grid';
import {track} from './narration';
import {theme} from '../theme';

type Props = {
	children: React.ReactNode;
	/** Small label in the top-left, e.g. "02 · PARSE". */
	chapter?: string;
	/** Step counter in the top-right. */
	step?: string;
	grid?: boolean;
	/**
	 * Attaches this scene's narration: plays the audio, shows the caption, and
	 * lifts the content out of the caption band.
	 */
	narration?: {episode: string; scene: string};
};

const Chrome: React.FC<{text: string; side: 'left' | 'right'}> = ({text, side}) => (
	<div
		style={{
			position: 'absolute',
			top: 54,
			[side]: 72,
			fontFamily: theme.mono,
			fontSize: 22,
			letterSpacing: 4,
			color: theme.muted,
			textTransform: 'uppercase',
		}}
	>
		{text}
	</div>
);

/**
 * The shared ground for every scene: background, grid, episode chrome,
 * narration, captions, vignette and grain. Scenes supply only their content.
 */
export const SceneFrame: React.FC<Props> = ({children, chapter, step, grid = true, narration}) => {
	const frame = useCurrentFrame();
	const chrome = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const voice = narration ? track(narration.episode, narration.scene) : null;

	return (
		<AbsoluteFill style={{backgroundColor: theme.bg}}>
			{grid ? <Grid /> : null}

			{chapter || step ? (
				<AbsoluteFill style={{opacity: chrome * 0.75}}>
					{chapter ? <Chrome text={chapter} side="left" /> : null}
					{step ? <Chrome text={step} side="right" /> : null}
				</AbsoluteFill>
			) : null}

			{/*
			 * An AbsoluteFill fills its nearest positioned ancestor, so insetting
			 * this wrapper re-centres every scene's content above the caption band
			 * without any scene having to know the band exists.
			 */}
			<AbsoluteFill style={{bottom: voice ? CAPTION_BAND : 0}}>{children}</AbsoluteFill>

			{voice ? (
				<>
					<Audio src={staticFile(voice.file)} />
					<Captions lines={voice.lines} />
				</>
			) : null}

			<Vignette strength={0.55} />
			<Grain opacity={0.05} />
		</AbsoluteFill>
	);
};
