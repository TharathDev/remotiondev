import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {DataTable} from '../kit/DataTable';
import {EndCard} from '../kit/EndCard';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {cue, sceneFrames} from '../kit/narration';
import {Panel} from '../kit/Panel';
import {SceneFrame} from '../kit/SceneFrame';
import {SqlBlock} from '../kit/SqlBlock';
import {TitleCard} from '../kit/TitleCard';
import {theme} from '../theme';

const EP = '09-delete';
const CHAPTER = '09 · DELETE';

const ROWS: (string | number)[][] = [
	[1, 'ada@lovelace.dev', 'active'],
	[2, 'alan@turing.dev', 'expired'],
	[3, 'grace@hopper.dev', 'active'],
	[4, 'edsger@dijkstra.dev', 'expired'],
	[5, 'barbara@liskov.dev', 'active'],
];

/** Lines: 0 erases nothing · 1 marks + logs · 2 bytes stay · 3 no disk back. */
const Marked: React.FC = () => {
	const marks = cue(EP, 'mark', 1);
	const bytes = cue(EP, 'mark', 2);
	const disk = cue(EP, 'mark', 3);

	return (
		<SceneFrame chapter={CHAPTER} step="What a delete writes" narration={{episode: EP, scene: 'mark'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 38}}>
				<Heading>DELETE marks. It does not erase.</Heading>

				<SqlBlock
					sql={`DELETE FROM users WHERE status = 'expired';`}
					from={10}
					speed={3}
					size={28}
					chrome={false}
				/>

				<Panel from={marks - 26} width={1180} title="The page afterwards — the rows are still there">
					<DataTable
						columns={['id', 'email', 'status']}
						rows={ROWS}
						from={marks}
						dead={[1, 3]}
						deadFrom={marks + 26}
						size={26}
					/>
				</Panel>

				<div style={{display: 'flex', flexDirection: 'column', gap: 20, width: 1180}}>
					<Callout from={bytes} label="Still on the page" size={29}>
						Marked dead, logged, and left exactly where they were.
					</Callout>
					<Callout from={disk} label="The consequence" accent={theme.warn} size={29}>
						Deleting a million rows returns no disk at all.
					</Callout>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

/** Lines: 0 how then · 1 VACUUM reusable · 2 VACUUM FULL · 3 OPTIMIZE TABLE · 4 TRUNCATE. */
const Reclaim: React.FC = () => {
	const reusable = cue(EP, 'space', 1);
	const full = cue(EP, 'space', 2);
	const optimize = cue(EP, 'space', 3);
	const truncate = cue(EP, 'space', 4);

	return (
		<SceneFrame chapter={CHAPTER} step="Getting the space back" narration={{episode: EP, scene: 'space'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34}}>
				<Heading>Reusable is not the same as returned</Heading>

				<div style={{display: 'flex', flexDirection: 'column', gap: 22, width: 1320}}>
					<Callout from={reusable} label="VACUUM · reusable" accent={theme.ok} size={30}>
						New rows fill the gaps instead of extending the file. No lock worth worrying about.
					</Callout>
					<Callout from={full} label="VACUUM FULL · returned" accent={theme.warn} size={30}>
						Rewrites the table and hands space back — behind an exclusive lock.
					</Callout>
					<Callout from={optimize} label="OPTIMIZE TABLE · returned" accent={theme.warn} size={30}>
						MySQL's equivalent, rebuilding the tablespace the same way.
					</Callout>
					<Callout from={truncate} label="TRUNCATE · different thing entirely" size={30}>
						Drops the data files rather than marking rows one by one.
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
				number="09"
				title="DELETE"
				subtitle="The operation that frees no disk"
				part="The operations"
				agenda={['What a delete writes', 'Why the file stays big', 'How to actually shrink it']}
				agendaFrom={cue(EP, 'title', 2)}
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'mark'), node: <Marked />},
	{duration: sceneFrames(EP, 'space'), node: <Reclaim />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="10 · JOIN"
				narration={{episode: EP, scene: 'end'}}
				takeaways={[
					'DELETE marks rows dead and logs the change; the bytes stay until cleanup.',
					'Ordinary vacuum makes space reusable, not returnable.',
					'VACUUM FULL, OPTIMIZE TABLE and TRUNCATE shrink the file — and all take heavy locks.',
				]}
			/>
		),
	},
];

export const EP09_DURATION = filmDuration(SCENES);

export const Ep09Delete: React.FC = () => <Film scenes={SCENES} />;
