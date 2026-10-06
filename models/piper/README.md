# Piper voices

Drop a Piper voice here — both files, same folder:

```
models/piper/en_US-ryan-medium.onnx        # ~63 MB
models/piper/en_US-ryan-medium.onnx.json   # ~5 KB
```

Audition voices at <https://rhasspy.github.io/piper-samples/>, then download the
pair from <https://huggingface.co/rhasspy/piper-voices>. Prefer **medium**
quality: `high` voices are ~110 MB, over GitHub's 100 MB per-file limit.

Then:

```bash
npm run tts -- --voice=piper --model=models/piper/en_US-ryan-medium.onnx
npm run render:all && npm run concat
```

`piper-tts` from PyPI ships the runtime and the espeak-ng phonemizer, so these
two files are the only thing that is not already installed. Nothing is
downloaded at run time.
