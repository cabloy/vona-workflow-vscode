import * as vscode from 'vscode';
import {
  getWorkspaceRootDirectory,
  hasVonaProject,
  IProjectInfo,
} from './vona.js';
import path from 'node:path';

export class ContextKeys {
  async initialize() {
    const projectInfo = await this._setProjectInfo();
    if (!projectInfo) {
      return;
    }
    return projectInfo;
  }

  async _setProjectInfo() {
    const projectInfo = await hasVonaProject();
    // vona.hasVonaProject
    vscode.commands.executeCommand(
      'setContext',
      'vona.hasVonaProject',
      !!projectInfo
    );
    // vona.currentVonaProject
    if (projectInfo && !projectInfo.isMulti) {
      vscode.commands.executeCommand(
        'setContext',
        'vona.currentVonaProject',
        projectInfo.directoryCurrent
      );
    }
    // more keys
    await this._setMoreKeys(projectInfo);
    // ok
    return projectInfo;
  }

  async _setMoreKeys(projectInfo?: IProjectInfo) {
    if (!projectInfo) {
      return;
    }
    // arrayProjectRoot
    const workspaceFolder = getWorkspaceRootDirectory();
    const arrayProjectRoot = projectInfo.isMulti
      ? projectInfo.projectNames.map((item) => path.join(workspaceFolder, item))
      : [workspaceFolder];
    // vona.arrayProjectRoot
    vscode.commands.executeCommand(
      'setContext',
      'vona.arrayProjectRoot',
      arrayProjectRoot
    );
    // vona.arrayProjectSrc
    vscode.commands.executeCommand(
      'setContext',
      'vona.arrayProjectSrc',
      arrayProjectRoot.map((item) => path.join(item, 'src'))
    );
  }
}
