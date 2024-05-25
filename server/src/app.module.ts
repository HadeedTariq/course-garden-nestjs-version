import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TeacherModule } from './teacher/teacher.module';
import { StudentModule } from './student/student.module';
import { AdminModule } from './admin/admin.module';
import { PlaylistModule } from './playlist/playlist.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, TeacherModule, StudentModule, AdminModule, PlaylistModule, FeedbackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
