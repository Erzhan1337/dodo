import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 30;
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private configService: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    const tokens = this.issueTokes(user.id);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.userService.getUserByPhone(dto.phone);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    const user = await this.userService.createUser(dto);
    const tokens = this.issueTokes(user.id);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async getNewTokens(refreshToken: string) {
    let data: { id: string };
    try {
      data = await this.jwt.verifyAsync(refreshToken);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userService.getUserById(data.id);
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const isValidRefreshToken = await verify(user.refreshToken, refreshToken);
    if (!isValidRefreshToken) {
      await this.userService.updateRefreshToken(user.id, null);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.issueTokes(user.id);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;

    try {
      const data = await this.jwt.verifyAsync<{ id: string }>(refreshToken);
      await this.userService.updateRefreshToken(data.id, null);
    } catch {
      return;
    }
  }

  issueTokes(userId: string) {
    const payload = {
      id: userId,
    };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: '1d',
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  private async validateUser(dto: LoginDto) {
    const user = await this.userService.getUserByPhone(dto.phone);
    if (!user) throw new NotFoundException('User not found');
    const isValidPassword = await verify(user.password, dto.password);
    if (!isValidPassword) throw new NotFoundException('User not found');

    return user;
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await hash(refreshToken);
    await this.userService.updateRefreshToken(userId, hashedRefreshToken);
  }

  private sanitizeUser(user: User) {
    const { password, refreshToken, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
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
