import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetRawHeaders = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const rawHeaders = req.rawHeaders;

    if (!rawHeaders)
      throw new InternalServerErrorException('No Raw Headers (request)');

    return rawHeaders;
  },
);
