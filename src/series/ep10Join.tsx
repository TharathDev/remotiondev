import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {cue, sceneFrames} from '../kit/narration';
import {Panel} from '../kit/Panel';
import {SceneFrame} from '../kit/SceneFrame';
import {TitleCard} from '../kit/TitleCard';
import {engines, theme} from '../theme';

const EP = '10-join';
const CHAPTER = '10 · JOIN';

const Strategy: React.FC<{
	name: string;
	shape: string;
	good: string;
	bad: string;
	from: number;
	accent: string;
}> = ({name, shape, good, bad, from, accent}) => (
	<Panel from={from} width={430} title={name} accent={accent}>
		<div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
			<div
				style={{
					fontFamily: theme.mono,
					fontSize: 21,
					color: accent,
					lineHeight: 1.5,
					minHeight: 64,
				}}
			>
				{shape}
			</div>
			<div style={{fontFamily: theme.font, fontSize: 24, color: theme.ink, lineHeight: 1.45}}>
				<span style={{color: theme.ok}}>Good:</span> {good}
			</div>
			<div style={{fontFamily: theme.font, fontSize: 24, color: theme.ink, lineHeight: 1.45}}>
				<span style={{color: theme.warn}}>Bad:</span> {bad}
			</div>
		</div>
	</Panel>
);

/** Lines: 0 three ways · 1 nested loop · 2 hash · 3 merge. */
const Strategies: React.FC = () => {
	const loop = cue(EP, 'strategies', 1);
	const hash = cue(EP, 'strategies', 2);
	const merge = cue(EP, 'strategies', 3);

	return (
		<SceneFrame chapter={CHAPTER} step="Three strategies" narration={{episode: EP, scene: 'strategies'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44}}>
				<Heading>One join, three ways to run it</Heading>

				<div style={{display: 'flex', gap: 32}}>
					<Strategy
						from={loop - 26}
						accent={theme.accent}
						name="Nested loop"
						shape={'for each left row:\n  probe right index'}
						good="a tiny left side, an indexed right side"
						bad="a big left side — it probes once per row"
					/>
					<Strategy
						from={hash - 26}
						accent={theme.accent2}
						name="Hash join"
						shape={'build hash of smaller side\nstream larger side past it'}
						good="big unsorted joins"
						bad="needs memory; spills to disk without it"
					/>
					<Strategy
						from={merge - 26}
						accent={theme.ok}
						name="Merge join"
						shape={'sort both sides\nwalk them in step'}
						good="inputs already sorted"
						bad="pays for two sorts if they are not"
					/>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

/** Lines: 0 how choose · 1 estimates · 2 bad estimate · 3 engine history. */
const Choosing: React.FC = () => {
	const estimates = cue(EP, 'choosing', 1);
	const wrong = cue(EP, 'choosing', 2);
	const history = cue(EP, 'choosing', 3);

	return (
		<SceneFrame chapter={CHAPTER} step="How it chooses" narration={{episode: EP, scene: 'choosing'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 38}}>
				<Heading>The choice is only as good as the row estimate</Heading>

				<div style={{display: 'flex', flexDirection: 'column', gap: 20, width: 1320}}>
					<Callout from={estimates} label="How" size={30}>
						It estimates rows from each side, then prices all three.
					</Callout>
					<Callout from={wrong} label="When it goes wrong" accent={theme.warn} size={30}>
						A nested loop chosen for ten rows, run over a million.
					</Callout>
				</div>

				<div style={{display: 'flex', gap: 38}}>
					<EnginePanel engine={engines.mysql} from={history - 26} width={640} tagline="hash join since 8.0.18" minHeight={170}>
						<div style={{fontFamily: theme.font, fontSize: 26, color: theme.ink, lineHeight: 1.5}}>
							Nested loops only, for most of its life.
						</div>
					</EnginePanel>

					<EnginePanel engine={engines.postgres} from={history - 18} width={640} tagline="all three, for decades" minHeight={170}>
						<div style={{fontFamily: theme.font, fontSize: 26, color: theme.ink, lineHeight: 1.5}}>
							Switches between them as your statistics change.
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
				number="10"
				title="JOIN"
				subtitle="Three strategies, and how the planner picks one"
				part="The operations"
				agenda={['Nested loop, hash, merge', 'What each is good at', 'How the planner decides']}
				agendaFrom={cue(EP, 'title', 2)}
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'strategies'), node: <Strategies />},
	{duration: sceneFrames(EP, 'choosing'), node: <Choosing />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="11 · INDEX"
				narration={{episode: EP, scene: 'end'}}
				takeaways={[
					'Nested loop, hash join, merge join — one query, three very different costs.',
					'The planner prices them from row estimates, so a bad estimate is a bad join.',
					'A nested loop over a large unindexed side is the classic disaster.',
				]}
			/>
		),
	},
];

export const EP10_DURATION = filmDuration(SCENES);

export const Ep10Join: React.FC = () => <Film scenes={SCENES} />;
