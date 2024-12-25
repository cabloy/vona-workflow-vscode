import semver from 'semver';
import { getRegistry } from './registry.js';
import { newTerminal } from './global.js';
import { getWorkspaceRootDirectory } from './vona.js';
import { invokeVonaCli } from './commands.js';

export async function checkIfUpdateCli() {
  try {
    const res = await invokeVonaCli(
      ['--version'],
      getWorkspaceRootDirectory(),
      true
    );
    const versionOld = res.trimEnd();
    let needUpdate;
    if (!semver.valid(versionOld)) {
      needUpdate = true;
    } else {
      // version new
      const info: any = await getPackageInfo('vona-cli');
      const versionNew = info.version;
      // check
      const lt = semver.lt(versionOld, versionNew);
      needUpdate = lt;
    }
    if (needUpdate) {
      newTerminal(`pnpm add -g vona-cli@latest`, getWorkspaceRootDirectory());
    }
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 10127) {
      newTerminal(`pnpm add -g vona-cli@latest`, getWorkspaceRootDirectory());
    } else {
      console.log(err);
    }
  }
}

export async function getPackageInfo(packageName: string) {
  const registry = await getRegistry();
  const result = await fetch(`${registry}${packageName}/latest`, {
    headers: {
      'content-type': 'application/json',
    },
  });
  if (result.status !== 200) {
    const message = `npm info ${packageName} got error: ${result.status}, ${result.statusText}`;
    throw new Error(message);
  }
  const data = await result.json();
  return data;
}
