#!/usr/bin/env node

import * as minimist from 'minimist';
import { AuthConfig } from 'node-sp-auth-config';
import * as path from 'path';
import * as chalk from 'chalk';

import { Download } from './api/Download';
import { IDownloadArgv } from './interface/ICli';

const argv: IDownloadArgv = minimist(process.argv.slice(2));

// tslint:disable-next-line:no-unused-expression
(() => {

    // Required parameters check
    if (typeof argv.url === 'undefined') {
        return console.log(chalk.red(`'--url' parameter should be provided`), `(full path to the file in SharePoint to download)`);
    }
    if (typeof argv.out === 'undefined') {
        return console.log(chalk.red(`'--out' parameter should be provided`), `(folder of file path to save the file to)`);
    }
    if (typeof argv.conf === 'undefined') {
        return console.log(chalk.gray(`'--conf' parameter is not provided`), `(the default configuration path is used)`);
    }

    const authConfig = new AuthConfig({
        configPath: path.resolve(argv.conf || './config/private.json'),
        defaultConfigPath: path.join(__dirname, './config/default.json'),
        encryptPassword: true,
        saveConfigOnDisk: true
    });

    authConfig.getContext()
        .then(context => {
            const { downloadFile } = new Download(context);
            downloadFile(argv.url, argv.out)
                .then(savedToPath => {
                    console.log(`${argv.url} has been downloaded to ${savedToPath}`);
                });
        })
        .catch(error => {
            console.log(error);
        });

});
