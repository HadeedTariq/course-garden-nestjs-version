import { Injectable } from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { User } from './schema/user.model';
import PhoneNumber, { CountryCode } from 'libphonenumber-js';
import { CustomException } from 'src/custom.exception';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  async registerUser(createAuthDto: CreateAuthDto) {
    const { mobileNumber, country } = createAuthDto;
    const phoneNumber = PhoneNumber(
      mobileNumber,
      country.toUpperCase() as CountryCode,
    );

    if (!phoneNumber?.isValid()) {
      throw new CustomException('Invalid Mobile Number');
    }

    await User.create(createAuthDto);
    return { message: 'User registered successfully' };
  }

  async login(res: Response, credentials: LoginAuthDto) {
    const { email, password } = credentials;

    const user = await User.findOne({ email });

    if (!user) {
      throw new CustomException('User not found');
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new CustomException('Incorrect Credentials');
    }
    const { accessToken, refreshToken } = user.generateAccessAndRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res
      .cookie('accessToken', accessToken, {
        secure: true,
        httpOnly: false,
        sameSite: 'none',
      })
      .cookie('refreshToken', refreshToken, {
        secure: true,
        httpOnly: false,
        sameSite: 'none',
      });

    res.status(200).json({ message: 'User logged in successfully' });
  }

  authenticateUser(req: Request, res: Response) {
    const { user } = req.body;

    res.status(200).json(user);
  }

  async authenticateByResfreshToken(req: Request, res: Response) {
    const { refreshToken: refToken } = req.cookies;
    if (!refToken) {
      throw new CustomException('Refresh Token not found');
    }
    const { id }: any = jwt.verify(
      refToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!,
    );
    if (!id) {
      throw new CustomException('Invalid Refresh Token');
    }

    const user = await User.findById(id);

    if (!user) {
      throw new CustomException('User not found');
    }

    const { accessToken, refreshToken } = user.generateAccessAndRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res
      .cookie('accessToken', accessToken, {
        secure: true,
        httpOnly: false,
        sameSite: 'none',
      })
      .cookie('refreshToken', refreshToken, {
        secure: true,
        httpOnly: false,
        sameSite: 'none',
      });

    res
      .status(200)
      .json({ message: 'User logged in by using refreshToken successfully' });
  }

  logout(res: Response) {
    res
      .clearCookie('refreshToken', {
        secure: true,
        httpOnly: false,
        sameSite: 'none',
      })
      .clearCookie('accessToken', {
        secure: true,
        httpOnly: false,
        sameSite: 'none',
      })
      .json({ message: 'User logged out successfully' });
  }
}
