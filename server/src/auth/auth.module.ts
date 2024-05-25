import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CheckAuth, ExistedUser } from './auth.middleware';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CheckAuth],
  exports: [CheckAuth],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ExistedUser)
      .forRoutes({
        path: '/auth/register',
        method: RequestMethod.POST,
      })
      .apply(CheckAuth)
      .forRoutes({
        path: '/auth',
        method: RequestMethod.POST,
      });
  }
}
