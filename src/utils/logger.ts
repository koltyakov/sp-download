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
    if (this.level >= LogLevel.Debug && this.level !== LogLevel.Off) {
      // tslint:disable-next-line:no-console
      console.log(...args);
    }
  }

  public verbose(...args: any[]) {
    if (this.level >= LogLevel.Verbose && this.level !== LogLevel.Off) {
      // tslint:disable-next-line:no-console
      console.log(...args);
    }
  }

  public info(...args: any[]) {
    if (this.level >= LogLevel.Info && this.level !== LogLevel.Off) {
      // tslint:disable-next-line:no-console
      console.log(...args);
    }
  }

  public warning(...args: any[]) {
    if (this.level >= LogLevel.Warning && this.level !== LogLevel.Off) {
      // tslint:disable-next-line:no-console
      console.log(...args);
    }
  }

  public error(...args: any[]) {
    if (this.level >= LogLevel.Error && this.level !== LogLevel.Off) {
      // tslint:disable-next-line:no-console
      console.log(...args);
    }
  }

}

export const logger = new Logger(parseInt(process.env.LOG_LEVEL || '3', 10));
