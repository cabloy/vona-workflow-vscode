import path from 'node:path';
import fse from 'fs-extra';
import * as vscode from 'vscode';

export interface ICommandPathInfo {
  projectCurrent: string;
  suiteRoot?: string;
  suiteName?: string;
  moduleRoot?: string;
  moduleName?: string;
  pathResource: string;
}

export interface IProjectInfo {
  directoryCurrent?: string;
  isMulti?: boolean;
  projectNames?: string[];
}

let _projectInfo: IProjectInfo = {
  directoryCurrent: undefined,
  isMulti: false,
  projectNames: undefined,
};

export function getWorkspaceRootDirectory(): string {
  return vscode.workspace.workspaceFolders?.[0].uri.fsPath!;
}

export function isVonaProject(pathRoot: string) {
  if (!pathRoot) {
    return false;
  }
  const pathTest = path.join(pathRoot, 'src/backend/config/config');
  return fse.pathExistsSync(pathTest);
}

export function getProjectInfo() {
  return _projectInfo;
}

export function setProjectInfo(projectInfo: IProjectInfo) {
  Object.assign(_projectInfo, projectInfo);
  vscode.commands.executeCommand(
    'setContext',
    'vona.currentVonaProject',
    _projectInfo.directoryCurrent
  );
}

export async function hasVonaProject(): Promise<IProjectInfo | undefined> {
  // reset
  _projectInfo.directoryCurrent = undefined;
  _projectInfo.isMulti = false;
  // workspace
  const workspaceFolder = getWorkspaceRootDirectory();
  if (!workspaceFolder) {
    return;
  }
  if (isVonaProject(workspaceFolder)) {
    _projectInfo.directoryCurrent = workspaceFolder;
    _projectInfo.isMulti = false;
    return _projectInfo;
  }
  // multi
  let projectNames = await fse.readdir(workspaceFolder);
  projectNames = projectNames.filter((item) => {
    return isVonaProject(path.join(workspaceFolder, item));
  });
  if (projectNames.length > 0) {
    _projectInfo.isMulti = true;
    _projectInfo.projectNames = projectNames;
    return _projectInfo;
  }
}

export function getVonaProjectCurrent(resource: string) {
  const projectInfo = getProjectInfo();
  if (!projectInfo.isMulti) {
    return projectInfo.directoryCurrent;
  }
  // current
  if (!resource) {
    return projectInfo.directoryCurrent;
  }
  // multi
  const workspaceFolder = getWorkspaceRootDirectory();
  const pos = resource.indexOf(path.sep, workspaceFolder.length + 1);
  const projectFolder = pos === -1 ? resource : resource.substring(0, pos);
  return projectFolder;
}

export function preparePathResource(resource?: vscode.Uri) {
  const fsPath = resource
    ? resource.fsPath
    : vscode.window.activeTextEditor?.document.uri.fsPath;
  if (!fsPath) {
    return { fromPalette: true, fsPath };
  }
  return { fromPalette: !resource, fsPath };
}

export function extractCommandPathInfo(resource: string) {
  let commandPathInfo = {} as ICommandPathInfo;
  commandPathInfo.projectCurrent = getVonaProjectCurrent(resource);
  commandPathInfo.pathResource = resource
    .substring(commandPathInfo.projectCurrent.length + 1)
    .replaceAll('\\', '/');
  const pathResource = commandPathInfo.pathResource;
  // suite
  const suiteInfo = extractSuiteInfo(pathResource);
  if (suiteInfo) {
    commandPathInfo.suiteRoot = suiteInfo.suiteRoot;
    commandPathInfo.suiteName = suiteInfo.suiteName;
    commandPathInfo.pathResource = suiteInfo.resource;
  }
  // module
  const moduleInfo = extractModuleInfo(pathResource);
  if (moduleInfo) {
    commandPathInfo.moduleRoot = moduleInfo.moduleRoot;
    commandPathInfo.moduleName = moduleInfo.moduleName;
    commandPathInfo.pathResource = moduleInfo.resource;
  }
  return commandPathInfo;
}

export function extractSuiteInfo(resource: string) {
  const patterns = [/src\/suite\/([^\/]+)/, /src\/suite-vendor\/([^\/]+)/];
  for (const pattern of patterns) {
    const matches = resource.match(pattern);
    if (matches) {
      return {
        suiteRoot: matches[0],
        suiteName: matches[1],
        resource: resource.substring(matches[0].length + 1),
      };
    }
  }
}

export function extractModuleInfo(resource: string) {
  const patterns = [
    /src\/module\/([^\/]+)/,
    /src\/module-vendor\/([^\/]+)/,
    /src\/suite\/[^\/]+\/modules\/([^\/]+)/,
    /src\/suite-vendor\/[^\/]+\/modules\/([^\/]+)/,
  ];
  for (const pattern of patterns) {
    const matches = resource.match(pattern);
    if (matches) {
      return {
        moduleRoot: matches[0],
        moduleName: matches[1],
        resource: resource.substring(matches[0].length + 1),
      };
    }
  }
}

export function combineCliResourcePath(pathResource: string, resource: string) {
  if (!pathResource) {
    return resource;
  }
  return `${pathResource}/${resource}`;
}

export function trimPathPrefixs(pathResource: string, prefixs: string[]) {
  for (const prefix of prefixs) {
    if (pathResource.startsWith(prefix)) {
      pathResource = pathResource.substring(prefix.length);
    }
  }
  return pathResource;
}
