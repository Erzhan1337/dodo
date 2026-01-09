import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../../config/jwt.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UserModule,
    ConfigModule,
  ],
})
export class AuthModule {}
