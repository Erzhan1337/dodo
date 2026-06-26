import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

const JWT_ACCESS_SECRET = 'JWT_ACCESS_SECRET';
const JWT_REFRESH_SECRET = 'JWT_REFRESH_SECRET';
const LEGACY_JWT_SECRET = 'JWT_SECRET';

function getSigningSecret(
  configService: ConfigService,
  envName: string,
  legacySuffix: string,
) {
  const secret = configService.get<string>(envName);
  if (secret) return secret;

  return `${configService.getOrThrow<string>(LEGACY_JWT_SECRET)}:${legacySuffix}`;
}

export function getJwtAccessSecret(configService: ConfigService) {
  return getSigningSecret(configService, JWT_ACCESS_SECRET, 'access');
}

export function getJwtRefreshSecret(configService: ConfigService) {
  return getSigningSecret(configService, JWT_REFRESH_SECRET, 'refresh');
}

export const getJwtConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => {
  return {
    secret: getJwtAccessSecret(configService),
  };
};
