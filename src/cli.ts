#!/usr/bin/env node

import * as minimist from 'minimist';
import { AuthConfig } from 'node-sp-auth-config';
import * as path from 'path';

import { Download } from './api/Download';
import { IDownloadArgv } from './interface/ICli';

const argv: IDownloadArgv = minimist(process.argv.slice(2));

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
