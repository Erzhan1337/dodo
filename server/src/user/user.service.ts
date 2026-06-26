import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { hash } from 'argon2';
import { normalizeKzPhone } from '../auth/lib/phone';

const safeUserSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const userWithPasswordSelect = {
  ...safeUserSelect,
  password: true,
} satisfies Prisma.UserSelect;

const userWithRefreshTokenSelect = {
  ...safeUserSelect,
  refreshToken: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getSafeUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });
  }

  async getUserWithRefreshTokenById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: userWithRefreshTokenSelect,
    });
  }

  async getUserByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone: normalizeKzPhone(phone) },
      select: safeUserSelect,
    });
  }

  async getUserWithPasswordByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone: normalizeKzPhone(phone) },
      select: userWithPasswordSelect,
    });
  }

  async createUser(dto: RegisterDto) {
    return this.prisma.user.create({
      data: {
        name: dto.name,
        phone: normalizeKzPhone(dto.phone),
        email: dto.email,
        password: await hash(dto.password),
      },
      select: safeUserSelect,
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }
}
