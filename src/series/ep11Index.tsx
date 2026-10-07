import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {Compare} from '../kit/Compare';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {cue, sceneFrames} from '../kit/narration';
import {SceneFrame} from '../kit/SceneFrame';
import {TitleCard} from '../kit/TitleCard';
import {Tree, TreeNode} from '../kit/Tree';
import {engines, theme} from '../theme';

const EP = '11-index';
const CHAPTER = '11 · INDEX';

const BTREE: TreeNode = {
	label: 'root',
	sub: '· 400 · 800 ·',
	children: [
		{label: '1 – 399', sub: '· 120 · 260 ·'},
		{label: '400 – 799', sub: '· 520 · 660 ·', children: [
			{label: '400 – 519'},
			{label: '520 – 659', sub: 'id = 571'},
			{label: '660 – 799'},
		]},
		{label: '800 +', sub: '· 910 · 1050 ·'},
	],
};

/** Lines: 0 a tree · 1 root, compare, branch · 2 three or four levels · 3 the trick. */
const Descent: React.FC = () => {
	const walk = cue(EP, 'btree', 1);
	const levels = cue(EP, 'btree', 2);
	const trick = cue(EP, 'btree', 3);

	return (
		<SceneFrame chapter={CHAPTER} step="The descent" narration={{episode: EP, scene: 'btree'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 38}}>
				<Heading>A lookup is a walk down a tree</Heading>

				<Tree root={BTREE} from={walk - 26} width={1340} levelHeight={132} />

				<div style={{display: 'flex', flexDirection: 'column', gap: 20, width: 1320}}>
					<Callout from={levels} label="Why it stays shallow" size={30}>
						Every level multiplies the fan-out, so millions of rows fit in three or four.
					</Callout>
					<Callout from={trick} label="The whole trick" accent={theme.ok} size={30}>
						A handful of page reads instead of reading everything.
					</Callout>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

/** Lines: 0 leaves differ · 1 InnoDB clustered · 2 secondary costs a second descent · 3 PG heap · 4 index costs writes. */
const Storage: React.FC = () => {
	const myAt = cue(EP, 'storage', 1);
	const second = cue(EP, 'storage', 2);
	const pgAt = cue(EP, 'storage', 3);
	const cost = cue(EP, 'storage', 4);

	return (
		<SceneFrame chapter={CHAPTER} step="What is in the leaf" narration={{episode: EP, scene: 'storage'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 38}}>
				<Heading>The leaves are where the engines part company</Heading>

				<Compare
					leftFrom={myAt}
					rightFrom={pgAt}
					left={
						<EnginePanel engine={engines.mysql} from={myAt - 26} width={640} tagline="clustered — the table is the index" minHeight={250}>
							<div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
								<div style={{fontFamily: theme.font, fontSize: 26, color: theme.ink, lineHeight: 1.45}}>
									The row itself lives in the primary key's leaf.
								</div>
								<Callout from={second} label="So" accent={engines.mysql.accent} size={25}>
									A secondary index stores the primary key — a miss costs a second descent.
								</Callout>
							</div>
						</EnginePanel>
					}
					right={
						<EnginePanel engine={engines.postgres} from={pgAt - 26} width={640} tagline="heap — the table is unordered" minHeight={250}>
							<div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
								<div style={{fontFamily: theme.font, fontSize: 26, color: theme.ink, lineHeight: 1.45}}>
									Every index points at a physical row location in the heap.
								</div>
								<Callout from={pgAt + 60} label="So" accent={engines.postgres.accent} size={25}>
									All indexes are equal, and none of them own the row.
								</Callout>
							</div>
						</EnginePanel>
					}
				/>

				<div style={{width: 1318}}>
					<Callout from={cost} label="Either way" accent={theme.warn} size={30}>
						Every index is paid for on every write. One nobody reads is pure tax.
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
				number="11"
				title="INDEX"
				subtitle="Three page reads instead of a million"
				part="The operations"
				agenda={['Walking a B-tree', 'Clustered vs heap', 'What every index costs']}
				agendaFrom={cue(EP, 'title', 2)}
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'btree'), node: <Descent />},
	{duration: sceneFrames(EP, 'storage'), node: <Storage />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="12 · TRANSACTION"
				narration={{episode: EP, scene: 'end'}}
				takeaways={[
					'A lookup is three or four page reads down a tree, not a scan.',
					'InnoDB puts the row in the leaf; PostgreSQL points at a heap location.',
					'Every index you add is paid for on every write.',
				]}
			/>
		),
	},
];

export const EP11_DURATION = filmDuration(SCENES);

export const Ep11Index: React.FC = () => <Film scenes={SCENES} />;
