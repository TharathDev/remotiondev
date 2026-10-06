import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {CostMeter} from '../kit/CostMeter';
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

const EP = '03-plan';
const CHAPTER = '03 · Plan';

/** One query, several ways to answer it. The planner prices each one. */
const Candidates: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="Costing" narration={{episode: EP, scene: 'candidates'}}>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46}}>
			<Heading>One query. Several ways to answer it.</Heading>

			<SqlBlock
				sql={`SELECT id, email FROM users WHERE id = 42;`}
				from={10}
				speed={2.6}
				size={32}
				chrome={false}
			/>

			<Panel from={cue(EP, 'candidates', 1) - 24} width={1200} title="Candidate plans · cost in arbitrary planner units">
				<div style={{display: 'flex', flexDirection: 'column', gap: 34}}>
					<CostMeter label="Seq Scan on users" cost={1842.0} max={1842} from={cue(EP, 'candidates', 1) + 10} />
					<CostMeter label="Bitmap Heap Scan" cost={412.55} max={1842} from={cue(EP, 'candidates', 1) + 45} />
					<CostMeter
						label="Index Scan using users_pkey"
						cost={8.3}
						max={1842}
						from={cue(EP, 'candidates', 2)}
						chosen
						chosenFrom={cue(EP, 'candidates', 3)}
					/>
				</div>
			</Panel>

			<div style={{width: 1200}}>
				<Callout from={cue(EP, 'candidates', 4)} label="The rule">
					The planner never asks which plan is fastest. It asks which plan it <em>estimates</em>{' '}
					is cheapest — and it is only as right as its statistics.
				</Callout>
			</div>
		</AbsoluteFill>
	</SceneFrame>
);

const EXPLAIN_OUT = `Index Scan using users_pkey on users
  (cost=0.29..8.30 rows=1 width=36)
  (actual time=0.021..0.022 rows=1 loops=1)
  Index Cond: (id = 42)
Planning Time: 0.094 ms
Execution Time: 0.041 ms`;

/** Reading the plan the server actually chose. */
const Explain: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="Reading the plan" narration={{episode: EP, scene: 'explain'}}>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30}}>
			<Heading>EXPLAIN shows the estimate. ANALYZE shows the truth.</Heading>

			<SqlBlock sql={`EXPLAIN ANALYZE SELECT id, email FROM users WHERE id = 42;`} from={10} speed={3} size={30} chrome={false} />

			<Panel from={cue(EP, 'explain', 1) - 30} width={1180} title="PostgreSQL output">
				<pre
					style={{
						fontFamily: theme.mono,
						fontSize: 27,
						lineHeight: 1.6,
						color: theme.ink,
						margin: 0,
						whiteSpace: 'pre-wrap',
					}}
				>
					{EXPLAIN_OUT}
				</pre>
			</Panel>

			{/* One line each: the narration carries the detail, and a paragraph here
			    pushes the scene into the caption band. */}
			<div style={{width: 1180, display: 'flex', flexDirection: 'column', gap: 16}}>
				<Callout from={cue(EP, 'explain', 1)} label="cost=" accent={theme.warn} size={28}>
					The guess, in planner units.
				</Callout>
				<Callout from={cue(EP, 'explain', 2)} label="actual time=" accent={theme.ok} size={28}>
					The measurement, in milliseconds.
				</Callout>
			</div>
		</AbsoluteFill>
	</SceneFrame>
);

/** How each engine keeps the numbers it plans with. */
const Statistics: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="Where the numbers come from" narration={{episode: EP, scene: 'statistics'}}>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50}}>
			<Heading>A planner is only as good as its statistics</Heading>

			<div style={{display: 'flex', gap: 40}}>
				<EnginePanel engine={engines.mysql} from={cue(EP, 'statistics', 1) - 26} tagline="EXPLAIN · EXPLAIN ANALYZE" minHeight={360}>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
						<Callout from={cue(EP, 'statistics', 1)} label="Index dives" accent={engines.mysql.accent} size={25}>
							InnoDB samples index pages at plan time to estimate how many rows a
							range will match.
						</Callout>
						<Callout from={cue(EP, 'statistics', 1) + 50} label="Histograms" accent={engines.mysql.accent} size={25}>
							Column histograms are opt-in: ANALYZE TABLE … UPDATE HISTOGRAM ON.
						</Callout>
						<Callout from={cue(EP, 'statistics', 3)} label="Joins" accent={engines.mysql.accent} size={25}>
							Greedy search over join orders, with hash join available since 8.0.18.
						</Callout>
					</div>
				</EnginePanel>

				<EnginePanel engine={engines.postgres} from={cue(EP, 'statistics', 2) - 26} tagline="EXPLAIN · EXPLAIN ANALYZE" minHeight={360}>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
						<Callout from={cue(EP, 'statistics', 2)} label="pg_statistic" accent={engines.postgres.accent} size={25}>
							ANALYZE samples rows and stores histograms, most-common values and
							null fractions.
						</Callout>
						<Callout from={cue(EP, 'statistics', 2) + 55} label="Autovacuum" accent={engines.postgres.accent} size={25}>
							The autovacuum daemon re-runs ANALYZE as tables drift, so estimates
							keep up without you.
						</Callout>
						<Callout from={cue(EP, 'statistics', 3) + 12} label="Joins" accent={engines.postgres.accent} size={25}>
							Exhaustive search for few tables; a genetic algorithm past
							geqo_threshold.
						</Callout>
					</div>
				</EnginePanel>
			</div>
		</AbsoluteFill>
	</SceneFrame>
);

const SCENES: Scene[] = [
	{
		duration: sceneFrames(EP, 'title'),
		node: (
			<TitleCard
				number="03"
				title="PLAN"
				subtitle="Choosing the cheapest way to answer, before answering"
				part="The life of a query"
				agenda={[
					'Many plans, one query',
					'Reading EXPLAIN',
					'Where the numbers come from',
				]}
				// The agenda lands with the "three things" line, not before it.
				agendaFrom={cue(EP, 'title', 2)}
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'candidates'), node: <Candidates />},
	{duration: sceneFrames(EP, 'explain'), node: <Explain />},
	{duration: sceneFrames(EP, 'statistics'), node: <Statistics />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="04 · Execute"
				narration={{episode: EP, scene: 'end'}}
				takeaways={[
					'The planner prices every candidate plan and picks the cheapest estimate — not the fastest plan.',
					'EXPLAIN gives you the estimate; EXPLAIN ANALYZE runs it and gives you the truth.',
					'A big gap between estimated and actual rows means stale statistics, not a bad planner.',
				]}
			/>
		),
	},
];

export const EP03_DURATION = filmDuration(SCENES);

export const Ep03Plan: React.FC = () => <Film scenes={SCENES} />;
