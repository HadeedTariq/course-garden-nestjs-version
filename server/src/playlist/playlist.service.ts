import { Injectable } from '@nestjs/common';
import { CustomException } from 'src/custom.exception';
import { Course } from 'src/teacher/schemas/course.model';
import { Playlist } from './playlist.model';
import { Request } from 'express';

@Injectable()
export class PlaylistService {
  async createPlaylist(req: Request) {
    const { user, courseId, name } = req.body;

    if (!name || !courseId) {
      throw new CustomException('Please fill all the fields');
    }

    const course = await Course.findById(courseId);

    if (!course) {
      throw new CustomException('Course not found');
    }

    const playlist = await Playlist.create({
      name,
      user: user.id,
      courses: [courseId],
      thumbnail: course.thumbnail,
    });

    return { message: 'Playlist Created Successfully' };
  }

  async getMyPlaylists(userId: string) {
    const myCreatedPlaylists = await Playlist.find({
      user: userId,
    });

    return myCreatedPlaylists;
  }

  async updatePlaylist(req: Request) {
    const { playlistId, courseId, user } = req.body;

    if (!playlistId || !courseId) {
      throw new CustomException('Playlist id and video id is required');
    }

    const playlistUpdater = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
        user: user.id,
      },
      {
        $push: { courses: courseId },
      },
    );
    if (playlistUpdater) {
      return { message: 'Playlist updated successfully' };
    } else {
      throw new CustomException('Something went wrong');
    }
  }
}
