import { spsave, ICoreOptions, IFileContentOptions } from 'spsave';
import * as fs from 'fs';
import * as path from 'path';
import { IAuthOptions } from 'node-sp-auth';

export const walkSync = (dir: string, filelist: string[] = []): string[] => {
  const files: string[] = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else {
      filelist.push(filePath);
    }
  });
  return filelist;
};

export const uploadFolder = (siteUrl: string, authOptions: IAuthOptions, fromFolder: string, toFolder: string): Promise<string> => {

  async function upload () {
    const coreOptions: ICoreOptions = {
      siteUrl: siteUrl,
      notification: false,
      checkin: true,
      checkinType: 1
    };
    const files = await walkSync(fromFolder, []);
    for (const file of files) {
      const fileOptions: IFileContentOptions = {
        folder: `${toFolder}/${path.dirname(path.relative(fromFolder, file)).replace(/\\/g, '/')}`,
        fileName: path.basename(file),
        fileContent: fs.readFileSync(file)
      };
      // Suppress spsave output
      // tslint:disable-next-line:no-empty
      const log = console.log; console.log = () => null;
      await spsave(coreOptions, authOptions, fileOptions)
        .then(() => {
          console.log = log;
        })
        .catch((error) => {
          console.log = log;
          throw new Error(error);
        });
    }
    return 'Done';
  }

  return upload();

};
