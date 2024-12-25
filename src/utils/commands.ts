import { commands, ExtensionContext, window } from 'vscode';
import {
  beanGlobal,
  beanAop,
  beanMiddleware,
  beanGuard,
  beanInterceptor,
  beanPipe,
  beanFilter,
  beanSocketConnection,
  beanSocketPacket,
  beanMetaIndex,
  beanMetaVersion,
  beanMetaStatus,
  beanMetaRedlock,
  beanSummerCache,
  beanStartup,
  beanQueue,
  beanSchedule,
  createEntity,
  createModel,
  createDto,
  createService,
  createController,
} from '../commands/create/bean.js';
import { logger } from './outputChannel.js';
import { LocalConsole } from './console.js';
import { ProcessHelper } from '@cabloy/process-helper';
import { getWorkspaceRootDirectory } from './vona.js';
import { existsSync } from 'fs-extra';
import path from 'node:path';
import { toolsMetadata } from '../commands/tools/metadata.js';
import { initConfig } from '../commands/init/config.js';
import { initConstant } from '../commands/init/constant.js';
import { initLocale } from '../commands/init/locale.js';
import { initError } from '../commands/init/error.js';
import { initMonkey } from '../commands/init/monkey.js';
import { initMain } from '../commands/init/main.js';
import { initStatic } from '../commands/init/static.js';
import { createModule } from '../commands/create/module.js';
import { createSuite } from '../commands/create/suite.js';
import { createTest } from '../commands/create/test.js';

const extensionCommands = [
  // create
  { command: 'vona.createModule', function: createModule },
  { command: 'vona.createSuite', function: createSuite },
  { command: 'vona.createDto', function: createDto },
  { command: 'vona.createEntity', function: createEntity },
  { command: 'vona.createModel', function: createModel },
  { command: 'vona.createService', function: createService },
  { command: 'vona.createController', function: createController },
  { command: 'vona.createTest', function: createTest },
  // bean
  { command: 'vona.beanGlobal', function: beanGlobal },
  { command: 'vona.beanAop', function: beanAop },
  { command: 'vona.beanMiddleware', function: beanMiddleware },
  { command: 'vona.beanGuard', function: beanGuard },
  { command: 'vona.beanInterceptor', function: beanInterceptor },
  { command: 'vona.beanPipe', function: beanPipe },
  { command: 'vona.beanFilter', function: beanFilter },
  { command: 'vona.beanSocketConnection', function: beanSocketConnection },
  { command: 'vona.beanSocketPacket', function: beanSocketPacket },
  { command: 'vona.beanMetaIndex', function: beanMetaIndex },
  { command: 'vona.beanMetaVersion', function: beanMetaVersion },
  { command: 'vona.beanMetaStatus', function: beanMetaStatus },
  { command: 'vona.beanMetaRedlock', function: beanMetaRedlock },
  { command: 'vona.beanSummerCache', function: beanSummerCache },
  { command: 'vona.beanStartup', function: beanStartup },
  { command: 'vona.beanQueue', function: beanQueue },
  { command: 'vona.beanSchedule', function: beanSchedule },
  // init
  { command: 'vona.initConfig', function: initConfig },
  { command: 'vona.initConstant', function: initConstant },
  { command: 'vona.initLocale', function: initLocale },
  { command: 'vona.initError', function: initError },
  { command: 'vona.initMonkey', function: initMonkey },
  { command: 'vona.initMain', function: initMain },
  { command: 'vona.initStatic', function: initStatic },
  // refactor
  // tools
  { command: 'vona.toolsMetadata', function: toolsMetadata },
];

export class Commands {
  context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  initialize() {
    for (const { command, function: commandFunction } of extensionCommands) {
      this.context.subscriptions.push(
        commands.registerCommand(
          command,
          wrapperCommand(command, commandFunction)
        )
      );
    }
  }
}

function wrapperCommand(command, fn) {
  return async function (...args) {
    try {
      await fn(...args);
    } catch (err) {
      // need not logger.log to avoid log the same error twice
      // logger.log(`command: ${command} Error: ${err.message}`);
      window.showInformationMessage(err.message);
    }
  };
}

export async function invokeVonaCli(
  args: string[],
  projectCurrent: string,
  forceGlobalCli?: boolean
) {
  const console = new LocalConsole();
  const processHelper = new ProcessHelper(projectCurrent, console);
  const workspaceFolder = getWorkspaceRootDirectory();
  args = args.concat('--vscode');
  let res;
  if (
    !forceGlobalCli &&
    existsSync(path.join(workspaceFolder, 'packages-cli'))
  ) {
    await processHelper.spawnCmd({
      cmd: 'tsc',
      args: ['-b'],
      options: {
        stdio: 'pipe',
        cwd: path.join(workspaceFolder, 'packages-cli'),
        shell: true,
      },
    });
    res = await processHelper.spawnExe({
      cmd: 'node',
      args: [
        path.join(workspaceFolder, 'packages-cli/cli/dist/bin/vona.js'),
      ].concat(args),
      options: {
        stdio: 'pipe',
        cwd: projectCurrent,
        shell: true,
      },
    });
  } else {
    // spawn
    res = await processHelper.spawnCmd({
      cmd: 'vona',
      args,
      options: {
        stdio: 'pipe',
        cwd: projectCurrent,
        shell: true,
      },
    });
  }
  return res;
}
