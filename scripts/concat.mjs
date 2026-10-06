#!/usr/bin/env node
/**
 * Joins the rendered episodes into one film, in registry order.
 *
 *   node scripts/concat.mjs                       # every mp4 in out/, sorted
 *   node scripts/concat.mjs out/series.mp4        # custom output path
 *
 * Every composition renders at the same size, frame rate and codec, so this
 * uses ffmpeg's concat demuxer and copies the streams — no re-encode, no
 * generation loss, and it finishes in about a second.
 */
import {spawn} from 'node:child_process';
import {readdirSync, writeFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'out');

const output = resolve(root, process.argv[2] ?? 'out/series.mp4');

const episodes = readdirSync(outDir)
	.filter((name) => /^\d{2}-.*\.mp4$/.test(name))
	.sort();

if (episodes.length === 0) {
	console.error('No episode MP4s in out/. Run `npm run render:all` first.');
	process.exit(1);
}

mkdirSync(dirname(output), {recursive: true});

const listPath = join(outDir, 'concat-list.txt');
writeFileSync(listPath, episodes.map((name) => `file '${join(outDir, name)}'`).join('\n'));

console.log(`Joining ${episodes.length} episode(s):`);
episodes.forEach((name) => console.log(`  ${name}`));

const ffmpeg = spawn(
	'ffmpeg',
	['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', output],
	{stdio: ['ignore', 'inherit', 'inherit']},
);

ffmpeg.on('close', (code) => {
	if (code === 0) {
		console.log(`\nWrote ${output}`);
	} else {
		process.exit(code ?? 1);
	}
});
