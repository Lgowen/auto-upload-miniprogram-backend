import AdmZip from 'adm-zip';
import url from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import minidev from 'minidev';
import { Project, preview } from 'miniprogram-ci';

type ReplacementItem = {
  type: 'js' | 'json';
  filePath: string;
  editValue: Record<string, any>;
};

type AppInfo = {
  appid: string;
  version: string;
  replace_list?: ReplacementItem[];
};

type WechatAppInfo = {
  appid: string;
  version: string;
  privateKeyPath?: string;
  privateKey?: string;
  replace_list?: ReplacementItem[];
};

type IAlipayConfig = {
  authentication?: {
    toolId: string;
    privateKey: string;
  };
  privateKeyPath?: string;
  projectPath?: string;
  dynamicConfig: {
    replace: () => AppInfo[];
  };
  larkParams?: ILarkParams;
};

type IWechatConfig = {
  projectPath?: string;
  dynamicConfig: {
    replace: () => WechatAppInfo[];
  };
  larkParams?: ILarkParams;
};

type ILarkParams = {
  isPushMessageToLark: boolean;
  larkRobotAppId: string;
  larkRobotAppSecret: string;
  larkRobotWebhook: string;
  messageTemplateId: string;
  templateData: Record<string, any>;
};

export interface IReplaceParams {
  relativePath: string;
  editValue: Record<string, any>;
}

export interface IAlipayParams {
  alipayAppId: string;
  projectPath: string;
  privateKeyPath: string;
  extraData?: Record<string, any>;
}

export interface IWechatParams {
  wechatAppId: string;
  qrcodeOutputDest: string;
  qrcodeUrl: string;
  projectPath: string;
  privateKeyPath: string;
  extraData?: Record<string, any>;
}

export async function replaceTextInJsFile(params: IReplaceParams) {
  const { relativePath, editValue } = params;
  const fullFilepath = getFullPath(relativePath);
  try {
    // 读取文件内容
    const data = fs.readFileSync(fullFilepath, 'utf8');
    const reg = new RegExp('(@@@)(.*?)(@@@)');

    const updateData = data.replace(reg, (_match, p1, p2, p3) => {
      const obj = JSON.parse(p2);
      const modifiedObj = { ...obj, ...editValue };
      return `${p1}${JSON.stringify(modifiedObj)}${p3}`;
    });

    fs.writeFileSync(fullFilepath, updateData, 'utf8');

    console.log('文件内容js替换并成功写回。');
  } catch (err) {
    console.error(`文件操作失败：${err}`);
  }
}

export async function replaceTextInJsonFile(params: IReplaceParams) {
  const { relativePath, editValue } = params;
  const fullFilepath = getFullPath(relativePath);
  try {
    // 读取文件内容
    const data = fs.readFileSync(fullFilepath, 'utf8');

    const jsonObject = JSON.parse(data);

    Object.keys(editValue).forEach((key) => {
      updateNestedKey(jsonObject, key, editValue[key]);
    });

    const updateData = JSON.stringify(jsonObject);

    fs.writeFileSync(fullFilepath, updateData, 'utf8');

    console.log('文件内容json替换并成功写回。');
  } catch (err) {
    console.error(`文件操作失败：${err}`);
  }
}

export async function unzipBundle(data: Buffer): Promise<string> {
  try {
    const zip = new AdmZip(data);
    let topLevelDirectoryName;
    zip.extractAllTo('');
    const zipEntries = zip.getEntries();

    if (zipEntries.length > 0) {
      const firstEntry = zipEntries[0];
      topLevelDirectoryName = firstEntry.entryName.split('/')[0];
      console.log('Top level directory name:', topLevelDirectoryName);
    } else {
      console.log('ZIP file is empty');
    }
    return topLevelDirectoryName as string;
  } catch (err) {
    throw new Error('Failed to retrieve repository content');
  }
}

/**
 * 获取文件完整路径
 * @param {string} relativePath 文件相对路径
 * @returns {string} manifest.json文件完整路径
 */
export function getFullPath(relativePath: string): string {
  // 获取使用者项目的根目录
  const projectRoot = process.cwd();

  // 构建 mp-ci.config.js 文件的完整路径
  const configFilePath = path.resolve(projectRoot, relativePath);

  return configFilePath;
}

/**
 * 获取当前脚本执行环境
 * @returns {'windows' | 'macos' | 'others'} 终端环境
 */
export function getEnvironment(): 'windows' | 'macos' | 'others' {
  if (process.platform === 'win32') {
    return 'windows';
  } else if (process.platform === 'darwin') {
    return 'macos';
  } else {
    return 'others';
  }
}

/**
 * @description: 读取项目下的mp-ci.config.js配置文件
 */
export async function readConfigFile(relativePath?: string) {
  const configPath = relativePath
    ? getFullPath(relativePath + '/mp-ci.config.js')
    : getFullPath('mp-ci.config.js');
  // delete require.cache[require.resolve(configPath)];
  const env = getEnvironment();
  let config;
  if (['macos', 'others'].includes(env)) {
    config = await import(configPath);
  } else {
    const fileUrl = url.pathToFileURL(path.resolve(configPath)).href;
    config = await import(fileUrl);
  }
  return config.default;
}

