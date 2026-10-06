import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {Connector} from '../kit/Connector';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {cue, sceneFrames} from '../kit/narration';
import {PageGrid} from '../kit/PageGrid';
import {Panel} from '../kit/Panel';
import {SceneFrame} from '../kit/SceneFrame';
import {Stage} from '../kit/Stage';
import {TitleCard} from '../kit/TitleCard';
import {engines, theme} from '../theme';

const EP = '04-execute';
const CHAPTER = '04 · Execute';

/** The volcano model: every node pulls one row from the node beneath it. */
const PullModel: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="The iterator model" narration={{episode: EP, scene: 'pull'}}>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 90}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Stage label="Client" sub="wants the next row" from={10} active={[cue(EP, 'pull', 1), 9999]} width={300} />
				<Connector axis="up" from={18} travel={cue(EP, 'pull', 1) + 92} length={60} />
				<Stage label="Limit 10" sub="stops pulling at 10" from={18} active={[cue(EP, 'pull', 2), 9999]} width={300} />
				<Connector axis="up" from={26} travel={cue(EP, 'pull', 1) + 74} length={60} />
				<Stage label="Sort" sub="must drain its child" from={26} active={[cue(EP, 'pull', 3), 9999]} width={300} />
				<Connector axis="up" from={34} travel={cue(EP, 'pull', 1) + 56} length={60} />
				<Stage label="Filter" sub="id &gt; 100" from={34} active={[cue(EP, 'pull', 1) + 40, 9999]} width={300} />
				<Connector axis="up" from={42} travel={cue(EP, 'pull', 1) + 38} length={60} />
				<Stage label="Seq Scan" sub="reads pages" from={42} active={[cue(EP, 'pull', 1) + 20, 9999]} width={300} />
			</div>

			<div style={{display: 'flex', flexDirection: 'column', gap: 26, width: 700}}>
				<Heading size={46}>Nobody runs the whole query. Each node asks its child for one row.</Heading>
				<Callout from={cue(EP, 'pull', 1)} label="Pull, not push">
					Execution starts at the top and travels down as a request; rows travel back up
					one at a time.
				</Callout>
				<Callout from={cue(EP, 'pull', 2)} label="Why LIMIT is fast">
					Limit stops asking after ten rows, so the scan below it never reads the rest of
					the table.
				</Callout>
				<Callout from={cue(EP, 'pull', 3)} label="Why ORDER BY is not" accent={theme.warn}>
					Sort cannot return its first row until it has pulled <em>every</em> row from its
					child. This is the blocking node that spills to disk.
				</Callout>
			</div>
		</AbsoluteFill>
	</SceneFrame>
);

const CACHED = [0, 1, 2, 3, 5, 7, 8, 11, 12, 13, 14, 17, 20, 21, 22, 25, 26, 30, 31, 33, 35, 38, 40, 41, 44, 45];

/** Reads do not come from disk. They come from memory, or they stall. */
const BufferPool: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="Where the rows live" narration={{episode: EP, scene: 'buffer'}}>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44}}>
			<Heading>The scan does not read disk. It reads pages.</Heading>

			<div style={{display: 'flex', gap: 54, alignItems: 'center'}}>
				<Panel from={cue(EP, 'buffer', 1) - 26} title="Buffer pool · page 22 requested">
					<PageGrid cached={CACHED} wanted={22} requestFrom={cue(EP, 'buffer', 1)} />
					<div style={{marginTop: 22, fontFamily: theme.mono, fontSize: 21, color: theme.ok}}>
						HIT — already resident, no I/O
					</div>
				</Panel>

				<Panel from={cue(EP, 'buffer', 2) - 26} title="Buffer pool · page 49 requested">
					<PageGrid cached={CACHED} wanted={49} requestFrom={cue(EP, 'buffer', 2)} />
					<div style={{marginTop: 22, fontFamily: theme.mono, fontSize: 21, color: theme.warn}}>
						MISS — read from disk, evict something
					</div>
				</Panel>
			</div>

			<div style={{width: 1300}}>
				<Callout from={cue(EP, 'buffer', 3)} label="The only number that matters">
					A hit is nanoseconds. A miss is a disk read. Tuning a database is mostly
					arranging for the pages you need to already be in memory.
				</Callout>
			</div>
		</AbsoluteFill>
	</SceneFrame>
);

/** Same idea, two memory architectures. */
const Memory: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="Two cache designs" narration={{episode: EP, scene: 'memory'}}>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50}}>
			<Heading>One cache, or two?</Heading>

			<div style={{display: 'flex', gap: 40}}>
				<EnginePanel engine={engines.mysql} from={cue(EP, 'memory', 1) - 26} tagline="innodb_buffer_pool_size" minHeight={340}>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
						<Callout from={cue(EP, 'memory', 1)} label="Owns the memory" accent={engines.mysql.accent} size={25}>
							InnoDB opens its files with O_DIRECT, so the buffer pool is the only
							copy — set it to most of the machine.
						</Callout>
						<Callout from={cue(EP, 'memory', 1) + 95} label="Young / old LRU" accent={engines.mysql.accent} size={25}>
							A split LRU keeps one big scan from flushing the pages that matter.
						</Callout>
						<Callout from={cue(EP, 'memory', 1) + 150} label="Change buffer" accent={engines.mysql.accent} size={25}>
							Secondary-index writes to absent pages are buffered and merged later.
						</Callout>
					</div>
				</EnginePanel>

				<EnginePanel engine={engines.postgres} from={cue(EP, 'memory', 2) - 26} tagline="shared_buffers" minHeight={340}>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
						<Callout from={cue(EP, 'memory', 2)} label="Shares with the OS" accent={engines.postgres.accent} size={25}>
							PostgreSQL leans on the kernel page cache too, so pages can sit in
							both — the usual advice is about a quarter of RAM.
						</Callout>
						<Callout from={cue(EP, 'memory', 2) + 130} label="Clock sweep" accent={engines.postgres.accent} size={25}>
							A usage counter per buffer, swept in a ring, instead of a strict LRU.
						</Callout>
						<Callout from={cue(EP, 'memory', 2) + 200} label="Ring buffers" accent={engines.postgres.accent} size={25}>
							Large sequential scans get a small private ring so they cannot evict
							the whole cache.
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
				number="04"
				title="EXECUTE"
				subtitle="Pulling rows up the plan tree, one at a time"
				part="The life of a query"
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'pull'), node: <PullModel />},
	{duration: sceneFrames(EP, 'buffer'), node: <BufferPool />},
	{duration: sceneFrames(EP, 'memory'), node: <Memory />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="05 · Return"
				narration={{episode: EP, scene: 'end'}}
				takeaways={[
					'Execution is a pull: each node asks its child for one row, so LIMIT really does stop the scan.',
					'Sort and hash nodes block — they must drain their child before returning anything.',
					'Reads hit the buffer pool or they hit disk, and that difference is most of your latency.',
				]}
			/>
		),
	},
];

export const EP04_DURATION = filmDuration(SCENES);

export const Ep04Execute: React.FC = () => <Film scenes={SCENES} />;
