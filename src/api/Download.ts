import { create as createRequest, ISPRequest } from 'sp-request';
import { getAuth, IAuthOptions } from 'node-sp-auth';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as https from 'https';
import * as colors from 'colors';

import * as request from 'request';
import { OptionsWithUrl } from 'request';

const isUrlHttps: any = (url: string): boolean => {
    return url.split('://')[0].toLowerCase() === 'https';
};

export class Download {

    private spr: ISPRequest;
    private context: IAuthOptions;
    private agent: https.Agent;

    constructor(context: IAuthOptions) {
        this.spr = createRequest(context);
        this.context = context;
        this.agent = new https.Agent({
            rejectUnauthorized: false,
            keepAlive: true,
            keepAliveMsecs: 10000
        });
    }

    public downloadFile = (spFileAbsolutePath: string, saveTo: string = './'): Promise<any> => {
        console.log(colors.gray(`Downloading: ${colors.green(spFileAbsolutePath)}`));
        let childUrlArr = spFileAbsolutePath.split('/');
        childUrlArr.pop();
        let childUrl = childUrlArr.join('/');
        return this.getWebByAnyChildUrl(childUrl)
            .then((web: any) => {
                let baseHostPath = web.Url.replace(web.ServerRelativeUrl, '');
                let spRelativeFilePath = spFileAbsolutePath.replace(baseHostPath, '');
                // return this.downloadFileFromSite(web.Url, spRelativeFilePath, saveTo);
                return this.downloadFileAsStream(web.Url, spRelativeFilePath, saveTo);
            });
    }

    public downloadFileFromSite = (siteUrl: string, spRelativeFilePath: string, saveTo: string = './'): Promise<any> => {
        console.log(colors.gray(`Downloading: ${colors.green(spRelativeFilePath)}`));
        return this.downloadFileAsStream(siteUrl, spRelativeFilePath, saveTo);
        // // Download using sp-request, without streaming, consumes lots of memory in case of large files
        // return new Promise((resolve, reject) => {
        //     let restUrl = `${siteUrl}/_api/Web/GetFileByServerRelativeUrl(@FileServerRelativeUrl)/OpenBinaryStream` +
        //                   `?@FileServerRelativeUrl='${encodeURIComponent(spRelativeFilePath)}'`;

        //     let saveFilePath = this.getSaveFilePath(saveTo, spRelativeFilePath);
        //     let saveFolderPath = path.dirname(saveFilePath);

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
            let restUrl = `${siteUrl}/_api/Web/GetFileByServerRelativeUrl(@FileServerRelativeUrl)/$value` +
                          `?@FileServerRelativeUrl='${encodeURIComponent(spRelativeFilePath)}'`;

            let saveFilePath = this.getSaveFilePath(saveTo, spRelativeFilePath);
            let saveFolderPath = path.dirname(saveFilePath);

            mkdirp(saveFolderPath, err => {
                if (err) {
                    return reject(err);
                }
                getAuth(siteUrl, this.context).then(auth => {

                    let options: OptionsWithUrl = {
                        url: restUrl,
                        method: 'GET',
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

                    request(options)
                        .pipe(fs.createWriteStream(saveFilePath))
                        .on('error', reject)
                        .on('finish', () => {
                            resolve(saveFilePath);
                        });

                }).catch(reject);
            });

        });
    }

    private getWebByAnyChildUrl = (anyChildUrl: string) => {
        return new Promise((resolve, reject) => {
            let restUrl = `${anyChildUrl}/_api/web?$select=Url,ServerRelativeUrl`;
            this.spr.get(restUrl)
                .then(response => {
                    resolve(response.body.d);
                })
                .catch(err => {
                    if (err.statusCode === 404) {
                        let childUrlArr = anyChildUrl.split('/');
                        childUrlArr.pop();
                        let childUrl = childUrlArr.join('/');
                        if (childUrlArr.length <= 3) {
                            return reject(`Wrong url, can't get Web property`);
                        } else {
                            return resolve(this.getWebByAnyChildUrl(childUrl));
                        }
                    } else {
                        return reject(err.message);
                    }
                });
        });
    }

    private getSaveFilePath = (saveTo: string, spRelativeFilePath: string): string => {
        let saveFilePath = path.resolve(saveTo);
        let originalFileName = decodeURIComponent(spRelativeFilePath).split('/').pop();

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
