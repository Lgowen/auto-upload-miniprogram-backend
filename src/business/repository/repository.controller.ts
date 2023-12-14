import { Controller, Post, Body, Headers } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { IGetBranchRequestBody, IPreviewMiniprogram } from './types';

@Controller('repository')
export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}
  @Post('getOrderDetail')
  async getOrderDetail(
    @Headers() headers: Record<string, string>,
    @Body('orderId') orderId: string,
  ) {
    const res = await this.repositoryService.getOrderDetail(orderId, headers);
    return res;
  }

  @Post('branch')
  async getBranch(@Body('repo') repo: string) {
    const res = await this.repositoryService.getBranch(repo);
    return res;
  }

  @Post('branchInfo')
  async getBranchInfo(@Body() requestBody: IGetBranchRequestBody) {
    const res = await this.repositoryService.getBranchInfo(requestBody);
    return res;
  }

  @Post('preview')
  async previewMiniprogram(@Body() requestBody: IPreviewMiniprogram) {
    const res = await this.repositoryService.previewMiniprogram(requestBody);
    return res;
  }
}
