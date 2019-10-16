import { create as createRequest, ISPRequest } from 'sp-request';
import { getAuth, IAuthOptions } from 'node-sp-auth';
import { AuthConfig } from 'node-sp-auth-config';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as https from 'https';
import * as colors from 'colors';
import * as request from 'request';

import { Logger, LogLevel, resolveLogLevel } from '../utils/logger';
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

  public downloadFile = (spFileAbsolutePath: string, saveTo: string = './'): Promise<any> => {
    this.logger.info(colors.gray(`Downloading: ${colors.green(spFileAbsolutePath)}`));
    const childUrlArr = spFileAbsolutePath.split('/');
    childUrlArr.pop();
    const childUrl = childUrlArr.join('/');
    return this.getWebByAnyChildUrl(childUrl)
      .then((web) => {
        const baseHostPath = web.Url.replace(web.ServerRelativeUrl, '');
        const spRelativeFilePath = spFileAbsolutePath.replace(baseHostPath, '');
        // return this.downloadFileFromSite(web.Url, spRelativeFilePath, saveTo);
        return this.downloadFileAsStream(web.Url, spRelativeFilePath, saveTo);
      });
  }

  public downloadFileFromSite = (siteUrl: string, spRelativeFilePath: string, saveTo: string = './'): Promise<any> => {
    this.logger.info(colors.gray(`Downloading: ${colors.green(spRelativeFilePath)}`));
    return this.downloadFileAsStream(siteUrl, spRelativeFilePath, saveTo);
    // // Download using sp-request, without streaming, consumes lots of memory in case of large files
    // return new Promise((resolve, reject) => {
    //     const restUrl = `${siteUrl}/_api/Web/GetFileByServerRelativeUrl(@FileServerRelativeUrl)/OpenBinaryStream` +
    //                   `?@FileServerRelativeUrl='${encodeURIComponent(spRelativeFilePath)}'`;

    //     const saveFilePath = this.getSaveFilePath(saveTo, spRelativeFilePath);
    //     const saveFolderPath = path.dirname(saveFilePath);

    //     this.spr.get(restUrl, { encoding: null })
    //         .then(response => {
    //             if (/.json$/.test(saveFilePath)) {
    //                 response.body = JSON.stringify(response.body, null, 4);
    //             }
    //             if (/.map$/.test(saveFilePath)) {
    //                 response.body = JSON.stringify(response.body);
    //             }
    //             mkdirp(saveFolderPath, err => {
    //                 // tslint:disable-next-line:no-shadowed-variable
    //                 fs.writeFile(saveFilePath, response.body, err => {
    //                     if (err) {
    //                         throw err;
    //                     }
    //                     resolve(saveFilePath);
    //                 });
    //             });
    //         })
    //         .catch(err => {
    //             reject(err.message);
    //         });
    // });
  }

  private downloadFileAsStream = (siteUrl: string, spRelativeFilePath: string, saveTo: string = './') => {
    return new Promise((resolve, reject) => {

      let endpointUrl: string;

      if (spRelativeFilePath.indexOf('/_vti_history/') !== -1) {
        const hostUrl = siteUrl.replace('://', '___').split('/')[0].replace('___', '://');
        endpointUrl = `${hostUrl}${encodeURIComponent(spRelativeFilePath).replace(/%2F/g, '/')}`;
      } else {
        endpointUrl = `${siteUrl}/_api/Web/GetFileByServerRelativeUrl(@FileServerRelativeUrl)/$value` +
          `?@FileServerRelativeUrl='${encodeURIComponent(spRelativeFilePath)}'`;
      }

      const saveFilePath = this.getSaveFilePath(saveTo, spRelativeFilePath);
      const saveFolderPath = path.dirname(saveFilePath);

      mkdirp(saveFolderPath, (err) => {
        if (err) {
          return reject(err);
        }
        getAuth(siteUrl, this.context).then((auth) => {

          const options: request.OptionsWithUrl = {
            url: endpointUrl,
            // method: 'GET',
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

          request.get(options)
            .pipe(fs.createWriteStream(saveFilePath))
            .on('error', reject)
            .on('finish', () => resolve(saveFilePath));

        }).catch(reject);
      });

    });
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
