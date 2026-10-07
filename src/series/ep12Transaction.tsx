import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {EndCard} from '../kit/EndCard';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {Matrix} from '../kit/Matrix';
import {cue, sceneFrames} from '../kit/narration';
import {Panel} from '../kit/Panel';
import {SceneFrame} from '../kit/SceneFrame';
import {SqlBlock} from '../kit/SqlBlock';
import {TitleCard} from '../kit/TitleCard';
import {engines, theme} from '../theme';

const EP = '12-transaction';
const CHAPTER = '12 · TRANSACTION';

/** Lines: 0 begin/commit/rollback · 1 invisible · 2 COMMIT · 3 ROLLBACK · 4 asymmetry. */
const Lifecycle: React.FC = () => {
	const hidden = cue(EP, 'lifecycle', 1);
	const commit = cue(EP, 'lifecycle', 2);
	const rollback = cue(EP, 'lifecycle', 3);
	const cheap = cue(EP, 'lifecycle', 4);

	return (
		<SceneFrame chapter={CHAPTER} step="The shape of it" narration={{episode: EP, scene: 'lifecycle'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 28}}>
				<Heading>Several statements, one outcome</Heading>

				<SqlBlock
					sql={`BEGIN;\n  UPDATE accounts SET balance = balance - 100 WHERE id = 1;\n  UPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;`}
					from={10}
					speed={3.6}
					size={27}
					caption="all of it, or none of it"
					emphasis={[{text: 'COMMIT', from: commit, color: theme.ok}]}
				/>

				<div style={{display: 'flex', flexDirection: 'column', gap: 20, width: 1320}}>
					<Callout from={hidden} label="Until you commit" size={29}>
						Nothing you have done is visible to anyone else.
					</Callout>
					<Callout from={commit} label="COMMIT" accent={theme.ok} size={29}>
						Flushes the log; durable and visible at the same instant.
					</Callout>
					<Callout from={rollback} label="ROLLBACK" accent={theme.warn} size={29}>
						InnoDB walks the undo log back. PostgreSQL just never marks the new tuples live.
					</Callout>
					<Callout from={cheap} label="Which means" size={29}>
						A huge rollback is nearly free in PostgreSQL. Not in InnoDB.
					</Callout>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

/** Lines: 0 the question · 1 read uncommitted · 2 read committed · 3 repeatable read · 4 serializable. */
const Isolation: React.FC = () => {
	const uncommitted = cue(EP, 'isolation', 1);
	const committed = cue(EP, 'isolation', 2);
	const repeatable = cue(EP, 'isolation', 3);
	const serializable = cue(EP, 'isolation', 4);

	return (
		<SceneFrame chapter={CHAPTER} step="Four levels" narration={{episode: EP, scene: 'isolation'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40}}>
				<Heading>What you can see while someone else is writing</Heading>

				<Panel from={uncommitted - 30} width={1420} title="What each level still allows">
					<Matrix
						columns={['dirty read', 'non-repeatable read', 'phantom']}
						from={uncommitted - 10}
						rows={[
							{label: 'Read uncommitted', cells: [true, true, true]},
							{label: 'Read committed', note: "PostgreSQL's default", cells: [false, true, true]},
							{label: 'Repeatable read', note: "MySQL's default", cells: [false, false, true]},
							{label: 'Serializable', cells: [false, false, false]},
						]}
						highlight={undefined}
					/>
				</Panel>

				<div style={{display: 'flex', gap: 24, width: 1420}}>
					<div style={{flex: 1}}>
						<Callout from={committed} label="Read committed" accent={engines.postgres.accent} size={27}>
							Every statement gets a fresh snapshot.
						</Callout>
					</div>
					<div style={{flex: 1}}>
						<Callout from={repeatable} label="Repeatable read" accent={engines.mysql.accent} size={27}>
							The whole transaction gets one snapshot.
						</Callout>
					</div>
					<div style={{flex: 1}}>
						<Callout from={serializable} label="Serializable" accent={theme.ok} size={27}>
							Guaranteed — and it may abort you to keep that promise.
						</Callout>
					</div>
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
				number="12"
				title="TRANSACTION"
				subtitle="Making several operations behave as one"
				part="The operations"
				agenda={['COMMIT and ROLLBACK', 'The four isolation levels', 'What each engine defaults to']}
				agendaFrom={cue(EP, 'title', 2)}
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'lifecycle'), node: <Lifecycle />},
	{duration: sceneFrames(EP, 'isolation'), node: <Isolation />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				narration={{episode: EP, scene: 'end'}}
				takeaways={[
					'COMMIT makes work durable and visible at one instant; ROLLBACK discards it.',
					'The four isolation levels trade visibility anomalies against concurrency.',
					'PostgreSQL defaults to read committed, MySQL to repeatable read — the same code behaves differently on each.',
				]}
			/>
		),
	},
];

export const EP12_DURATION = filmDuration(SCENES);

export const Ep12Transaction: React.FC = () => <Film scenes={SCENES} />;
