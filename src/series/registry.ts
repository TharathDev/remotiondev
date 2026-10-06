import React from 'react';
import {Ep01Connection, EP01_DURATION} from './ep01Connection';
import {Ep02Parse, EP02_DURATION} from './ep02Parse';
import {Ep03Plan, EP03_DURATION} from './ep03Plan';
import {Ep04Execute, EP04_DURATION} from './ep04Execute';
import {Ep05Return, EP05_DURATION} from './ep05Return';

export type Episode = {
	/** Remotion composition id, and the output filename: out/<id>.mp4 */
	id: string;
	number: string;
	title: string;
	part: string;
	durationInFrames: number;
	component: React.FC;
};

/**
 * The single source of truth for the series. Root.tsx registers a Composition
 * per entry and scripts/render-all.mjs renders one MP4 per entry, so adding an
 * episode means adding one line here and nothing else.
 */
export const EPISODES: Episode[] = [
	{
		id: '01-connection',
		number: '01',
		title: 'Connection',
		part: 'The life of a query',
		durationInFrames: EP01_DURATION,
		component: Ep01Connection,
	},
	{
		id: '02-parse',
		number: '02',
		title: 'Parse',
		part: 'The life of a query',
		durationInFrames: EP02_DURATION,
		component: Ep02Parse,
	},
	{
		id: '03-plan',
		number: '03',
		title: 'Plan',
		part: 'The life of a query',
		durationInFrames: EP03_DURATION,
		component: Ep03Plan,
	},
	{
		id: '04-execute',
		number: '04',
		title: 'Execute',
		part: 'The life of a query',
		durationInFrames: EP04_DURATION,
		component: Ep04Execute,
	},
	{
		id: '05-return',
		number: '05',
		title: 'Return',
		part: 'The life of a query',
		durationInFrames: EP05_DURATION,
		component: Ep05Return,
	},
];
