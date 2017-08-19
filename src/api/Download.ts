import { create as createRequest, ISPRequest } from 'sp-request';
import { IOnPremiseAddinCredentials, IOnpremiseUserCredentials, IOnpremiseFbaCredentials,
         IOnlineAddinCredentials, IUserCredentials, IAdfsUserCredentials } from 'node-sp-auth';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

export class Download {

    private spr: ISPRequest;

    constructor(context: IOnPremiseAddinCredentials | IOnpremiseUserCredentials | IOnpremiseFbaCredentials | IOnlineAddinCredentials | IUserCredentials | IAdfsUserCredentials) {
        this.spr = createRequest(context);
    }

    public downloadFile = (spFileAbsolutePath: string, saveTo: string) => {
        let childUrlArr = spFileAbsolutePath.split('/');
        childUrlArr.pop();
        let childUrl = childUrlArr.join('/');
        return this.getWebByAnyChildUrl(childUrl)
            .then((web: any) => {
                let baseHostPath = web.Url.replace(web.ServerRelativeUrl, '');
                let spRelativeFilePath = spFileAbsolutePath.replace(baseHostPath, '');
                return this.downloadFileRaw(web.Url, spRelativeFilePath, saveTo);
            });
    }

    private downloadFileRaw = (siteUrl: string, spRelativeFilePath: string, saveTo: string) => {
        return new Promise((resolve, reject) => {
            let restUrl = `${siteUrl}/_api/Web/GetFileByServerRelativeUrl(@FileServerRelativeUrl)/OpenBinaryStream` +
                          `?@FileServerRelativeUrl='${encodeURIComponent(spRelativeFilePath)}'`;
            this.spr.get(restUrl, { encoding: null })
                .then(response => {
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

                    let saveFolderPath = path.dirname(saveFilePath);

                    if (/.json$/.test(saveFilePath)) {
                        response.body = JSON.stringify(response.body, null, 4);
                    }
                    if (/.map$/.test(saveFilePath)) {
                        response.body = JSON.stringify(response.body);
                    }
                    mkdirp(saveFolderPath, err => {
                        // tslint:disable-next-line:no-shadowed-variable
                        fs.writeFile(saveFilePath, response.body, err => {
                            if (err) {
                                throw err;
                            }
                            resolve(saveFilePath);
                        });
                    });
                })
                .catch(err => {
                    reject(err.message);
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
                    let childUrlArr = anyChildUrl.split('/');
                    childUrlArr.pop();
                    let childUrl = childUrlArr.join('/');
                    if (childUrlArr.length <= 3) {
                        reject(`Wrong url, can't get Web property`);
                    } else {
                        resolve(this.getWebByAnyChildUrl(childUrl));
                    }
                });
        });
    }

}
