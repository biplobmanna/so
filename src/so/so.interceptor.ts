import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { SoGateway } from './so.gateway';
import { NewSoDto } from './dto';

@Injectable()
export class SoInterceptor implements NestInterceptor {
  private readonly logger;

  constructor(private soGateway: SoGateway) {
    this.logger = new Logger(SoInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // this.logger.log('Interceptor on!');
    // intercept response of adding so
    return next.handle().pipe(
      tap((data) => {
        this.soGateway.publishSo(data as NewSoDto);
      }),
    );
  }
}
