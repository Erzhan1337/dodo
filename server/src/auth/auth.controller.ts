import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
  ) {}

  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.assertTrustedOrigin(req);
    const guestCartToken = this.getGuestCartToken(req);
    const { sessionToken, ...response } = await this.authService.login(
      dto,
      guestCartToken,
    );
    this.authService.addSessionTokenToResponse(res, sessionToken);
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
    this.assertTrustedOrigin(req);
    const guestCartToken = this.getGuestCartToken(req);
    const { sessionToken, ...response } = await this.authService.register(
      dto,
      guestCartToken,
    );
    this.authService.addSessionTokenToResponse(res, sessionToken);
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
    this.assertTrustedOrigin(req);
    const sessionTokenFromCookie =
      req.cookies[this.authService.SESSION_COOKIE_NAME];
    if (!sessionTokenFromCookie) {
      this.authService.removeSessionTokenFromResponse(res);
      throw new UnauthorizedException("Session token isn't provided");
    }

    try {
      return await this.authService.getNewTokens(sessionTokenFromCookie);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.authService.removeSessionTokenFromResponse(res);
      }

      throw error;
    }
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.assertTrustedOrigin(req);
    const sessionTokenFromCookie =
      req.cookies[this.authService.SESSION_COOKIE_NAME];
    await this.authService.logout(sessionTokenFromCookie);
    this.authService.removeSessionTokenFromResponse(res);
    return { message: 'Logged out successfully' };
  }

  private getGuestCartToken(req: Request) {
    return req.cookies?.[GUEST_CART_TOKEN_COOKIE];
  }

  private assertTrustedOrigin(req: Request) {
    if (this.configService.getOrThrow('PRODUCTION') !== 'true') return;

    const origin = req.get('origin');
    const clientUrl = this.configService.getOrThrow<string>('CLIENT_URL');
    const trustedOrigin = new URL(clientUrl).origin;

    if (!origin || origin !== trustedOrigin) {
      throw new ForbiddenException('Untrusted request origin');
    }
  }
}
