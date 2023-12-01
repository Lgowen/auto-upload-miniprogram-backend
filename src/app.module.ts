import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';

@Module({
  imports: [UploadModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class AppModule {}
