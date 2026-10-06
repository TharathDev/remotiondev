# remotiondev

A [Remotion](https://www.remotion.dev/) video app: React components rendered frame by frame into an MP4.

The repo ships with one finished film, **"Video as code"** — a 17.7 s / 530-frame 1080p30
motion-graphics piece built entirely from code. No stock footage, no image assets, no
network at render time.

![Poster frame](media/poster.jpg)

The rendered film is committed at [`media/video-as-code.mp4`](media/video-as-code.mp4);
`npm run build` regenerates it into `out/`, which is gitignored.

## Quick start

```bash
npm install
npm run studio      # open the Remotion Studio and scrub the timeline
npm run build       # render out/video.mp4
```

## Scripts

| Script | What it does |
|---|---|
| `npm run studio` | Remotion Studio on `localhost:3000` — live preview, frame scrubbing, prop editing |
| `npm run build` | Renders the `MyComp` composition to `out/video.mp4` |
| `npm run render` | Bare `remotion render` — pass your own composition id and output path |
| `npm run still` | Renders a single frame, e.g. `npm run still -- MyComp out/frame.png --frame=95` |
| `npm run typecheck` | `tsc --noEmit` |

## Layout

```
CLAUDE.md             Remotion house rules for Claude Code (see below)
remotion.config.ts    Render settings and browser resolution
src/
  index.ts            registerRoot
  Root.tsx            <Composition id="MyComp" ... /> — 1920x1080, 30fps
  MyComp.tsx          The film: four scenes joined by a TransitionSeries
  theme.ts            Palette, type stack, beat grid
  scenes/             The intro film's four scenes
  components/         KineticText, Seed, StarField, Grain, Vignette, Caption
  kit/                Shared building blocks for the series (see below)
  series/             One file per episode, plus registry.ts
  narration/          scripts.json (written by hand) and manifest.json (generated)
scripts/
  tts.mjs             Narration -> public/audio + manifest.json
  render-all.mjs      Renders every episode to out/
  concat.mjs          Joins the episodes with ffmpeg -c copy
public/               staticFile() assets
media/                The committed film and its poster frame
out/                  Render output (gitignored)
```

### How the film is put together

One object travels through every scene — a single dot. It stretches into a rule under the
title, becomes the three cards, multiplies into the bar field, and collapses back into a
dot at the end. `MyComp.tsx` derives `TOTAL_DURATION` from the scene durations minus one
transition per cut, so the composition length can never drift out of sync with the scenes.

Everything is frame-driven. There is no `Math.random()` anywhere: the dust field, the film
grain and the bar amplitudes all come from Remotion's seeded `random()`, so frame 397 is
byte-identical on every machine and every re-render.


## The MySQL / PostgreSQL series

A narrated explainer series. Each operation is its own Remotion composition and
renders to its own MP4, so an episode can be rewritten, re-rendered or dropped
without touching the others, then joined at the end.

```bash
npm run tts                     # synthesise narration -> public/audio + manifest
npm run render:all              # every episode -> out/01-connection.mp4, ...
npm run render:all 03-plan      # just one, after you change it
npm run concat                  # join them in order -> out/series.mp4
```

The join uses ffmpeg's concat demuxer with `-c copy`. Every composition is
1920x1080 / 30fps with the same codecs, so it is a stream copy: no re-encode, no
generation loss, about a second.

### Adding or changing an episode

`src/series/registry.ts` is the single source of truth. One entry per episode:

```ts
{id: '03-plan', number: '03', title: 'Plan', durationInFrames: EP03_DURATION, component: Ep03Plan}
```

`Root.tsx` registers a `<Composition>` per entry and `scripts/render-all.mjs`
renders one file per entry, so adding an episode is one line plus its scene file.

### The kit

`src/kit/` is why each episode file stays short. Episodes compose these rather
than hand-rolling layout, so a change to the palette or the type scale lands
everywhere at once.

| Component | Use |
|---|---|
| `SceneFrame` | Background, grid, episode chrome, narration, captions, vignette, grain |
| `Film` | Joins scenes with a consistent cut **and** derives the episode's duration from them |
| `TitleCard` / `EndCard` | The opening and closing card every episode shares |
| `SqlBlock` | SQL typed out and syntax-coloured, via a small deterministic tokenizer in `sql.ts` |
| `Stage` / `Connector` | Pipeline boxes and the packet travelling between them, horizontal or vertical |
| `Tree` | Parse and plan trees, laid out from a nested object |
| `CostMeter` | Candidate plan costs on a shared scale |
| `PageGrid` | A buffer pool, with hit and miss |
| `DataTable` | Result sets and heap pages, with live and dead rows |
| `EnginePanel` | One side of a MySQL / PostgreSQL comparison, in that engine's hue |
| `Callout`, `Panel`, `Heading`, `Badge` | The small shared pieces |

### Narration

Narration is written in `src/narration/scripts.json`, one array of lines per
scene. `npm run tts` synthesises each line separately, trims its silence, joins
the lines with a fixed gap, and writes both the audio and
`src/narration/manifest.json`, which records the exact start frame of every
line.

Scenes then lay themselves out **from that manifest**:

```tsx
const mysqlAt = cue(EP, 'engines', 1);          // frame that sentence starts on
<EnginePanel from={mysqlAt - 26} ... />          // panel arrives just before it
<Callout from={mysqlAt} ... />                   // callout lights as it is spoken
```

and scene durations come from `sceneFrames(EP, scene)` rather than a constant.
So editing a sentence and re-running `npm run tts` re-times the film — there are
no hand-tuned frame numbers to chase.

All of it runs offline, with no API keys. Four voices are wired up:

```bash
npm run tts -- --voice=pico       # default, the most natural of the four
npm run tts -- --voice=festival   # Festival HTS (cmu_us_slt)
npm run tts -- --voice=mbrola     # eSpeak NG driving MBROLA us1
npm run tts -- --voice=espeak     # eSpeak NG on its own
npm run tts -- --rate=0.95        # slow the delivery down
```

They need `pico2wave`, `festival` + `festvox-us-slt-hts`, `mbrola` + `mbrola-us1`,
`espeak-ng` and `sox` on `PATH`. A presence-EQ and compression chain is applied
to these by default (`--polish=off` to skip it); it sharpens the consonants but
cannot make an old synth sound modern.

### Your own voice, via Voicebox

The offline voices above are 1990s-era formant and diphone synths. They are
intelligible and they cost nothing, but they will never sound good. For a real
neural voice — including one cloned from your own recordings —
[Voicebox](https://github.com/jamiepine/voicebox) is wired in as a backend.

**This has to run on your machine, not in a cloud session.** Voicebox downloads
its models from Hugging Face on first use, and it is driven over localhost.

```bash
# 1. Run Voicebox — the desktop app, or headless from a checkout of the fork:
python -m backend.main --host 127.0.0.1 --port 17493

# 2. Create or clone a voice profile in the app.

# 3. From a local checkout of THIS repo, list the profiles:
npm run tts -- --voice=voicebox
#    → prints every profile with its id

# 4. Regenerate the whole series in that voice:
npm run tts -- --voice=voicebox --profile="My Voice"

# 5. Re-render:
npm run render:all && npm run concat
```

Useful flags:

| Flag | Default | Notes |
|---|---|---|
| `--profile=` | — | Profile name (case-insensitive) or id. Required. |
| `--engine=` | profile default | `qwen`, `kokoro`, `chatterbox`, `chatterbox_turbo`, `luxtts`, `tada` |
| `--voicebox-url=` | `http://127.0.0.1:17493` | If Voicebox runs elsewhere |
| `--language=` | `en` | 23 languages supported |
| `--polish=off` | on | Skips the EQ/compression chain, which only helps the offline synths |

Because everything downstream reads `manifest.json`, swapping the voice changes
nothing else: scene durations, caption timing and callout cues all re-derive
from the new audio. Commit the regenerated `public/audio/**` and
`src/narration/manifest.json` and the rendered films follow.

To swap in a different provider entirely — ElevenLabs, OpenAI, a local Piper —
add one entry to the `VOICES` table in `scripts/tts.mjs`. That table is the only
place that knows how audio gets made.


## Rendering

Remotion drives Chrome in old headless mode, which recent full Chrome binaries no longer
support — it needs `chrome-headless-shell`. `remotion.config.ts` resolves a browser in
this order:

1. `REMOTION_BROWSER_EXECUTABLE`, if set and present on disk
2. Playwright's `chrome-headless-shell`, if `PLAYWRIGHT_BROWSERS_PATH` is set
3. Remotion's own managed browser — the normal path on a developer machine

So `npm run build` works unconfigured locally, and reuses the existing browser in CI or a
container where one is already installed.

## CLAUDE.md

`CLAUDE.md` is [Thariq Shihipar's Remotion guide](https://gist.github.com/ThariqS/3d446e7c7aa9eb94f468194deb73028f),
installed verbatim. It gives Claude Code the Remotion component rules — `useCurrentFrame()`,
`interpolate()`, `spring()`, `Sequence` / `Series` / `TransitionSeries`, `OffthreadVideo`,
`staticFile()`, the ban on `Math.random()`, and why a Remotion component is not an
interactive React component. Claude Code reads it automatically; it is the reason the code
in `src/` looks the way it does.
