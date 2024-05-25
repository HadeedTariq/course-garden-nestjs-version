import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import mongoose from 'mongoose';
import { Notification } from 'src/admin/schemas/notification.model';
import { CustomException } from 'src/custom.exception';
import { CouponCode, Course } from 'src/teacher/schemas/course.model';
import { CoursePoints } from '../student/schemas/coursePoints.model';
import { PendingBuyer } from './schemas/pendingBuyer.model';
import { Payment } from 'src/teacher/schemas/payments.model';

@Injectable()
export class StudentService {
  async getCourses(req: Request) {
    const coursePipeline: any = [
      {
        $match: {
          isPublish: true,
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

      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'teacher',
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
                qualification: 1,
              },
            },
          ],
        },
      },

      {
        $unwind: '$teacher',
      },

      {
        $project: {
          couponCode: 0,
          chapters: 0,
          creator: 0,
          purchasers: 0,
        },
      },
    ];
    if (req.body.user && req.body.user.id) {
      coursePipeline[0].$match.creator = {
        $ne: new mongoose.Types.ObjectId(req.body.user.id),
      };
    }
    const courses = await Course.aggregate(coursePipeline);

    const realCourses = courses?.map((crs) => {
      if (crs.price) {
        return {
          title: crs.title,
          thumbnail: crs.thumbnail,
          category: crs.category,
          description: crs.description,
          teacher: crs.teacher,
          status: crs.status,
          price: crs.price,
          _id: crs._id,
        };
      } else {
        return crs;
      }
    });

    return realCourses;
  }

  async getMyNotifications(req: Request) {
    const { user } = req.body;

    const userNotifications = await Notification.find({
      user: user.id,
    });

    return userNotifications;
  }

  async readNotification(req: Request) {
    const { notificationId } = req.body;
    if (!notificationId) {
      throw new CustomException('Notification Id  required');
    }
    await Notification.findByIdAndUpdate(notificationId, {
      read: true,
    });

    return { message: 'Notification readed' };
  }

  async getErolledCourseDetails(req: Request, courseId: string) {
    if (!courseId) {
      throw new CustomException('Course Id  required');
    }

    const coursePointDetails = await CoursePoints.findOne({
      courseId,
      user: req.body.user.id,
    });
    if (coursePointDetails) {
      return coursePointDetails;
    } else {
      throw new CustomException('Course Id  required');
    }
  }

  async enrollInFreeCourse(req: Request, courseId: string) {
    if (!courseId) {
      throw new CustomException('Course Id is required');
    }

    const addCourseToPoints = await CoursePoints.create({
      courseId,
      user: req.body.user.id,
    });

    return { message: 'Enrolled in free course successfully' };
  }

  async onCompleteChapter(req: Request, courseId: string, chapterId: string) {
    if (!courseId || !chapterId) {
      throw new CustomException('Course Id and Chapter Id is required');
    }
    const course = await Course.findById(courseId);
    const updateCoursePoints = await CoursePoints.findOneAndUpdate(
      { courseId, user: req.body.user.id },
      {
        $inc: { points: 5 },
        $push: { chapters: chapterId },
      },
      { new: true },
    );

    if (updateCoursePoints && course?.chapters?.length) {
      const isCourseCompleted =
        updateCoursePoints.points === course?.chapters?.length * 5;
      if (isCourseCompleted) {
        updateCoursePoints.courseCompleted = true;
        await updateCoursePoints.save();
        return { message: 'Course completed successfully' };
      } else {
        return { message: 'chapter completed successfully' };
      }
    } else {
      throw new CustomException('Something went wrong');
    }
  }

  async getCompletedChapters(req: Request, courseId: string) {
    const { user } = req.body;
    if (!courseId) {
      throw new CustomException('Course Id is required');
    }

    const coursePoints = await CoursePoints.findOne({
      courseId,
      user: user.id,
    });

    if (coursePoints) {
      return coursePoints.chapters;
    } else {
      throw new CustomException('No course points found');
    }
  }

  async applyCouponCode(req: Request, courseId: string) {
    const updateCouponPoints = await CouponCode.findOneAndUpdate(
      { courseId },
      {
        $inc: { quantity: -1 },
        $push: { couponUsers: req.body.user.id },
      },
    );

    return { message: 'Coupon Code applied successfully' };
  }

  async getCouponCode(req: Request, courseId: string) {
    if (!courseId) {
      throw new CustomException('Course Id  required');
    }

    const couponCode = await CouponCode.findOne({
      courseId,
      couponUsers: req.body.user.id,
    });

    if (couponCode) {
      return couponCode.coupon;
    } else {
      throw new CustomException('No coupon code found');
    }
  }

  async purchaseCourse(req: Request) {
    const { session } = req.body;
    return { id: session.id };
  }

  async paymentSucceed(req: Request) {
    const buyerExist = await PendingBuyer.findOne({
      user: req.body.user.id,
      courseId: req.body.courseId,
      _id: req.body.id,
    });

    if (!buyerExist) {
      throw new CustomException('Invalid secret id');
    }
    const updateCourse = await Course.findByIdAndUpdate(req.body.courseId, {
      $push: { purchasers: req.body.user.id },
    });

    await Payment.create({
      courseId: req.body.courseId,
      purchaser: req.body.user.id,
      price: buyerExist.price,
    });
    await PendingBuyer.findByIdAndDelete(buyerExist._id);
    console.log('done');

    if (updateCourse) {
      return { message: 'Payment Successfull' };
    } else {
      throw new CustomException('Something went wrong');
    }
  }

  async getMyPaidCourses(req: Request) {
    const { user } = req.body;

    const myPurchasedCourses = await Course.find({
      purchasers: user.id,
    });

    const purchasedCoursesIds = myPurchasedCourses?.map((course) => course._id);

    return purchasedCoursesIds;
  }

  async getMyPaidCourseChaptersTitles(id: String, req: Request) {
    const { user } = req.body;

    if (!id) {
      throw new CustomException('Course Id  required');
    }

    const course = await Course.findOne({
      _id: id,
      purchasers: user.id,
    }).populate({
      path: 'chapters',
      select: 'title',
    });
    return course?.chapters || [];
  }

  async enrollInPaidCourse(courseId: string, req: Request) {
    if (!courseId) {
      throw new CustomException('Course Id is required');
    }

    const course = await Course.findOne({
      _id: courseId,
      purchasers: req.body.user.id,
    });

    if (!course) {
      throw new CustomException('Please purchased the course');
    }

    const addCourseToPoints = await CoursePoints.create({
      courseId,
      user: req.body.user.id,
    });

    return { message: 'Enrolled in Paid course successfully' };
  }

  async getPaidCourseContent(req: Request, courseId: string) {
    if (!courseId) {
      throw new CustomException('Course Id is required');
    }

    const coursePipeline: any = [
      {
        $match: {
          isPublish: true,
          _id: new mongoose.Types.ObjectId(courseId as string),
          purchasers: new mongoose.Types.ObjectId(req.body.user.id),
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

      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'teacher',
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
                qualification: 1,
              },
            },
          ],
        },
      },

      {
        $unwind: '$teacher',
      },

      {
        $project: {
          couponCode: 0,
          chapters: 0,
          creator: 0,
          purchasers: 0,
        },
      },
    ];
    const course = await Course.aggregate(coursePipeline);

    if (!course) {
      throw new CustomException('Please purchased the course');
    }
    return course;
  }

  async getAllCoursesPoints(req: Request) {
    const { user } = req.body;

    const coursePoints = await CoursePoints.find({
      user: new mongoose.Types.ObjectId(user.id),
    }).select('points');

    const totalPoints = coursePoints?.reduce((acc: any, detail: any) => {
      acc += detail.points;
      return acc;
    }, 0);

    return { totalPoints };
  }

  async getMyAllCourses(req: Request) {
    const { user } = req.body;

    const enrolledCourses = await CoursePoints.find({
      user: new mongoose.Types.ObjectId(user.id),
    }).select('courseId');
    return enrolledCourses;
  }
}
