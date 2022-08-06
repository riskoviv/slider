type WarnLog = {
  type: 'warn',
  message: string,
  module: 'slider-plugin' | 'Model',
  timestamp: number,
}

type ErrorLog = {
  type: 'error',
  message: string,
  module: 'EventEmitter',
  timestamp: number,
};

type Log = WarnLog | ErrorLog;

class Logger {
  static logs: Log[] = [];

  static pluginWarn(message: string) {
    Logger.warn(message, 'slider-plugin');
  }

  static modelWarn(message: string) {
    Logger.warn(message, 'Model');
  }

  static emitError(error: Error) {
    const log: ErrorLog = {
      type: 'error',
      message: `${error.name}: ${error.message}`,
      module: 'EventEmitter',
      timestamp: Date.now(),
    };
    Logger.logs.push(log);
    Logger.printErrorMessage(log);
  }

  static printLogs() {
    Logger.logs.forEach((log) => {
      switch (log.type) {
        case 'warn':
          Logger.printWarnMessage(log);
          break;
        case 'error':
          Logger.printErrorMessage(log);
          break;
        default: break;
      }
    });
  }

  static deleteLogs() {
    Logger.logs = [];
    console.info(
      '%cAll Logger\'s logs has been deleted',
      'background-color: #25d; color: white; border-radius: 3px;',
    );
  }

  private static warn(message: string, module: 'slider-plugin' | 'Model') {
    const log: WarnLog = {
      type: 'warn',
      message,
      module,
      timestamp: Date.now(),
    };
    Logger.logs.push(log);
    Logger.printWarnMessage(log);
  }

  private static getFullTime(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
  }

  private static printWarnMessage(log: WarnLog) {
    console.warn(`${log.module} at ${Logger.getFullTime(log.timestamp)}: ${log.message}`);
  }

  private static printErrorMessage(log: ErrorLog) {
    console.error(
      `%c${log.module} at ${Logger.getFullTime(log.timestamp)}:`,
      'border: 1px solid #d25; border-radius: 3px; background-color: #fff1',
      log.message,
    );
  }
}

Object.defineProperty(window, 'Logger', { value: Logger });

export default Logger;
