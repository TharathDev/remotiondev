import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {Connector} from '../kit/Connector';
import {DataTable} from '../kit/DataTable';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {cue, sceneFrames} from '../kit/narration';
import {Panel} from '../kit/Panel';
import {SceneFrame} from '../kit/SceneFrame';
import {Stage} from '../kit/Stage';
import {TitleCard} from '../kit/TitleCard';
import {engines, theme} from '../theme';

const EP = '05-return';
const CHAPTER = '05 · Return';

const ROWS: (string | number)[][] = [
	[1, 'ada@lovelace.dev', '2024-01-14'],
	[2, 'alan@turing.dev', '2024-02-02'],
	[3, 'grace@hopper.dev', '2024-02-19'],
	[4, 'edsger@dijkstra.dev', '2024-03-07'],
	[5, 'barbara@liskov.dev', '2024-03-30'],
];

/** The result set is not a parcel. It is a stream. */
const Streaming: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="Back down the wire" narration={{episode: EP, scene: 'streaming'}}>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46}}>
			<Heading>Rows leave as they are found, not when the query ends</Heading>

			<div style={{display: 'flex', alignItems: 'center', gap: 0}}>
				<Stage label="Executor" sub="produces rows" from={12} active={[cue(EP, 'streaming', 1), 9999]} width={240} />
				<Connector from={20} travel={cue(EP, 'streaming', 1) + 10} length={80} />
				<Stage label="Wire" sub="protocol frames" from={20} active={[cue(EP, 'streaming', 1) + 22, 9999]} width={240} />
				<Connector from={28} travel={cue(EP, 'streaming', 1) + 32} length={80} />
				<Stage label="Driver" sub="buffers or yields" from={28} active={[cue(EP, 'streaming', 1) + 44, 9999]} width={240} />
				<Connector from={36} travel={cue(EP, 'streaming', 1) + 54} length={80} />
				<Stage label="Your code" sub="row by row" from={36} active={[cue(EP, 'streaming', 1) + 66, 9999]} width={240} />
			</div>

			<Panel from={cue(EP, 'streaming', 1) - 10} width={1100} title="Arriving at the client">
				<DataTable columns={['id', 'email', 'created']} rows={ROWS} from={cue(EP, 'streaming', 1) + 24} size={30} />
			</Panel>

			<div style={{width: 1100}}>
				<Callout from={cue(EP, 'streaming', 2)} label="Why this matters">
					A driver that materialises the whole result set before handing you the first row
					throws this away — and your memory with it.
				</Callout>
			</div>
		</AbsoluteFill>
	</SceneFrame>
);

/** The frames each engine actually puts on the socket. */
const Protocol: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="What is on the socket" narration={{episode: EP, scene: 'protocol'}}>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50}}>
			<Heading>Same shape, different frames</Heading>

			<div style={{display: 'flex', gap: 40}}>
				<EnginePanel engine={engines.mysql} from={cue(EP, 'protocol', 1) - 26} tagline="text or binary protocol" minHeight={380}>
					<pre
						style={{
							fontFamily: theme.mono,
							fontSize: 24,
							lineHeight: 1.75,
							color: theme.ink,
							margin: 0,
						}}
					>
						{`Column count packet
Column definition  x N
Row packet         x M
OK packet (EOF)`}
					</pre>
					<div style={{marginTop: 26}}>
						<Callout from={cue(EP, 'protocol', 1) + 45} label="Default" accent={engines.mysql.accent} size={28}>
							The client library buffers the whole set unless you ask for an
							unbuffered / streaming cursor.
						</Callout>
					</div>
				</EnginePanel>

				<EnginePanel engine={engines.postgres} from={cue(EP, 'protocol', 2) - 26} tagline="extended query protocol" minHeight={380}>
					<pre
						style={{
							fontFamily: theme.mono,
							fontSize: 24,
							lineHeight: 1.75,
							color: theme.ink,
							margin: 0,
						}}
					>
						{`RowDescription
DataRow            x M
CommandComplete
ReadyForQuery`}
					</pre>
					<div style={{marginTop: 26}}>
						<Callout from={cue(EP, 'protocol', 2) + 45} label="Default" accent={engines.postgres.accent} size={28}>
							Also buffered client-side. DECLARE CURSOR, or a driver fetch size,
							is what makes it incremental.
						</Callout>
					</div>
				</EnginePanel>
			</div>

			<div style={{width: 1300}}>
				<Callout from={cue(EP, 'protocol', 3)} label="The trap">
					The server streams. Your driver usually does not. That default is where
					out-of-memory on a big SELECT comes from.
				</Callout>
			</div>
		</AbsoluteFill>
	</SceneFrame>
);

const SCENES: Scene[] = [
	{
		duration: sceneFrames(EP, 'title'),
		node: (
			<TitleCard
				number="05"
				title="RETURN"
				subtitle="How rows get from the executor back into your variables"
				part="The life of a query"
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'streaming'), node: <Streaming />},
	{duration: sceneFrames(EP, 'protocol'), node: <Protocol />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="06 · SELECT"
				narration={{episode: EP, scene: 'end'}}
				takeaways={[
					'The server emits rows as it finds them — the result set is a stream, not a parcel.',
					'Both wire protocols describe the columns once, then send rows, then signal completion.',
					'Most drivers buffer the whole set by default; a cursor or fetch size is what makes it incremental.',
				]}
			/>
		),
	},
];

export const EP05_DURATION = filmDuration(SCENES);

export const Ep05Return: React.FC = () => <Film scenes={SCENES} />;
