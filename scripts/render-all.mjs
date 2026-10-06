#!/usr/bin/env node
/**
 * Renders every episode to out/<composition-id>.mp4.
 *
 *   node scripts/render-all.mjs                 # every composition in the registry
 *   node scripts/render-all.mjs 03-plan 07-insert   # just these
 *
 * Rendering is sequential on purpose: Remotion already saturates the available
 * cores for a single render, so running two at once makes both slower.
 */
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'out');

const run = (command, args) =>
	new Promise((resolve, reject) => {
		const child = spawn(command, args, {cwd: root, stdio: ['ignore', 'pipe', 'inherit']});
		let stdout = '';
		child.stdout.on('data', (chunk) => {
			stdout += chunk;
			process.stdout.write(chunk);
		});
		child.on('error', reject);
		child.on('close', (code) =>
			code === 0 ? resolve(stdout) : reject(new Error(`${command} exited with ${code}`)),
		);
	});

const listCompositions = async () => {
	const child = spawn('npx', ['remotion', 'compositions', 'src/index.ts'], {
		cwd: root,
		stdio: ['ignore', 'pipe', 'ignore'],
	});
	let out = '';
	for await (const chunk of child.stdout) {
		out += chunk;
	}
	await new Promise((resolve) => child.on('close', resolve));

	// Lines look like: "01-connection    30      1920x1080      526 (17.53 sec)"
	return out
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => /^\S+\s+\d+\s+\d+x\d+\s+\d+/.test(line))
		.map((line) => line.split(/\s+/)[0]);
};

const main = async () => {
	mkdirSync(outDir, {recursive: true});

	const requested = process.argv.slice(2);
	const all = await listCompositions();
	const targets = requested.length > 0 ? requested : all.filter((id) => id !== 'MyComp');

	const unknown = targets.filter((id) => !all.includes(id));
	if (unknown.length > 0) {
		console.error(`Unknown composition(s): ${unknown.join(', ')}`);
		console.error(`Available: ${all.join(', ')}`);
		process.exit(1);
	}

	console.log(`Rendering ${targets.length} composition(s): ${targets.join(', ')}\n`);

	const started = Date.now();
	for (const [i, id] of targets.entries()) {
		console.log(`\n── [${i + 1}/${targets.length}] ${id} ──`);
		await run('npx', ['remotion', 'render', id, `out/${id}.mp4`]);
	}

	const mins = ((Date.now() - started) / 60000).toFixed(1);
	console.log(`\nDone. ${targets.length} file(s) in out/ — ${mins} min.`);
};

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
