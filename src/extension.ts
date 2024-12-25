import * as vscode from 'vscode';
import { logger } from './utils/outputChannel.js';
import { FileWatchers } from './watchers/files.js';
import { TextEditorWatchers } from './watchers/textEditor.js';
import { Commands } from './utils/commands.js';
import { checkIfUpdateCli } from './utils/updater.js';

// let fileWatchers: FileWatchers | undefined;
let textEditorWatchers: TextEditorWatchers | undefined;
export function activateExtension(context: vscode.ExtensionContext) {
  logger.log('Vona-vscode is active');

  const commands = new Commands(context);
  commands.initialize();

  textEditorWatchers = new TextEditorWatchers(context);
  textEditorWatchers.start();

  checkIfUpdateCli();

  // fileWatchers = new FileWatchers(context);
  // fileWatchers.start();
}

export function deactivateExtension() {
  if (textEditorWatchers) {
    textEditorWatchers.stop();
    textEditorWatchers = undefined;
  }
  // if (fileWatchers) {
  //   fileWatchers.stop();
  //   fileWatchers = undefined;
  // }
}
