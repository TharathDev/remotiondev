import React from 'react';
import {Ep01Connection, EP01_DURATION} from './ep01Connection';
import {Ep02Parse, EP02_DURATION} from './ep02Parse';
import {Ep03Plan, EP03_DURATION} from './ep03Plan';
import {Ep04Execute, EP04_DURATION} from './ep04Execute';
import {Ep05Return, EP05_DURATION} from './ep05Return';
import {Ep06Select, EP06_DURATION} from './ep06Select';
import {Ep07Insert, EP07_DURATION} from './ep07Insert';
import {Ep08Update, EP08_DURATION} from './ep08Update';
import {Ep09Delete, EP09_DURATION} from './ep09Delete';
import {Ep10Join, EP10_DURATION} from './ep10Join';
import {Ep11Index, EP11_DURATION} from './ep11Index';
import {Ep12Transaction, EP12_DURATION} from './ep12Transaction';

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
	{
		id: '06-select',
		number: '06',
		title: 'Select',
		part: 'The operations',
		durationInFrames: EP06_DURATION,
		component: Ep06Select,
	},
	{
		id: '07-insert',
		number: '07',
		title: 'Insert',
		part: 'The operations',
		durationInFrames: EP07_DURATION,
		component: Ep07Insert,
	},
	{
		id: '08-update',
		number: '08',
		title: 'Update',
		part: 'The operations',
		durationInFrames: EP08_DURATION,
		component: Ep08Update,
	},
	{
		id: '09-delete',
		number: '09',
		title: 'Delete',
		part: 'The operations',
		durationInFrames: EP09_DURATION,
		component: Ep09Delete,
	},
	{
		id: '10-join',
		number: '10',
		title: 'Join',
		part: 'The operations',
		durationInFrames: EP10_DURATION,
		component: Ep10Join,
	},
	{
		id: '11-index',
		number: '11',
		title: 'Index',
		part: 'The operations',
		durationInFrames: EP11_DURATION,
		component: Ep11Index,
	},
	{
		id: '12-transaction',
		number: '12',
		title: 'Transaction',
		part: 'The operations',
		durationInFrames: EP12_DURATION,
		component: Ep12Transaction,
	},
];
