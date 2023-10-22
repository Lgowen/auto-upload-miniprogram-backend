// import minidev from 'minidev';
// import path from 'path';
// import { fileURLToPath } from 'url';
// // const minidev = mypkg.;
// // const args = process.argv.slice(2);

// export async function previewMiniprogram(APP_ID: string) {
//   // const env = args[0];
//   const relativePath = './mp-alipay';
//   const dirname = path.dirname(fileURLToPath(import.meta.url));
//   const buildPath = path.join(dirname, relativePath);
//   try {
//     const { qrcodeUrl, version } = await minidev.preview({
//       appId: APP_ID, // (对应appid)
//       identityKeyPath: './config.json', // 身份验证文件
//       project: buildPath, // uniapp打包后的路径
//     });
//     return { qrcodeUrl, version };
//     // console.log(qrcodeUrl, 'qrcodeUrlqrcodeUrl')
//     // console.log(version, 'qrcodeUrlqrcodeUrl')
//     // const [imageData, authorization] = await Promise.all([
//     //   getImageData(qrcodeUrl),
//     //   getAuthorization({
//     //     app_id: 'cli_a58d09de7afd100c',
//     //     app_secret: 'Vk4XeM577bPNWPbnucSxAbvuwVsWfZ2R',
//     //   }),
//     // ]);
//     // // console.log("获取imageData、authorization成功");
//     // const qrcode = await uploadImageToFeiShu(imageData, authorization);
//     // console.log('上传图片至飞书服务器成功');
//     // pushMessageToFeiShu(version, qrcode, env);
//   } catch (err) {
//     console.log('预览失败，原因：', err);
//     process.exit(-1);
//   }
// }

// // previewMiniprogram(APP_ID);
