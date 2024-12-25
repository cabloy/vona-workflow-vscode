import { Uri, window, workspace } from 'vscode';
import {
  combineCliResourcePath,
  extractCommandPathInfo,
  preparePathResource,
  trimPathPrefixs,
} from '../../utils/vona.js';
import { LocalConsole } from '../../utils/console.js';
import path from 'node:path';
import { invokeVonaCli } from '../../utils/commands.js';
import { showTextDocument } from '../../utils/global.js';

export async function beanGlobal(resource: Uri) {
  await beanGeneral_common(resource, 'bean', 'What is the global bean name?');
}

export async function beanAop(resource: Uri) {
  await beanGeneral_common(resource, 'aop', 'What is the aop bean name?');
}

export async function beanMiddleware(resource: Uri) {
  await beanGeneral_common(
    resource,
    'middleware',
    'What is the middleware bean name?'
  );
}

export async function beanGuard(resource: Uri) {
  await beanGeneral_common(resource, 'guard', 'What is the guard bean name?');
}

export async function beanInterceptor(resource: Uri) {
  await beanGeneral_common(
    resource,
    'interceptor',
    'What is the interceptor bean name?'
  );
}

export async function beanPipe(resource: Uri) {
  await beanGeneral_common(resource, 'pipe', 'What is the pipe bean name?');
}

export async function beanFilter(resource: Uri) {
  await beanGeneral_common(resource, 'filter', 'What is the filter bean name?');
}

export async function beanSocketConnection(resource: Uri) {
  await beanGeneral_common(
    resource,
    'socketConnection',
    'What is the socket connection bean name?'
  );
}

export async function beanSocketPacket(resource: Uri) {
  await beanGeneral_common(
    resource,
    'socketPacket',
    'What is the socket packet bean name?'
  );
}

export async function beanMetaIndex(resource: Uri) {
  await beanGeneral_common(
    resource,
    'meta',
    'What is the meta index bean name?',
    'index'
  );
}

export async function beanMetaVersion(resource: Uri) {
  await beanGeneral_common(
    resource,
    'meta',
    'What is the meta version bean name?',
    'version'
  );
}

export async function beanMetaStatus(resource: Uri) {
  await beanGeneral_common(
    resource,
    'meta',
    'What is the meta status bean name?',
    'status'
  );
}

export async function beanMetaRedlock(resource: Uri) {
  await beanGeneral_common(
    resource,
    'meta',
    'What is the meta redlock bean name?',
    'redlock'
  );
}

export async function beanSummerCache(resource: Uri) {
  await beanGeneral_common(
    resource,
    'summerCache',
    'What is the summer cache bean name?'
  );
}

export async function beanStartup(resource: Uri) {
  await beanGeneral_common(
    resource,
    'startup',
    'What is the startup bean name?'
  );
}

export async function beanQueue(resource: Uri) {
  await beanGeneral_common(resource, 'queue', 'What is the queue bean name?');
}

export async function beanSchedule(resource: Uri) {
  await beanGeneral_common(
    resource,
    'schedule',
    'What is the schedule bean name?'
  );
}

export async function createEntity(resource: Uri) {
  await beanGeneral_common(resource, 'entity', 'What is the entity name?');
}

export async function createModel(resource: Uri) {
  await beanGeneral_common(resource, 'model', 'What is the model name?');
}

export async function createDto(resource: Uri) {
  await beanGeneral_common(resource, 'dto', 'What is the dto name?');
}

export async function createService(resource: Uri) {
  await beanGeneral_common(resource, 'service', 'What is the service name?');
}

export async function createController(resource: Uri) {
  await beanGeneral_common(
    resource,
    'controller',
    'What is the controller name?'
  );
}

export async function beanGeneral_common(
  resource: Uri,
  sceneName: string,
  prompt: string,
  name?: string
) {
  const { fromPalette, fsPath } = preparePathResource(resource);
  if (!fsPath) {
    return;
  }
  // name
  if (!name) {
    name = await window.showInputBox({ prompt });
    if (!name) {
      return;
    }
  }
  // commandPathInfo
  const commandPathInfo = extractCommandPathInfo(fsPath);
  if (fromPalette) {
    commandPathInfo.pathResource = '';
  }
  // pathResource
  const pathResource = trimPathPrefixs(
    combineCliResourcePath(commandPathInfo.pathResource, name),
    [`src/${sceneName}/`, 'src/bean/', 'src/']
  );
  // invoke
  // const commandName = sceneName === 'bean' ? 'general' : sceneName;
  await invokeVonaCli(
    [
      `:create:bean`,
      sceneName,
      pathResource,
      `--module=${commandPathInfo.moduleName}`,
    ],
    commandPathInfo.projectCurrent
  );
  // open
  const fileDestScene = [
    'entity',
    'model',
    'dto',
    'service',
    'controller',
  ].includes(sceneName)
    ? `src/${sceneName}/${pathResource}.ts`
    : `src/bean/${sceneName}.${pathResource}.ts`;
  const fileDest = path.join(commandPathInfo.moduleRoot, fileDestScene);
  showTextDocument(path.join(commandPathInfo.projectCurrent, fileDest));
}
