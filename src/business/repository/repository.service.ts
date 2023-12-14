import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfraService } from '../../core/service/infra.service';
import { IGetBranchRequestBody, IPreviewMiniprogram } from './types';
import {
  unzipBundle,
  getFullPath,
  readConfigFile,
  handleGenerateConfig,
  getPrivateKeyPathForWechat,
  getPrivateKeyPathForAlipay,
  previewMiniprogramInWechat,
  previewMiniprogramInAlipay,
} from '../../utils/index';
import fs from 'node:fs';

@Injectable()
export class RepositoryService {
  private defaultConfig: any;
  private defaultFilename: string;
  constructor(
    // 用于获取配置
    private readonly configService: ConfigService,
    // 调用基础方法
    private readonly infraService: InfraService,
  ) {}

  // 接口的具体实现
  public async getOrderDetail(
    orderId: string,
    headers: Record<string, string>,
  ) {
    if (!orderId) throw new BadRequestException('缺少订单ID');
    // 从订单域中根据订单ID获取指定订单信息
    const [orderInfoErr, orderInfo] = await this.infraService.fetch({
      url: `${this.configService.get<string>('server.Order')}/orderInfo`,
      data: { orderId },
      headers,
    });
    if (orderInfoErr) {
      throw new InternalServerErrorException(orderInfoErr.message);
    }

    // 从产品域中根据产品代码获取指定产品信息
    const { productCode, policyID } = orderInfo;
    const [productInfoErr, productInfo] = await this.infraService.fetch({
      url: `${this.configService.get<string>('server.Product')}/productInfo`,
      data: { productCode },
      headers,
    });
    if (productInfoErr) {
      throw new InternalServerErrorException(productInfoErr.message);
    }

    // 从保险域中根据保单号获取指定保单信息
    const [policyInfoErr, policyInfo] = await this.infraService.fetch({
      url: `${this.configService.get<string>('server.Insure')}/policyInfo`,
      data: { policyID },
      headers,
    });
    if (policyInfoErr) {
      throw new InternalServerErrorException(policyInfoErr.message);
    }

    // 完成所有信息的获取后可以按需拼接返回给前端
    return {
      ...orderInfo,
      productInfo,
      policyInfo,
    };
  }

  public async getBranch(repo: string) {
    const accessToken = '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';
    const headers = {
      Authorization: `token ${accessToken}`,
    };
    const owner = 'Houselai';
    const url = `http://api.github.com/repos/${owner}/${repo}/branches`;
    const [branchErr, branch] = await this.infraService.fetch({
      url,
      headers,
    });
    if (branchErr) {
      throw new InternalServerErrorException(branchErr.message);
    }
    return branch;
  }

  public async getBranchInfo(params: IGetBranchRequestBody) {
    const { repo, branch } = params;
    const accessToken = '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';
    const headers = {
      Authorization: `token ${accessToken}`,
    };
    const owner = 'Houselai';
    const url = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;
    const [branchInfoErr, branchInfo] = await this.infraService.fetch({
      url,
      headers,
      responseType: 'arraybuffer',
    });
    console.log(branchInfoErr, branchInfo);
    if (branchInfoErr) {
      throw new InternalServerErrorException(branchInfoErr.message);
    }
    const filename = await unzipBundle(branchInfo);
    console.log(filename, 'filenamefile');
    const config = await readConfigFile(filename);
    const fullFilepath = getFullPath(
      `${filename}/${config.alipay.pagesListPath}`,
    );
    const data = fs.readFileSync(fullFilepath, 'utf8');
    const jsonObject = JSON.parse(data);
    const pageList = jsonObject.pages.map((item: string) => `/${item}`);
    if (jsonObject.subPackages) {
      if (Array.isArray(jsonObject.subPackages)) {
        jsonObject.subPackages.forEach((item: any) => {
          const subPages = item.pages.map(
            (page: any) => `/${item.root}/${page}`,
          );
          pageList.push(...subPages);
        });
      }
    }
    this.defaultConfig = config;
    this.defaultFilename = filename;
    const formGenerate = config[params.platform].formGenerate();
    console.log(formGenerate, 'formGenerateformGenerate');
    return {
      appid: formGenerate.appid,
      pageList,
      pageConfig: formGenerate.replace_list.reduce((pre, cur) => {
        return {
          ...pre,
          ...cur.editValue,
        };
      }, {}),
    };
  }

  public async previewMiniprogram(params: IPreviewMiniprogram) {
    const platform = params.platform;
    const generateConfig = this.defaultConfig[platform].formGenerate();
    const projectPath = this.defaultConfig[platform]?.projectPath
      ? getFullPath(
          `${this.defaultFilename}/${this.defaultConfig[platform]?.projectPath}`,
        )
      : `${process.cwd()}/${this.defaultFilename}`;
    await handleGenerateConfig(
      generateConfig,
      this.defaultFilename,
      params.fileValue,
    );
    let result;
    let qrcodeUrl;
    if (platform === 'wechat') {
      const wechatAppId = generateConfig.appid;
      const privateKeyPath = getPrivateKeyPathForWechat(generateConfig);
      result = await previewMiniprogramInWechat({
        wechatAppId,
        projectPath,
        privateKeyPath,
        qrcodeOutputDest: './qrcode.jpg',
        qrcodeUrl: 'qrcode.jpg',
        extraData: { ...params.previewValue },
      });
      qrcodeUrl = 'qrcode.jpg';
    } else if (platform === 'alipay') {
      const alipayAppId = generateConfig.appid;
      const privateKeyPath = getPrivateKeyPathForAlipay(
        this.defaultConfig.alipay,
        alipayAppId,
      );
      console.log(privateKeyPath, 'privateKeyPathprivateKeyPath');
      result = await previewMiniprogramInAlipay({
        alipayAppId,
        projectPath,
        privateKeyPath,
        extraData: { ...params.previewValue },
      });
    } else {
      throw new InternalServerErrorException('暂不支持别的平台');
    }
    this.defaultFilename &&
      fs.rm(this.defaultFilename, { recursive: true }, (err) => {
        if (err) {
          console.error('删除文件夹时出错:', err);
        } else {
          console.log('文件夹删除成功');
        }
      });
    qrcodeUrl && fs.rmSync(qrcodeUrl);
    this.defaultFilename = '';
    return result;
  }
}
