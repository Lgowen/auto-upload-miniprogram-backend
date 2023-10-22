import { Module } from '@nestjs/common';
import { QrcodeModule } from './qrcode/qrcode.module';
import { QrcodeController } from './qrcode/qrcode.controller';
import { QrcodeService } from './qrcode/qrcode.service';

@Module({
  imports: [QrcodeModule],
  controllers: [QrcodeController],
  providers: [QrcodeService],
})
export class AppModule {}
