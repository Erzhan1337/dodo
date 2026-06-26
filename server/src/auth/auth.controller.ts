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
import { CartService, GUEST_CART_TOKEN_COOKIE } from '../cart/cart.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cartService: CartService,
  ) {}

  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const guestCartToken = this.getGuestCartToken(req);
    const { refreshToken, ...response } = await this.authService.login(
      dto,
      guestCartToken,
    );
    this.authService.addRefreshTokenToResponse(res, refreshToken);
    if (guestCartToken) this.cartService.removeGuestCartTokenFromResponse(res);
    return response;
  }

  @HttpCode(201)
  @UsePipes(new ValidationPipe())
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const guestCartToken = this.getGuestCartToken(req);
    const { refreshToken, ...response } = await this.authService.register(
      dto,
      guestCartToken,
    );
    this.authService.addRefreshTokenToResponse(res, refreshToken);
    if (guestCartToken) this.cartService.removeGuestCartTokenFromResponse(res);
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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshTokenFromCookie =
      req.cookies[this.authService.REFRESH_TOKEN_NAME];
    await this.authService.logout(refreshTokenFromCookie);
    this.authService.removeRefreshTokenFromResponse(res);
    return { message: 'Logged out successfully' };
  }

  private getGuestCartToken(req: Request) {
    return req.cookies?.[GUEST_CART_TOKEN_COOKIE];
  }
}
