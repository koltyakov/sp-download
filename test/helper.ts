import  { spsave, ICoreOptions, IFileContentOptions } from 'spsave';
import * as fs from 'fs';
import * as path from 'path';

export const walkSync = (dir: string, filelist: string[] = []): string[] => {
    let files: string[] = fs.readdirSync(dir);
    files.forEach(file => {
        let filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            filelist = walkSync(filePath, filelist);
        } else {
            filelist.push(filePath);
        }
    });
    return filelist;
};

export const uploadFolder = (siteUrl: string, authOptions: any, fromFolder: string, toFolder: string): Promise<any> => {

    async function upload() {
        const coreOptions: ICoreOptions = {
            siteUrl: siteUrl,
            notification: false,
            checkin: true,
            checkinType: 1
        };
        let files = await walkSync(fromFolder, []);
        for (let file of files) {
            const fileOptions: IFileContentOptions = {
                folder: `${toFolder}/${path.dirname(path.relative(fromFolder, file)).replace(/\\/g, '/')}`,
                fileName: path.basename(file),
                fileContent: fs.readFileSync(file)
            };
            // Suppress spsave output
            // tslint:disable-next-line:no-empty
            let log = console.log; console.log = () => {};
            await spsave(coreOptions, authOptions, fileOptions)
                .then(() => {
                    console.log = log;
                })
                .catch(err => {
                    console.log = log;
                    throw new Error(err);
                });
        }
        return 'Done';
    }

    return upload();

};
