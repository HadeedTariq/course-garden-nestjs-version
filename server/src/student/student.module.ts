import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import {
  CouponCodeChecker,
  IsStudentAuthenticated,
  PaymentChecker,
} from './student.middleware';
import { CheckAuth } from 'src/auth/auth.middleware';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckAuth)
      .exclude({
        path: 'student/',
        method: RequestMethod.GET,
      })
      .forRoutes({
        path: 'student/*',
        method: RequestMethod.ALL,
      });

    consumer.apply(IsStudentAuthenticated).forRoutes({
      path: '/student/',
      method: RequestMethod.GET,
    });

    consumer.apply(CouponCodeChecker).forRoutes({
      path: '/student/course/applyCouponCode',
      method: RequestMethod.POST,
    });

    consumer.apply(PaymentChecker).forRoutes({
      path: '/student/course/purchase',
      method: RequestMethod.POST,
    });
  }
}
