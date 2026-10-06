import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Callout} from '../kit/Callout';
import {Connector} from '../kit/Connector';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {SceneFrame} from '../kit/SceneFrame';
import {Stage} from '../kit/Stage';
import {TitleCard} from '../kit/TitleCard';
import {engines, theme} from '../theme';

const CHAPTER = '01 · Connection';

/** The handshake, as a pipeline the query has not even entered yet. */
const Handshake: React.FC = () => {
	const frame = useCurrentFrame();

	const heading = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<SceneFrame chapter={CHAPTER} step="Before the query">
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 70}}>
				<div
					style={{
						opacity: heading,
						transform: `translateY(${interpolate(heading, [0, 1], [-16, 0])}px)`,
						fontFamily: theme.font,
						fontSize: 52,
						fontWeight: 800,
						color: theme.ink,
						letterSpacing: -1,
					}}
				>
					Nothing runs until a session exists
				</div>

				<div style={{display: 'flex', alignItems: 'center'}}>
					<Stage label="Client" sub="psql / mysql" from={10} active={[26, 44]} width={210} />
					<Connector from={20} travel={34} length={78} />
					<Stage label="Socket" sub="TCP or unix" from={18} active={[44, 62]} width={210} />
					<Connector from={28} travel={52} length={78} />
					<Stage label="Auth" sub="scram / sha2" from={26} active={[62, 84]} width={210} />
					<Connector from={36} travel={72} length={78} />
					<Stage label="Session" sub="backend ready" from={34} active={[84, 150]} width={210} />
				</div>

				<div style={{display: 'flex', flexDirection: 'column', gap: 22, width: 1060}}>
					<Callout from={92} label="Handshake">
						The server speaks first: it sends its version and the auth methods it will
						accept, and the client answers with credentials.
					</Callout>
					<Callout from={112} label="Cost">
						A connection is expensive to build and cheap to keep. This is the whole
						argument for connection pooling.
					</Callout>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

/** Where the two engines genuinely diverge: what a connection *is*. */
const ThreadVsProcess: React.FC = () => {
	const frame = useCurrentFrame();

	const heading = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const workers = (count: number, accent: string, from: number, label: string) => (
		<div>
			<div style={{display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20}}>
				{new Array(count).fill(true).map((_, i) => {
					const pop = interpolate(frame, [from + i * 3, from + i * 3 + 10], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					return (
						<div
							key={i}
							style={{
								width: 44,
								height: 44,
								borderRadius: 10,
								background: `${accent}22`,
								border: `1px solid ${accent}66`,
								opacity: pop,
								transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])})`,
							}}
						/>
					);
				})}
			</div>
			<div style={{fontFamily: theme.mono, fontSize: 19, color: theme.muted, letterSpacing: 1}}>
				{label}
			</div>
		</div>
	);

	return (
		<SceneFrame chapter={CHAPTER} step="One connection =">
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 56}}>
				<div
					style={{
						opacity: heading,
						fontFamily: theme.font,
						fontSize: 52,
						fontWeight: 800,
						color: theme.ink,
						letterSpacing: -1,
					}}
				>
					A connection is not the same thing in both engines
				</div>

				<div style={{display: 'flex', gap: 40}}>
					<EnginePanel engine={engines.mysql} from={14} tagline="thread per connection" minHeight={330}>
						{workers(12, engines.mysql.accent, 34, '12 threads inside one mysqld process')}
						<div
							style={{
								fontFamily: theme.font,
								fontSize: 25,
								color: theme.ink,
								lineHeight: 1.5,
								marginTop: 26,
							}}
						>
							Threads share one address space, so a new connection is cheap — but one
							bad thread can take the server down with it.
						</div>
					</EnginePanel>

					<EnginePanel engine={engines.postgres} from={22} tagline="process per connection" minHeight={330}>
						{workers(12, engines.postgres.accent, 42, '12 OS processes forked by the postmaster')}
						<div
							style={{
								fontFamily: theme.font,
								fontSize: 25,
								color: theme.ink,
								lineHeight: 1.5,
								marginTop: 26,
							}}
						>
							Processes are isolated, so a crash takes one backend — but each one costs
							real memory, which is why PgBouncer exists.
						</div>
					</EnginePanel>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

const SCENES: Scene[] = [
	{
		duration: 100,
		node: (
			<TitleCard
				number="01"
				title="CONNECTION"
				subtitle="The handshake that has to happen before any SQL runs"
				part="The life of a query"
			/>
		),
	},
	{duration: 170, node: <Handshake />},
	{duration: 180, node: <ThreadVsProcess />},
	{
		duration: 130,
		node: (
			<EndCard
				next="02 · Parse"
				takeaways={[
					'The server speaks first, the client answers with credentials, and only then does a session exist.',
					'MySQL gives each connection a thread; PostgreSQL forks it a process.',
					'Either way the connection is the expensive part — pool it.',
				]}
			/>
		),
	},
];

export const EP01_DURATION = filmDuration(SCENES);

export const Ep01Connection: React.FC = () => <Film scenes={SCENES} />;
