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
import { verify } from 'argon2';

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
    const { password, ...userWithoutPassword } = user;
    return {
      userWithoutPassword,
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
    const { password, ...userWithoutPassword } = user;
    return {
      userWithoutPassword,
      ...tokens,
    };
  }

  async getNewTokens(refreshToken: string) {
    let data: any;
    try {
      data = await this.jwt.verifyAsync(refreshToken);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userService.getUserById(data.id);
    if (!user) throw new UnauthorizedException('User not found');
    const tokens = this.issueTokes(user.id);
    const { password, ...userWithoutPassword } = user;
    return {
      userWithoutPassword,
      ...tokens,
    };
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

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);
    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: this.configService.getOrThrow('SERVER_DOMAIN'),
      expires: expiresIn,
      secure: this.configService.getOrThrow("PRODUCTION"),
      sameSite: 'lax',
    });
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: this.configService.getOrThrow('SERVER_DOMAIN'),
      expires: new Date(0),
      secure: this.configService.getOrThrow('PRODUCTION'),
      sameSite: 'lax',
    });
  }
}
