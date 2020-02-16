import { create as createRequest, ISPRequest } from 'sp-request';
import { getAuth, IAuthOptions } from 'node-sp-auth';
import { AuthConfig } from 'node-sp-auth-config';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as https from 'https';
import * as colors from 'colors';
import * as request from 'request';

import { Logger, resolveLogLevel } from '../utils/logger';
import { IDownloadOptions } from '../interface/IDownload';

const isUrlHttps: any = (url: string): boolean => {
  return url.split('://')[0].toLowerCase() === 'https';
};

export class Download {

  private spr: ISPRequest;
  private context: IAuthOptions;
  private agent: https.Agent;
  private logger: Logger;

  constructor (context: IAuthOptions, options: IDownloadOptions = {}) {
    this.initContext(context);
    this.logger = new Logger(resolveLogLevel(options.logLevel));
  }

  public downloadFile = async (spFileAbsolutePath: string, saveTo: string = './'): Promise<string> => {
    this.logger.info(colors.gray(`Downloading: ${colors.green(spFileAbsolutePath)}`));
    const childUrlArr = spFileAbsolutePath.split('/');
    childUrlArr.pop();
    const childUrl = childUrlArr.join('/');
    const web = await this.getWebByAnyChildUrl(childUrl);
    const baseHostPath = web.Url.replace(web.ServerRelativeUrl, '');
    const spRelativeFilePath = spFileAbsolutePath.replace(baseHostPath, '');
    const saveFilePath = this.getSaveFilePath(saveTo, spRelativeFilePath);
    const saveFolderPath = path.dirname(saveFilePath);
    await mkdirp(saveFolderPath);
    const req = await this.downloadFileAsStream(web.Url, spRelativeFilePath);
    return new Promise((resolve, reject) => {
      req.pipe(fs.createWriteStream(saveFilePath))
        .on('error', reject)
        .on('finish', () => resolve(saveFilePath));
    });
  }

  public downloadFileFromSite = async (siteUrl: string, spRelativeFilePath: string, saveTo: string = './'): Promise<string> => {
    this.logger.info(colors.gray(`Downloading: ${colors.green(spRelativeFilePath)}`));
    const saveFilePath = this.getSaveFilePath(saveTo, spRelativeFilePath);
    const saveFolderPath = path.dirname(saveFilePath);
    await mkdirp(saveFolderPath);
    const req = await this.downloadFileAsStream(siteUrl, spRelativeFilePath);
    return new Promise((resolve, reject) => {
      req.pipe(fs.createWriteStream(saveFilePath))
        .on('error', reject)
        .on('finish', () => resolve(saveFilePath));
    });
  }

  public downloadFileAsStream = async (siteUrl: string, spRelativeFilePath: string): Promise<request.Request> => {
    const hostUrl = siteUrl.split('/').slice(0, 3).join('/');
    const endpointUrl = spRelativeFilePath.indexOf('/_vti_history/') !== -1
      ? `${hostUrl}${encodeURIComponent(spRelativeFilePath).replace(/%2F/g, '/')}`
      : `${siteUrl}/_api/Web/GetFileByServerRelativeUrl(@FileServerRelativeUrl)/$value` +
        `?@FileServerRelativeUrl='${encodeURIComponent(spRelativeFilePath)}'`;

    const auth = await Promise.resolve(getAuth(siteUrl, this.context));

    const options: request.OptionsWithUrl = {
      url: endpointUrl,
      headers: {
        ...auth.headers,
        'User-Agent': 'sp-download'
      },
      encoding: null,
      strictSSL: false,
      gzip: true,
      agent: isUrlHttps(siteUrl) ? this.agent : undefined,
      ...auth.options
    };

    return request.get(options);
  }

  private getWebByAnyChildUrl = (anyChildUrl: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const restUrl = `${anyChildUrl}/_api/web?$select=Url,ServerRelativeUrl`;
      this.spr.get(restUrl)
        .then((response) => resolve(response.body.d))
        .catch((err) => {
          if (err.statusCode === 404) {
            const childUrlArr = anyChildUrl.split('/');
            childUrlArr.pop();
            const childUrl = childUrlArr.join('/');
            if (childUrlArr.length <= 2) {
              return reject(`Wrong url, can't get Web property`);
            } else {
              return resolve(this.getWebByAnyChildUrl(childUrl));
            }
          } else if (err.statusCode === 401) {
            this.logger.error(colors.red('401, Access Denied'));
            this.promptForCreds()
              .then(() => resolve(this.getWebByAnyChildUrl(anyChildUrl)))
              .catch(reject);
          } else {
            return reject(err.message);
          }
        });
    });
  }

  private initContext = (context: IAuthOptions): void => {
    this.spr = createRequest(context);
    this.context = context;
    this.agent = new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
      keepAliveMsecs: 10000
    });
  }

  private promptForCreds = (): Promise<any> => {
    return new AuthConfig({
      authOptions: this.context,
      forcePrompts: true
    })
      .getContext()
      .then((context) => {
        this.initContext(context.authOptions);
        this.logger.info(colors.gray('Trying to download with new creds...'));
        return context;
      });
  }

  private getSaveFilePath = (saveTo: string, spRelativeFilePath: string): string => {
    let saveFilePath = path.resolve(saveTo);
    const originalFileName = decodeURIComponent(spRelativeFilePath).split('/').pop();

    try {
      if (fs.lstatSync(saveFilePath).isDirectory()) {
        saveFilePath = path.join(saveFilePath, originalFileName);
      }
    } catch (e) {
      //
    }

    if (path.parse(saveFilePath).ext !== path.parse(originalFileName).ext) {
      saveFilePath = path.join(saveFilePath, originalFileName);
    }

    return saveFilePath;
  }

}

export { IDownloadOptions } from '../interface/IDownload';
