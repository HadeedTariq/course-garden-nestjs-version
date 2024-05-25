import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { IsCourseExist, IsTeacher } from './teacher.middleware';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IsTeacher)
      .forRoutes('teacher')
      .apply(IsCourseExist)
      .forRoutes('teacher/chapter/create');
  }
}
