import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const guestToken = req.cookies['token'];
    const { refreshToken, ...response } = await this.authService.login(
      dto,
      guestToken,
    );
    this.authService.addRefreshTokenToResponse(res, refreshToken);
    if (guestToken) {
      res.clearCookie('token');
    }
    return response;
  }

  @HttpCode(201)
  @UsePipes(new ValidationPipe())
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const guestToken = req.cookies['cart'];
    const { refreshToken, ...response } = await this.authService.register(
      dto,
      guestToken,
    );
    this.authService.addRefreshTokenToResponse(res, refreshToken);
    if (guestToken) {
      res.clearCookie('token');
    }
    return response;
  }

  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('login/access-token')
  async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenFromCookie =
      req.cookies[this.authService.REFRESH_TOKEN_NAME];
    if (!refreshTokenFromCookie) {
      this.authService.removeRefreshTokenFromResponse(res);
      throw new UnauthorizedException("Refresh token isn't provided");
    }

    const { refreshToken, ...response } = await this.authService.getNewTokens(
      refreshTokenFromCookie,
    );
    this.authService.addRefreshTokenToResponse(res, refreshToken);
    return response;
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeRefreshTokenFromResponse(res);
    return { message: 'Logged out successfully' };
  }
}
