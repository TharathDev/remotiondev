import manifestJson from '../narration/manifest.json';

export type Cue = {
	text: string;
	/** Frame, relative to the start of the scene, that this line begins on. */
	from: number;
	frames: number;
};

export type SceneTrack = {
	/** Path under public/, for staticFile(). */
	file: string;
	frames: number;
	lines: Cue[];
};

export type EpisodeTrack = {
	voice: string;
	scenes: Record<string, SceneTrack>;
};

const manifest = manifestJson as unknown as Record<string, EpisodeTrack>;

export const track = (episode: string, scene: string): SceneTrack | null =>
	manifest[episode]?.scenes[scene] ?? null;

/**
 * How long a scene should be: exactly as long as its narration, plus any extra
 * the visuals need to finish. Scenes get their duration from here rather than a
 * hand-tuned constant, so re-recording the narration re-times the film.
 *
 * Falls back to `fallback` when a scene has no narration yet, which keeps the
 * project renderable before `npm run tts` has been run.
 */
export const sceneFrames = (episode: string, scene: string, fallback = 180, extra = 0): number => {
	const found = track(episode, scene);
	return found ? found.frames + extra : fallback;
};

/**
 * The frame a given narration line starts on. Scenes use this to light a
 * callout exactly as it is spoken, instead of guessing an offset.
 */
export const cue = (episode: string, scene: string, line: number, fallback = 0): number =>
	track(episode, scene)?.lines[line]?.from ?? fallback;

/** The frame a given line finishes on. */
export const cueEnd = (episode: string, scene: string, line: number, fallback = 0): number => {
	const found = track(episode, scene)?.lines[line];
	return found ? found.from + found.frames : fallback;
};
