import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Body(ValidationPipe) createAuthDto: CreateAuthDto) {
    return this.authService.registerUser(createAuthDto);
  }

  @Post('login')
  login(@Res() res: Response, @Body(ValidationPipe) credentials: LoginAuthDto) {
    return this.authService.login(res, credentials);
  }

  @Post('')
  authenticateUser(@Req() req: Request, @Res() res: Response) {
    return this.authService.authenticateUser(req, res);
  }

  @Post('refreshAccessToken')
  authenticateByResfreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.authenticateByResfreshToken(req, res);
  }

  @Post('logout')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
