import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CODES, ERROR_MESSAGE_MAP } from '../../common/constant';

@Injectable()
export class InfraService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * 接口请求通用函数
   * @param options.url 接口路径
   * @param options.data 请求体
   * @param options.headers 请求头
   * @returns
   */
  public async fetch(
    options: any,
  ): Promise<[Record<string, string> | null, any]> {
    if (!options)
      return [
        {
          code: CODES.FETCH_OPTIONS_ERROR,
          message: ERROR_MESSAGE_MAP[CODES.FETCH_OPTIONS_ERROR],
        },
        null,
      ];

    const { url, data, headers, method = 'GET', responseType } = options;
    /**
     * 忽略请求头中带来的content-length
     * 避免因content-length字节数不对导致的下游服务异常
     */
    delete headers['content-length'];

    // 在此可以对options内的参数做任意修改...

    try {
      const res = await lastValueFrom(
        this.httpService.request({
          url,
          method,
          data,
          headers,
          responseType,
        }),
      );
      const err = [0, null, undefined].includes(res.data.code)
        ? null
        : { ...res.data, errUrl: url };
      const result = res.data || null;
      console.log(res.data.code, ' res.data.code');
      return [err, result];
    } catch (error) {
      if (error.response) {
        const { status } = error.response;
        switch (status) {
          case 401:
            throw new UnauthorizedException();
          // ......
        }
        return [error.response.data, null];
      }
      return [error, null];
    }
  }
}
