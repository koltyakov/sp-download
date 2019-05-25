# sp-download - Easy to use files download client library and CLI for SharePoint in Node.js

[![NPM](https://nodei.co/npm/sp-download.png?mini=true&downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sp-download/)

[![npm version](https://badge.fury.io/js/sp-download.svg)](https://badge.fury.io/js/sp-download)
[![Downloads](https://img.shields.io/npm/dm/sp-download.svg)](https://www.npmjs.com/package/sp-download)
![Build Status](https://koltyakov.visualstudio.com/SPNode/_apis/build/status/sp-download?branchName=master)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/sharepoint-node/Lobby)

`sp-download` is a SharePoint files download library and CLI in Node.js.

## Supported SharePoint versions

- SharePoint Online
- SharePoint 2013
- SharePoint 2016

## Features

- CLI && A library scenarious
- Support robust authentication scenarious
- Streaming download
  - download files of any sizes
  - no memory consumption growth

## Get started

### Command line (CLI)

#### Prerequesites

- Node.js

#### Install as CLI

```bash
npm install sp-download -g
```

### Command line (CLI) usage

```bash
sp-download --url="https://contoso.sharepoint.com/sites/site/lib/folder/file.ext" --out="./download"
```

or

```bash
sp-download --url="https://contoso.sharepoint.com/sites/site/lib/folder/file.ext" --out="./download/filename.ext"
```

#### Options

Print help:

```bash
sp-download -h
```

| Shortcut | Option | Description |
| --- | --- | --- |
| -V | --version | output the version number  |
| -u | --url [value] | full path to the file in SharePoint, required |
| -o | --out [value] | local directory or path to file where downloaded file should be saved, optional, default is `./` |
| -c | --conf [value] | Path to private configuration file |
| -s | --site [value] | SharePoint SPWeb url, optional, default is requested based on `url` |
| -d | --ondemand | On-Demand auth request, optional |
| -h | --help | output usage information |

### In Node.js applications

#### Install as dependency

```bash
npm install sp-download --save
```

or

```bash
yarn add sp-download
```

#### Minimal setup (TypeScript)

```javascript
import { Download, IAuthOptions } from 'sp-download';

const authContext: IAuthOptions = {
  // ... node-sp-auth options
};

const download = new Download(authContext);

let filePathToDownload: string = 'https://contoso.sharepoint.com/sites/site/lib/folder/file.ext';
let saveToPath: string = './download';

download.downloadFile(filePathToDownload, saveToPath)
  .then(savedToPath => {
    console.log(`${argv.url} has been downloaded to ${savedToPath}`);
  })
  .catch(error => {
    console.log(error);
  });
```

#### Minimal setup (JavaScript)

```javascript
const Download = require('sp-download').Download;

const authContext = {
  // ... node-sp-auth options
};

const download = new Download(authContext);

let filePathToDownload = 'https://contoso.sharepoint.com/sites/site/lib/folder/file.ext';
let saveToPath = './download';

download.downloadFile(filePathToDownload, saveToPath)
  .then(savedToPath => {
    console.log(`${argv.url} has been downloaded to ${savedToPath}`);
  })
  .catch(error => {
    console.log(error);
  });
```

## Authentication settings

The library provides wizard-like approach for building and managing config files for [`node-sp-auth`](https://github.com/s-KaiNet/node-sp-auth) (Node.js to SharePoint unattended http authentication).

- SharePoint On-Premise (2013, 2016):
  - User credentials (NTLM)
  - Form-based authentication (FBA)
  - Add-In Only permissions
  - ADFS user credentials

- SharePoint Online:
  - User credentials (SAML)
  - Add-In Only permissions
  - ADFS user credentials

For more information please check node-sp-auth [credential options](https://github.com/s-KaiNet/node-sp-auth#params) and [wiki pages](https://github.com/s-KaiNet/node-sp-auth/wiki).