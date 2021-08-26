import * as path from 'path';
import { AuthConfig } from 'node-sp-auth-config';

import { Download } from '../../src';
import { uploadFolder } from '../helper';

const testVariables = {
  uploadFilesFolder: './test/files',
  rootFolderPath: 'Shared Documents/sp-download',
  downloadPath: './download'
};

const authConfig = new AuthConfig({
  configPath: './config/integration/private.spo.json',
  encryptPassword: true,
  saveConfigOnDisk: true
});

(async () => {

  const ctx = await authConfig.getContext();
  const download = new Download(ctx.authOptions);

  if (false) {
    await uploadFolder(
      ctx.siteUrl,
      ctx.authOptions,
      path.resolve(testVariables.uploadFilesFolder),
      testVariables.rootFolderPath
    );
  }

  await download.downloadFile(
    `${ctx.siteUrl}/${testVariables.rootFolderPath}/Folder1/text.txt`,
    testVariables.downloadPath
  );

  console.log('Done');

})()
  .catch(console.error);
