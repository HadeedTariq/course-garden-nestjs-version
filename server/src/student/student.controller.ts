import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  Put,
} from '@nestjs/common';
import { StudentService } from './student.service';

import { Request } from 'express';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('/')
  getCourses(@Req() request: Request) {
    return this.studentService.getCourses(request);
  }

  @Get('notifications')
  getMyNotifications(@Req() request: Request) {
    return this.studentService.getMyNotifications(request);
  }

  @Post('notification/read')
  readNotification(@Req() request: Request) {
    return this.studentService.readNotification(request);
  }

  @Get('notification/read')
  getErolledCourseDetails(
    @Req() request: Request,
    @Query('courseId') courseId: string,
  ) {
    return this.studentService.getErolledCourseDetails(request, courseId);
  }

  @Post('/course/enroll/freeCourse')
  enrollInFreeCourse(@Req() req: Request, @Query('courseId') courseId: string) {
    return this.studentService.enrollInFreeCourse(req, courseId);
  }

  @Put('/course/completeChapter')
  onCompleteChapter(
    @Req() req: Request,
    @Query('courseId') courseId: string,
    @Query('chapterId') chapterId: string,
  ) {
    return this.studentService.onCompleteChapter(req, courseId, chapterId);
  }

  @Get('/course/myCompletedChapters')
  getCompletedChapters(
    @Req() req: Request,
    @Query('courseId') courseId: string,
  ) {
    return this.studentService.getCompletedChapters(req, courseId);
  }

  @Post('/course/applyCouponCode')
  applyCouponCode(@Req() req: Request, @Body() courseId: string) {
    return this.studentService.applyCouponCode(req, courseId);
  }

  @Get('/course/checkCoupon')
  getCouponCode(@Req() req: Request, @Query('courseId') courseId: string) {
    return this.studentService.getCouponCode(req, courseId);
  }

  @Post('/course/purchase')
  purchaseCourse(@Req() req: Request) {
    return this.studentService.purchaseCourse(req);
  }

  @Post('/course/paymentSucceed')
  paymentSucceed(@Req() req: Request) {
    return this.studentService.paymentSucceed(req);
  }

  @Get('/course/myPurchasedCourses')
  getMyPaidCourses(@Req() req: Request) {
    return this.studentService.getMyPaidCourses(req);
  }

  @Get('paidCourse/:id/chapterTitles')
  getMyPaidCourseChaptersTitles(@Param('id') id: string, @Req() req: Request) {
    return this.studentService.getMyPaidCourseChaptersTitles(id, req);
  }

  @Post('/course/enroll/paidCourse')
  enrollInPaidCourse(@Query('courseId') courseId: string, @Req() req: Request) {
    return this.studentService.enrollInPaidCourse(courseId, req);
  }

  @Get('paidCourse/content')
  getPaidCourseContent(
    @Query('courseId') courseId: string,
    @Req() req: Request,
  ) {
    console.log(courseId);

    return this.studentService.getPaidCourseContent(req, courseId);
  }

  @Get('courses/allPoints')
  getAllCoursesPoints(@Req() req: Request) {
    return this.studentService.getAllCoursesPoints(req);
  }

  @Get('courses/all')
  getMyAllCourses(@Req() req: Request) {
    return this.studentService.getMyAllCourses(req);
  }
}
