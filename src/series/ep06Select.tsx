import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {Connector} from '../kit/Connector';
import {CostMeter} from '../kit/CostMeter';
import {EndCard} from '../kit/EndCard';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {cue, sceneFrames} from '../kit/narration';
import {Panel} from '../kit/Panel';
import {SceneFrame} from '../kit/SceneFrame';
import {SqlBlock} from '../kit/SqlBlock';
import {Stage} from '../kit/Stage';
import {TitleCard} from '../kit/TitleCard';
import {theme} from '../theme';

const EP = '06-select';
const CHAPTER = '06 · SELECT';

/**
 * The clause order. Lines: 0 written vs run · 1 FROM first · 2 WHERE then
 * GROUP BY then SELECT · 3 ORDER BY and LIMIT · 4 why an alias fails in WHERE.
 */
const ClauseOrder: React.FC = () => {
	const from = cue(EP, 'order', 1);
	const middle = cue(EP, 'order', 2);
	const tail = cue(EP, 'order', 3);
	const alias = cue(EP, 'order', 4);

	return (
		<SceneFrame chapter={CHAPTER} step="Logical order" narration={{episode: EP, scene: 'order'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30}}>
				<Heading>You write it in one order. It runs in another.</Heading>

				<SqlBlock
					sql={`SELECT name, count(*) AS n FROM orders\nWHERE status = 'paid' GROUP BY name\nORDER BY n DESC LIMIT 10;`}
					from={10}
					speed={3.4}
					size={28}
					caption="as written"
				/>

				<div style={{display: 'flex', alignItems: 'center'}}>
					<Stage label="FROM" sub="pick the table" from={from - 20} active={[from, middle]} width={178} />
					<Connector from={from - 14} travel={from + 4} length={38} />
					<Stage label="WHERE" sub="drop rows" from={from - 12} active={[middle, middle + 60]} width={178} />
					<Connector from={from - 6} travel={middle + 6} length={38} />
					<Stage label="GROUP BY" sub="fold rows" from={from - 4} active={[middle + 60, middle + 110]} width={178} />
					<Connector from={from + 2} travel={middle + 60} length={38} />
					<Stage label="HAVING" sub="drop groups" from={from + 4} active={[middle + 110, tail]} width={178} />
					<Connector from={from + 10} travel={middle + 110} length={38} />
					<Stage label="SELECT" sub="pick columns" from={from + 12} active={[tail - 40, tail]} width={178} />
					<Connector from={from + 18} travel={tail - 30} length={38} />
					<Stage label="ORDER BY" sub="sort" from={from + 20} active={[tail, tail + 50]} width={178} />
					<Connector from={from + 26} travel={tail + 6} length={38} />
					<Stage label="LIMIT" sub="cut" from={from + 28} active={[tail + 50, alias + 400]} width={178} />
				</div>

				<div style={{width: 1300}}>
					<Callout from={alias} label="Why the alias fails" accent={theme.warn} size={30}>
						WHERE runs before SELECT, so <code style={{fontFamily: theme.mono}}>n</code> does not exist yet.
					</Callout>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

/** SELECT * as a read-volume decision. Lines: 0 intro · 1 not typing · 2 pages · 3 covering index. */
const SelectStar: React.FC = () => {
	const reading = cue(EP, 'star', 1);
	const pages = cue(EP, 'star', 2);
	const covering = cue(EP, 'star', 3);

	return (
		<SceneFrame chapter={CHAPTER} step="What star costs" narration={{episode: EP, scene: 'star'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40}}>
				<Heading>Naming columns is a read-volume decision</Heading>

				<div style={{display: 'flex', gap: 36}}>
					<Panel from={reading - 24} width={640} title="SELECT * FROM orders WHERE id = 42">
						<div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
							<CostMeter
								label="pages read"
								cost={42}
								max={42}
								from={pages}
								unit="pages"
								format={(v) => String(Math.round(v))}
							/>
							<div style={{fontFamily: theme.font, fontSize: 25, color: theme.muted, lineHeight: 1.45}}>
								The index finds the row, then the heap is visited for every column you did not need.
							</div>
						</div>
					</Panel>

					<Panel from={reading - 16} width={640} title="SELECT id, email FROM orders WHERE id = 42" accent={theme.ok}>
						<div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
							<CostMeter
								label="pages read"
								cost={3}
								max={42}
								from={pages + 20}
								unit="pages"
								format={(v) => String(Math.round(v))}
								accent={theme.ok}
							/>
							<div style={{fontFamily: theme.font, fontSize: 25, color: theme.muted, lineHeight: 1.45}}>
								Both columns live in the index, so the heap is never touched at all.
							</div>
						</div>
					</Panel>
				</div>

				<div style={{width: 1316}}>
					<Callout from={covering} label="Covering index" accent={theme.ok} size={30}>
						An index that answers the whole query on its own.
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
				number="06"
				title="SELECT"
				subtitle="The clause you write first, and the server runs last"
				part="The operations"
				agenda={['The real clause order', 'Why an alias fails in WHERE', 'What SELECT * costs']}
				agendaFrom={cue(EP, 'title', 2)}
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'order'), node: <ClauseOrder />},
	{duration: sceneFrames(EP, 'star'), node: <SelectStar />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="07 · INSERT"
				narration={{episode: EP, scene: 'end'}}
				takeaways={[
					'Clauses run FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT — not the order you type them.',
					'That order is why a SELECT alias cannot be used in WHERE.',
					'SELECT * is a decision about how many pages the server reads.',
				]}
			/>
		),
	},
];

export const EP06_DURATION = filmDuration(SCENES);

export const Ep06Select: React.FC = () => <Film scenes={SCENES} />;