export async function handleGenerateConfig(
  dynamic: any,
  prefixPath: any,
  replaceEditValue: any,
) {
  for (const app of dynamic.replace_list) {
    if (app.type === 'js') {
      await replaceTextInJsFile({
        relativePath: `${prefixPath}/${app.filePath}`,
        editValue: { ...app.editValue, ...replaceEditValue },
      });
    } else if (app.type === 'json') {
      await replaceTextInJsonFile({
        relativePath: `${prefixPath}/${app.filePath}`,
        editValue: { ...app.editValue, ...replaceEditValue },
      });
    } else {
      console.log('暂不支持别的文件修改');
    }
  }
}

export function getPrivateKeyPathForWechat(dynamic: WechatAppInfo) {
  if (dynamic.privateKeyPath) {
    return getFullPath(dynamic.privateKeyPath);
  } else {
    const privateKey = dynamic.privateKey as string;
    const configPath = path.dirname(__dirname);
    console.log(__dirname, 'getPrivateKeyPathForWechat');
    const fullpath = path.join(configPath, `private.${dynamic.appid}.key`);
    fs.writeFileSync(fullpath, privateKey);
    return fullpath;
  }
}

export function getPrivateKeyPathForAlipay(
  alipayConfig: IAlipayConfig,
  appid: string,
) {
  if (alipayConfig.privateKeyPath) {
    return getFullPath(alipayConfig.privateKeyPath);
  } else {
    const transformData = {
      alipay: {
        authentication: alipayConfig.authentication,
      },
    };
    const transformString = JSON.stringify(transformData);
    console.log(__dirname, 'getPrivateKeyPathForAlipay');
    const configPath = path.dirname(__dirname);
    const fullpath = path.join(configPath, `config.${appid}.json`);
    fs.writeFileSync(fullpath, transformString);
    return fullpath;
  }
}

export async function previewMiniprogramInAlipay(params: IAlipayParams) {
  const { alipayAppId, projectPath, privateKeyPath, extraData } = params;
  console.log(`支付宝小程序${alipayAppId}正在预览中......`);
  const { originalConsoleLog, originalConsoleInfo } = rewriteConsole();
  try {
    const { qrcodeUrl } = await minidev.preview({
      appId: alipayAppId, // (对应appid)
      identityKeyPath: privateKeyPath, // 身份验证文件路径
      project: projectPath, // 项目路径
      ...extraData,
    });
    setOriginConsole(originalConsoleLog, originalConsoleInfo);
    console.log(`支付宝小程序${alipayAppId}预览成功`);
    return qrcodeUrl;
  } catch (err) {
    setOriginConsole(originalConsoleLog, originalConsoleInfo);
    console.log(`支付宝小程序${alipayAppId}预览失败`);
    throw err;
  }
}

/**
 * 预览应用(微信)
 * @param {string} APP_ID 要预览应用的appid
 * @returns {undefined}
 */
export async function previewMiniprogramInWechat(params: IWechatParams) {
  const {
    wechatAppId,
    projectPath,
    privateKeyPath,
    qrcodeOutputDest,
    qrcodeUrl,
    extraData,
  } = params;
  console.log(`微信小程序${wechatAppId}正在预览中......`);
  console.log(Project, 'wxciwxci');
  const { originalConsoleLog, originalConsoleInfo } = rewriteConsole();
  try {
    const project = new Project({
      appid: wechatAppId,
      type: 'miniProgram',
      projectPath,
      privateKeyPath,
      ignores: ['node_modules/**/*'],
      ...extraData,
    });
    setOriginConsole(originalConsoleLog, originalConsoleInfo);
    console.log(`微信小程序${wechatAppId}预览成功`);
    const previewResult = await preview({
      project,
      // desc: 'hello', // 此备注将显示在“小程序助手”开发版列表中
      setting: {
        es6: true,
      },
      qrcodeFormat: 'image',
      qrcodeOutputDest,
      onProgressUpdate: console.log,
      version: '',
    });
    console.log(previewResult, 'previewResult');
    const imageData = await getBase64(qrcodeUrl);
    return imageData;
  } catch (err) {
    setOriginConsole(originalConsoleLog, originalConsoleInfo);
    console.log(`微信小程序${wechatAppId}预览失败`);
    throw err;
  }
}

/**
 * 重写console的一些方法
 * @returns {}
 */
export function rewriteConsole() {
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  console.log = () => {};
  console.info = () => {};
  return {
    originalConsoleLog,
    originalConsoleInfo,
  };
}

export function setOriginConsole(
  originalConsoleLog: any,
  originalConsoleInfo: any,
) {
  console.log = originalConsoleLog;
  console.info = originalConsoleInfo;
}

export async function getBase64(url: string) {
  const fullFilepath = getFullPath(url);
  const fileData = fs.readFileSync(fullFilepath);
  return fileData.toString('base64');
}

/**
 * 修改嵌套层级对象数据
 * @returns {}
 */
export function updateNestedKey(
  obj: Record<string, any>,
  keyPath: string,
  newValue: Record<string, any>,
) {
  const keys = keyPath.split('.');
  const currentKey = keys[0];
  if (keys.length === 1) {
    obj[currentKey] = newValue;
  } else {
    updateNestedKey(obj[currentKey], keys.slice(1).join('.'), newValue);
  }
}
