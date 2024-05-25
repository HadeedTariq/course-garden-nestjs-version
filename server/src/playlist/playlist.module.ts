import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { CheckAuth } from 'src/auth/auth.middleware';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PlaylistController],
  providers: [PlaylistService],
})
export class PlaylistModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckAuth).forRoutes('playlist');
  }
}
