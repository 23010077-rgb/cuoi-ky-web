import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ACCESS_COOKIE } from './jwt.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private cookieOptions() {
    return {
      httpOnly: true, // JS không đọc được cookie
      secure: this.config.get('NODE_ENV') === 'production', // chỉ gửi qua HTTPS khi production
      sameSite: 'lax' as const, // chặn gửi cookie ở request POST từ site khác (chống CSRF)
      maxAge: 2 * 60 * 60 * 1000,
      path: '/',
    };
  }

  @ApiOperation({ summary: 'Đăng ký tài khoản' })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @ApiOperation({ summary: 'Đăng nhập (token được đặt trong cookie httpOnly)' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // chống dò mật khẩu
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.auth.login(dto);
    res.cookie(ACCESS_COOKIE, token, this.cookieOptions());
    return { user };
  }

  @ApiOperation({ summary: 'Đăng xuất (xoá cookie)' })
  @HttpCode(200)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const { maxAge, ...opts } = this.cookieOptions();
    res.clearCookie(ACCESS_COOKIE, opts);
    return { message: 'Đã đăng xuất' };
  }

  @ApiOperation({ summary: 'Thông tin người dùng hiện tại' })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.auth.me(req.user.id);
  }
}
