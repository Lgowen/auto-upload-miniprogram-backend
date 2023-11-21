import { Injectable } from '@nestjs/common';
import { minidev } from 'minidev';
import { execSync } from 'child_process';

export const WX_PLATFORM = 'WX_PLATFORM';
export const ALIPAY_PLATFORM = 'ALIPAY_PLATFORM';

@Injectable()
export class QrcodeService {
  getQrcode(): any {
    return {
      code: 0,
      data: ['翠花', '小红', '大丫'],
      msg: '请求女孩列表成功',
    };
  }

  async getQrcodeByVersion(version: string) {
    console.log(version, 'version');
    const errResult = {
      code: 0,
      data: '',
      msg: '获取Qrcode失败',
    };
    if (!version) return errResult;

    // const APP_ID = '2021004100659339';
    // const buildPath = 'mp-alipay';
    // const dirname = path.dirname(fileURLToPath(import.meta.url));
    // const buildPath = path.join(dirname, relativePath);
    const command = `D:\\HBuilderX\\cli.exe open`
    try {
      // const { qrcodeUrl, version } = await minidev.preview({
      //   appId: APP_ID, // (对应appid)
      //   identityKeyPath: 'config.json', // 身份验证文件
      //   project: buildPath, // uniapp打包后的路径
      // });
      const result = execSync(command);

      console.log(result, 'result')

      setTimeout(() => {
        const loginCommand = `D:\\HBuilderX\\cli.exe login --username 434666361@qq.com --password Yigeren1!`
        const loginCommandRes = execSync(loginCommand);
        console.log(loginCommandRes.toString(), 'loginCommandRes')
        setTimeout(() => {
          const openProjectCommand = `D:\\HBuilderX\\cli.exe project open --path D:\\project\\auto-upload-miniprogram-backend\\remote-project\\uni-flower-mall`
          const openProjectCommandRes = execSync(openProjectCommand)
          console.log(openProjectCommandRes.toString(), 'openProjectCommandRe11s')
          setTimeout(() => {
            const buildCommand = createBuildCommandForALIPAY('uni-flower-mall')
            const buildCommandRes = execSync(buildCommand);
            console.log(buildCommandRes.toString(), 'buildCommandRes')
          }, 1500)
        }, 1500)
      }, 1000)

      return { code: 0, data: {}, msg: 'success' };
      // console.log(qrcodeUrl, 'qrcodeUrlqrcodeUrl')
      // console.log(version, 'qrcodeUrlqrcodeUrl')
      // const [imageData, authorization] = await Promise.all([
      //   getImageData(qrcodeUrl),
      //   getAuthorization({
      //     app_id: 'cli_a58d09de7afd100c',
      //     app_secret: 'Vk4XeM577bPNWPbnucSxAbvuwVsWfZ2R',
      //   }),
      // ]);
      // // console.log("获取imageData、authorization成功");
      // const qrcode = await uploadImageToFeiShu(imageData, authorization);
      // console.log('上传图片至飞书服务器成功');
      // pushMessageToFeiShu(version, qrcode, env);
    } catch (err) {
      console.log(err, 'err');
      return {
        code: 0,
        data: {},
        msg: `预览失败，原因：${err}`,
      };
      // process.exit(-1);
    }

    // const APP_ID = '2021004100659339'; // 当前想要预览应用的appid
    // let res;
    // try {
    //   res = await previewMiniprogram(APP_ID);
    // } catch (err) {
    //   res = {
    //     code: 0,
    //     data: {},
    //     msg: err.msg || '我也不知道为什么报错',
    //   };
    // }
  }
}

function createBuildCommandForALIPAY(projectName = 'uni-flower-mall') {
  return `D:\\HBuilderX\\cli.exe publish --platform mp-alipay --project ${projectName}`;
}

function createBuildCommandForWX(projectName = 'uni-flower-mall') {
  return `D:\\HBuilderX\\cli.exe publish --platform mp-weixin --project ${projectName}`;
}

export const platformMap = {
  WX_PLATFORM: createBuildCommandForWX,
  ALIPAY_PLATFORM: createBuildCommandForALIPAY,
};

export async function build(platform) {
  if (!platformMap[platform]) return 'fail';
  const command = platformMap[platform]();
  try {
    const result = execSync(command);

    if (result.toString().includes('成功' || '')) {
      console.log('build成功了');
      return 'success';
    } else {
      console.log('build失败了');
      console.error(result.toString());
      return 'fail';
    }
  } catch (err) {
    console.error(`命令执行失败：${err.message}`);
  }
}

async function executeScript() {
  const args = process.argv.slice(2);
  const platform = args[0];
  const res = await build(platform);
  if (res === 'fail') {
    return;
  }
  console.log('build完了');
}
