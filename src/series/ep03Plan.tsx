import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {CostMeter} from '../kit/CostMeter';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {Panel} from '../kit/Panel';
import {SceneFrame} from '../kit/SceneFrame';
import {SqlBlock} from '../kit/SqlBlock';
import {TitleCard} from '../kit/TitleCard';
import {engines, theme} from '../theme';

const CHAPTER = '03 · Plan';

/** One query, several ways to answer it. The planner prices each one. */
const Candidates: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="Costing">
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46}}>
			<Heading>One query. Several ways to answer it.</Heading>

			<SqlBlock
				sql={`SELECT id, email FROM users WHERE id = 42;`}
				from={14}
				speed={2.6}
				size={32}
				chrome={false}
			/>

			<Panel from={34} width={1200} title="Candidate plans · cost in arbitrary planner units">
				<div style={{display: 'flex', flexDirection: 'column', gap: 34}}>
					<CostMeter label="Seq Scan on users" cost={1842.0} max={1842} from={50} />
					<CostMeter label="Bitmap Heap Scan" cost={412.55} max={1842} from={62} />
					<CostMeter
						label="Index Scan using users_pkey"
						cost={8.3}
						max={1842}
						from={74}
						chosen
						chosenFrom={108}
					/>
				</div>
			</Panel>

			<div style={{width: 1200}}>
				<Callout from={118} label="The rule">
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
	<SceneFrame chapter={CHAPTER} step="Reading the plan">
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44}}>
			<Heading>EXPLAIN shows the estimate. ANALYZE shows the truth.</Heading>

			<SqlBlock sql={`EXPLAIN ANALYZE SELECT id, email FROM users WHERE id = 42;`} from={14} speed={3} size={30} chrome={false} />

			<Panel from={40} width={1180} title="PostgreSQL output">
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

			<div style={{width: 1180, display: 'flex', flexDirection: 'column', gap: 20}}>
				<Callout from={92} label="cost=" accent={theme.warn}>
					The guess, in planner units. Startup cost, then total cost.
				</Callout>
				<Callout from={110} label="actual time=" accent={theme.ok}>
					The measurement, in milliseconds. When <em>rows</em> here is far from the
					estimate, your statistics are stale — run ANALYZE.
				</Callout>
			</div>
		</AbsoluteFill>
	</SceneFrame>
);

/** How each engine keeps the numbers it plans with. */
const Statistics: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="Where the numbers come from">
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50}}>
			<Heading>A planner is only as good as its statistics</Heading>

			<div style={{display: 'flex', gap: 40}}>
				<EnginePanel engine={engines.mysql} from={14} tagline="EXPLAIN · EXPLAIN ANALYZE" minHeight={360}>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
						<Callout from={34} label="Index dives" accent={engines.mysql.accent} size={25}>
							InnoDB samples index pages at plan time to estimate how many rows a
							range will match.
						</Callout>
						<Callout from={50} label="Histograms" accent={engines.mysql.accent} size={25}>
							Column histograms are opt-in: ANALYZE TABLE … UPDATE HISTOGRAM ON.
						</Callout>
						<Callout from={66} label="Joins" accent={engines.mysql.accent} size={25}>
							Greedy search over join orders, with hash join available since 8.0.18.
						</Callout>
					</div>
				</EnginePanel>

				<EnginePanel engine={engines.postgres} from={22} tagline="EXPLAIN · EXPLAIN ANALYZE" minHeight={360}>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
						<Callout from={42} label="pg_statistic" accent={engines.postgres.accent} size={25}>
							ANALYZE samples rows and stores histograms, most-common values and
							null fractions.
						</Callout>
						<Callout from={58} label="Autovacuum" accent={engines.postgres.accent} size={25}>
							The autovacuum daemon re-runs ANALYZE as tables drift, so estimates
							keep up without you.
						</Callout>
						<Callout from={74} label="Joins" accent={engines.postgres.accent} size={25}>
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
		duration: 100,
		node: (
			<TitleCard
				number="03"
				title="PLAN"
				subtitle="Choosing the cheapest way to answer, before answering"
				part="The life of a query"
			/>
		),
	},
	{duration: 185, node: <Candidates />},
	{duration: 185, node: <Explain />},
	{duration: 180, node: <Statistics />},
	{
		duration: 130,
		node: (
			<EndCard
				next="04 · Execute"
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
