import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { getJwtAccessSecret } from '../../../config/jwt.config';
import { AuthService } from '../auth.service';

type AccessTokenPayload = {
  id: string;
  sessionId: string;
  type: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getJwtAccessSecret(configService),
      ignoreExpiration: false,
    });
  }

  async validate({ id, sessionId, type }: AccessTokenPayload) {
    if (type !== 'access' || !sessionId) {
      throw new UnauthorizedException('Invalid access token');
    }

    const user = await this.authService.getActiveSessionUser(sessionId, id);
    if (!user) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    return user;
  }
}
