import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {tokenColor, tokenizeSql} from './sql';

type Emphasis = {
	/** Exact token text to light up, case-insensitive. */
	text: string;
	from: number;
	color?: string;
};

type Props = {
	sql: string;
	/** Frame the typewriter starts on. */
	from?: number;
	/** Characters revealed per frame. */
	speed?: number;
	size?: number;
	emphasis?: Emphasis[];
	/** Draw the panel chrome around the code. */
	chrome?: boolean;
	caption?: string;
};

/**
 * SQL typed out character by character, then optionally lit token by token.
 * The reveal is a pure function of the frame, so scrubbing backwards un-types it.
 */
export const SqlBlock: React.FC<Props> = ({
	sql,
	from = 0,
	speed = 2.2,
	size = 38,
	emphasis = [],
	chrome = true,
	caption,
}) => {
	const frame = useCurrentFrame();
	const tokens = tokenizeSql(sql);

	const revealed = Math.max(
		0,
		Math.floor(interpolate(frame - from, [0, sql.length / speed], [0, sql.length], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})),
	);

	// The caret sits at the end of the typed text until typing finishes.
	const typing = revealed < sql.length;
	const caretOn = typing || Math.floor(frame / 8) % 2 === 0;

	let consumed = 0;

	return (
		<div
			style={{
				background: chrome ? theme.bgPanel : 'transparent',
				border: chrome ? `1px solid ${theme.faint}` : undefined,
				borderRadius: chrome ? 18 : undefined,
				padding: chrome ? '34px 40px' : 0,
				fontFamily: theme.mono,
				fontSize: size,
				lineHeight: 1.65,
				whiteSpace: 'pre-wrap',
				maxWidth: 1340,
			}}
		>
			{caption ? (
				<div
					style={{
						fontSize: size * 0.52,
						letterSpacing: 3,
						textTransform: 'uppercase',
						color: theme.muted,
						marginBottom: 20,
					}}
				>
					{caption}
				</div>
			) : null}

			<div>
				{tokens.map((token, i) => {
					const start = consumed;
					consumed += token.text.length;

					if (start >= revealed) {
						return null;
					}

					const visible = token.text.slice(0, revealed - start);
					const hit = emphasis.find(
						(e) => e.text.toLowerCase() === token.text.toLowerCase() && frame >= e.from,
					);

					return (
						<span
							key={i}
							style={{
								color: hit ? (hit.color ?? theme.accent) : tokenColor[token.kind],
								fontWeight: token.kind === 'keyword' || hit ? 700 : 400,
								background: hit ? 'rgba(255,90,54,0.14)' : undefined,
								borderRadius: hit ? 5 : undefined,
								textShadow: hit ? `0 0 18px ${hit.color ?? theme.accent}66` : undefined,
								transition: undefined,
							}}
						>
							{visible}
						</span>
					);
				})}
				<span style={{opacity: caretOn ? 1 : 0, color: theme.accent}}>▍</span>
			</div>
		</div>
	);
};
