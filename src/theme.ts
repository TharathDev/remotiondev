export const theme = {
	bg: '#0A0A0F',
	bgLift: '#13131C',
	ink: '#F5F3EF',
	muted: '#8B8798',
	accent: '#FF5A36',
	accent2: '#4C6FFF',
	font: '"Inter Display", "Inter", "Helvetica Neue", Arial, sans-serif',
	mono: 'ui-monospace, Menlo, Consolas, "DejaVu Sans Mono", monospace',
} as const;

/** Every scene is cut on this grid so the film has one tempo. */
export const BEAT = 15; // frames — half a second at 30fps
