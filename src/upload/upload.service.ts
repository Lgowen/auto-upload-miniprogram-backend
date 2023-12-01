import { Injectable, StreamableFile } from '@nestjs/common';
import { unzipBundle, sleep } from '../../utils/index';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

@Injectable()
export class UploadService {
  async handleZipFile(
    name: string,
    file: Express.Multer.File,
  ): Promise<StreamableFile> {
    console.log(name); // 打印参数名
    console.log(file); // 打印文件信息
    await unzipBundle(file.buffer);

    return new Promise(async (resolve) => {
      const command = `D:\\HBuilderX\\cli.exe open`;
      const result = execSync(command);

      console.log(result.toString(), 'open command');
      await sleep(1000);
      const loginCommand = `D:\\HBuilderX\\cli.exe login --username 434666361@qq.com --password Yigeren1!`;
      const loginCommandRes = execSync(loginCommand);
      console.log(loginCommandRes.toString(), 'loginCommandRes');
      await sleep(1500);
      const openProjectCommand = `D:\\HBuilderX\\cli.exe project open --path D:\\project\\auto-upload-miniprogram-backend\\remote-project`;
      const openProjectCommandRes = execSync(openProjectCommand);
      console.log(openProjectCommandRes.toString(), 'openProjectCommandRe11s');
      await sleep(1500);
      const buildCommand = createBuildCommandForALIPAY('remote-project');
      const buildCommandRes = execSync(buildCommand);
      console.log(buildCommandRes.toString(), 'buildCommandRes');

      const filePath = path.resolve('../../');
      console.log(filePath, 'filePathfilePathfilePath');
      const unpackageFilePath = path.join(filePath, 'unpackage.zip');
      console.log(unpackageFilePath, 'unpackageFilePathunpackageFilePath');

      // 创建可写流，用于写入 ZIP 文件
      const output = fs.createWriteStream(unpackageFilePath);

      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      archive.pipe(output);

      archive.directory(
        '../../remote-project/unpackage/dist/build/mp-alipay',
        false,
      );

      archive.finalize();

      archive.on('finish', async () => {
        await sleep(2000);
        console.log('unpackageFile生成完成1');
        const stream = fs.createReadStream(unpackageFilePath);
        resolve(new StreamableFile(stream));
      });
    });
  }
}

function createBuildCommandForALIPAY(projectName = 'uni-flower-mall') {
  return `D:\\HBuilderX\\cli.exe publish --platform mp-alipay --project ${projectName}`;
}
