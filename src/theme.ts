export const theme = {
	bg: '#0A0A0F',
	bgLift: '#13131C',
	bgPanel: '#171722',
	ink: '#F5F3EF',
	muted: '#8B8798',
	faint: 'rgba(245,243,239,0.08)',
	accent: '#FF5A36',
	accent2: '#4C6FFF',
	ok: '#3DD68C',
	warn: '#FFC53D',
	font: '"Inter Display", "Inter", "Helvetica Neue", Arial, sans-serif',
	mono: 'ui-monospace, Menlo, Consolas, "DejaVu Sans Mono", monospace',
} as const;

/** Every scene is cut on this grid so the film has one tempo. */
export const BEAT = 15; // frames — half a second at 30fps

/**
 * The two engines the series compares. Colours are each project's own brand
 * hue, pushed to stay legible on the dark ground and distinguishable from the
 * neutral accent.
 */
export const engines = {
	mysql: {
		key: 'mysql',
		name: 'MySQL',
		mark: 'My',
		accent: '#F29111',
		soft: 'rgba(242,145,17,0.14)',
		edge: 'rgba(242,145,17,0.42)',
	},
	postgres: {
		key: 'postgres',
		name: 'PostgreSQL',
		mark: 'Pg',
		accent: '#4C9BE8',
		soft: 'rgba(76,155,232,0.14)',
		edge: 'rgba(76,155,232,0.42)',
	},
} as const;

export type Engine = (typeof engines)[keyof typeof engines];
