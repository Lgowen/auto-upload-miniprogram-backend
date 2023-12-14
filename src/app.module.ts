import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';

/* 业务模块 */
import { RepositoryModule } from './business/repository/repository.module';
/* 业务模块 */

import Config from './common/config/index';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [Config],
      isGlobal: true,
    }),
    CoreModule,
    RepositoryModule,
  ],
})
export default class AppModule {
  constructor() {}
}
