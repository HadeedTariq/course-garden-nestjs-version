import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from './schema/user.model';
import { CustomException } from '../custom.exception';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ExistedUser implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;

    if (!email) {
      throw new CustomException('Please fill all the fields');
    }

    const isUserAlreadyExist = await User.findOne({ email });
    if (isUserAlreadyExist) {
      throw new CustomException('User already exist with this mail');
    }

    console.log(`check auth  ${req.url}`);

    next();
  }
}

@Injectable()
export class CheckAuth implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      throw new CustomException('Access Token not found');
    }

    const user = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET!);

    if (!user) {
      throw new CustomException('Invalid Access Token');
    }

    console.log(req.url);

    req.body.user = user;
    next();
  }
}
