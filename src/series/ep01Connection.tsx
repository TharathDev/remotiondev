import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Callout} from '../kit/Callout';
import {Connector} from '../kit/Connector';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {cue, sceneFrames} from '../kit/narration';
import {SceneFrame} from '../kit/SceneFrame';
import {Stage} from '../kit/Stage';
import {TitleCard} from '../kit/TitleCard';
import {engines, theme} from '../theme';

const EP = '01-connection';
const CHAPTER = '01 · Connection';

/**
 * The handshake, as a pipeline the query has not even entered yet.
 *
 * Narration lines: 0 nothing runs · 1 the server speaks first ·
 * 2 the client answers · 3 connections are expensive.
 */
const Handshake: React.FC = () => {
	// Line indices into the handshake narration: 1 "the server speaks first",
	// 3 "the client answers with credentials", 5 "building a connection is expensive".
	const serverSpeaks = cue(EP, 'handshake', 1);
	const clientAnswers = cue(EP, 'handshake', 3);
	const cost = cue(EP, 'handshake', 5);

	return (
		<SceneFrame chapter={CHAPTER} step="Before the query" narration={{episode: EP, scene: 'handshake'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 64}}>
				<Heading>Nothing runs until a session exists</Heading>

				<div style={{display: 'flex', alignItems: 'center'}}>
					<Stage label="Client" sub="psql / mysql" from={18} active={[serverSpeaks, serverSpeaks + 40]} />
					<Connector from={28} travel={serverSpeaks + 8} length={80} />
					<Stage label="Socket" sub="TCP or unix" from={26} active={[serverSpeaks + 40, clientAnswers]} />
					<Connector from={36} travel={serverSpeaks + 48} length={80} />
					<Stage label="Auth" sub="scram / sha2" from={34} active={[clientAnswers, clientAnswers + 55]} />
					<Connector from={44} travel={clientAnswers + 10} length={80} />
					<Stage label="Session" sub="backend ready" from={42} active={[clientAnswers + 55, cost + 400]} />
				</div>

				<div style={{display: 'flex', flexDirection: 'column', gap: 26, width: 1180}}>
					<Callout from={serverSpeaks} label="Handshake">
						The server speaks first: it sends its version and the auth methods it will
						accept, and the client answers with credentials.
					</Callout>
					<Callout from={cost} label="Cost">
						Expensive to build, cheap to keep. That asymmetry is the whole argument for
						connection pooling.
					</Callout>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

/** A grid of workers, popping in one at a time as the engine is described. */
const Workers: React.FC<{count: number; accent: string; from: number; label: string}> = ({
	count,
	accent,
	from,
	label,
}) => {
	const frame = useCurrentFrame();

	return (
		<div>
			<div style={{display: 'flex', gap: 11, flexWrap: 'wrap', marginBottom: 22}}>
				{new Array(count).fill(true).map((_, i) => {
					const pop = interpolate(frame, [from + i * 3, from + i * 3 + 10], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					return (
						<div
							key={i}
							style={{
								width: 48,
								height: 48,
								borderRadius: 11,
								background: `${accent}22`,
								border: `1px solid ${accent}66`,
								opacity: pop,
								transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])})`,
							}}
						/>
					);
				})}
			</div>
			<div style={{fontFamily: theme.mono, fontSize: 20, color: theme.muted, letterSpacing: 1}}>
				{label}
			</div>
		</div>
	);
};

/**
 * Where the two engines genuinely diverge: what a connection *is*.
 *
 * Narration lines: 0 not the same thing · 1 MySQL threads · 2 PostgreSQL processes.
 */
const ThreadVsProcess: React.FC = () => {
	// 1 "MySQL gives each connection a thread", 4 "PostgreSQL forks a process".
	const mysqlAt = cue(EP, 'engines', 1);
	const pgAt = cue(EP, 'engines', 4);

	return (
		<SceneFrame chapter={CHAPTER} step="One connection =" narration={{episode: EP, scene: 'engines'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 54}}>
				<Heading>A connection is not the same thing in both engines</Heading>

				<div style={{display: 'flex', gap: 40}}>
					<EnginePanel engine={engines.mysql} from={mysqlAt - 26} tagline="thread per connection" minHeight={360}>
						<Workers
							count={12}
							accent={engines.mysql.accent}
							from={mysqlAt}
							label="12 threads inside one mysqld process"
						/>
						<div
							style={{
								fontFamily: theme.font,
								fontSize: 28,
								color: theme.ink,
								lineHeight: 1.5,
								marginTop: 26,
							}}
						>
							Threads share one address space, so a new connection is cheap — but one
							bad thread can take the server down with it.
						</div>
					</EnginePanel>

					<EnginePanel engine={engines.postgres} from={pgAt - 26} tagline="process per connection" minHeight={360}>
						<Workers
							count={12}
							accent={engines.postgres.accent}
							from={pgAt}
							label="12 OS processes forked by the postmaster"
						/>
						<div
							style={{
								fontFamily: theme.font,
								fontSize: 28,
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
		duration: sceneFrames(EP, 'title'),
		node: (
			<TitleCard
				number="01"
				title="CONNECTION"
				subtitle="The handshake that has to happen before any SQL runs"
				part="The life of a query"
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'handshake'), node: <Handshake />},
	{duration: sceneFrames(EP, 'engines'), node: <ThreadVsProcess />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="02 · Parse"
				narration={{episode: EP, scene: 'end'}}
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
