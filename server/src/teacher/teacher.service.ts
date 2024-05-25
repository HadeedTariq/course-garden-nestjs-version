import { Injectable } from '@nestjs/common';
import {
  CreateChapterDto,
  CreateCourseDto,
  PublishCourseDto,
} from './dto/create-course.dto';
import { CouponCode, Course } from './schemas/course.model';
import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { CustomException } from 'src/custom.exception';
import { Chapter } from './schemas/chapter.model';
import { Payment } from './schemas/payments.model';

@Injectable()
export class TeacherService {
  async createCourse(
    createCourseDto: CreateCourseDto,
    req: Request,
    res: Response,
  ) {
    const {
      title,
      description,
      thumbnail,
      couponCode: { coupon, quantity },
      category,
    } = createCourseDto;

    const createdCouponCode = await CouponCode.create({
      coupon,
      quantity,
    });

    const createdCourse = await Course.create({
      title,
      description,
      thumbnail,
      creator: new Types.ObjectId(req.body.user.id),
      couponCode: createdCouponCode._id,
      category,
    });

    if (createdCouponCode) {
      createdCouponCode.courseId = new Types.ObjectId(
        createdCourse._id as string,
      );
      await createdCouponCode.save();
    }

    res.status(201).json(createdCourse);
  }

  async publishCourse(publisher: PublishCourseDto) {
    const { status, price, courseId } = publisher;

    const updateCourse = await Course.findByIdAndUpdate(courseId, {
      status: status,
      price: price ? `$ ${price}` : '$ 0',
      isPublish: true,
    });

    if (updateCourse) {
      return { message: 'Course published successfully' };
    } else {
      throw new CustomException('Something went wrong');
    }
  }

  async createChapter(chapter: CreateChapterDto) {
    const {
      title,
      description,
      thumbnail,
      chapterNumber,
      video,
      courseId,
      totalChapters,
    } = chapter;

    const createdChapter = await Chapter.create({
      title,
      description,
      thumbnail,
      chapterNumber,
      video,
      courseId,
    });

    await Course.findByIdAndUpdate(courseId, {
      $push: { chapters: createdChapter._id },
      totalChapters,
    });

    if (createdChapter) {
      return {
        message: 'Chapter created successfully',
        chapterId: createdChapter._id,
      };
    } else {
      throw new CustomException('Something went wrong');
    }
  }

  async getCourseById(id: string) {
    if (!id || id.length !== 24) {
      throw new CustomException('Course Id must be true');
    }
    const course = await Course.findById(id).populate('chapters');

    if (!course) {
      throw new CustomException('Course Not found');
    }

    return JSON.parse(JSON.stringify(course)) as any;
  }

  async myCourses(req: Request) {
    const { user } = req.body;

    const courses = await Course.aggregate([
      {
        $match: {
          creator: new mongoose.Types.ObjectId(user.id),
        },
      },
      {
        $lookup: {
          from: 'chapters',
          localField: 'chapters',
          foreignField: '_id',
          as: 'courseChapters',
        },
      },
    ]);

    return JSON.parse(JSON.stringify(courses)) as any;
  }

  async deleteCourse(id: string) {
    if (!id || id.length !== 24) {
      throw new CustomException('Course Id is required');
    }

    const delCourse = await Course.findByIdAndDelete(id);

    if (delCourse) {
      const delCouponCodes = await CouponCode.findOneAndDelete({
        courseId: id,
      });
      const delChapters = await Chapter.deleteMany({
        courseId: id,
      });
      return { message: 'Course deleted successfully' };
    }
  }

  async getMyCoursesRevenue(courseId: string) {
    if (!courseId || courseId.length !== 24) {
      throw new CustomException('Course Id must be required');
    }

    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
    );

    const firstDayOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );

    const revenueDetails = await Payment.aggregate([
      {
        $match: {
          courseId: new mongoose.Types.ObjectId(courseId as string),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'purchaser',
          foreignField: '_id',
          as: 'purchaserDetails',
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
                email: 1,
              },
            },
          ],
        },
      },
      { $unwind: '$purchaserDetails' },
    ]);

    const monthlyRevenue = revenueDetails.reduce((acc: any, pDetails: any) => {
      const realPrice = pDetails.price.split(' ')[1];
      if (
        pDetails.createdAt > firstDayOfMonth &&
        pDetails.createdAt < firstDayOfNextMonth
      ) {
        acc += Number(realPrice);
      }
      return acc;
    }, 0);

    const totalRevenue = revenueDetails.reduce((acc: any, pDetails: any) => {
      const realPrice = pDetails.price.split(' ')[1];
      acc += Number(realPrice);
      return acc;
    }, 0);

    return {
      purchaserDetails: revenueDetails,
      totalRevenue: `$ ${totalRevenue}`,
      monthlyRevenue: `$ ${monthlyRevenue}`,
    };
  }
}
