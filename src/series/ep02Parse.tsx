import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout} from '../kit/Callout';
import {Connector} from '../kit/Connector';
import {EndCard} from '../kit/EndCard';
import {EnginePanel} from '../kit/EnginePanel';
import {Film, filmDuration, Scene} from '../kit/Film';
import {Heading} from '../kit/Heading';
import {cue, sceneFrames} from '../kit/narration';
import {SceneFrame} from '../kit/SceneFrame';
import {SqlBlock} from '../kit/SqlBlock';
import {Stage} from '../kit/Stage';
import {TitleCard} from '../kit/TitleCard';
import {Tree, TreeNode} from '../kit/Tree';
import {engines, theme} from '../theme';

const EP = '02-parse';
const CHAPTER = '02 · Parse';

const QUERY = `SELECT id, email
FROM users
WHERE id = 42;`;

/** Text in, tokens out. The server has no idea what this means yet. */
const Tokens: React.FC = () => {
	const lexing = cue(EP, 'tokens', 1);
	const typo = cue(EP, 'tokens', 2);

	return (
		<SceneFrame chapter={CHAPTER} step="Stage 1 — lexing" narration={{episode: EP, scene: 'tokens'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 56}}>
				<Heading>To the server, your query arrives as a string</Heading>

				<SqlBlock
					sql={QUERY}
					from={20}
					speed={1.9}
					size={40}
					caption="raw text on the wire"
					emphasis={[
						{text: 'SELECT', from: lexing},
						{text: 'FROM', from: lexing + 10},
						{text: 'WHERE', from: lexing + 20},
					]}
				/>

				<div style={{width: 1060}}>
					<Callout from={typo} label="Lexer">
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
	const branches = cue(EP, 'tree', 1);
	const syntaxOnly = cue(EP, 'tree', 2);

	return (
		<SceneFrame chapter={CHAPTER} step="Stage 2 — parsing" narration={{episode: EP, scene: 'tree'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44}}>
				<Heading>The tokens become a tree</Heading>

				<Tree root={PARSE_TREE} from={branches - 30} width={1300} levelHeight={140} />

				<div style={{width: 1100}}>
					<Callout from={syntaxOnly} label="Still only syntax">
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
	const mysqlAt = cue(EP, 'pipelines', 1);
	const pgAt = cue(EP, 'pipelines', 2);

	return (
		<SceneFrame chapter={CHAPTER} step="Stage 3 — analysis" narration={{episode: EP, scene: 'pipelines'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34}}>
				<Heading size={48}>PostgreSQL puts one more stage between parse and plan</Heading>

				<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
					<EnginePanel engine={engines.mysql} from={mysqlAt - 26} width={1420} tagline="parse → optimize">
						<div style={{display: 'flex', alignItems: 'center'}}>
							<Stage label="Parser" sub="syntax tree" from={mysqlAt} width={250} accent={engines.mysql.accent} />
							<Connector from={mysqlAt + 6} travel={mysqlAt + 18} length={70} accent={engines.mysql.accent} />
							<Stage label="Resolver" sub="names" from={mysqlAt + 12} width={250} accent={engines.mysql.accent} />
							<Connector from={mysqlAt + 18} travel={mysqlAt + 32} length={70} accent={engines.mysql.accent} />
							<Stage label="Optimizer" sub="cost model" from={mysqlAt + 24} width={250} accent={engines.mysql.accent} />
						</div>
					</EnginePanel>

					<EnginePanel engine={engines.postgres} from={pgAt - 26} width={1420} tagline="parse → analyze → rewrite → plan">
						<div style={{display: 'flex', alignItems: 'center'}}>
							<Stage label="Parser" sub="raw tree" from={pgAt} width={220} accent={engines.postgres.accent} />
							<Connector from={pgAt + 6} travel={pgAt + 16} length={56} accent={engines.postgres.accent} />
							<Stage label="Analyzer" sub="catalog" from={pgAt + 10} width={220} accent={engines.postgres.accent} />
							<Connector from={pgAt + 16} travel={pgAt + 28} length={56} accent={engines.postgres.accent} />
							<Stage label="Rewriter" sub="views" from={pgAt + 20} width={220} accent={engines.postgres.accent} />
							<Connector from={pgAt + 26} travel={pgAt + 40} length={56} accent={engines.postgres.accent} />
							<Stage label="Planner" sub="cost model" from={pgAt + 30} width={220} accent={engines.postgres.accent} />
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
				number="02"
				title="PARSE"
				subtitle="From a string on the wire to a tree the server can reason about"
				part="The life of a query"
				agenda={[
					'Text into tokens',
					'Tokens into a tree',
					'The extra stage in Postgres',
				]}
				// The agenda lands with the "three things" line, not before it.
				agendaFrom={cue(EP, 'title', 2)}
				narration={{episode: EP, scene: 'title'}}
			/>
		),
	},
	{duration: sceneFrames(EP, 'tokens'), node: <Tokens />},
	{duration: sceneFrames(EP, 'tree'), node: <ParseTree />},
	{duration: sceneFrames(EP, 'pipelines'), node: <Pipelines />},
	{
		duration: sceneFrames(EP, 'end'),
		node: (
			<EndCard
				next="03 · Plan"
				narration={{episode: EP, scene: 'end'}}
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
