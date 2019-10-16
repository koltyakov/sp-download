export const enum LogLevel {
  Debug = 5,
  Verbose = 4,
  Info = 3,
  Warning = 2,
  Error = 1,
  Off = 0
}

export class Logger {

  private level?: LogLevel;

  constructor(level?: LogLevel) {
    this.level = typeof level !== 'undefined' ? level : LogLevel.Info;
  }

  public debug(...args: any[]) {
    if (this.level >= LogLevel.Debug) {
      // tslint:disable-next-line:no-console
      console.log(...args);
    }
  }

  public verbose(...args: any[]) {
    if (this.level >= LogLevel.Verbose) {
      // tslint:disable-next-line:no-console
      console.log(...args);
    }
  }

  public info(...args: any[]) {
    if (this.level >= LogLevel.Info) {
      // tslint:disable-next-line:no-console
      console.log(...args);
    }
  }

  public warning(...args: any[]) {
    if (this.level >= LogLevel.Warning) {
      // tslint:disable-next-line:no-console
      console.log(...args);
    }
  }

  public error(...args: any[]) {
    if (this.level >= LogLevel.Error) {
      // tslint:disable-next-line:no-console
      console.log(...args);
    }
  }

}

export const resolveLogLevel = (levelSrt: string | number = ''): LogLevel => {
  const levels = ['Off', 'Error', 'Warning', 'Info', 'Verbose', 'Debug'].map((n) => n.toLowerCase());
  let l: LogLevel = 3; // default
  if (levels.indexOf(`${levelSrt}`.toLowerCase()) !== -1) {
    l = levels.indexOf(`${levelSrt}`.toLowerCase());
  } else {
    const ll = parseInt(`${levelSrt}`, 10);
    if (ll >= 0 && ll <= levels.length - 1) {
      l = ll;
    }
  }
  return l;
};

export const logger = new Logger(resolveLogLevel(process.env.LOG_LEVEL));
