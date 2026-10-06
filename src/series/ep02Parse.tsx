import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Callout} from '../kit/Callout';
import {Connector} from '../kit/Connector';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {SceneFrame} from '../kit/SceneFrame';
import {SqlBlock} from '../kit/SqlBlock';
import {Stage} from '../kit/Stage';
import {TitleCard} from '../kit/TitleCard';
import {Tree, TreeNode} from '../kit/Tree';
import {engines, theme} from '../theme';

const CHAPTER = '02 · Parse';

const QUERY = `SELECT id, email
FROM users
WHERE id = 42;`;

/** Text in, tokens out. The server has no idea what this means yet. */
const Tokens: React.FC = () => {
	const frame = useCurrentFrame();

	const heading = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<SceneFrame chapter={CHAPTER} step="Stage 1 — lexing">
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
					To the server, your query arrives as a string
				</div>

				<SqlBlock
					sql={QUERY}
					from={20}
					speed={1.9}
					size={40}
					caption="raw text on the wire"
					emphasis={[
						{text: 'SELECT', from: 110},
						{text: 'FROM', from: 118},
						{text: 'WHERE', from: 126},
					]}
				/>

				<div style={{width: 1060}}>
					<Callout from={132} label="Lexer">
						First it is cut into tokens — keywords, identifiers, literals, punctuation.
						A typo fails here, before anything touches a table.
					</Callout>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

const PARSE_TREE: TreeNode = {
	label: 'SelectStmt',
	children: [
		{label: 'targetList', children: [{label: 'id', sub: 'ColumnRef'}, {label: 'email', sub: 'ColumnRef'}]},
		{label: 'fromClause', children: [{label: 'users', sub: 'RangeVar'}]},
		{
			label: 'whereClause',
			children: [{label: '=', sub: 'A_Expr'}, {label: '42', sub: 'Const'}],
		},
	],
};

/** Tokens become a shape the planner can walk. */
const ParseTree: React.FC = () => {
	const frame = useCurrentFrame();

	const heading = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<SceneFrame chapter={CHAPTER} step="Stage 2 — parsing">
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44}}>
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
					The tokens become a tree
				</div>

				<Tree root={PARSE_TREE} from={18} width={1300} levelHeight={140} />

				<div style={{width: 1100}}>
					<Callout from={100} label="Still only syntax">
						The parse tree says the query is <em>shaped</em> correctly. It does not yet
						know whether <code style={{fontFamily: theme.mono}}>users</code> exists, or
						what type <code style={{fontFamily: theme.mono}}>id</code> is.
					</Callout>
				</div>
			</AbsoluteFill>
		</SceneFrame>
	);
};

/** The stage counts differ, and it is the one structural difference worth knowing. */
const Pipelines: React.FC = () => {
	const frame = useCurrentFrame();

	const heading = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<SceneFrame chapter={CHAPTER} step="Stage 3 — analysis">
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50}}>
				<div
					style={{
						opacity: heading,
						fontFamily: theme.font,
						fontSize: 50,
						fontWeight: 800,
						color: theme.ink,
						letterSpacing: -1,
						textAlign: 'center',
					}}
				>
					PostgreSQL puts one more stage between parse and plan
				</div>

				<div style={{display: 'flex', flexDirection: 'column', gap: 30}}>
					<EnginePanel engine={engines.mysql} from={14} width={1420} tagline="parse → optimize">
						<div style={{display: 'flex', alignItems: 'center'}}>
							<Stage label="Parser" sub="syntax tree" from={26} width={250} accent={engines.mysql.accent} />
							<Connector from={34} travel={44} length={70} accent={engines.mysql.accent} />
							<Stage label="Resolver" sub="names + types" from={32} width={250} accent={engines.mysql.accent} />
							<Connector from={40} travel={58} length={70} accent={engines.mysql.accent} />
							<Stage label="Optimizer" sub="cost model" from={38} width={250} accent={engines.mysql.accent} />
						</div>
					</EnginePanel>

					<EnginePanel engine={engines.postgres} from={24} width={1420} tagline="parse → analyze → rewrite → plan">
						<div style={{display: 'flex', alignItems: 'center'}}>
							<Stage label="Parser" sub="raw tree" from={46} width={220} accent={engines.postgres.accent} />
							<Connector from={52} travel={64} length={56} accent={engines.postgres.accent} />
							<Stage label="Analyzer" sub="catalog lookup" from={52} width={220} accent={engines.postgres.accent} />
							<Connector from={58} travel={76} length={56} accent={engines.postgres.accent} />
							<Stage label="Rewriter" sub="views + rules" from={58} width={220} accent={engines.postgres.accent} />
							<Connector from={64} travel={88} length={56} accent={engines.postgres.accent} />
							<Stage label="Planner" sub="cost model" from={64} width={220} accent={engines.postgres.accent} />
						</div>
					</EnginePanel>
				</div>

				<div style={{width: 1420}}>
					<Callout from={104} label="Why the rewriter matters" accent={engines.postgres.accent}>
						It is what expands a view into the query that selects from it, and what makes
						PostgreSQL rules work at all.
					</Callout>
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
				number="02"
				title="PARSE"
				subtitle="From a string on the wire to a tree the server can reason about"
				part="The life of a query"
			/>
		),
	},
	{duration: 180, node: <Tokens />},
	{duration: 170, node: <ParseTree />},
	{duration: 180, node: <Pipelines />},
	{
		duration: 130,
		node: (
			<EndCard
				next="03 · Plan"
				takeaways={[
					'Lexing then parsing turns text into a syntax tree — a typo never reaches a table.',
					'The parse tree is syntax only; resolving names and types is a separate step.',
					'PostgreSQL adds a rewriter stage, which is how views and rules are expanded.',
				]}
			/>
		),
	},
];

export const EP02_DURATION = filmDuration(SCENES);

export const Ep02Parse: React.FC = () => <Film scenes={SCENES} />;
