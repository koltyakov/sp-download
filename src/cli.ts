#!/usr/bin/env node

import * as minimist from 'minimist';
import { AuthConfig, IAuthConfigSettings } from 'node-sp-auth-config';
import * as path from 'path';
import * as colors from 'colors';

import { Download } from './api/Download';
import { IDownloadArgv } from './interface/ICli';

const argv: IDownloadArgv = minimist(process.argv.slice(2));

const download = (context: any, params: IDownloadArgv) => {
    const { downloadFile, downloadFileFromSite } = new Download(context.authOptions);
    if (typeof params.site === 'undefined') {
        return downloadFile(params.url, params.out)
            .then(savedToPath => {
                console.log(`${params.url} has been downloaded to ${savedToPath}`);
            });
    } else {
        return downloadFileFromSite(params.site, params.url, params.out)
            .then(savedToPath => {
                console.log(`${params.url} has been downloaded to ${savedToPath}`);
            });
    }
};

// tslint:disable-next-line:no-unused-expression
(() => {

    // Required parameters check
    if (typeof argv.url === 'undefined') {
        console.log(
            colors.red(`'${colors.bold('--url')}' parameter should be provided`),
            colors.gray(`(full path to the file in SharePoint to download)`)
        );
        return;
    }
    if (typeof argv.out === 'undefined') {
        console.log(
            colors.yellow(`'${colors.bold('--out')}' parameter is not provided`),
            colors.gray(`(folder of file path to save the file to)`)
        );
    }
    if (typeof argv.conf === 'undefined' && (argv.ondemand || '').toLowerCase() !== 'true') {
        console.log(
            colors.yellow(`'${colors.bold('--conf')}' parameter is not provided`),
            colors.gray(`(the default configuration path is used)`)
        );
    }

    if ((argv.ondemand || '').toLowerCase() === 'true') {

        download({ ondemand: true }, argv)
            .catch(error => {
                console.log(colors.red(`${colors.bold('Error:')} ${error}`));
            });

    } else {

        let authConfSettings: IAuthConfigSettings = {
            configPath: path.resolve(argv.conf || './config/private.json'),
            defaultConfigPath: path.join(__dirname, './config/default.json'),
            encryptPassword: true,
            saveConfigOnDisk: true
        };

        const authConfig = new AuthConfig(authConfSettings);

        authConfig.getContext()
            .then(context => {
                console.log(colors.gray(`Config file: ${colors.green(authConfSettings.configPath)}`));
                if (context.siteUrl) {
                    console.log(colors.gray(`SP site URL: ${colors.green(context.siteUrl)}`));
                }
                return download(context, argv);
            })
            .catch(error => {
                console.log(colors.red(`${colors.bold('Error:')} ${error}`));
            });
    }

})();
