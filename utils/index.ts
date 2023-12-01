import * as AdmZip from 'adm-zip';
import { promisify } from 'util';
import * as childProcess from 'child_process';
import * as path from 'path';
const exec = promisify(childProcess.exec);

export async function unzipBundle(data: ArrayBuffer) {
  try {
    const zip = new AdmZip(data);
    zip.extractAllTo('remote-project');
    process.chdir('remote-project');
    await exec('npm install');
    process.chdir(__dirname);
    console.log('npm install siccessfully');
  } catch (err) {
    console.error(err);
    throw new Error('Failed to retrieve repository content');
  }
}

export function sleep(time: any) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function getFullPath(relativePath) {
  // 获取使用者项目的根目录
  const projectRoot = process.cwd();
  console.log(projectRoot, 'asdasdds');
  // 构建 mp-ci.config.js 文件的完整路径
  const configFilePath = path.resolve(projectRoot, relativePath);
  return configFilePath;
}
