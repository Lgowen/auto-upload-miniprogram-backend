import { Module } from '@nestjs/common';
import { QrcodeModule } from './qrcode/qrcode.module';
import { QrcodeController } from './qrcode/qrcode.controller';
import { QrcodeService } from './qrcode/qrcode.service';
import { UploadModule } from './upload/upload.module';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';

@Module({
  imports: [QrcodeModule, UploadModule],
  controllers: [QrcodeController, UploadController],
  providers: [QrcodeService, UploadService],
})
export class AppModule {}
