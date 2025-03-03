import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../../../common/notifications/notifications.service';
import { SignupDto } from '../users/dtos/signup.dto';
import { LoginDto } from '../users/dtos/login.dto';
import { VerifyOtpDto } from '../users/dtos/verify-otp.dto';
import { ForgetPasswordOtpDto } from '../users/dtos/forgetpassword-otp.dto';
import { VerifyForgetPasswordOtpDto } from '../users/dtos/verifyforgetpassword-otp.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { verify } from 'crypto';
import { SendSmsDto } from '../users/dtos/send-sms.dto';
import { VerifySmsDto } from '../users/dtos/verify-sms.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@ApiTags('Authentication Controller')
@Controller('v1/auth')
@ApiBearerAuth('JWT')

export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.usersService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Post('login/send-sms')
  async sendSms(@Body() dto: SendSmsDto) {
    return this.usersService.loginBySms(dto);
  }

  @Post('login/verify-sms')
  async verifySms(@Body() dto: VerifySmsDto) {
    return this.usersService.verifyBySms(dto);
  }

  @Post('otp/verify')
  async mobileVerification(@Body() verifyOtpDto: VerifyOtpDto) {
    let result = this.notificationsService.validateOtp(
      verifyOtpDto.mobile,
      verifyOtpDto.otp,
    );
    if (result) {
      return this.usersService.verifyAccount(
        verifyOtpDto.mobile,
        verifyOtpDto.type,
      );
    } else {
      return { status: false, message: 'Invalid OTP/Username', data: null };
    }
  }

  @Get('email/verify')
  async emailVerification(@Query('token') token: string) {
    try {
      return await this.usersService.verifyEmailToken(token);
    } catch (err) {
      return { status: false, message: 'Invalid Token', data: err };
    }
  }

  @Post('otp/forget-password')
  async forgetPassword(@Body() forgetPasswordOtpDto: ForgetPasswordOtpDto) {
    return this.usersService.sendForgetPasswordOtp(forgetPasswordOtpDto.mobile);
  }

  @Post('otp/forget-password/verify')
  async forgetPasswordVerification(
    @Body() requestData: VerifyForgetPasswordOtpDto,
  ) {
    let result = await this.notificationsService.validateOtp(
      requestData.mobile,
      requestData.otp,
    );
    if (result) {
      return this.usersService.changePassword(
        requestData.mobile,
        requestData.password,
      );
    } else {
      return { status: false, message: 'Invalid OTP/Mobile', data: null };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.usersService.logout(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async authenticatedUser(@Req() req: any) {
    // console.log(req.user.id)
    const token = req.headers.authorization.split(' ')[1];
    return this.usersService.authenticatedUser(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  async refreshAccessToken(@Req() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.usersService.refreshAccessToken(token);
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    return { msg: 'Googe Authentication' };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleRedirect(@Req() req) {
    return this.authService.validateOAuthLogin(req.user);
  }

  @Get('facebook/login')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {
    return { msg: 'Facebook Authentication' };
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req) {
    // Handles Facebook OAuth2 callback
    return this.authService.validateOAuthLogin(req.user);
  }
}
