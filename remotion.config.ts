import {Config} from '@remotion/cli/config';
import {existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('swangle');

/**
 * Remotion drives the browser in old headless mode, which the full Chrome binary
 * no longer supports — it needs `chrome-headless-shell`. When Playwright's
 * browsers are already on this machine we point Remotion at that shell so the
 * render does not have to download a second browser. On a machine with neither
 * variable set this resolves to nothing and Remotion uses its own managed
 * browser, which is the normal path.
 */
const findPlaywrightHeadlessShell = (): string | null => {
	const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
	if (!root || !existsSync(root)) {
		return null;
	}

	const dir = readdirSync(root).find((entry) => entry.startsWith('chromium_headless_shell-'));
	if (!dir) {
		return null;
	}

	const shell = join(root, dir, 'chrome-linux', 'headless_shell');
	return existsSync(shell) ? shell : null;
};

const browser =
	[process.env.REMOTION_BROWSER_EXECUTABLE].find(
		(candidate): candidate is string => Boolean(candidate && existsSync(candidate)),
	) ?? findPlaywrightHeadlessShell();

if (browser) {
	Config.setBrowserExecutable(browser);
}
