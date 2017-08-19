# sp-download - Easy to use files download client library and CLI for SharePoint in Node.js

[![NPM](https://nodei.co/npm/sp-download.png?mini=true&downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sp-download/)

[![npm version](https://badge.fury.io/js/sp-download.svg)](https://badge.fury.io/js/sp-download)
[![Downloads](https://img.shields.io/npm/dm/sp-download.svg)](https://www.npmjs.com/package/sp-download)

---
### Need help on SharePoint with Node.js? Join our gitter chat and ask question! [![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/sharepoint-node/Lobby)
---

`sp-download` is a SharePoint files download library and CLI in Node.js.

## Supported SharePoint versions:

- SharePoint Online
- SharePoint 2013
- SharePoint 2016

## Supported authentication scenarios

- SharePoint On-Premise (2013, 2016):
  - User credentials (NTLM)
  - Form-based authentication (FBA)
  - Add-In Only permissions
  - ADFS user credentials

- SharePoint Online:
  - User credentials (SAML)
  - Add-In Only permissions
  - ADFS user credentials

## Get started

### NPM

```bash
npm install sp-download --save
```

### Yarn

```bash
yarn add sp-download
```

### Command line (CLI) usage

```bash
sp-download --url='https://contoso.sharepoint.com/sites/site/lib/folder/file.ext' --out='./download'
```
or

```bash
sp-download --url='https://contoso.sharepoint.com/sites/site/lib/folder/file.ext' --out='./download/filename.ext'
```

#### Arguments

- `url` - full path to the file in SharePoint
- `out` - local directory or path to file where downloaded file should be saved
- `conf` - path to credentials config file

### Usage in Node.js application

#### Minimal setup (TypeScript)

```javascript
import { Download, IAuthContext } from 'sp-download';

const authContext: IAuthContext = {
    // ... node-sp-auth options
};

const download = new Download(authContext);

let filePathToDownload: string = 'https://contoso.sharepoint.com/sites/site/lib/folder/file.ext';
let saveToPath: string = './download';

download.downloadFileAbs(filePathToDownload, saveToPath)
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

download.downloadFileAbs(filePathToDownload, saveToPath)
    .then(savedToPath => {
        console.log(`${argv.url} has been downloaded to ${savedToPath}`);
    })
    .catch(error => {
        console.log(error);
    });
```
