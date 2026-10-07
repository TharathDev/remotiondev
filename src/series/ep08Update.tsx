import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {Compare} from '../kit/Compare';
import {DataTable} from '../kit/DataTable';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {cue, sceneFrames} from '../kit/narration';
import {Panel} from '../kit/Panel';
import {SceneFrame} from '../kit/SceneFrame';
import {SqlBlock} from '../kit/SqlBlock';
import {TitleCard} from '../kit/TitleCard';
import {engines, theme} from '../theme';

const EP = '08-update';
const CHAPTER = '08 · UPDATE';

const ROWS: (string | number)[][] = [
	[7, 'ada@lovelace.dev', 'active', 'xmin 412'],
	[7, 'ada@lovelace.dev', 'paused', 'xmin 907'],
];

/**
 * MVCC. Lines: 0 not overwritten · 1 PostgreSQL new tuple · 2 InnoDB undo ·
 * 3 old readers still see the old value · 4 nobody blocks.
 */
const Versions: React.FC = () => {
	const pgAt = cue(EP, 'mvcc', 1);
	const myAt = cue(EP, 'mvcc', 2);
	const readers = cue(EP, 'mvcc', 3);
	const blocking = cue(EP, 'mvcc', 4);

	return (
		<SceneFrame chapter={CHAPTER} step="Two versions" narration={{episode: EP, scene: 'mvcc'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36}}>
				<Heading>The old value does not go anywhere</Heading>

				<SqlBlock
					sql={`UPDATE users SET status = 'paused' WHERE id = 7;`}
					from={10}
					speed={3}
					size={28}
					chrome={false}
				/>

				<Panel from={pgAt - 26} width={1180} title="The same row, in PostgreSQL, after the update">
					<DataTable
						columns={['id', 'email', 'status', 'version']}
						rows={ROWS}
						from={pgAt}
						dead={[0]}
						deadFrom={pgAt + 24}
						size={26}
					/>
				</Panel>

				<div style={{display: 'flex', flexDirection: 'column', gap: 20, width: 1180}}>
					<Callout from={myAt} label="InnoDB" accent={engines.mysql.accent} size={29}>
						Writes in place, and keeps the old value in the undo log.
					</Callout>
					<Callout from={readers} label="Why it matters" accent={theme.ok} size={29}>
						A reader that started earlier still sees <em>active</em>.
					</Callout>
					<Callout from={blocking} label="MVCC" size={29}>
						Readers never block writers; writers never block readers.
					</Callout>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

/** Cleanup. Lines: 0 somebody has to · 1 autovacuum · 2 purge thread · 3 bloat. */
const Cleanup: React.FC = () => {
	const pgAt = cue(EP, 'cleanup', 1);
	const myAt = cue(EP, 'cleanup', 2);
	const bloat = cue(EP, 'cleanup', 3);

	return (
		<SceneFrame chapter={CHAPTER} step="Who clears up" narration={{episode: EP, scene: 'cleanup'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40}}>
				<Heading>Old versions have to be collected</Heading>

				<Compare
					leftFrom={myAt}
					rightFrom={pgAt}
					left={
						<EnginePanel engine={engines.mysql} from={myAt - 26} width={640} tagline="purge thread" minHeight={230}>
							<div style={{fontFamily: theme.font, fontSize: 27, color: theme.ink, lineHeight: 1.5}}>
								Discards undo records once no transaction can still see them. Blocked, the
								undo log grows instead.
							</div>
						</EnginePanel>
					}
					right={
						<EnginePanel engine={engines.postgres} from={pgAt - 26} width={640} tagline="autovacuum" minHeight={230}>
							<div style={{fontFamily: theme.font, fontSize: 27, color: theme.ink, lineHeight: 1.5}}>
								Marks dead tuples reusable so the table stops growing. Blocked, the table
								bloats instead.
							</div>
						</EnginePanel>
					}
				/>

				<div style={{width: 1318}}>
					<Callout from={bloat} label="The one thing that breaks both" accent={theme.warn} size={30}>
						A transaction left open. Nothing older than it can be collected.
					</Callout>
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
				number="08"
				title="UPDATE"
				subtitle="Why nothing is ever really overwritten"
				part="The operations"
				agenda={['Where the old value goes', 'Why nobody blocks', 'Who clears up after']}
				agendaFrom={cue(EP, 'title', 2)}
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'mvcc'), node: <Versions />},
	{duration: sceneFrames(EP, 'cleanup'), node: <Cleanup />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="09 · DELETE"
				narration={{episode: EP, scene: 'end'}}
				takeaways={[
					'Nothing is overwritten — the old value survives as a dead tuple or an undo record.',
					'That is what lets readers and writers run without blocking each other.',
					'An idle open transaction is what turns that into bloat.',
				]}
			/>
		),
	},
];

export const EP08_DURATION = filmDuration(SCENES);

export const Ep08Update: React.FC = () => <Film scenes={SCENES} />;
