import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type SafeUser, UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { Prisma } from '@prisma/client';
import {
  getJwtAccessSecret,
  getJwtRefreshSecret,
} from '../../config/jwt.config';
import { CartService } from '../cart/cart.service';

type AuthTokenType = 'access' | 'refresh';

type AuthTokenPayload = {
  id: string;
  type: AuthTokenType;
};

type SensitiveUserFields = {
  password?: string;
  refreshToken?: string | null;
};

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 30;
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private configService: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
    private cartService: CartService,
  ) {}

  async login(dto: LoginDto, guestCartToken?: string) {
    const user = await this.validateUser(dto);
    const tokens = this.issueTokens(user.id);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    if (guestCartToken) {
      await this.cartService.mergeGuestCartIntoUser(user.id, guestCartToken);
    }

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async register(dto: RegisterDto, guestCartToken?: string) {
    const existingUser = await this.userService.getUserByPhone(dto.phone);
    if (existingUser) {
      throw new BadRequestException('Phone already exists');
    }

    let user: SafeUser;
    try {
      user = await this.userService.createUser(dto);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new BadRequestException(this.getUniqueConstraintMessage(error));
      }

      throw error;
    }

    const tokens = this.issueTokens(user.id);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    if (guestCartToken) {
      await this.cartService.mergeGuestCartIntoUser(user.id, guestCartToken);
    }

    return {
      user,
      ...tokens,
    };
  }

  async getNewTokens(refreshToken: string) {
    let data: AuthTokenPayload;
    try {
      data = await this.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userService.getUserWithRefreshTokenById(data.id);
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const isValidRefreshToken = await verify(user.refreshToken, refreshToken);
    if (!isValidRefreshToken) {
      await this.userService.updateRefreshToken(user.id, null);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.issueTokens(user.id);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;

    try {
      const data = await this.verifyRefreshToken(refreshToken);
      await this.userService.updateRefreshToken(data.id, null);
    } catch {
      return;
    }
  }

  issueTokens(userId: string) {
    const accessTokenPayload: AuthTokenPayload = {
      id: userId,
      type: 'access',
    };
    const refreshTokenPayload: AuthTokenPayload = {
      id: userId,
      type: 'refresh',
    };
    const accessToken = this.jwt.sign(accessTokenPayload, {
      expiresIn: '1d',
      secret: getJwtAccessSecret(this.configService),
    });

    const refreshToken = this.jwt.sign(refreshTokenPayload, {
      expiresIn: '30d',
      secret: getJwtRefreshSecret(this.configService),
    });

    return { accessToken, refreshToken };
  }

  private async validateUser(dto: LoginDto) {
    const user = await this.userService.getUserWithPasswordByPhone(dto.phone);
    if (!user) throw new NotFoundException('User not found');
    const isValidPassword = await verify(user.password, dto.password);
    if (!isValidPassword) throw new NotFoundException('User not found');

    return user;
  }

  private async verifyRefreshToken(refreshToken: string) {
    const payload = await this.jwt.verifyAsync<AuthTokenPayload>(refreshToken, {
      secret: getJwtRefreshSecret(this.configService),
    });

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload;
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await hash(refreshToken);
    await this.userService.updateRefreshToken(userId, hashedRefreshToken);
  }

  private sanitizeUser<T extends SensitiveUserFields>(user: T) {
    const {
      password: _password,
      refreshToken: _refreshToken,
      ...userWithoutSensitiveData
    } = user;
    return userWithoutSensitiveData;
  }

  private isUniqueConstraintError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private getUniqueConstraintMessage(
    error: Prisma.PrismaClientKnownRequestError,
  ) {
    const fields = this.getUniqueConstraintFields(error);

    if (fields.some((field) => field.includes('email'))) {
      return 'Email already exists';
    }

    if (fields.some((field) => field.includes('phone'))) {
      return 'Phone already exists';
    }

    return 'User already exists';
  }

  private getUniqueConstraintFields(
    error: Prisma.PrismaClientKnownRequestError,
  ) {
    const target = error.meta?.target;

    if (Array.isArray(target)) {
      return target
        .filter((field): field is string => typeof field === 'string')
        .map((field) => field.toLowerCase());
    }

    if (typeof target === 'string') {
      return [target.toLowerCase()];
    }

    return [];
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);
    const isProduction = this.configService.getOrThrow('PRODUCTION') === 'true';
    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: isProduction
        ? this.configService.getOrThrow('SERVER_DOMAIN')
        : undefined,
      expires: expiresIn,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
  }

  removeRefreshTokenFromResponse(res: Response) {
    const isProduction = this.configService.getOrThrow('PRODUCTION') === 'true';
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: isProduction
        ? this.configService.getOrThrow('SERVER_DOMAIN')
        : undefined,
      expires: new Date(0),
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
  }
}
