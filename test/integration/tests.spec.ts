import * as mocha from 'mocha';
import * as path from 'path';
import { IAuthContext } from 'node-sp-auth-config';

import { Download, LogLevel } from '../../src';
import { Environments as TestsConfigs } from '../configs';
import { uploadFolder } from '../helper';
import { getContext } from '../utils/context';

const testVariables = {
  uploadFilesFolder: './test/files',
  rootFolderPath: 'Shared Documents/sp-download',
  downloadPath: './download'
};

for (let testConfig of TestsConfigs) {

  describe(`Run tests in ${testConfig.environmentName}`, () => {

    let download: Download;
    let context: IAuthContext;

    before('Upload files for tests && prepare the Download', function (done: Mocha.Done): void {
      this.timeout(30 * 1000);
      getContext(testConfig.configPath)
        .then((ctx) => {
          context = ctx;
          download = new Download(ctx.authOptions, { logLevel: LogLevel.Off });
          return uploadFolder(
            context.siteUrl,
            context.authOptions,
            path.resolve(testVariables.uploadFilesFolder),
            testVariables.rootFolderPath
          );
        })
        .then(() => done())
        .catch(done);
    });

    it(`should download a file with output as a folder path`, function (done: Mocha.Done): void {
      this.timeout(30 * 1000);
      download.downloadFile(
        `${(context as any).siteUrl}/${testVariables.rootFolderPath}/Folder1/text.txt`,
        testVariables.downloadPath
      ).then(() => done()).catch(done);
    });

    it(`should download a file with output as a file path`, function (done: Mocha.Done): void {
      this.timeout(30 * 1000);
      download.downloadFile(
        `${context.siteUrl}/${testVariables.rootFolderPath}/Folder1/Folder2/logo.png`,
        `${testVariables.downloadPath}/logo1.png`
      ).then(() => done()).catch(done);
    });

    it(`should download a file with spaces in file name`, function (done: Mocha.Done): void {
      this.timeout(30 * 1000);
      download.downloadFile(
        `${context.siteUrl}/${testVariables.rootFolderPath}/Folder1/file with spaces.txt`,
        `${testVariables.downloadPath}/file with spaces.txt`
      ).then(() => done()).catch(done);
    });

  });

}
