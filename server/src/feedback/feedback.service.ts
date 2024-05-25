import { Injectable } from '@nestjs/common';
import { CustomException } from 'src/custom.exception';
import { Feedback } from './feedback.model';
import { Request } from 'express';
import mongoose from 'mongoose';

@Injectable()
export class FeedbackService {
  async createFeedback(req: Request) {
    const { user, content, courseId } = req.body;

    if (!courseId || !content) {
      throw new CustomException('Please fil all the fields ');
    }

    const createdFeedback = await Feedback.create({
      content,
      user: user.id,
      courseId,
    });

    return { message: 'Feedback created successfully' };
  }

  async getCourseFeedbacks(req: Request) {
    const { courseId } = req.query;
    if (!courseId) {
      throw new CustomException('CourseId is required');
    }

    const courseFeedbacks = await Feedback.aggregate([
      {
        $match: {
          courseId: new mongoose.Types.ObjectId(courseId as string),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },

      {
        $unwind: '$user',
      },

      { $unwind: { path: '$replies', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'users',
          localField: 'replies.user',
          foreignField: '_id',
          as: 'replies.user',
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },

      { $unwind: { path: '$replies.user', preserveNullAndEmptyArrays: true } },

      {
        $group: {
          _id: '$_id',
          content: { $first: '$content' },
          user: { $first: '$user' },
          courseId: { $first: '$courseId' },
          replies: { $push: '$replies' },
        },
      },
    ]);

    return courseFeedbacks;
  }

  async createReply(req: Request) {
    const { commentId, user, content } = req.body;
    if (!commentId) {
      throw new CustomException('Comment Id is required');
    }

    const createdReply = await Feedback.findByIdAndUpdate(commentId, {
      $push: {
        replies: {
          user: user.id,
          content: content,
        },
      },
    });
    return { message: 'Reply created successfully' };
  }
}
