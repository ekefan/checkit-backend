import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { status } from '@grpc/grpc-js';

@Catch()
export class GrpcExceptionFilter implements RpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    return throwError(() => exception);
  }
}

export class GrpcError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

export const GrpcErrors = {
  notFound: (msg: string) => new GrpcError(status.NOT_FOUND, msg),
  alreadyExists: (msg: string) => new GrpcError(status.ALREADY_EXISTS, msg),
  invalidArgument: (msg: string) => new GrpcError(status.INVALID_ARGUMENT, msg),
  internal: (msg: string) => new GrpcError(status.INTERNAL, msg),
  unauthenticated: (msg: string) => new GrpcError(status.UNAUTHENTICATED, msg),
  permissionDenied: (msg: string) => new GrpcError(status.PERMISSION_DENIED, msg),
};