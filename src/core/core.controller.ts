import { Controller, Post, Body } from '@nestjs/common';

@Controller('core')
export class CoreController {
  constructor(private readonly cosService) {}

  @Post('sts')
  async handleCosSts(@Body('bucket') bucket: string) {
    const res = await this.cosService.handleCosSts(bucket);
    return res;
  }

  @Post('auth')
  async getAuthUrl(@Body('fileKey') fileKey: string) {
    const res = await this.cosService.getAuthUrl(fileKey);
    return res;
  }
}
