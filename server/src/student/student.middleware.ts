import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { CouponCode, Course } from 'src/teacher/schemas/course.model';
import Stripe from 'stripe';
import { PendingBuyer } from './schemas/pendingBuyer.model';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { CustomException } from 'src/custom.exception';

@Injectable()
export class IsStudentAuthenticated implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return next();
    }

    const user: any = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET!,
    );

    if (!user) {
      return next();
    }

    req.body.user = user;
    next();
  }
}

@Injectable()
export class CouponCodeChecker implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { courseId, coupon } = req.body;
    if (!courseId || !coupon) {
      throw new CustomException('Course Id and Coupon Code required');
    }

    const couponCode = await CouponCode.findOne({
      courseId,
      quantity: { $gt: 0 },
      coupon,
    });

    if (!couponCode) {
      throw new CustomException('Invalid Coupon Code');
    }

    next();
  }
}

@Injectable()
export class PaymentChecker implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!);
    const { courseId, coupon, price } = req.body;
    console.log(req.body);

    if (!courseId || !price) {
      throw new CustomException('Course id and price is required');
    }
    const course = await Course.findById(courseId);
    const pendingBuyer = await PendingBuyer.create({
      courseId: course?._id,
      user: req.body.user.id,
    });
    if (coupon) {
      const couponDetails = await CouponCode.findOne({
        courseId,
        couponUsers: req.body.user.id,
      });
      if (!couponDetails) {
        throw new CustomException('Incorrect Coupon Details');
      }
      if (course) {
        const realPrice = Number(course.price?.split(' ')[1]);
        const discountPrice = Math.floor(realPrice / 2);
        const discRealPrice = `$${discountPrice}`;

        if (discRealPrice !== price) {
          throw new CustomException("Price Doesn't match");
        } else {
          pendingBuyer.price = discRealPrice;
          await pendingBuyer.save();
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: course.title,
                    images: [course.thumbnail],
                  },
                  unit_amount: discountPrice * 100,
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/course/paymentSuccessFull/${pendingBuyer._id}?courseId=${course._id}`,
            cancel_url: `${process.env.CLIENT_URL}/`,
          });
          req.body.session = session;
          next();
        }
      } else {
        throw new CustomException('Course not found');
      }
    } else {
      if (course) {
        const realPrice = Number(course.price?.split(' ')[1]);

        if (course.price !== price) {
          throw new CustomException("Price Doesn't match");
        } else {
          pendingBuyer.price = `$ ${realPrice}`;
          await pendingBuyer.save();
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: course.title,
                    images: [course.thumbnail],
                  },
                  unit_amount: realPrice * 100,
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/course/paymentSuccessFull/${pendingBuyer._id}?courseId=${course._id}`,
            cancel_url: `${process.env.CLIENT_URL}/`,
          });
          req.body.session = session;
          next();
        }
      } else {
        throw new CustomException('Course not found');
      }
    }
  }
}
