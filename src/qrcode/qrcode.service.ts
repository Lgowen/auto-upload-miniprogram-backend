import { Injectable } from '@nestjs/common';
import { minidev } from 'minidev';

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

    const APP_ID = '2021004100659339';
    const buildPath = 'mp-alipay';
    // const dirname = path.dirname(fileURLToPath(import.meta.url));
    // const buildPath = path.join(dirname, relativePath);
    try {
      const { qrcodeUrl, version } = await minidev.preview({
        appId: APP_ID, // (对应appid)
        identityKeyPath: 'config.json', // 身份验证文件
        project: buildPath, // uniapp打包后的路径
      });
      return { code: 0, data: { qrcodeUrl, version }, msg: 'success' };
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
