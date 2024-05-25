import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/auth/schema/user.model';
import { Course } from './schemas/course.model';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { CustomException } from 'src/custom.exception';

@Injectable()
export class IsTeacher implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      throw new CustomException('Access Token not found');
    }

    const user: any = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET!,
    );

    if (!user) {
      throw new CustomException('Invalid Access Token');
    }

    const isValidateTeacher = await User.findOne({
      _id: user.id,
      role: 'teacher',
    });
    if (!isValidateTeacher) {
      throw new CustomException('Only teacher can perform this action');
    }

    req.body.user = user;
    next();
  }
}

@Injectable()
export class IsCourseExist implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { courseId } = req.body;
    if (!courseId || courseId.length !== 24) {
      throw new CustomException('Course Id must be true');
    }

    const course = await Course.findById(courseId);

    if (!course) {
      throw new CustomException('Course Not found');
    }
    next();
  }
}
