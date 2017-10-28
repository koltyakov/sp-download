import { expect } from 'chai';
import * as path from 'path';
import * as sprequest from 'sp-request';
import { Cpass } from 'cpass';
import { IAuthOptions } from 'node-sp-auth';

import { Download } from '../../src';
import { Environments as TestsConfigs } from '../configs';
import { uploadFolder } from '../helper';

const cpass = new Cpass();

const testVariables = {
  uploadFilesFolder: './test/files',
  rootFolderPath: 'Shared Documents/sp-download',
  downloadPath: './download'
};

for (let testConfig of TestsConfigs) {

  describe(`Run tests in ${testConfig.environmentName}`, () => {

    let download: Download;
    let context: IAuthOptions;

    before('Upload files for tests && prepare the Download', function (done: any): void {
      this.timeout(30 * 1000);
      context = require(path.resolve(testConfig.configPath));
      (context as any).password = (context as any).password && cpass.decode((context as any).password);
      download = new Download(context);
      uploadFolder((context as any).siteUrl, context, path.resolve(testVariables.uploadFilesFolder), testVariables.rootFolderPath)
        .then(() => {
          done();
        })
        .catch(done);
    });

    it(`should download a file with output as a folder path`, function (done: MochaDone): void {
      this.timeout(30 * 1000);
      download.downloadFile(
        `${(context as any).siteUrl}/${testVariables.rootFolderPath}/Folder1/text.txt`,
        testVariables.downloadPath
      ).then(() => {
        done();
      }).catch(done);
    });

    it(`should download a file with output as a file path`, function (done: MochaDone): void {
      this.timeout(30 * 1000);
      download.downloadFile(
        `${(context as any).siteUrl}/${testVariables.rootFolderPath}/Folder1/Folder2/logo.png`,
        `${testVariables.downloadPath}/logo1.png`
      ).then(() => {
        done();
      }).catch(done);
    });

  });

}
