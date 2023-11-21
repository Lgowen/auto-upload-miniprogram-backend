import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('files')
export class UploadController {
  constructor(private readonly fileService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('name'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('name') name: string) {
    this.fileService.handleZipFile(name, file);

    return { message: 'File uploaded successfully' };
  }
}