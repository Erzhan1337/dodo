import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { createHmac, randomBytes } from 'node:crypto';
import { verify } from 'argon2';
import type { CookieOptions, Response } from 'express';
import { CartService } from '../cart/cart.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  safeUserSelect,
  type SafeUser,
  UserService,
} from '../user/user.service';
import {
  getJwtAccessSecret,
  getJwtRefreshSecret,
} from '../../config/jwt.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type AccessTokenPayload = {
  id: string;
  sessionId: string;
  type: 'access';
};

type SensitiveUserFields = {
  password?: string;
};

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const LAST_USED_UPDATE_INTERVAL_MS = 5 * 60 * 1000;
const MAX_ACTIVE_SESSIONS_PER_USER = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly cartService: CartService,
  ) {
    if (this.isProduction) {
      const pepper = this.configService.get<string>('SESSION_TOKEN_PEPPER');
      if (!pepper || Buffer.byteLength(pepper, 'utf8') < 32) {
        throw new Error(
          'SESSION_TOKEN_PEPPER must contain at least 32 bytes in production',
        );
      }

      this.getSessionCookieOptions();
    }
  }

  get SESSION_COOKIE_NAME() {
    return this.isProduction ? '__Host-refreshSession' : 'refreshSession';
  }

  async login(dto: LoginDto, guestCartToken?: string) {
    const user = await this.validateUser(dto);
    const session = await this.createSession(user.id);

    if (guestCartToken) {
      await this.cartService.mergeGuestCartIntoUser(user.id, guestCartToken);
    }

    return {
      user: this.sanitizeUser(user),
      accessToken: this.issueAccessToken(user.id, session.id),
      sessionToken: session.token,
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

    const session = await this.createSession(user.id);

    if (guestCartToken) {
      await this.cartService.mergeGuestCartIntoUser(user.id, guestCartToken);
    }

    return {
      user,
      accessToken: this.issueAccessToken(user.id, session.id),
      sessionToken: session.token,
    };
  }

  async getNewTokens(sessionToken: string) {
    const tokenHash = this.hashSessionToken(sessionToken);
    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        lastUsedAt: true,
        expiresAt: true,
        revokedAt: true,
        user: {
          select: safeUserSelect,
        },
      },
    });

    const now = new Date();
    if (!session || session.revokedAt || session.expiresAt <= now) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    if (
      now.getTime() - session.lastUsedAt.getTime() >=
      LAST_USED_UPDATE_INTERVAL_MS
    ) {
      await this.prisma.authSession.update({
        where: { id: session.id },
        data: { lastUsedAt: now },
      });
    }

    return {
      user: session.user,
      accessToken: this.issueAccessToken(session.userId, session.id),
    };
  }

  async logout(sessionToken?: string) {
    if (!sessionToken) return;

    await this.prisma.authSession.updateMany({
      where: {
        tokenHash: this.hashSessionToken(sessionToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async getActiveSessionUser(sessionId: string, userId: string) {
    const session = await this.prisma.authSession.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        user: {
          select: safeUserSelect,
        },
      },
    });

    return session?.user ?? null;
  }

  addSessionTokenToResponse(res: Response, sessionToken: string) {
    res.cookie(this.SESSION_COOKIE_NAME, sessionToken, {
      ...this.getSessionCookieOptions(),
      expires: new Date(Date.now() + SESSION_DURATION_MS),
    });
  }

  removeSessionTokenFromResponse(res: Response) {
    res.cookie(this.SESSION_COOKIE_NAME, '', {
      ...this.getSessionCookieOptions(),
      expires: new Date(0),
    });
  }

  private async createSession(userId: string) {
    const token = randomBytes(32).toString('base64url');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

    const session = await this.prisma.$transaction(async (tx) => {
      await tx.authSession.deleteMany({
        where: {
          userId,
          OR: [{ expiresAt: { lte: now } }, { revokedAt: { not: null } }],
        },
      });

      const createdSession = await tx.authSession.create({
        data: {
          userId,
          tokenHash: this.hashSessionToken(token),
          expiresAt,
        },
        select: { id: true },
      });

      const sessionsToRevoke = await tx.authSession.findMany({
        where: { userId, revokedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: MAX_ACTIVE_SESSIONS_PER_USER,
        select: { id: true },
      });

      if (sessionsToRevoke.length > 0) {
        await tx.authSession.updateMany({
          where: { id: { in: sessionsToRevoke.map((session) => session.id) } },
          data: { revokedAt: now },
        });
      }

      return createdSession;
    });

    return { ...session, token };
  }

  private issueAccessToken(userId: string, sessionId: string) {
    const payload: AccessTokenPayload = {
      id: userId,
      sessionId,
      type: 'access',
    };

    return this.jwt.sign(payload, {
      expiresIn: '15m',
      secret: getJwtAccessSecret(this.configService),
    });
  }

  private async validateUser(dto: LoginDto) {
    const user = await this.userService.getUserWithPasswordByPhone(dto.phone);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isValidPassword = await verify(user.password, dto.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private hashSessionToken(sessionToken: string) {
    const pepper = this.configService.get<string>('SESSION_TOKEN_PEPPER');

    if (!pepper && this.isProduction) {
      throw new Error('SESSION_TOKEN_PEPPER must be configured in production');
    }

    return createHmac(
      'sha256',
      pepper || getJwtRefreshSecret(this.configService),
    )
      .update(sessionToken)
      .digest('hex');
  }

  private getSessionCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      path: '/',
      secure: this.isProduction,
      sameSite: this.authCookieSameSite,
    };
  }

  private get authCookieSameSite(): NonNullable<CookieOptions['sameSite']> {
    const configured = this.configService
      .get<string>('AUTH_COOKIE_SAME_SITE')
      ?.trim()
      .toLowerCase();
    const sameSite = configured || (this.isProduction ? 'none' : 'lax');

    if (sameSite !== 'lax' && sameSite !== 'strict' && sameSite !== 'none') {
      throw new Error(
        'AUTH_COOKIE_SAME_SITE must be one of: lax, strict, none',
      );
    }

    return sameSite;
  }

  private get isProduction() {
    return this.configService.getOrThrow('PRODUCTION') === 'true';
  }

  private sanitizeUser<T extends SensitiveUserFields>(user: T) {
    const { password: _password, ...userWithoutSensitiveData } = user;
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
}
