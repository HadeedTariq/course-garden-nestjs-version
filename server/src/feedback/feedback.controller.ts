import { Controller, Post, Get, Req } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Request } from 'express';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}
  @Post('create')
  async createFeedback(@Req() req: Request) {
    return this.feedbackService.createFeedback(req);
  }

  @Post('reply')
  async createReply(@Req() req: Request) {
    return this.feedbackService.createReply(req);
  }

  @Get()
  async getCourseFeedbacks(@Req() req: Request) {
    return this.feedbackService.getCourseFeedbacks(req);
  }
}
