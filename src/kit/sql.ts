/**
 * A tiny, deterministic SQL tokenizer. Every episode writes its SQL as a plain
 * string and gets consistent colouring for free, so the series only has one
 * place to change if the palette moves.
 */
export type TokenKind =
	| 'keyword'
	| 'func'
	| 'string'
	| 'number'
	| 'punct'
	| 'ident'
	| 'comment'
	| 'space';

export type Token = {text: string; kind: TokenKind};

const KEYWORDS = new Set([
	'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'AS',
	'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON', 'USING',
	'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
	'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'RETURNING',
	'CREATE', 'TABLE', 'INDEX', 'UNIQUE', 'PRIMARY', 'KEY', 'FOREIGN',
	'REFERENCES', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'EXPLAIN', 'ANALYZE',
	'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'SAVEPOINT', 'ISOLATION',
	'LEVEL', 'READ', 'WRITE', 'COMMITTED', 'UNCOMMITTED', 'REPEATABLE',
	'SERIALIZABLE', 'FOR', 'SHARE', 'LOCK', 'VACUUM', 'WITH', 'DISTINCT',
	'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'BETWEEN', 'LIKE', 'EXISTS',
	'UNION', 'ALL', 'INT', 'BIGINT', 'TEXT', 'VARCHAR', 'TIMESTAMP', 'BOOLEAN',
	'DEFAULT', 'CONSTRAINT', 'CASCADE', 'START', 'WORK',
]);

const FUNCS = new Set([
	'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'NOW', 'COALESCE', 'LOWER', 'UPPER',
	'LENGTH', 'ROUND', 'DATE_TRUNC', 'EXTRACT', 'CAST',
]);

/** Order matters: longest / most specific patterns first. */
const PATTERN = /(--[^\n]*)|('(?:[^']|'')*')|(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_$]*)|(\s+)|([^\sA-Za-z0-9_']+)/g;

export const tokenizeSql = (sql: string): Token[] => {
	const tokens: Token[] = [];

	for (const match of sql.matchAll(PATTERN)) {
		const [text, comment, str, num, word, space] = match;

		if (comment !== undefined) {
			tokens.push({text, kind: 'comment'});
		} else if (str !== undefined) {
			tokens.push({text, kind: 'string'});
		} else if (num !== undefined) {
			tokens.push({text, kind: 'number'});
		} else if (word !== undefined) {
			const upper = word.toUpperCase();
			const kind: TokenKind = KEYWORDS.has(upper)
				? 'keyword'
				: FUNCS.has(upper)
					? 'func'
					: 'ident';
			tokens.push({text, kind});
		} else if (space !== undefined) {
			tokens.push({text, kind: 'space'});
		} else {
			tokens.push({text, kind: 'punct'});
		}
	}

	return tokens;
};

export const tokenColor: Record<TokenKind, string> = {
	keyword: '#FF7A5C',
	func: '#C792EA',
	string: '#3DD68C',
	number: '#FFC53D',
	punct: '#8B8798',
	ident: '#F5F3EF',
	comment: '#5E5A6B',
	space: 'transparent',
};
