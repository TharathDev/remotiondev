#!/usr/bin/env node
/**
 * Joins the rendered episodes into one film, in registry order.
 *
 *   node scripts/concat.mjs out/series.mp4             # every episode
 *   node scripts/concat.mjs out/part1.mp4 01 02 03 04 05 # just these
 *
 * Episode arguments are id prefixes, so "01" selects 01-connection. Without
 * them every episode is joined — which is why the output path is explicit: a
 * run that joined everything once silently overwrote a part file.
 *
 * The episode list comes from Remotion's own composition list rather than from
 * a glob of out/. A glob also picks up anything else that happens to be sitting
 * there — compressed previews, drafts — and joining a re-encode alongside the
 * master corrupts the timestamps as well as duplicating the content.
 *
 * Every composition renders at the same size, frame rate and codec, so this
 * uses ffmpeg's concat demuxer and copies the streams: no re-encode, no
 * generation loss, about a second.
 */
import {spawn} from 'node:child_process';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'out');
const args = process.argv.slice(2);
const output = resolve(root, args[0] ?? 'out/series.mp4');
const wanted = args.slice(1);

const listCompositions = async () => {
	const child = spawn('npx', ['remotion', 'compositions', 'src/index.ts'], {
		cwd: root,
		stdio: ['ignore', 'pipe', 'ignore'],
	});
	let out = '';
	for await (const chunk of child.stdout) {
		out += chunk;
	}
	await new Promise((done) => child.on('close', done));

	// Lines look like: "01-connection    30      1920x1080      3249 (108.30 sec)"
	return out
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => /^\S+\s+\d+\s+\d+x\d+\s+\d+/.test(line))
		.map((line) => line.split(/\s+/)[0])
		.filter((id) => /^\d{2}-/.test(id));
};

const main = async () => {
	const all = await listCompositions();
	const ids = wanted.length > 0 ? all.filter((id) => wanted.some((w) => id.startsWith(w))) : all;

	if (ids.length === 0) {
		console.error(`No episodes matched: ${wanted.join(', ')}`);
		console.error(`Available: ${all.join(', ')}`);
		process.exit(1);
	}

	const files = ids.map((id) => join(outDir, `${id}.mp4`));
	const missing = ids.filter((id, i) => !existsSync(files[i]));

	if (missing.length > 0) {
		console.error(`Not rendered yet: ${missing.join(', ')}`);
		console.error('Run `npm run render:all` first.');
		process.exit(1);
	}

	mkdirSync(dirname(output), {recursive: true});
	const listPath = join(outDir, 'concat-list.txt');
	writeFileSync(listPath, files.map((f) => `file '${f}'`).join('\n'));

	console.log(`Joining ${files.length} episode(s) in registry order:`);
	ids.forEach((id) => console.log(`  ${id}`));

	/*
	 * Video is copied; audio is re-encoded. Copying both leaves non-monotonic
	 * DTS at every episode boundary, because each file's AAC frames start on
	 * their own alignment, and that can click on the cut. Re-encoding just the
	 * audio lays down clean timestamps, costs a few seconds for ten minutes of
	 * speech, and leaves every video frame untouched.
	 */
	const ffmpeg = spawn(
		'ffmpeg',
		[
			'-y', '-f', 'concat', '-safe', '0', '-i', listPath,
			'-c:v', 'copy',
			'-c:a', 'aac', '-b:a', '192k',
			'-movflags', '+faststart',
			output,
		],
		{stdio: ['ignore', 'inherit', 'inherit']},
	);
	ffmpeg.on('close', (code) => {
		if (code !== 0) {
			process.exit(code ?? 1);
		}
		console.log(`\nWrote ${output}`);
	});
};

main().catch((e) => {
	console.error(e.message);
	process.exit(1);
});
