import 'dotenv/config';

const DIRECT_DATABASE_URL_PATTERN = /^postgres(?:ql)?:\/\//;

export const getDatabaseUrl = () => {
  const directUrl = process.env.DATABASE_URL?.trim().replace(/^`|`$/g, '');

  if (directUrl && DIRECT_DATABASE_URL_PATTERN.test(directUrl)) {
    try {
      new URL(directUrl);

      return directUrl;
    } catch (error) {
      void error;
    }
  }

  const expandedDirectUrl = directUrl
    ?.replaceAll('${POSTGRES_USER}', process.env.POSTGRES_USER ?? '')
    .replaceAll('${POSTGRES_PASSWORD}', process.env.POSTGRES_PASSWORD ?? '')
    .replaceAll('${POSTGRES_PORT}', process.env.POSTGRES_PORT ?? '')
    .replaceAll('${POSTGRES_DB}', process.env.POSTGRES_DB ?? '');

  if (
    expandedDirectUrl &&
    DIRECT_DATABASE_URL_PATTERN.test(expandedDirectUrl)
  ) {
    try {
      new URL(expandedDirectUrl);

      return expandedDirectUrl;
    } catch (error) {
      void error;
    }
  }

  const username = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DB;
  const host = process.env.POSTGRES_HOST ?? 'localhost';
  const port = process.env.POSTGRES_PORT ?? '5432';

  if (!username || !password || !database) {
    throw new Error(
      'DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB are required',
    );
  }

  const url = new URL(`postgresql://${host}:${port}/${database}`);
  url.username = username;
  url.password = password;

  return url.toString();
};
