import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { InfraService } from './service/infra.service';
import { MyLoggerService } from './service/logger.service';

// import { CoreController } from './core.controller';

import { LoggerMiddleware } from '../common/middleware/logger';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [InfraService, MyLoggerService],
  exports: [HttpModule, InfraService, MyLoggerService],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
