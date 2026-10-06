import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';

export type TreeNode = {
	label: string;
	sub?: string;
	children?: TreeNode[];
};

type Props = {
	root: TreeNode;
	from?: number;
	width?: number;
	levelHeight?: number;
	accent?: string;
};

type Placed = {
	node: TreeNode;
	x: number;
	y: number;
	depth: number;
	parent: Placed | null;
};

/**
 * Lays a parse tree out by giving every leaf an equal slice of the width and
 * putting each parent above the midpoint of its children. Nodes and the edges
 * into them fade in depth by depth.
 */
const place = (root: TreeNode, width: number, levelHeight: number): Placed[] => {
	const placed: Placed[] = [];
	let leafCursor = 0;

	const leafCount = (node: TreeNode): number =>
		node.children?.length ? node.children.reduce((sum, c) => sum + leafCount(c), 0) : 1;

	const total = leafCount(root);
	const slice = width / total;

	const walk = (node: TreeNode, depth: number, parent: Placed | null): Placed => {
		if (!node.children?.length) {
			const entry: Placed = {node, x: leafCursor * slice + slice / 2, y: depth * levelHeight, depth, parent};
			leafCursor += 1;
			placed.push(entry);
			return entry;
		}

		const entry: Placed = {node, x: 0, y: depth * levelHeight, depth, parent};
		placed.push(entry);
		const kids = node.children.map((child) => walk(child, depth + 1, entry));
		entry.x = (kids[0].x + kids[kids.length - 1].x) / 2;
		return entry;
	};

	walk(root, 0, null);
	return placed;
};

export const Tree: React.FC<Props> = ({
	root,
	from = 0,
	width = 1240,
	levelHeight = 150,
	accent = theme.accent,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const nodes = place(root, width, levelHeight);
	const height = Math.max(...nodes.map((n) => n.y)) + 90;

	const appear = (depth: number) =>
		spring({
			fps,
			frame: frame - from - depth * 12,
			config: {damping: 17, mass: 0.6, stiffness: 120},
		});

	return (
		<div style={{position: 'relative', width, height}}>
			<svg width={width} height={height} style={{position: 'absolute', top: 0, left: 0}}>
				{nodes
					.filter((n) => n.parent)
					.map((n, i) => {
						const p = n.parent as Placed;
						const draw = appear(n.depth);
						return (
							<line
								key={i}
								x1={p.x}
								y1={p.y + 56}
								x2={p.x + (n.x - p.x) * draw}
								y2={p.y + 56 + (n.y - p.y - 56) * draw}
								stroke={theme.faint}
								strokeWidth={2}
							/>
						);
					})}
			</svg>

			{nodes.map((n, i) => {
				const enter = appear(n.depth);
				const isRoot = n.depth === 0;

				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: n.x,
							top: n.y,
							transform: `translateX(-50%) scale(${interpolate(enter, [0, 1], [0.8, 1])})`,
							opacity: enter,
							padding: '12px 20px',
							borderRadius: 12,
							background: isRoot ? `${accent}1A` : theme.bgLift,
							border: `1px solid ${isRoot ? accent : theme.faint}`,
							textAlign: 'center',
							whiteSpace: 'nowrap',
						}}
					>
						<div
							style={{
								fontFamily: theme.mono,
								fontSize: 27,
								fontWeight: 700,
								color: isRoot ? accent : theme.ink,
							}}
						>
							{n.node.label}
						</div>
						{n.node.sub ? (
							<div style={{fontFamily: theme.mono, fontSize: 20, color: theme.muted, marginTop: 5}}>
								{n.node.sub}
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
};
