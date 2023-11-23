import { Injectable } from '@nestjs/common';
import { unzipBundle } from '../../utils/index';
import { execSync } from 'child_process';

@Injectable()
export class UploadService {
  async handleZipFile(name: string, file: Express.Multer.File): Promise<void> {
    console.log(name); // 打印参数名
    console.log(file); // 打印文件信息

    await unzipBundle(file.buffer)

    const command = `D:\\HBuilderX\\cli.exe open`
    const result = execSync(command);

    console.log(result, 'resu1111111111111lt')

    setTimeout(() => {
      const loginCommand = `D:\\HBuilderX\\cli.exe login --username 434666361@qq.com --password Yigeren1!`
      const loginCommandRes = execSync(loginCommand);
      console.log(loginCommandRes.toString(), 'loginCommandRes')
      setTimeout(() => {
        const openProjectCommand = `D:\\HBuilderX\\cli.exe project open --path D:\\project\\auto-upload-miniprogram-backend\\remote-project`
        const openProjectCommandRes = execSync(openProjectCommand)
        console.log(openProjectCommandRes.toString(), 'openProjectCommandRe11s')
        setTimeout(() => {
          const buildCommand = createBuildCommandForALIPAY('remote-project')
          const buildCommandRes = execSync(buildCommand);
          console.log(buildCommandRes.toString(), 'buildCommandRes')
        }, 1500)
      }, 1500)
    }, 1000)
  }
}


function createBuildCommandForALIPAY(projectName = 'uni-flower-mall') {
  return `D:\\HBuilderX\\cli.exe publish --platform mp-alipay --project ${projectName}`;
}
