import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {Connector} from '../kit/Connector';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {PageGrid} from '../kit/PageGrid';
import {Panel} from '../kit/Panel';
import {SceneFrame} from '../kit/SceneFrame';
import {Stage} from '../kit/Stage';
import {TitleCard} from '../kit/TitleCard';
import {engines, theme} from '../theme';

const CHAPTER = '04 · Execute';

/** The volcano model: every node pulls one row from the node beneath it. */
const PullModel: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="The iterator model">
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 90}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Stage label="Client" sub="wants the next row" from={8} active={[30, 150]} width={300} />
				<Connector axis="up" from={16} travel={110} length={60} />
				<Stage label="Limit 10" sub="stops pulling at 10" from={16} active={[44, 150]} width={300} />
				<Connector axis="up" from={24} travel={96} length={60} />
				<Stage label="Sort" sub="must drain its child" from={24} active={[58, 150]} width={300} />
				<Connector axis="up" from={32} travel={82} length={60} />
				<Stage label="Filter" sub="id &gt; 100" from={32} active={[72, 150]} width={300} />
				<Connector axis="up" from={40} travel={68} length={60} />
				<Stage label="Seq Scan" sub="reads pages" from={40} active={[86, 150]} width={300} />
			</div>

			<div style={{display: 'flex', flexDirection: 'column', gap: 26, width: 700}}>
				<Heading size={46}>Nobody runs the whole query. Each node asks its child for one row.</Heading>
				<Callout from={70} label="Pull, not push">
					Execution starts at the top and travels down as a request; rows travel back up
					one at a time.
				</Callout>
				<Callout from={92} label="Why LIMIT is fast">
					Limit stops asking after ten rows, so the scan below it never reads the rest of
					the table.
				</Callout>
				<Callout from={114} label="Why ORDER BY is not" accent={theme.warn}>
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
	<SceneFrame chapter={CHAPTER} step="Where the rows live">
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44}}>
			<Heading>The scan does not read disk. It reads pages.</Heading>

			<div style={{display: 'flex', gap: 54, alignItems: 'center'}}>
				<Panel from={14} title="Buffer pool · page 22 requested">
					<PageGrid cached={CACHED} wanted={22} requestFrom={40} />
					<div style={{marginTop: 22, fontFamily: theme.mono, fontSize: 21, color: theme.ok}}>
						HIT — already resident, no I/O
					</div>
				</Panel>

				<Panel from={26} title="Buffer pool · page 49 requested">
					<PageGrid cached={CACHED} wanted={49} requestFrom={60} />
					<div style={{marginTop: 22, fontFamily: theme.mono, fontSize: 21, color: theme.warn}}>
						MISS — read from disk, evict something
					</div>
				</Panel>
			</div>

			<div style={{width: 1300}}>
				<Callout from={92} label="The only number that matters">
					A hit is nanoseconds. A miss is a disk read. Tuning a database is mostly
					arranging for the pages you need to already be in memory.
				</Callout>
			</div>
		</AbsoluteFill>
	</SceneFrame>
);

/** Same idea, two memory architectures. */
const Memory: React.FC = () => (
	<SceneFrame chapter={CHAPTER} step="Two cache designs">
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50}}>
			<Heading>One cache, or two?</Heading>

			<div style={{display: 'flex', gap: 40}}>
				<EnginePanel engine={engines.mysql} from={14} tagline="innodb_buffer_pool_size" minHeight={340}>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
						<Callout from={34} label="Owns the memory" accent={engines.mysql.accent} size={25}>
							InnoDB opens its files with O_DIRECT, so the buffer pool is the only
							copy — set it to most of the machine.
						</Callout>
						<Callout from={50} label="Young / old LRU" accent={engines.mysql.accent} size={25}>
							A split LRU keeps one big scan from flushing the pages that matter.
						</Callout>
						<Callout from={66} label="Change buffer" accent={engines.mysql.accent} size={25}>
							Secondary-index writes to absent pages are buffered and merged later.
						</Callout>
					</div>
				</EnginePanel>

				<EnginePanel engine={engines.postgres} from={22} tagline="shared_buffers" minHeight={340}>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
						<Callout from={42} label="Shares with the OS" accent={engines.postgres.accent} size={25}>
							PostgreSQL leans on the kernel page cache too, so pages can sit in
							both — the usual advice is about a quarter of RAM.
						</Callout>
						<Callout from={58} label="Clock sweep" accent={engines.postgres.accent} size={25}>
							A usage counter per buffer, swept in a ring, instead of a strict LRU.
						</Callout>
						<Callout from={74} label="Ring buffers" accent={engines.postgres.accent} size={25}>
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
		duration: 100,
		node: (
			<TitleCard
				number="04"
				title="EXECUTE"
				subtitle="Pulling rows up the plan tree, one at a time"
				part="The life of a query"
			/>
		),
	},
	{duration: 195, node: <PullModel />},
	{duration: 185, node: <BufferPool />},
	{duration: 180, node: <Memory />},
	{
		duration: 130,
		node: (
			<EndCard
				next="05 · Return"
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
