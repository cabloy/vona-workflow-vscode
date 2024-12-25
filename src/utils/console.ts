import {
  IProcessHelperSpawnOptions,
  ProcessHelperConsole,
} from '@cabloy/process-helper';
import { logger } from './outputChannel.js';

export interface IConsoleLogData {
  text: string;
  total?: number;
  progress?: number;
}

export interface IConsoleLogOptions {
  logPrefix?: boolean;
}

export class LocalConsole extends ProcessHelperConsole {
  async log(data, options: IProcessHelperSpawnOptions = {}) {
    if (!data) {
      return;
    }
    // data
    if (typeof data !== 'object') {
      data = { text: String(data) };
    }
    let { /* progressNo,*/ total, progress, text } = data;
    // logPrefix
    const logPrefix = options.logPrefix;
    if (logPrefix) {
      text = this._adjustText(logPrefix, text);
    }
    // fallback
    if (total !== undefined && progress !== undefined) {
      const progressValid = progress >= 0;
      const progressText = `(${progressValid ? progress + 1 : '-'}/${total})`;
      if (progressValid) {
        text = this._adjustText(`${progressText}=> `, text);
      }
    }
    // log
    logger.log(text);
  }

  _adjustText(prefix, text) {
    return String(text)
      .split('\n')
      .map((item) => (item ? prefix + item : item))
      .join('\n');
  }
}
