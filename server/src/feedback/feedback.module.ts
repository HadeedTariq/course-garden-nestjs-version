import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CheckAuth } from 'src/auth/auth.middleware';

@Module({
  imports: [AuthModule],

  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckAuth).forRoutes('feedback');
  }
}
