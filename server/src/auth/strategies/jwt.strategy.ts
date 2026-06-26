import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { getJwtAccessSecret } from '../../../config/jwt.config';

type AccessTokenPayload = {
  id: string;
  type: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getJwtAccessSecret(configService),
      ignoreExpiration: false,
    });
  }

  async validate({ id, type }: AccessTokenPayload) {
    if (type !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }

    return this.userService.getUserById(id);
  }
}
