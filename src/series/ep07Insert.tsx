import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {Connector} from '../kit/Connector';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {cue, sceneFrames} from '../kit/narration';
import {SceneFrame} from '../kit/SceneFrame';
import {Stage} from '../kit/Stage';
import {TitleCard} from '../kit/TitleCard';
import {engines, theme} from '../theme';

const EP = '07-insert';
const CHAPTER = '07 · INSERT';

/**
 * The write path. Lines: 0 not the table first · 1 page + log · 2 log flushed,
 * then COMMIT · 3 the page can wait · 4 why a power cut is survivable.
 */
const WritePath: React.FC = () => {
	const logged = cue(EP, 'write', 1);
	const flushed = cue(EP, 'write', 2);
	const later = cue(EP, 'write', 3);
	const why = cue(EP, 'write', 4);

	return (
		<SceneFrame chapter={CHAPTER} step="The write path" narration={{episode: EP, scene: 'write'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46}}>
				<Heading>The row reaches the log before it reaches the table</Heading>

				<div style={{display: 'flex', alignItems: 'center'}}>
					<Stage label="INSERT" sub="your statement" from={14} active={[logged - 30, logged]} width={226} />
					<Connector from={22} travel={logged - 26} length={62} />
					<Stage label="Page" sub="in memory" from={22} active={[logged, flushed]} width={226} />
					<Connector from={30} travel={logged + 10} length={62} />
					<Stage label="WAL" sub="append-only" from={30} active={[logged + 30, flushed]} width={226} accent={theme.warn} />
					<Connector from={38} travel={flushed - 10} length={62} />
					<Stage label="fsync" sub="hits the disk" from={38} active={[flushed, flushed + 60]} width={226} accent={theme.warn} />
					<Connector from={46} travel={flushed + 20} length={62} />
					<Stage label="COMMIT" sub="returns to you" from={46} active={[flushed + 60, why + 400]} width={226} accent={theme.ok} />
				</div>

				<div style={{display: 'flex', flexDirection: 'column', gap: 22, width: 1320}}>
					<Callout from={later} label="The table page can wait" size={30}>
						It may be written minutes later, or never, if it changes again first.
					</Callout>
					<Callout from={why} label="Why a power cut is survivable" accent={theme.ok} size={30}>
						The log is the truth. The table catches up on recovery.
					</Callout>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

/** Torn pages. Lines: 0 both do this · 1 a page is bigger than a sector · 2 MySQL · 3 PostgreSQL. */
const TornPages: React.FC = () => {
	const problem = cue(EP, 'durability', 1);
	const mysqlAt = cue(EP, 'durability', 2);
	const pgAt = cue(EP, 'durability', 3);

	return (
		<SceneFrame chapter={CHAPTER} step="The torn page" narration={{episode: EP, scene: 'durability'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40}}>
				<Heading>A crash can leave a page half written</Heading>

				<div style={{width: 1320}}>
					<Callout from={problem} label="The problem" accent={theme.warn} size={30}>
						A 16KB page is many 4KB sectors. A crash between them leaves nonsense.
					</Callout>
				</div>

				<div style={{display: 'flex', gap: 38}}>
					<EnginePanel engine={engines.mysql} from={mysqlAt - 26} width={640} tagline="doublewrite buffer" minHeight={240}>
						<div style={{fontFamily: theme.font, fontSize: 27, color: theme.ink, lineHeight: 1.5}}>
							Every page is written twice: first into a scratch area, then into place. On
							recovery a torn page is rebuilt from the copy.
						</div>
					</EnginePanel>

					<EnginePanel engine={engines.postgres} from={pgAt - 26} width={640} tagline="full page writes" minHeight={240}>
						<div style={{fontFamily: theme.font, fontSize: 27, color: theme.ink, lineHeight: 1.5}}>
							The first change to a page after a checkpoint puts the whole page in the
							log, so recovery can replace it outright.
						</div>
					</EnginePanel>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

const SCENES: Scene[] = [
	{
		duration: sceneFrames(EP, 'title'),
		node: (
			<TitleCard
				number="07"
				title="INSERT"
				subtitle="Getting a row onto disk, and surviving the power going out"
				part="The operations"
				agenda={['Log first, table later', 'What COMMIT guarantees', 'Surviving a torn page']}
				agendaFrom={cue(EP, 'title', 2)}
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'write'), node: <WritePath />},
	{duration: sceneFrames(EP, 'durability'), node: <TornPages />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="08 · UPDATE"
				narration={{episode: EP, scene: 'end'}}
				takeaways={[
					'The write-ahead log is flushed before COMMIT returns; the table page can wait.',
					'That ordering is the whole of crash durability.',
					'A torn page is the real danger — doublewrite in MySQL, full page writes in PostgreSQL.',
				]}
			/>
		),
	},
];

export const EP07_DURATION = filmDuration(SCENES);

export const Ep07Insert: React.FC = () => <Film scenes={SCENES} />;
