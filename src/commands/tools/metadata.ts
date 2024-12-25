import { Uri, window } from 'vscode';
import {
  extractCommandPathInfo,
  preparePathResource,
} from '../../utils/vona.js';
import { invokeVonaCli } from '../../utils/commands.js';
import path from 'node:path';
import { showTextDocument } from '../../utils/global.js';

export async function toolsIcon(resource?: Uri) {
  const { fsPath } = preparePathResource(resource);
  if (!fsPath) {
    return;
  }
  // commandPathInfo
  const commandPathInfo = extractCommandPathInfo(fsPath);
  if (!commandPathInfo.moduleName) {
    return;
  }
  // invoke
  await invokeVonaCli(
    [':tools:icon', commandPathInfo.moduleName],
    commandPathInfo.projectCurrent
  );
  window.showInformationMessage('Generate icon successfully!');
}

export async function toolsMetadata(resource?: Uri) {
  const { fsPath } = preparePathResource(resource);
  if (!fsPath) {
    return;
  }
  // commandPathInfo
  const commandPathInfo = extractCommandPathInfo(fsPath);
  if (!commandPathInfo.moduleName) {
    return;
  }
  // invoke
  await invokeVonaCli(
    [':tools:metadata', commandPathInfo.moduleName],
    commandPathInfo.projectCurrent
  );
  // open
  const fileDest = path.join(
    commandPathInfo.moduleRoot,
    `src/.metadata/index.ts`
  );
  showTextDocument(path.join(commandPathInfo.projectCurrent, fileDest));
  //window.showInformationMessage('Generate .metadata successfully!');
}
