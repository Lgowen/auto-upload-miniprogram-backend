import * as AdmZip from 'adm-zip';
import { promisify } from 'util'
import * as childProcess from 'child_process'

const exec = promisify(childProcess.exec)

export async function unzipBundle(data: ArrayBuffer) {
  try {
    const zip = new AdmZip(data);
    zip.extractAllTo('remote-project');

    process.chdir('remote-project/uni-flower-mall')

    await exec('npm install')

    process.chdir(__dirname)
    
    console.log('npm install siccessfully')
    
  } catch (err) {
    console.error(err);
    throw new Error('Failed to retrieve repository content');
  }
}
