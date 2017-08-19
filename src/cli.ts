#!/usr/bin/env node

import * as minimist from 'minimist';
import { AuthConfig } from 'node-sp-auth-config';
import * as path from 'path';
import * as colors from 'colors';

import { Download } from './api/Download';
import { IDownloadArgv } from './interface/ICli';

const argv: IDownloadArgv = minimist(process.argv.slice(2));

// tslint:disable-next-line:no-unused-expression
(() => {

    // Required parameters check
    if (typeof argv.url === 'undefined') {
        console.log(colors.red(`'--url' parameter should be provided`), `(full path to the file in SharePoint to download)`);
        return;
    }
    if (typeof argv.out === 'undefined') {
        console.log(colors.red(`'--out' parameter should be provided`), `(folder of file path to save the file to)`);
        return;
    }
    if (typeof argv.conf === 'undefined') {
        console.log(colors.gray(`'--conf' parameter is not provided`), `(the default configuration path is used)`);
    }

    const authConfig = new AuthConfig({
        configPath: path.resolve(argv.conf || './config/private.json'),
        defaultConfigPath: path.join(__dirname, './config/default.json'),
        encryptPassword: true,
        saveConfigOnDisk: true
    });

    authConfig.getContext()
        .then(context => {
            const { downloadFile } = new Download(context.authOptions);
            return downloadFile(argv.url, argv.out)
                .then(savedToPath => {
                    console.log(`${argv.url} has been downloaded to ${savedToPath}`);
                });
        })
        .catch(error => {
            console.log(colors.red(error));
        });

})();
