#!/usr/bin/env node

import { program } from 'commander';
import { AuthConfig, IAuthConfigSettings, IAuthContext } from 'node-sp-auth-config';
import * as path from 'path';
import * as colors from 'colors';

import { Download } from './api/Download';
import { Logger, resolveLogLevel } from './utils/logger';
import { IDownloadArgv } from './interface/ICli';

program
  .version('2.0.0')
  .usage('--url=<file ...> [options]')
  .option('-u, --url [value]', 'Full path to the file in SharePoint, required')
  .option('-o, --out [value]', 'Local directory or path to file where downloaded file should be saved, optional, default is `./`')
  .option('-s, --site [value]', 'SharePoint SPWeb url, optional, default is requested based on `url`')
  .option('-c, --conf [value]', 'Path to private configuration file')
  .option('-d, --ondemand', 'On-Demand auth request, optional')
  .option('-l, --logLevel [value]', 'Log level: Debug = 5, Verbose = 4, Info = 3 (default), Warning = 2, Error = 1, Off = 0', '3')
  .parse(process.argv);

const argv = program as unknown as IDownloadArgv;

const logger = new Logger(resolveLogLevel(argv.logLevel));

const download = (context: IAuthContext, params: IDownloadArgv): Promise<void> => {
  const { downloadFile, downloadFileFromSite } = new Download(context.authOptions, {
    ...argv,
    logLevel: resolveLogLevel(argv.logLevel)
  });
  if (typeof params.site === 'undefined') {
    return downloadFile(params.url, params.out)
      .then((savedToPath) => {
        logger.info(`${params.url} has been downloaded to ${savedToPath}`);
      });
  } else {
    return downloadFileFromSite(params.site, params.url, params.out)
      .then((savedToPath) => {
        logger.info(`${params.url} has been downloaded to ${savedToPath}`);
      });
  }
};

// tslint:disable-next-line:no-unused-expression
(() => {

  // Required parameters check
  if (typeof argv.url === 'undefined') {
    logger.error(
      colors.red(`'${colors.bold('--url')}' parameter should be provided`),
      colors.gray(`(full path to the file in SharePoint to download)`)
    );
    return;
  }
  if (typeof argv.out === 'undefined') {
    logger.warning(
      colors.yellow(`'${colors.bold('--out')}' parameter is not provided`),
      colors.gray(`(folder of file path to save the file to)`)
    );
  }
  if (typeof argv.conf === 'undefined' && (argv.ondemand || '').toLowerCase() !== 'true') {
    logger.warning(
      colors.yellow(`'${colors.bold('--conf')}' parameter is not provided`),
      colors.gray(`(the default configuration path is used)`)
    );
  }

  if ((argv.ondemand || '').toLowerCase() === 'true') {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    download({ ondemand: true } as any, argv)
      .catch((error) => {
        logger.error(colors.red(`${colors.bold('Error:')} ${error}`));
      });

  } else {

    const authConfSettings: IAuthConfigSettings = {
      configPath: path.resolve(argv.conf || './config/private.json'),
      defaultConfigPath: path.join(__dirname, './config/default.json'),
      encryptPassword: true,
      saveConfigOnDisk: true
    };

    const authConfig = new AuthConfig(authConfSettings);

    authConfig.getContext()
      .then((context) => {
        logger.info(colors.gray(`Config file: ${colors.green(authConfSettings.configPath)}`));
        if (context.siteUrl) {
          logger.info(colors.gray(`SP site URL: ${colors.green(context.siteUrl)}`));
        }
        return download(context, argv);
      })
      .catch((error) => {
        logger.error(colors.red(`${colors.bold('Error:')} ${error}`));
      });
  }

})();
