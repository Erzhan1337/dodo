import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { hash } from 'argon2';
import { normalizeKzPhone } from '../auth/lib/phone';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getUserByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone: normalizeKzPhone(phone) },
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
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }
}
