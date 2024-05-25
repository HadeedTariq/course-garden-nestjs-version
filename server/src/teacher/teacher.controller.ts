import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Req,
  Res,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';

import {
  CreateChapterDto,
  CreateCourseDto,
  PublishCourseDto,
} from './dto/create-course.dto';
import { Request, Response } from 'express';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post('createCourse')
  createCourse(
    @Req() req: Request,
    @Res() res: Response,
    @Body(ValidationPipe) createCourseDto: CreateCourseDto,
  ) {
    return this.teacherService.createCourse(createCourseDto, req, res);
  }

  @Post('course/publish')
  publishCourse(@Body(ValidationPipe) publisher: PublishCourseDto) {
    return this.teacherService.publishCourse(publisher);
  }

  @Post('chapter/create')
  createChapter(@Body(ValidationPipe) chapter: CreateChapterDto) {
    return this.teacherService.createChapter(chapter);
  }

  @Get('course/myCourses')
  getMyCourses(@Req() req: Request) {
    return this.teacherService.myCourses(req);
  }

  @Get('course/revenue')
  getMyCoursesRevenue(@Query('courseId') courseId: string) {
    return this.teacherService.getMyCoursesRevenue(courseId);
  }

  @Get('course/:id')
  getCourseById(@Param('id') id: string) {
    return this.teacherService.getCourseById(id);
  }

  @Delete('deleteCourse/:id')
  deleteCourse(@Param('id') id: string) {
    this.teacherService.deleteCourse(id);
  }
}
