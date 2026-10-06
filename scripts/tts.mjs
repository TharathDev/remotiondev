#!/usr/bin/env node
/**
 * Synthesises the narration in src/narration/scripts.json into one audio file
 * per scene, and writes src/narration/manifest.json with the timing the
 * episodes lay themselves out from.
 *
 *   node scripts/tts.mjs                      # every episode, Pico voice
 *   node scripts/tts.mjs --voice=festival     # a different engine
 *   node scripts/tts.mjs 03-plan              # re-do one episode
 *   node scripts/tts.mjs --rate=0.95          # slow the delivery down
 *
 * Each line is synthesised on its own and silence-trimmed, then the lines are
 * joined with a fixed gap. That is what makes the manifest's per-line frame
 * offsets exact: a scene can light a callout on the frame its sentence starts.
 *
 * Everything here runs offline — no API keys, no network.
 */
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, rmSync, writeFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS = join(root, 'src/narration/scripts.json');
const MANIFEST = join(root, 'src/narration/manifest.json');
const AUDIO_DIR = join(root, 'public/audio');
const TMP = join(root, '.tts-tmp');

export const FPS = 30;
/** Silence before the first line of a scene. */
const LEAD_IN = 0.45;
/** Silence between lines. */
const GAP = 0.42;
/** Silence after the last line, so a cut never clips the final word. */
const TAIL = 1.1;

const args = process.argv.slice(2);
const flag = (name, fallback) => {
	const hit = args.find((a) => a.startsWith(`--${name}=`));
	return hit ? hit.split('=')[1] : fallback;
};
const voice = flag('voice', 'pico');
const rate = Number(flag('rate', '1'));
const polish = flag('polish', 'on') !== 'off';
const only = args.filter((a) => !a.startsWith('--'));

/* Voicebox options — see the Voicebox section of the README. */
const vbUrl = (flag('voicebox-url', 'http://127.0.0.1:17493') || '').replace(/\/$/, '');
const vbProfile = flag('profile', null);
const vbEngine = flag('engine', null);
const vbLanguage = flag('language', 'en');

/** Each backend writes a mono WAV at its own sample rate; sox normalises after. */
const VOICES = {
	pico: (text, out) => ['pico2wave', ['-l', 'en-US', '-w', out, text]],
	festival: (text, out) => [
		'bash',
		['-c', `printf '%s' ${JSON.stringify(text)} | text2wave -eval '(voice_cmu_us_slt_arctic_hts)' -o ${JSON.stringify(out)}`],
	],
	mbrola: (text, out) => ['espeak-ng', ['-v', 'mb-us1', '-s', '150', '-w', out, text]],
	espeak: (text, out) => ['espeak-ng', ['-v', 'en-us+f3', '-s', '150', '-p', '45', '-w', out, text]],

	/*
	 * Voicebox (https://github.com/jamiepine/voicebox) running locally: a real
	 * neural voice, including one cloned from your own recordings. Its
	 * /generate/stream endpoint answers with WAV bytes synchronously, which is
	 * exactly the shape this script wants.
	 *
	 * Voicebox has to be running on the same machine as this script — it is a
	 * desktop app, and its models are downloaded from Hugging Face on first use.
	 */
	voicebox: (text, out) => [
		'curl',
		[
			'-sS', '--fail-with-body', '--max-time', '300',
			'-X', 'POST', `${vbUrl}/generate/stream`,
			'-H', 'Content-Type: application/json',
			'-d', JSON.stringify({
				profile_id: resolvedProfileId,
				text,
				language: vbLanguage,
				normalize: true,
				...(vbEngine ? {engine: vbEngine} : {}),
			}),
			'-o', out,
		],
	],
};

/** Filled in before synthesis when --voice=voicebox. */
let resolvedProfileId = null;

if (!VOICES[voice]) {
	console.error(`Unknown voice "${voice}". Options: ${Object.keys(VOICES).join(', ')}`);
	process.exit(1);
}

const sh = (cmd, cmdArgs) => execFileSync(cmd, cmdArgs, {stdio: ['ignore', 'pipe', 'pipe']});

/**
 * Turns --profile (a name or an id) into the profile id Voicebox wants, and
 * fails early with something actionable if Voicebox is not running.
 */
const resolveVoiceboxProfile = () => {
	let profiles;
	try {
		profiles = JSON.parse(sh('curl', ['-sS', '--fail', '--max-time', '10', `${vbUrl}/profiles`]).toString());
	} catch {
		console.error(`Could not reach Voicebox at ${vbUrl}.`);
		console.error('Start the Voicebox app (or its backend) on this machine, then try again.');
		console.error('Override the address with --voicebox-url=http://host:port');
		process.exit(1);
	}

	const list = Array.isArray(profiles) ? profiles : (profiles.profiles ?? []);
	if (list.length === 0) {
		console.error('Voicebox is running but has no voice profiles. Create or clone one in the app first.');
		process.exit(1);
	}

	const names = list.map((p) => `${p.name} (${p.id})`).join('\n  ');

	if (!vbProfile) {
		console.error('Pick a voice with --profile="<name or id>". Available:\n  ' + names);
		process.exit(1);
	}

	const match =
		list.find((p) => p.id === vbProfile) ??
		list.find((p) => (p.name ?? '').toLowerCase() === vbProfile.toLowerCase());

	if (!match) {
		console.error(`No Voicebox profile matches "${vbProfile}". Available:`);
		console.error('  ' + names);
		process.exit(1);
	}

	console.log(`Voicebox profile: ${match.name} (${match.id})`);
	return match.id;
};

