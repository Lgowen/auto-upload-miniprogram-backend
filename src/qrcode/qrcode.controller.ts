import { Controller, Get, Request } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';

@Controller('qrcode')
export class QrcodeController {
  constructor(private qrcodeService: QrcodeService) {}

  @Get('getQrcodeByVersion')
  async getQrcodeByVersion(@Request() req): Promise<any> {
    const version: string = req.query.version;
    return await this.qrcodeService.getQrcodeByVersion(version);
  }

  @Get('getQrcode')
  getQrcode(@Request() req) {
    console.log(req, 'req');
    return this.qrcodeService.getQrcode();
  }
}
