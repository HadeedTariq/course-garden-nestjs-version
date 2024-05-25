import { Request } from 'express';
import { PlaylistService } from './playlist.service';
import { Controller, Post, Get, Put, Body, Req } from '@nestjs/common';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post('create')
  createPlaylist(@Req() req: Request) {
    return this.playlistService.createPlaylist(req);
  }

  @Get('myPlaylists')
  getMyPlaylists(@Req() req) {
    const userId = req.body.user.id;
    return this.playlistService.getMyPlaylists(userId);
  }

  @Put('update')
  updatePlaylist(@Req() req: Request) {
    return this.playlistService.updatePlaylist(req);
  }
}