if (voice === 'voicebox') {
	resolvedProfileId = resolveVoiceboxProfile();
}

const duration = (file) =>
	Number(
		sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file])
			.toString()
			.trim(),
	);

const silence = (seconds, out) =>
	sh('sox', ['-n', '-r', '48000', '-c', '1', '-b', '16', out, 'trim', '0', String(seconds)]);

/** Synthesise one line, trim its leading and trailing silence, normalise it. */
const speak = (text, out) => {
	const raw = join(TMP, 'raw.wav');
	const [cmd, cmdArgs] = VOICES[voice](text, raw);
	sh(cmd, cmdArgs);

	const chain = ['-r', '48000', '-c', '1', '-b', '16', out];
	// Trim silence from both ends so the gap between lines is exactly GAP.
	const trim = ['silence', '1', '0.05', '0.25%', 'reverse', 'silence', '1', '0.05', '0.25%', 'reverse'];
	const tempo = rate !== 1 ? ['tempo', '-s', String(rate)] : [];

	/*
	 * The offline synths are thin and boxy. A high-pass, a presence lift around
	 * 3.5 kHz and gentle compression make the consonants land without making it
	 * sound processed. Voicebox output is already a finished neural voice, so it
	 * only gets levelled.
	 */
	const tone =
		polish && voice !== 'voicebox'
			? [
					'highpass', '90',
					'equalizer', '3500', '1.2q', '+4',
					'equalizer', '250', '1.0q', '-2',
					// Headroom first: the EQ lift alone is enough to clip the compressor.
					'gain', '-4',
					'compand', '0.02,0.20', '-35,-22,-18,-9,-6,-4', '-2',
				]
			: [];

	sh('sox', [raw, ...chain, ...tone, ...trim, ...tempo, 'gain', '-n', '-2.5']);
};

const scripts = JSON.parse(readFileSync(SCRIPTS, 'utf8'));
const episodes = only.length > 0 ? only : Object.keys(scripts);

const unknown = episodes.filter((id) => !scripts[id]);
if (unknown.length > 0) {
	console.error(`Unknown episode(s): ${unknown.join(', ')}`);
	process.exit(1);
}

rmSync(TMP, {recursive: true, force: true});
mkdirSync(TMP, {recursive: true});

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};

console.log(`Voice: ${voice}${rate !== 1 ? ` · rate ${rate}` : ''}\n`);

for (const episodeId of episodes) {
	const scenes = scripts[episodeId];
	mkdirSync(join(AUDIO_DIR, episodeId), {recursive: true});
	manifest[episodeId] = {voice, scenes: {}};

	for (const [sceneId, lines] of Object.entries(scenes)) {
		const parts = [];
		const cues = [];
		let cursor = LEAD_IN;

		const lead = join(TMP, 'lead.wav');
		silence(LEAD_IN, lead);
		parts.push(lead);

		lines.forEach((text, i) => {
			const lineFile = join(TMP, `${sceneId}-${i}.wav`);
			speak(text, lineFile);
			const seconds = duration(lineFile);

			cues.push({
				text,
				from: Math.round(cursor * FPS),
				frames: Math.round(seconds * FPS),
			});

			parts.push(lineFile);
			cursor += seconds;

			if (i < lines.length - 1) {
				const gap = join(TMP, `gap-${sceneId}-${i}.wav`);
				silence(GAP, gap);
				parts.push(gap);
				cursor += GAP;
			}
		});

		const tail = join(TMP, 'tail.wav');
		silence(TAIL, tail);
		parts.push(tail);
		cursor += TAIL;

		const relative = `audio/${episodeId}/${sceneId}.mp3`;
		const out = join(root, 'public', relative);
		sh('sox', [...parts, '-C', '128', out]);

		const total = duration(out);
		manifest[episodeId].scenes[sceneId] = {
			file: relative,
			frames: Math.ceil(total * FPS),
			lines: cues,
		};

		console.log(
			`  ${episodeId}/${sceneId}  ${lines.length} lines  ${total.toFixed(1)}s  ${Math.ceil(total * FPS)}f`,
		);
	}
}

rmSync(TMP, {recursive: true, force: true});
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, '\t')}\n`);

const grand = Object.values(manifest).reduce(
	(sum, ep) => sum + Object.values(ep.scenes).reduce((s, sc) => s + sc.frames, 0),
	0,
);
console.log(`\nWrote ${MANIFEST}`);
console.log(`Total narration: ${(grand / FPS / 60).toFixed(1)} min across ${Object.keys(manifest).length} episode(s).`);
