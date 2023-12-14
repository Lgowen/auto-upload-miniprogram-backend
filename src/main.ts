import { NestFactory } from '@nestjs/core';
import path from 'node:path';
import dotenv from 'dotenv';

import AppModule from './app.module';
import StandardRespInterceptor from './common/interceptor/standardResp';
import ErrorFilter from './common/filter/errorResp';
import { logger } from './core/service/logger.service';

const { ENV = 'dev' } = process.env;
const envFileName = `.env.${ENV}`;

// 写入env配置进环境变量
dotenv.config({
  path: path.join(__dirname, `../${envFileName}`),
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置前缀
  app.setGlobalPrefix('api');

  // 设置跨域
  app.enableCors();

  // 全局过滤器
  app.useGlobalFilters(new ErrorFilter());

  // 全局拦截器
  app.useGlobalInterceptors(new StandardRespInterceptor());

  const PORT =
    process.env.NODE_ENV === 'development'
      ? process.env.DEV_PORT
      : process.env.PORT;

  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  await app.listen(PORT, () => {
    logger.log(`Listening Port ${PORT}`, 'Main');
    logger.log('===========环境变量BEGIN===========', 'Main');
    logger.log(`APP_ENV     ${process.env.APP_ENV}`, 'Main');
    logger.log(`ENV         ${process.env.ENV}`, 'Main');
    logger.log(`SERVER_API  ${process.env.SERVER_API}`, 'Main');
    logger.log(`SERVER_HOST ${process.env.SERVER_HOST}`, 'Main');
    logger.log('===========环境变量END===========', 'Main');
  });
}

bootstrap();
