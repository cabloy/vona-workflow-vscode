import {
  ExtensionContext,
  FileSystemWatcher,
  RelativePattern,
  workspace,
} from 'vscode';
import { getWorkspaceRootDirectory } from '../utils/vona.js';

export class FileWatchers {
  context: ExtensionContext;
  rootWatcher?: FileSystemWatcher;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  start() {
    this.rootWatcher = workspace.createFileSystemWatcher(
      new RelativePattern(getWorkspaceRootDirectory(), '**/*')
    );
    this.rootWatcher.onDidCreate((uri) => {
      console.log('create:', uri);
    });
    this.rootWatcher.onDidChange((uri) => {
      console.log('change:', uri);
    });
    this.rootWatcher.onDidDelete((uri) => {
      console.log('delete:', uri);
    });
  }

  stop() {
    if (this.rootWatcher) {
      this.rootWatcher.dispose();
      this.rootWatcher = undefined;
    }
  }
}
